import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function POST(req: Request) {
    try {
        const { title, order, columnId } = await req.json();
        const card = await prisma.card.create({
            data: {
                title: String(title),
                order: Number(order),
                column: { connect: { id: columnId } },
            },
        });
        return NextResponse.json(card);
    } catch (error) {
        console.error('POST /api/cards error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}