import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, userId, kanbanId, role = 'COLLABORATOR' } = body;

    if (!kanbanId) {
        return NextResponse.json(
            { error: 'kanbanId is required.' },
            { status: 400 }
        );
    }

    // Si ni email ni userId
    if (!email && !userId) {
        return NextResponse.json(
            { error: 'Email or userId is required.' },
            { status: 400 }
        );
    }

    try {
        if (email) {
            // Invitation par email
            const existing = await prisma.invitation.findFirst({
                where: { email, kanbanId, used: false },
            });

            if (existing) {
                return NextResponse.json(
                    {
                        message: 'An invitation already exists.',
                        token: existing.token,
                    },
                    { status: 409 }
                );
            }

            const token = randomUUID();
            const invitation = await prisma.invitation.create({
                data: { email, kanbanId, token, role },
            });

            return NextResponse.json(
                { message: 'Invitation created successfully.', token: invitation.token },
                { status: 201 }
            );
        }

        if (userId) {
            // Invitation pour un utilisateur existant → ajout direct au Kanban
            // Vérifier si l'utilisateur est déjà membre
            const kanban = await prisma.kanban.findUnique({
                where: { id: kanbanId },
                include: { members: true },
            });

            if (!kanban) return NextResponse.json({ error: 'Kanban not found' }, { status: 404 });

            if (kanban.members.some(m => m.id === userId)) {
                return NextResponse.json({ message: 'User already a member' }, { status: 409 });
            }

            await prisma.kanban.update({
                where: { id: kanbanId },
                data: { members: { connect: { id: userId } } },
            });

            return NextResponse.json({ message: 'User added to Kanban successfully' }, { status: 200 });
        }
    } catch (error) {
        console.error('[INVITATION_CREATE_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
