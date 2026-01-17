import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Database } from '../database/mongodb';
import { MongoUserRepository } from '../../interface-adapters/repositories/MongoUserRepository';
import { RegisterUser } from '../../application/use-cases/RegisterUser';
import { ViewProfile } from '../../application/use-cases/ViewProfile';
import { UpdateProfile } from '../../application/use-cases/UpdateProfile';
import { AuthenticateUser } from '../../application/use-cases/AuthenticateUser';
import { authMiddleware, AuthRequest } from './middleware/auth';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const startServer = async () => {
    const db = await Database.connect();
    const userRepository = new MongoUserRepository(db);

    const registerUserUseCase = new RegisterUser(userRepository);
    const viewProfileUseCase = new ViewProfile(userRepository);
    const updateProfileUseCase = new UpdateProfile(userRepository);
    const authenticateUserUseCase = new AuthenticateUser(userRepository);

    // Auth Route
    app.post('/api/auth/login', async (req: Request, res: Response) => {
        try {
            const result = await authenticateUserUseCase.execute(req.body);
            res.json(result);
        } catch (error: any) {
            res.status(401).json({ error: error.message });
        }
    });

    // Register User Route
    app.post('/api/users/register', async (req: Request, res: Response) => {
        try {
            const result = await registerUserUseCase.execute(req.body);
            res.status(201).json(result);
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
