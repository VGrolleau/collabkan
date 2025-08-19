// src/app/api/invitations/[token]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type Params = { params: { token: string } };

export async function GET(_: Request, { params }: Params) {
    const invitation = await prisma.invitation.findUnique({
        where: { token: params.token },
        include: { kanban: true },
    });

    if (!invitation || invitation.used) {
        return NextResponse.json({ message: 'Invalid or used invitation' }, { status: 404 });
    }

    return NextResponse.json({ invitation });
}
