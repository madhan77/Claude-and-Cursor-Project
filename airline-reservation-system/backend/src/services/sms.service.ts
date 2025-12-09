import { format } from 'date-fns';

interface BookingSMSData {
  pnr: string;
  contact_phone: string;
  total_price: number;
  passenger_name: string;
  flights: Array<{
    flight_number: string;
    airline_name: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: Date;
    dep_city: string;
    arr_city: string;
  }>;
}

class SMSService {
  private twilioClient: any = null;
  private isConfigured: boolean = false;

  constructor() {
    // Initialize synchronously to avoid async constructor issues
    this.initializeTwilio();
  }

  private initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    console.log('📱 Initializing SMS service...');
    console.log(`   - TWILIO_ACCOUNT_SID: ${accountSid ? 'Set (' + accountSid.substring(0, 10) + '...)' : 'Not set'}`);
    console.log(`   - TWILIO_AUTH_TOKEN: ${authToken ? 'Set (hidden)' : 'Not set'}`);
    console.log(`   - TWILIO_PHONE_NUMBER: ${fromNumber || 'Not set'}`);

    if (accountSid && authToken && fromNumber) {
      try {
        // Use synchronous require instead of async import
        const twilio = require('twilio');
        this.twilioClient = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('✅ SMS service initialized (Twilio)');
      } catch (error: any) {
        console.error('❌ Twilio SDK error:', error.message);
        console.log('⚠️  Twilio SDK not installed. Run: npm install twilio');
        this.isConfigured = false;
      }
    } else {
      console.log('⚠️  SMS service not configured (missing Twilio credentials)');
      console.log('   To enable SMS notifications:');
      console.log('   1. Sign up at https://www.twilio.com/try-twilio');
      console.log('   2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
      this.isConfigured = false;
    }
  }

  async sendBookingConfirmation(data: BookingSMSData): Promise<boolean> {
    if (!this.isConfigured || !this.twilioClient) {
      console.log('⚠️  SMS not sent: SMS service not configured');
      return false;
    }

    try {
      const firstFlight = data.flights[0];
      const isRoundTrip = data.flights.length > 1;

      // SMS has character limits, especially for trial accounts (160 chars)
      // Keep it very concise
      let message = '';

      if (isRoundTrip) {
        // Round trip - ultra concise
        message = `✈️ Booking ${data.pnr} confirmed!
${firstFlight.flight_number} ${firstFlight.dep_city}-${firstFlight.arr_city} ${format(new Date(firstFlight.departure_time), 'MMM dd')}
${data.flights[1].flight_number} ${data.flights[1].dep_city}-${data.flights[1].arr_city} ${format(new Date(data.flights[1].departure_time), 'MMM dd')}
Total: $${data.total_price.toFixed(2)}`;
      } else {
        // One way - slightly more detail
        message = `✈️ Booking ${data.pnr} confirmed!
${firstFlight.airline_name} ${firstFlight.flight_number}
${firstFlight.dep_city} → ${firstFlight.arr_city}
${format(new Date(firstFlight.departure_time), 'MMM dd, HH:mm')}
Total: $${data.total_price.toFixed(2)}`;
      }

      const formattedPhone = this.formatPhoneNumber(data.contact_phone);
      console.log(`📱 Sending SMS to ${formattedPhone} for booking ${data.pnr}`);
      console.log(`   Message length: ${message.length} characters`);

      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone,
      });

      console.log('✅ SMS sent successfully:', result.sid);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error.message);
      console.error('   Error code:', error.code);
      console.error('   More info:', error.moreInfo);
      console.error('   To:', this.formatPhoneNumber(data.contact_phone));
      console.error('   From:', process.env.TWILIO_PHONE_NUMBER);
      return false;
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // If the number doesn't start with a country code, assume US (+1)
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }

    // If it already has a country code
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }

    return cleaned;
  }

  // Alternative: AWS SNS for SMS (commented out)
  /*
  private async sendViaSNS(phone: string, message: string): Promise<boolean> {
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    try {
      const params = {
        Message: message,
        PhoneNumber: phone,
        MessageAttributes: {
          'AWS.SNS.SMS.SenderID': {
            DataType: 'String',
            StringValue: 'Airline',
          },
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      };

      await sns.publish(params).promise();
      console.log('✅ SMS sent via AWS SNS');
      return true;
    } catch (error: any) {
      console.error('❌ Error sending SMS via SNS:', error.message);
      return false;
    }
  }
  */
}

export default new SMSService();
