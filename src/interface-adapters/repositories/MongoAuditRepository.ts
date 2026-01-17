import { Db, Collection } from 'mongodb';
import { IAuditRepository, AuditLog } from '../../application/interfaces/IAuditRepository';

export class MongoAuditRepository implements IAuditRepository {
    private collection: Collection;

    constructor(db: Db) {
        this.collection = db.collection('audit_logs');
    }

    public async save(log: AuditLog): Promise<void> {
        await this.collection.insertOne(log);
    }

    public async findByTarget(targetId: string): Promise<AuditLog[]> {
        const cursor = this.collection.find({ targetId }).sort({ timestamp: -1 });
        const results = await cursor.toArray();
        return results.map(data => ({
            id: data.id,
            timestamp: data.timestamp,
            actorId: data.actorId,
            action: data.action,
            targetId: data.targetId,
            metadata: data.metadata
        }));
    }
}
