import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.column.delete({ where: { id: String(params.id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/columns/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { title } = await req.json();
        const updated = await prisma.column.update({
            where: { id: String(params.id) },
            data: { title: String(title) },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/columns/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}