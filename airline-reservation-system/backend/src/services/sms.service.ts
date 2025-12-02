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
    this.initializeTwilio();
  }

  private async initializeTwilio() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        // Dynamically import Twilio (will be installed separately)
        const twilio = await import('twilio');
        this.twilioClient = twilio.default(accountSid, authToken);
        this.isConfigured = true;
        console.log('✅ SMS service initialized');
      } catch (error: any) {
        console.log('⚠️  Twilio SDK not installed. Run: npm install twilio');
        this.isConfigured = false;
      }
    } else {
      console.log('⚠️  SMS service not configured (missing Twilio credentials)');
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

      // SMS has character limits, so keep it concise
      const message = `
✈️ Booking Confirmed!

PNR: ${data.pnr}
Passenger: ${data.passenger_name}

${isRoundTrip ? 'Outbound' : 'Flight'}: ${firstFlight.airline_name} ${firstFlight.flight_number}
${firstFlight.dep_city} → ${firstFlight.arr_city}
${format(new Date(firstFlight.departure_time), 'MMM dd, HH:mm')}

${isRoundTrip ? `Return: ${data.flights[1].airline_name} ${data.flights[1].flight_number}
${data.flights[1].dep_city} → ${data.flights[1].arr_city}
${format(new Date(data.flights[1].departure_time), 'MMM dd, HH:mm')}

` : ''}Total: $${data.total_price.toFixed(2)}

Check-in opens 24h before departure. Have a great flight!
      `.trim();

      const result = await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: this.formatPhoneNumber(data.contact_phone),
      });

      console.log('✅ SMS sent successfully:', result.sid);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending SMS:', error.message);
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
