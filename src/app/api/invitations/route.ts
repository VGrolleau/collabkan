// src/app/api/invitations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    const body = await request.json();
    const { email, kanbanId, role = 'COLLABORATOR' } = body;

    if (!email || !kanbanId) {
        return NextResponse.json(
            { error: 'Email and kanbanId are required.' },
            { status: 400 }
        );
    }

    try {
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
            data: {
                email,
                kanbanId,
                token,
                role,
            },
        });

        // TODO: Envoi d'email (Resend, Mailjet, etc.)

        return NextResponse.json(
            {
                message: 'Invitation created successfully.',
                token: invitation.token,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('[INVITATION_CREATE_ERROR]', error);
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500 }
        );
    }
}
