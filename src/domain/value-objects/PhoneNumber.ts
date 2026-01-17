export class PhoneNumber {
    private readonly value: string;

    private constructor(value: string) {
        this.value = value;
    }

    public static create(phone: string, country: string = 'BD'): PhoneNumber {
        if (!phone || phone.trim().length === 0) {
            throw new Error('Phone number is required');
        }

        const normalized = this.normalize(phone, country);
        this.validate(normalized, country);

        return new PhoneNumber(normalized);
    }

    private static normalize(phone: string, country: string): string {
        // Basic normalization: remove non-digits
        let cleaned = phone.replace(/\D/g, '');

        if (country === 'BD') {
            // Handle Bangladesh specific normalization
            if (cleaned.startsWith('0')) {
                cleaned = '88' + cleaned;
            } else if (!cleaned.startsWith('88')) {
                cleaned = '880' + cleaned;
            }
        }

        return '+' + cleaned;
    }

    private static validate(phone: string, country: string): void {
        if (country === 'BD') {
            // E.164 for BD: +8801XXXXXXXXX (14 characters total)
            if (phone.length !== 14) {
                throw new Error('Invalid Bangladesh phone number length');
            }
            const operatorPrefix = phone.substring(4, 6);
            const validPrefixes = ['13', '14', '15', '16', '17', '18', '19'];
            if (!validPrefixes.includes(operatorPrefix)) {
                throw new Error('Invalid Bangladesh operator prefix');
            }
        }
    }

    public getValue(): string {
        return this.value;
    }
}
