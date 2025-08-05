import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
        return NextResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
        return NextResponse.json({ message: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    const response = NextResponse.json({ message: 'Connexion réussie', user: { id: user.id, email: user.email, name: user.name } });

    // Définir le cookie via la réponse
    response.cookies.set('session_user_id', user.id, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    return response;
}
