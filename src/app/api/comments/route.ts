import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { content, authorId, cardId } = await req.json();
        const comment = await prisma.comment.create({
            data: {
                content: String(content),
                author: { connect: { id: String(authorId) } },
                card: { connect: { id: String(cardId) } },
            },
        });
        return NextResponse.json(comment);
    } catch (error) {
        console.error('POST /api/comments error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
