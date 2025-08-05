// src/app/api/kanbans/route.ts
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/session';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const user = await getUserFromRequest(request);

    if (!user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const kanbans = await prisma.kanban.findMany({
        where: {
            members: {
                some: {
                    id: user.id,
                },
            },
        },
        include: {
            columns: {
                include: {
                    cards: true,
                },
            },
        },
    });

    return NextResponse.json(kanbans);
}
