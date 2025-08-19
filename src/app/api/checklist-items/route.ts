import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { text, done = false, cardId } = await req.json();
        const item = await prisma.checklistItem.create({
            data: {
                text: String(text),
                done: Boolean(done),
                card: { connect: { id: String(cardId) } },
            },
        });
        return NextResponse.json(item);
    } catch (error) {
        console.error('POST /api/checklist-items error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
