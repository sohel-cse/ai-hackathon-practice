import { User } from '../../domain/entities/User';
import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';

export interface IUserRepository {
    save(user: User): Promise<void>;
    findById(id: string): Promise<User | null>;
    findByEmail(email: EmailAddress): Promise<User | null>;
    findByPhone(phone: PhoneNumber): Promise<User | null>;
    delete(id: string): Promise<void>;
    findAll(limit: number, offset: number): Promise<User[]>;
}
