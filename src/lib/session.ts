// src/lib/session.ts
import { prisma } from './prisma';
import { parse } from 'cookie';
import type { User } from '@prisma/client';

export async function getUserFromRequest(request: Request): Promise<User | null> {
    const cookie = request.headers.get('cookie');
    if (!cookie) return null;

    const cookies = parse(cookie);
    const userId = cookies['session_user_id'];
    if (!userId) return null;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user;
}
