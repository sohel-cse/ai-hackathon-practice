export interface IEmailService {
    sendVerificationEmail(to: string, token: string): Promise<void>;
    sendEmailChangeNotification(to: string, token: string): Promise<void>;
}
