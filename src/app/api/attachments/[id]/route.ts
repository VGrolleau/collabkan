import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { filename, url } = await req.json();
        const updated = await prisma.attachment.update({
            where: { id: params.id },
            data: {
                filename: filename ? String(filename) : undefined,
                url: url ? String(url) : undefined,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/attachments/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.attachment.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/attachments/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { cardId: string } }) {
    try {
        const attachments = await prisma.attachment.findMany({
            where: { cardId: params.cardId },
        });
        return NextResponse.json(attachments);
    } catch (error) {
        console.error('GET /api/attachments/[cardId] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
