import { EmailAddress } from '../value-objects/EmailAddress';
import { Password } from '../value-objects/Password';
import { PhoneNumber } from '../value-objects/PhoneNumber';

export enum UserStatus {
    PENDING_VERIFICATION = 'PENDING_VERIFICATION',
    ACTIVE = 'ACTIVE',
    DEACTIVATED = 'DEACTIVATED'
}

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export interface UserProps {
    id: string;
    fullName: string;
    email: EmailAddress;
    phone: PhoneNumber;
    password: Password;
    status: UserStatus;
    roles: Role[];
    termsVersion: string;
    privacyVersion: string;
    createdAt: Date;
    updatedAt: Date;
}

export class User {
    private props: UserProps;

    constructor(props: UserProps) {
        this.validate(props);
        this.props = props;
    }

    private validate(props: UserProps): void {
        if (props.fullName.length < 2 || props.fullName.length > 80) {
            throw new Error('Full name must be between 2 and 80 characters');
        }
        if (/^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(props.fullName)) {
            throw new Error('Full name cannot contain only symbols or digits');
        }
    }

    public getId(): string { return this.props.id; }
    public getFullName(): string { return this.props.fullName; }
    public getEmail(): EmailAddress { return this.props.email; }
    public getPhone(): PhoneNumber { return this.props.phone; }
    public getStatus(): UserStatus { return this.props.status; }
    public getRoles(): Role[] { return this.props.roles; }
    public getPassword(): Password { return this.props.password; }

    public deactivate(): void {
        if (this.props.status === UserStatus.DEACTIVATED) {
            throw new Error('User is already deactivated');
        }
        this.props.status = UserStatus.DEACTIVATED;
        this.props.updatedAt = new Date();
    }

    public activate(): void {
        this.props.status = UserStatus.ACTIVE;
        this.props.updatedAt = new Date();
    }

    public updateProfile(fullName: string): void {
        this.props.fullName = fullName;
        this.validate(this.props);
        this.props.updatedAt = new Date();
    }

    public toJSON() {
        return {
            id: this.props.id,
            fullName: this.props.fullName,
            email: this.props.email.getValue(),
            phone: this.props.phone.getValue(),
            status: this.props.status,
            roles: this.props.roles,
            createdAt: this.props.createdAt,
            updatedAt: this.props.updatedAt
        };
    }
}
