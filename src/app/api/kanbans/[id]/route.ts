import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { name, description } = await req.json();
        const updated = await prisma.kanban.update({
            where: { id: params.id },
            data: { name, description },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/kanbans/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
