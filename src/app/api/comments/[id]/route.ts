import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { content } = await req.json();
        const updated = await prisma.comment.update({
            where: { id: params.id },
            data: { content: String(content) },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/comments/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.comment.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/comments/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
