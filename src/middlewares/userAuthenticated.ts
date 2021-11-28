import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../config/auth';

import AppError from '../shared/error/AppError';

interface ITokenPlayload {
    iat: number;
    exp: number;
    sub: string;
}

export default function ensureAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    // Validação do token JWT

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError('Não foi enviado o JWT', 401);
    }

    const [, token] = authHeader.split(' ');

    try {
        const decoded = verify(token, authConfig.jwt.secret);

        const { sub } = decoded as ITokenPlayload;

        req.user = {
            id: sub,
        };

        return next();
    } catch {
        throw new AppError('token JWT inválido', 401);
    }
}

