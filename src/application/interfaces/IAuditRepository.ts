export interface AuditLog {
    id: string;
    timestamp: Date;
    actorId: string;
    action: string;
    targetId?: string;
    metadata: any;
}

export interface IAuditRepository {
    save(log: AuditLog): Promise<void>;
    findByTarget(targetId: string): Promise<AuditLog[]>;
}
