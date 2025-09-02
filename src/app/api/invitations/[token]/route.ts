import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { kanban: true },
        });

        if (!invitation || invitation.used) {
            return NextResponse.json({ message: 'Invalid or used invitation' }, { status: 404 });
        }

        return NextResponse.json({ invitation });
    } catch (error) {
        console.error('GET /api/invitations/[token] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
