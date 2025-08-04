import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ma-super-cle-secrete'; // à définir dans ton .env

interface UserPayload {
    email: string;
    // ajoute d'autres champs selon ce que tu mets dans ton token
}

export function getUserFromToken(authHeader: string | null): UserPayload | null {
    if (!authHeader) return null;

    const token = authHeader.replace('Bearer ', '');

    try {
        const payload = jwt.verify(token, JWT_SECRET) as UserPayload;
        return payload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}
