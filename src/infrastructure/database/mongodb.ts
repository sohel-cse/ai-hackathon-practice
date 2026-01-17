import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

export class Database {
    private static client: MongoClient;
    private static db: Db;

    public static async connect(): Promise<Db> {
        if (this.db) return this.db;

        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const dbName = process.env.MONGODB_DB_NAME || 'user_management';

        this.client = new MongoClient(uri);
        await this.client.connect();
        this.db = this.client.db(dbName);

        // Create indexes for uniqueness
        await this.db.collection('users').createIndex({ email: 1 }, { unique: true });
        await this.db.collection('users').createIndex({ phone: 1 }, { unique: true });
        await this.db.collection('users').createIndex({ id: 1 }, { unique: true });

        console.log('Connected to MongoDB');
        return this.db;
    }

    public static async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.close();
        }
    }
}
