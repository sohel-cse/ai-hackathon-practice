import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from '../database/mongodb';
import { MongoUserRepository } from '../../interface-adapters/repositories/MongoUserRepository';
import { MongoAuditRepository } from '../../interface-adapters/repositories/MongoAuditRepository';
import { NodemailerEmailService } from '../../infrastructure/external-services/NodemailerEmailService';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { ViewProfile } from '../../application/use-cases/ViewProfile';
import { UpdateProfile } from '../../application/use-cases/UpdateProfile';
import { AuthenticateUser } from '../../application/use-cases/AuthenticateUser';
import { VerifyEmail } from '../../application/use-cases/VerifyEmail';
import { ChangeEmail } from '../../application/use-cases/ChangeEmail';
import { authMiddleware, AuthRequest } from './middleware/auth';
import { authRateLimiter, generalRateLimiter } from './middleware/rate-limit';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(generalRateLimiter);

const startServer = async () => {
    const db = await Database.connect();
    const userRepository = new MongoUserRepository(db);
    const auditRepository = new MongoAuditRepository(db);
    const emailService = new NodemailerEmailService();

    const registerUserUseCase = new RegisterUser(userRepository, auditRepository, emailService);
    const viewProfileUseCase = new ViewProfile(userRepository);
    const updateProfileUseCase = new UpdateProfile(userRepository);
    const authenticateUserUseCase = new AuthenticateUser(userRepository);
    const verifyEmailUseCase = new VerifyEmail(userRepository, auditRepository);
    const changeEmailUseCase = new ChangeEmail(userRepository, auditRepository, emailService);

    // Auth Route
    app.post('/api/auth/login', authRateLimiter, async (req: Request, res: Response) => {
        try {
            const result = await authenticateUserUseCase.execute(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    });

    // Register User Route
    app.post('/api/users/register', authRateLimiter, async (req: Request, res: Response) => {
        try {
            const result = await registerUserUseCase.execute(req.body);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Email Verification Route
    app.post('/api/users/:id/verify', async (req: Request, res: Response) => {
        try {
            await verifyEmailUseCase.execute({
                userId: req.params.id as string,
                token: req.body.token
            });
            res.json({ message: 'Email verified successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Email Change Route
    app.post('/api/users/me/change-email', authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            await changeEmailUseCase.execute({
                userId: req.user!.id,
                newEmail: req.body.newEmail
            });
            res.json({ message: 'Email change initiated. Please verify your new email.' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    // Protected Routes
    app.get('/api/users/me', authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            const result = await viewProfileUseCase.execute({
                requestingUserId: req.user!.id,
                targetUserId: req.user!.id,
                requestingUserRoles: req.user!.roles as any
            });
            res.json(result);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    });

    app.get('/api/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            const result = await viewProfileUseCase.execute({
                requestingUserId: req.user!.id,
                targetUserId: req.params.id as string,
                requestingUserRoles: req.user!.roles as any
            });
            res.json(result);
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    });

    app.put('/api/users/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
        try {
            const result = await updateProfileUseCase.execute({
                requestingUserId: req.user!.id,
                targetUserId: req.params.id as string,
                requestingUserRoles: req.user!.roles as any,
                fullName: req.body.fullName
            });
            res.json(result);
        } catch (error: any) {
            res.status(403).json({ error: error.message });
        }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch(console.error);
