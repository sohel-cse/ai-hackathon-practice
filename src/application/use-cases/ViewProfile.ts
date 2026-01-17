import { IUserRepository } from '../interfaces/IUserRepository';
import { User, Role } from '../../domain/entities/User';

export interface ViewProfileDTO {
    requestingUserId: string;
    targetUserId: string;
    requestingUserRoles: Role[];
}

export class ViewProfile {
    constructor(private userRepository: IUserRepository) { }

    public async execute(dto: ViewProfileDTO): Promise<any> {
        const isAdmin = dto.requestingUserRoles.includes(Role.ADMIN);
        const isSelf = dto.requestingUserId === dto.targetUserId;

        if (!isSelf && !isAdmin) {
            throw new Error('Unauthorized access to profile');
        }

        const user = await this.userRepository.findById(dto.targetUserId);
        if (!user) {
            throw new Error('User not found');
        }

        const userData = user.toJSON();

        // Data minimization: mask sensitive fields for others or based on policy
        if (!isSelf && isAdmin) {
            // Example: mask phone for admin if not fully authorized (if that rule was strict)
            // For now, simple masking
            return {
                ...userData,
                phone: this.maskPhone(userData.phone),
                email: this.maskEmail(userData.email)
            };
        }

        return userData;
    }

    private maskPhone(phone: string): string {
        return phone.replace(/(\+\d{4})\d{6}(\d{2})/, '$1******$2');
    }

    private maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        return `${local![0]}***@${domain}`;
    }
}
