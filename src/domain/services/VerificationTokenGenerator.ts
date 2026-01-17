import { randomBytes } from 'crypto';

export class VerificationTokenGenerator {
    public static generate(): string {
        return randomBytes(32).toString('hex');
    }
}
