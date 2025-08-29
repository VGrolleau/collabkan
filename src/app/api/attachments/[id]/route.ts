import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type RequestEvent = {
    params: { id: string };
};

export async function GET(_req: Request, event: RequestEvent) {
    const { id } = event.params;
    try {
        const attachments = await prisma.attachment.findMany({
            where: { cardId: id },
        });
        return NextResponse.json(attachments);
    } catch (error) {
        console.error('GET /api/attachments/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(req: Request, event: RequestEvent) {
    const { id } = event.params;
    try {
        const { filename, url } = await req.json();
        const updated = await prisma.attachment.update({
            where: { id },
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

export async function DELETE(_req: Request, event: RequestEvent) {
    const { id } = event.params;
    try {
        await prisma.attachment.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/attachments/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
