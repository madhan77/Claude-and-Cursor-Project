import nodemailer from 'nodemailer';
import { format } from 'date-fns';

interface BookingEmailData {
  pnr: string;
  contact_email: string;
  total_price: number;
  passenger_name: string;
  flights: Array<{
    flight_number: string;
    airline_name: string;
    departure_airport: string;
    arrival_airport: string;
    departure_time: Date;
    arrival_time: Date;
    dep_city: string;
    arr_city: string;
  }>;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    };

    // Only initialize if credentials are provided
    if (emailConfig.auth.user && emailConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email service initialized');
    } else {
      console.log('⚠️  Email service not configured (missing SMTP credentials)');
    }
  }

  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    if (!this.transporter) {
      console.log('⚠️  Email not sent: Email service not configured');
      return false;
    }

    try {
      const flightsHtml = data.flights.map(flight => `
        <div style="background: #f9fafb; padding: 16px; margin: 16px 0; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; color: #1f2937;">${flight.airline_name} - ${flight.flight_number}</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <strong>${flight.dep_city} (${flight.departure_airport})</strong>
              <p style="margin: 4px 0; color: #6b7280;">${format(new Date(flight.departure_time), 'MMM dd, yyyy HH:mm')}</p>
            </div>
            <div style="text-align: right;">
              <strong>${flight.arr_city} (${flight.arrival_airport})</strong>
              <p style="margin: 4px 0; color: #6b7280;">${format(new Date(flight.arrival_time), 'MMM dd, yyyy HH:mm')}</p>
            </div>
          </div>
        </div>
      `).join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Booking Confirmation</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">✈️ Booking Confirmed!</h1>
              <p style="margin: 12px 0 0; font-size: 16px; opacity: 0.9;">Your reservation is complete</p>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400e;">
                  <strong>Important:</strong> Please save your PNR for future reference
                </p>
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <p style="color: #6b7280; margin: 0 0 8px;">Booking Reference (PNR)</p>
                <p style="font-size: 32px; font-weight: bold; color: #667eea; margin: 0; letter-spacing: 4px;">${data.pnr}</p>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Flight Details</h2>
              ${flightsHtml}

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                  <span style="color: #6b7280;">Passenger:</span>
                  <strong>${data.passenger_name}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6b7280;">Total Amount:</span>
                  <strong style="color: #059669; font-size: 20px;">$${data.total_price.toFixed(2)}</strong>
                </div>
              </div>

              <div style="margin-top: 30px; padding: 20px; background: #f9fafb; border-radius: 8px;">
                <h3 style="margin: 0 0 12px; color: #1f2937;">Next Steps:</h3>
                <ol style="margin: 0; padding-left: 20px; color: #6b7280;">
                  <li style="margin-bottom: 8px;">Check in online 24 hours before departure</li>
                  <li style="margin-bottom: 8px;">Arrive at the airport 2-3 hours before international flights</li>
                  <li style="margin-bottom: 8px;">Keep your passport and PNR handy</li>
                  <li>Review baggage allowance and restrictions</li>
                </ol>
              </div>

              <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
                <p style="margin: 0 0 8px;">Need help? Contact our support team</p>
                <p style="margin: 0;">📧 support@airline.com | 📞 1-800-FLY-NOW</p>
              </div>
            </div>

            <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
            </div>
          </body>
        </html>
      `;

      const mailOptions = {
        from: `"Airline Reservation System" <${process.env.SMTP_USER}>`,
        to: data.contact_email,
        subject: `✈️ Booking Confirmation - ${data.pnr}`,
        html: htmlContent,
        text: `
Booking Confirmed!

Your booking has been confirmed. Please save your PNR for future reference.

PNR: ${data.pnr}
Passenger: ${data.passenger_name}
Total Amount: $${data.total_price.toFixed(2)}

Flight Details:
${data.flights.map(f => `
${f.airline_name} - ${f.flight_number}
${f.dep_city} (${f.departure_airport}) → ${f.arr_city} (${f.arrival_airport})
Departure: ${format(new Date(f.departure_time), 'MMM dd, yyyy HH:mm')}
Arrival: ${format(new Date(f.arrival_time), 'MMM dd, yyyy HH:mm')}
`).join('\n')}

Next Steps:
1. Check in online 24 hours before departure
2. Arrive at the airport 2-3 hours before international flights
3. Keep your passport and PNR handy
4. Review baggage allowance and restrictions

Need help? Contact our support team
Email: support@airline.com | Phone: 1-800-FLY-NOW
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Error sending email:', error.message);
      return false;
    }
  }
}

export default new EmailService();
