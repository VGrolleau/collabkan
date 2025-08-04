import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { title, description, columnId } = await req.json();
        const updated = await prisma.card.update({
            where: { id: params.id },
            data: {
                title,
                description,
                column: columnId ? { connect: { id: columnId } } : undefined,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/cards/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.card.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/cards/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}