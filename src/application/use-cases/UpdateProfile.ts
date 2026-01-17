import { IUserRepository } from '../interfaces/IUserRepository';
import { Role } from '../../domain/entities/User';

export interface UpdateProfileDTO {
    requestingUserId: string;
    targetUserId: string;
    requestingUserRoles: Role[];
    fullName?: string;
}

export class UpdateProfile {
    constructor(private userRepository: IUserRepository) { }

    public async execute(dto: UpdateProfileDTO): Promise<any> {
        const isAdmin = dto.requestingUserRoles.includes(Role.ADMIN);
        const isSelf = dto.requestingUserId === dto.targetUserId;

        if (!isSelf && !isAdmin) {
            throw new Error('Unauthorized to update profile');
        }

        const user = await this.userRepository.findById(dto.targetUserId);
        if (!user) {
            throw new Error('User not found');
        }

        if (dto.fullName) {
            user.updateProfile(dto.fullName);
        }

        await this.userRepository.save(user);

        return user.toJSON();
    }
}
