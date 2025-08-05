import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const cookie = req.cookies.get('session_user_id')?.value;

    if (!cookie) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: cookie } });

    if (!user) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email, name: user.name } });
}
