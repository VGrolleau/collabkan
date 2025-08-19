// src/app/api/invitations/[token]/accept/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Le type context permet de gérer le await pour récupérer params
export async function POST(
    req: Request,
    context: { params: { token: string } } | Promise<{ params: { token: string } }>
) {
    // On await context pour récupérer params proprement (Next.js v13+)
    const { params } = await context;

    // Simule l'email de l'utilisateur connecté (à remplacer par ta logique d'auth)
    const userEmail = 'collab@example.com';

    // Recherche l'invitation par token
    const invitation = await prisma.invitation.findUnique({
        where: { token: params.token },
    });

    console.log('Invitation trouvée:', invitation);

    if (!invitation) {
        return NextResponse.json({ message: 'Invitation not found' }, { status: 400 });
    }

    if (invitation.used) {
        return NextResponse.json({ message: 'Invitation already used' }, { status: 400 });
    }

    if (invitation.email !== userEmail) {
        return NextResponse.json({ message: 'Invitation email mismatch' }, { status: 400 });
    }

    // Ajoute l'utilisateur au kanban
    await prisma.kanban.update({
        where: { id: invitation.kanbanId },
        data: {
            members: { connect: { email: userEmail } },
        },
    });

    // Marque l'invitation comme utilisée
    await prisma.invitation.update({
        where: { token: invitation.token },
        data: {
            used: true,
            usedAt: new Date(),
        },
    });

    return NextResponse.json({ message: 'Invitation accepted' });
}
