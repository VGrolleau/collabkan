// src/app/api/cards/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { title, description = '', order, columnId } = await request.json();

        if (!title || !columnId) {
            return NextResponse.json({ error: 'Titre et colonne requis' }, { status: 400 });
        }

        const existingCards = await prisma.card.count({
            where: { columnId },
        });

        const card = await prisma.card.create({
            data: {
                title,
                description,
                columnId,
                order: existingCards + 1, // ou juste existingCards si 0-based
            },
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error('Erreur création carte:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
