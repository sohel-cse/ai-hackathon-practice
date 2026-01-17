import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { Password } from '../../domain/value-objects/Password';
import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';
import { User, UserStatus, Role } from '../../domain/entities/User';
import { IUserRepository } from '../interfaces/IUserRepository';
import { v4 as uuidv4 } from 'uuid';

export interface RegisterUserDTO {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    termsVersion: string;
    privacyVersion: string;
}

export class RegisterUser {
    constructor(private userRepository: IUserRepository) { }

    public async execute(dto: RegisterUserDTO): Promise<any> {
        const email = EmailAddress.create(dto.email);
        const phone = PhoneNumber.create(dto.phone);

        // Identity uniqueness check
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
            id: uuidv4(),
            fullName: dto.fullName,
            email,
            phone,
            password,
            status: UserStatus.PENDING_VERIFICATION,
            roles: [Role.USER],
            termsVersion: dto.termsVersion,
            privacyVersion: dto.privacyVersion,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await this.userRepository.save(user);

        return user.toJSON();
    }
}
