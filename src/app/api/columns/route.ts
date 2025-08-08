// src/app/api/columns/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { title, kanbanId, order } = await req.json();

        if (!title || !kanbanId) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const newColumn = await prisma.column.create({
            data: {
                title: String(title),
                order: Number(order),
                kanban: { connect: { id: String(kanbanId) } },
            },
        });

        return NextResponse.json(newColumn, { status: 201 });
    } catch (error) {
        console.error('POST /api/columns error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function GET() {
    // Optionnel : pour tester la route
    const columns = await prisma.column.findMany();
    return NextResponse.json(columns);
}
