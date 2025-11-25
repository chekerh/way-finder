import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private useMailjet: boolean;
  private mailjetApiKey: string | undefined;
  private mailjetApiSecret: string | undefined;
  private mailjetFromEmail: string | undefined;
  private mailjetFromName: string | undefined;

  constructor() {
    // Check if using Mailjet (case insensitive)
    const emailService = process.env.EMAIL_SERVICE?.toLowerCase().trim();
    this.useMailjet = emailService === 'mailjet';
    
    this.logger.log(`Email service configured: ${emailService || 'not set'} (using Mailjet: ${this.useMailjet})`);
    
    if (this.useMailjet) {
      // Use Mailjet API
      this.mailjetApiKey = process.env.MAILJET_API_KEY;
      this.mailjetApiSecret = process.env.MAILJET_API_SECRET;
      this.mailjetFromEmail = process.env.MAILJET_FROM_EMAIL;
      this.mailjetFromName = process.env.MAILJET_FROM_NAME || 'WayFinder';
      
      if (!this.mailjetApiKey || !this.mailjetApiSecret) {
        this.logger.warn('Mailjet API credentials not configured. Email sending will fail.');
        this.logger.warn(`MAILJET_API_KEY: ${this.mailjetApiKey ? 'set' : 'missing'}`);
        this.logger.warn(`MAILJET_API_SECRET: ${this.mailjetApiSecret ? 'set' : 'missing'}`);
        this.logger.warn(`MAILJET_FROM_EMAIL: ${this.mailjetFromEmail || 'missing'}`);
      } else {
        this.logger.log('Mailjet email service configured successfully');
      }
    } else {
      // Use SMTP (Gmail or other SMTP servers) - Only if not using Mailjet
      this.logger.log('Using SMTP transport (not Mailjet)');
      const smtpService = process.env.EMAIL_SERVICE || 'gmail';
      const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
      const emailPort = parseInt(process.env.EMAIL_PORT || '587');
      const emailUser = process.env.EMAIL_USER;
      const emailPassword = process.env.EMAIL_PASSWORD;

      if (smtpService === 'gmail' || !emailHost) {
        // Use Gmail OAuth2 or App Password
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPassword, // Use App Password for Gmail
          },
        });
      } else {
        // Use custom SMTP server
        this.transporter = nodemailer.createTransport({
          host: emailHost,
          port: emailPort,
          secure: emailPort === 465, // true for 465, false for other ports
          auth: {
            user: emailUser,
            pass: emailPassword,
          },
        });
      }

      // Only verify transporter if credentials are provided (skip verification to avoid errors)
      // Verification will happen on first email send
      if (this.transporter && emailUser && emailPassword) {
        // Don't verify immediately - it can cause timeout errors
        // Verification will happen automatically on first email send
        this.logger.log(`✅ SMTP transporter configured for ${emailHost}:${emailPort} with user: ${emailUser}`);
      } else {
        this.logger.error('❌ SMTP credentials not fully configured. Email sending will fail.');
        this.logger.error(`EMAIL_USER: ${emailUser ? 'set (' + emailUser + ')' : 'MISSING'}`);
        this.logger.error(`EMAIL_PASSWORD: ${emailPassword ? 'set' : 'MISSING'}`);
        this.logger.error(`EMAIL_HOST: ${emailHost}`);
        this.logger.error(`EMAIL_PORT: ${emailPort}`);
        this.transporter = null; // Don't use SMTP if credentials are missing
      }
    }
  }

  /**
   * Send email via Mailjet API
   */
  private async sendViaMailjet(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string,
  ): Promise<void> {
    if (!this.mailjetApiKey || !this.mailjetApiSecret || !this.mailjetFromEmail) {
      throw new Error('Mailjet credentials not configured');
    }

    const mailjetUrl = 'https://api.mailjet.com/v3.1/send';
    const auth = Buffer.from(`${this.mailjetApiKey}:${this.mailjetApiSecret}`).toString('base64');

    const payload = {
      Messages: [
        {
          From: {
            Email: this.mailjetFromEmail,
            Name: this.mailjetFromName,
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          TextPart: textContent,
          HTMLPart: htmlContent,
        },
      ],
    };

    try {
      const response = await axios.post(mailjetUrl, payload, {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.Messages && response.data.Messages[0]) {
        this.logger.log(`Mailjet email sent to ${to}: ${response.data.Messages[0].To[0].MessageID}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to send Mailjet email to ${to}:`, error.response?.data || error.message);
      throw new Error('Failed to send email via Mailjet');
    }
  }

  /**
   * Send email via SMTP (nodemailer)
   */
  private async sendViaSMTP(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string,
    fromEmail?: string,
  ): Promise<void> {
    if (!this.transporter) {
      const errorMsg = 'SMTP transporter not configured. Please check EMAIL_USER and EMAIL_PASSWORD environment variables.';
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const from = fromEmail || process.env.EMAIL_FROM || `WayFinder <${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from,
      to,
      subject,
      html: htmlContent,
      text: textContent,
    };

    try {
      this.logger.log(`Attempting to send email to ${to} via SMTP...`);
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✅ Email sent successfully to ${to}: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error.message || error);
      if (error.code) {
        this.logger.error(`Error code: ${error.code}`);
      }
      if (error.response) {
        this.logger.error(`Error response: ${JSON.stringify(error.response)}`);
      }
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate a secure random token for email verification
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, token: string, firstName?: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${frontendUrl}/verify-email?token=${token}`;
    const fromEmail = process.env.EMAIL_FROM || `WayFinder <${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Verify Your WayFinder Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4A90E2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to WayFinder! 🗺️</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Hello ${firstName || 'there'},</p>
            <p>Thank you for signing up with WayFinder! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="display: inline-block; background-color: #4A90E2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #4A90E2;">${verificationLink}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with WayFinder, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #777;">Best regards,<br>The WayFinder Team</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to WayFinder!
        
        Hello ${firstName || 'there'},
        
        Thank you for signing up with WayFinder! Please verify your email address by visiting this link:
        
        ${verificationLink}
        
        This link will expire in 24 hours.
        
        If you didn't create an account with WayFinder, you can safely ignore this email.
        
        Best regards,
        The WayFinder Team
      `,
    };

    if (this.useMailjet) {
      await this.sendViaMailjet(email, 'Verify Your WayFinder Email', mailOptions.html, mailOptions.text);
    } else {
      await this.sendViaSMTP(email, 'Verify Your WayFinder Email', mailOptions.html, mailOptions.text, fromEmail);
    }
  }

  /**
   * Generate a 4-digit OTP code
   */
  generateOTPCode(): string {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit code
  }

  /**
   * Send OTP code via email
   */
  async sendOTPEmail(email: string, otpCode: string, firstName?: string): Promise<void> {
    this.logger.log(`[Send OTP Email] Preparing to send OTP to ${email}`);
    
    // Check if email service is configured
    if (this.useMailjet) {
      if (!this.mailjetApiKey || !this.mailjetApiSecret || !this.mailjetFromEmail) {
        this.logger.error('[Send OTP Email] Mailjet credentials not configured');
        throw new Error('Email service not configured. Please set MAILJET_API_KEY, MAILJET_API_SECRET, and MAILJET_FROM_EMAIL.');
      }
    } else {
      if (!this.transporter) {
        this.logger.error('[Send OTP Email] SMTP transporter not configured');
        this.logger.error(`EMAIL_USER: ${process.env.EMAIL_USER ? 'set' : 'missing'}`);
        this.logger.error(`EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'set' : 'missing'}`);
        throw new Error('Email service not configured. Please set EMAIL_USER and EMAIL_PASSWORD environment variables.');
      }
    }
    
    const fromEmail = process.env.EMAIL_FROM || `WayFinder <${process.env.EMAIL_USER}>`;

    const mailOptions = {
      from: fromEmail,
      to: email,
      subject: 'Votre code de vérification WayFinder',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code de vérification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #4A90E2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">WayFinder 🔐</h1>
          </div>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
            <p>Bonjour ${firstName || 'cher utilisateur'},</p>
            <p>Votre code de vérification à 4 chiffres est :</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background-color: #4A90E2; color: white; padding: 20px 40px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                ${otpCode}
              </div>
            </div>
            <p>Ce code est valide pendant <strong>5 minutes</strong>.</p>
            <p>Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.</p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #777;">Cordialement,<br>L'équipe WayFinder</p>
          </div>
        </body>
        </html>
      `,
      text: `
        WayFinder - Code de vérification
        
        Bonjour ${firstName || 'cher utilisateur'},
        
        Votre code de vérification à 4 chiffres est : ${otpCode}
        
        Ce code est valide pendant 5 minutes.
        
        Si vous n'avez pas demandé ce code, vous pouvez ignorer cet email en toute sécurité.
        
        Cordialement,
        L'équipe WayFinder
      `,
    };

    try {
      if (this.useMailjet) {
        this.logger.log(`[Send OTP Email] Sending via Mailjet to ${email}`);
        await this.sendViaMailjet(email, 'Votre code de vérification WayFinder', mailOptions.html, mailOptions.text);
        this.logger.log(`[Send OTP Email] ✅ OTP email sent successfully via Mailjet to ${email}`);
      } else {
        this.logger.log(`[Send OTP Email] Sending via SMTP to ${email}`);
        await this.sendViaSMTP(email, 'Votre code de vérification WayFinder', mailOptions.html, mailOptions.text, fromEmail);
        this.logger.log(`[Send OTP Email] ✅ OTP email sent successfully via SMTP to ${email}`);
      }
    } catch (error: any) {
      this.logger.error(`[Send OTP Email] ❌ Failed to send OTP email to ${email}:`, error.message || error);
      throw error; // Re-throw to let caller handle
    }
  }

  /**
   * Send password reset email (for future use)
   */
  async sendPasswordResetEmail(email: string, token: string, firstName?: string): Promise<void> {
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const fromEmail = process.env.EMAIL_FROM || `WayFinder <${process.env.EMAIL_USER}>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #4A90E2; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <p>Hello ${firstName || 'there'},</p>
          <p>We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #4A90E2; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4A90E2;">${resetLink}</p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          <p style="font-size: 12px; color: #777;">Best regards,<br>The WayFinder Team</p>
        </div>
      </body>
      </html>
    `;

    const textContent = `
      WayFinder - Password Reset Request
      
      Hello ${firstName || 'there'},
      
      We received a request to reset your password. Please visit this link to reset it:
      
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you didn't request a password reset, you can safely ignore this email.
      
      Best regards,
      The WayFinder Team
    `;

    if (this.useMailjet) {
      await this.sendViaMailjet(email, 'Reset Your WayFinder Password', htmlContent, textContent);
    } else {
      await this.sendViaSMTP(email, 'Reset Your WayFinder Password', htmlContent, textContent, fromEmail);
    }
  }
}

