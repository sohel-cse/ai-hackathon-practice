import nodemailer from 'nodemailer';
import { IEmailService } from '../../application/interfaces/IEmailService';

export class NodemailerEmailService implements IEmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    public async sendVerificationEmail(to: string, token: string): Promise<void> {
        const url = `${process.env.APP_URL}/api/users/verify?token=${token}`;
        await this.transporter.sendMail({
            from: process.env.EMAIL_FROM || '"User Management" <noreply@example.com>',
            to,
            subject: 'Verify your email',
            html: `<p>Please verify your email by clicking <a href="${url}">here</a>.</p><p>Token: ${token}</p>`,
        });
    }

    public async sendEmailChangeNotification(to: string, token: string): Promise<void> {
        const url = `${process.env.APP_URL}/api/users/verify-email-change?token=${token}`;
        await this.transporter.sendMail({
            from: process.env.EMAIL_FROM || '"User Management" <noreply@example.com>',
            to,
            subject: 'Confirm your email change',
            html: `<p>You initiated an email change. Please confirm by clicking <a href="${url}">here</a>.</p><p>Token: ${token}</p>`,
        });
    }
}
