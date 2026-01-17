import { IUserRepository } from '../interfaces/IUserRepository';
import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import jwt from 'jsonwebtoken';

export interface AuthenticateUserDTO {
    email: string;
    password: string;
}

export class AuthenticateUser {
    constructor(private userRepository: IUserRepository) { }

    public async execute(dto: AuthenticateUserDTO): Promise<any> {
        const email = EmailAddress.create(dto.email);
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isPasswordValid = await user.getPassword().compare(dto.password);
        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        if (user.getStatus() === 'DEACTIVATED') {
            throw new Error('Account is deactivated');
        }

        const token = jwt.sign(
            { id: user.getId(), roles: user.getRoles() },
            process.env.JWT_SECRET || 'supersecret',
            { expiresIn: '1h' }
        );

        return {
            token,
            user: user.toJSON()
        };
    }
}
