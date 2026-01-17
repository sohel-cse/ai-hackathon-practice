import { IUserRepository } from '../interfaces/IUserRepository';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { IEmailService } from '../interfaces/IEmailService';
import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { VerificationTokenGenerator } from '../../domain/services/VerificationTokenGenerator';
import { randomUUID } from 'crypto';

export interface ChangeEmailDTO {
    userId: string;
    newEmail: string;
    currentPassword?: string; // For re-authentication
}

export class ChangeEmail {
    constructor(
        private userRepository: IUserRepository,
        private auditRepository: IAuditRepository,
        private emailService: IEmailService
    ) { }

    public async execute(dto: ChangeEmailDTO): Promise<void> {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Email uniqueness check for the new email
        const newEmail = EmailAddress.create(dto.newEmail);
        const existingUser = await this.userRepository.findByEmail(newEmail);
        if (existingUser) {
            throw new Error('Email already in use');
        }

        const token = VerificationTokenGenerator.generate();
        user.initiateEmailChange(newEmail, token);

        await this.userRepository.save(user);

        await this.auditRepository.save({
            id: randomUUID(),
            timestamp: new Date(),
            actorId: user.getId(),
            action: 'EMAIL_CHANGE_INITIATED',
            targetId: user.getId(),
            metadata: {
                oldEmail: user.getEmail().getValue(),
                newEmail: newEmail.getValue()
            }
        });

        // Send email change notification to the NEW email
        await this.emailService.sendEmailChangeNotification(
            newEmail.getValue(),
            token
        );

        // In a real system, we would trigger an email with the verification token/link here
        console.log(`Verification token for ${newEmail.getValue()}: ${token}`);
    }
}
