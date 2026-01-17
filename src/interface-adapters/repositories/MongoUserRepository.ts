import { MongoClient, Db, Collection } from 'mongodb';
import { IUserRepository } from '../../application/interfaces/IUserRepository';
import { User, UserStatus, Role } from '../../domain/entities/User';
import { EmailAddress } from '../../domain/value-objects/EmailAddress';
import { PhoneNumber } from '../../domain/value-objects/PhoneNumber';
import { Password } from '../../domain/value-objects/Password';

export class MongoUserRepository implements IUserRepository {
    private collection: Collection;

    constructor(db: Db) {
        this.collection = db.collection('users');
    }

    public async save(user: User): Promise<void> {
        const data = user.toJSON();
        const passwordHashed = user.getPassword().getHashedValue();

        await this.collection.updateOne(
            { id: user.getId() },
            { $set: { ...data, password: passwordHashed } },
            { upsert: true }
        );
    }

    public async findById(id: string): Promise<User | null> {
        const data = await this.collection.findOne({ id });
        if (!data) return null;
        return this.mapToDomain(data);
    }

    public async findByEmail(email: EmailAddress): Promise<User | null> {
        const data = await this.collection.findOne({ email: email.getValue() });
        if (!data) return null;
        return this.mapToDomain(data);
    }

    public async findByPhone(phone: PhoneNumber): Promise<User | null> {
        const data = await this.collection.findOne({ phone: phone.getValue() });
        if (!data) return null;
        return this.mapToDomain(data);
    }

    public async delete(id: string): Promise<void> {
        await this.collection.deleteOne({ id });
    }

    public async findAll(limit: number, offset: number): Promise<User[]> {
        const cursor = this.collection.find().skip(offset).limit(limit);
        const results = await cursor.toArray();
        return results.map(data => this.mapToDomain(data));
    }

    private mapToDomain(data: any): User {
        return new User({
            id: data.id,
            fullName: data.fullName,
            email: EmailAddress.create(data.email),
            phone: PhoneNumber.create(data.phone),
            password: Password.fromHashed(data.password),
            status: data.status as UserStatus,
            roles: data.roles as Role[],
            termsVersion: data.termsVersion,
            privacyVersion: data.privacyVersion,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt)
        });
    }
}
