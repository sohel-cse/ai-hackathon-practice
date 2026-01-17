import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { Password } from '../../domain/value-objects/Password';
import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';
import { User, UserStatus, Role } from '../../domain/entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { IEmailService } from '../interfaces/IEmailService';
import { VerificationTokenGenerator } from '../../domain/services/VerificationTokenGenerator';
import { randomUUID } from 'crypto';

export interface RegisterUserDTO {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    termsVersion: string;
    privacyVersion: string;
}

export class RegisterUser {
    constructor(
        private userRepository: IUserRepository,
        private auditRepository: IAuditRepository,
        private emailService: IEmailService
    ) { }

    public async execute(dto: RegisterUserDTO): Promise<any> {
        const email = EmailAddress.create(dto.email);
        const phone = PhoneNumber.create(dto.phone);

        // Identity uniqueness check
        console.log(email, phone);
        const existingEmail = await this.userRepository.findByEmail(email);
        if (existingEmail) {
            throw new Error('Email already exists');
        }

        const existingPhone = await this.userRepository.findByPhone(phone);
        if (existingPhone) {
            throw new Error('Phone number already exists');
        }

        const password = await Password.create(dto.password);

        const user = new User({
            id: randomUUID(),
            fullName: dto.fullName,
            email,
            phone,
            password,
            status: UserStatus.PENDING_VERIFICATION,
            roles: [Role.USER],
            termsVersion: dto.termsVersion,
            privacyVersion: dto.privacyVersion,
            verificationToken: VerificationTokenGenerator.generate(),
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await this.userRepository.save(user);

        // Send verification email
        await this.emailService.sendVerificationEmail(
            user.getEmail().getValue(),
            user.getVerificationToken()!
        );

        await this.auditRepository.save({
            id: randomUUID(),
            timestamp: new Date(),
            actorId: user.getId(),
            action: 'USER_REGISTERED',
            targetId: user.getId(),
            metadata: {
                email: user.getEmail().getValue(),
                termsVersion: dto.termsVersion
            }
        });

        return user.toJSON();
    }
}
