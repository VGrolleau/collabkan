// src/app/api/invitations/[token]/accept/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'ma-super-cle-secrete';

export async function POST(req: Request, context: { params: { token: string } }) {
    const { params } = context;
    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
        return NextResponse.json({ message: 'Mot de passe requis (≥6 caractères)' }, { status: 400 });
    }

    // Recherche de l'invitation
    const invitation = await prisma.invitation.findUnique({
        where: { token: params.token },
    });

    if (!invitation) {
        return NextResponse.json({ message: 'Invitation non trouvée' }, { status: 404 });
    }

    if (invitation.used) {
        return NextResponse.json({ message: 'Invitation déjà utilisée' }, { status: 409 });
    }

    // Vérifie si l'utilisateur existe déjà
    let user = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (!user) {
        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        user = await prisma.user.create({
            data: {
                email: invitation.email,
                name: '', // peut être mis à jour plus tard via le front
                password: hashedPassword,
                role: 'COLLABORATOR',
            },
        });
    }

    // Ajoute l'utilisateur au Kanban
    await prisma.kanban.update({
        where: { id: invitation.kanbanId },
        data: {
            members: { connect: { id: user.id } },
        },
    });

    // Marque l'invitation comme utilisée
    await prisma.invitation.update({
        where: { token: invitation.token },
        data: { used: true, usedAt: new Date() },
    });

    // Génère un JWT pour la session de l’invité
    const jwtToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    return NextResponse.json({
        message: 'Invitation acceptée',
        token: jwtToken,
        user: { id: user.id, email: user.email, role: user.role },
        kanbanId: invitation.kanbanId,
    });
}
