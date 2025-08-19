import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { filename, url, cardId } = await req.json();

        if (!cardId) {
            return NextResponse.json({ error: 'cardId manquant' }, { status: 400 });
        }

        // Vérifie que la carte existe
        const cardExists = await prisma.card.findUnique({ where: { id: cardId } });
        if (!cardExists) {
            return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 });
        }

        const attachment = await prisma.attachment.create({
            data: {
                filename: String(filename),
                url: String(url),
                card: { connect: { id: cardId } },
            },
        });
        return NextResponse.json(attachment);
    } catch (error) {
        console.error('POST /api/attachments error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}