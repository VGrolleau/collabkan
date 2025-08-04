import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { filename, url, cardId } = await req.json();
        const attachment = await prisma.attachment.create({
            data: {
                filename: String(filename),
                url: String(url),
                card: { connect: { id: String(cardId) } },
            },
        });
        return NextResponse.json(attachment);
    } catch (error) {
        console.error('POST /api/attachments error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
