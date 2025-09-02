import { Injectable } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }
    sgMail.setApiKey(apiKey);
  }

  async sendEmail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL');
    if (!fromEmail) {
      throw new Error('SENDGRID_FROM_EMAIL is not set in environment variables');
    }

    const msg = {
      to,
      from: fromEmail,
      subject,
      text,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('SendGrid error:', error);
      throw error;
    }
  }
}
