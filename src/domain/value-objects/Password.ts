import bcrypt from 'bcryptjs';

export class Password {
    private readonly hashedValue: string;

    private constructor(hashedValue: string) {
        this.hashedValue = hashedValue;
    }

    public static async create(plainText: string): Promise<Password> {
        this.validate(plainText);
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(plainText, salt);
        return new Password(hashed);
    }

    public static fromHashed(hashedValue: string): Password {
        return new Password(hashedValue);
    }

    private static validate(plainText: string): void {
        if (plainText.length < 12) {
            throw new Error('Password must be at least 12 characters long');
        }

        let categories = 0;
        if (/[a-z]/.test(plainText)) categories++;
        if (/[A-Z]/.test(plainText)) categories++;
        if (/[0-9]/.test(plainText)) categories++;
        if (/[^A-Za-z0-9]/.test(plainText)) categories++;

        if (categories < 3) {
            throw new Error('Password must include at least 3 of 4 categories: uppercase, lowercase, digits, symbols');
        }

        // Additional rules (e.g., common dictionary words) should be added here
    }

    public async compare(plainText: string): Promise<boolean> {
        return bcrypt.compare(plainText, this.hashedValue);
    }

    public getHashedValue(): string {
        return this.hashedValue;
    }
}
