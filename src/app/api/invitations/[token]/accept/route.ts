import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'ma-super-cle-secrete';

export async function POST(req: Request) {
    const token = new URL(req.url).searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const body = await req.json();
    const { password } = body;
    if (!password || password.length < 6) {
        return NextResponse.json({ message: 'Mot de passe requis (≥6 caractères)' }, { status: 400 });
    }

    try {
        const invitation = await prisma.invitation.findUnique({ where: { token } });
        if (!invitation) return NextResponse.json({ message: 'Invitation non trouvée' }, { status: 404 });
        if (invitation.used) return NextResponse.json({ message: 'Invitation déjà utilisée' }, { status: 409 });

        let user = await prisma.user.findUnique({ where: { email: invitation.email } });
        if (!user) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await prisma.user.create({
                data: {
                    email: invitation.email,
                    name: '',
                    password: hashedPassword,
                    role: 'COLLABORATOR',
                },
            });
        }

        await prisma.kanban.update({
            where: { id: invitation.kanbanId },
            data: { members: { connect: { id: user.id } } },
        });

        await prisma.invitation.update({
            where: { token },
            data: { used: true, usedAt: new Date() },
        });

        const jwtToken = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        return NextResponse.json({
            message: 'Invitation acceptée',
            token: jwtToken,
            user: { id: user.id, email: user.email, role: user.role },
            kanbanId: invitation.kanbanId,
        });
    } catch (error) {
        console.error('POST /api/invitations/[token]/accept error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
