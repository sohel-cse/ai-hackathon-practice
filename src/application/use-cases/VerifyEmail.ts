import { IUserRepository } from '../interfaces/IUserRepository';
import { IAuditRepository } from '../interfaces/IAuditRepository';
import { randomUUID } from 'crypto';

export interface VerifyEmailDTO {
    userId: string;
    token: string;
}

export class VerifyEmail {
    constructor(
        private userRepository: IUserRepository,
        private auditRepository: IAuditRepository
    ) { }

    public async execute(dto: VerifyEmailDTO): Promise<void> {
        const user = await this.userRepository.findById(dto.userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.verifyEmail(dto.token);

        await this.userRepository.save(user);

        await this.auditRepository.save({
            id: randomUUID(),
            timestamp: new Date(),
            actorId: user.getId(),
            action: 'EMAIL_VERIFIED',
            targetId: user.getId(),
            metadata: { email: user.getEmail().getValue() }
        });
    }
}
