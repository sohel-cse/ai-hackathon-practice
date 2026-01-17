export class EmailAddress {
    private readonly value: string;

    private static BLACKLISTED_DOMAINS = ['tempmail.com', 'mailinator.com', 'dispostable.com'];

    private constructor(email: string) {
        this.value = email;
    }

    public static create(email: string): EmailAddress {
        if (!email || email.trim().length === 0) {
            throw new Error('Email is required');
        }

        const normalized = this.normalize(email);

        if (!this.isValid(normalized)) {
            throw new Error('Invalid email format');
        }

        if (this.isBlacklisted(normalized)) {
            throw new Error('Email domain is not allowed');
        }

        return new EmailAddress(normalized);
    }

    private static normalize(email: string): string {
        let [localPart, domain] = email.trim().toLowerCase().split('@');
        if (!localPart || !domain) return email.trim().toLowerCase();

        // Normalization policy: treat user+tag@gmail.com as user@gmail.com
        if (domain === 'gmail.com') {
            localPart = localPart.split('+')[0]!.replace(/\./g, '');
        }

        return `${localPart}@${domain}`;
    }

    private static isValid(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private static isBlacklisted(email: string): boolean {
        const domain = email.split('@')[1];
        return this.BLACKLISTED_DOMAINS.includes(domain || '');
    }

    public getValue(): string {
        return this.value;
    }

    public equals(other: EmailAddress): boolean {
        return this.value === other.getValue();
    }
}
