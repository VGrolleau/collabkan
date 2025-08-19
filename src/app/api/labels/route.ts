import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const labels = await prisma.label.findMany();
        return NextResponse.json(labels);
    } catch (error) {
        console.error("GET /api/labels error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { cardId, name, color } = await req.json();

    const label = await prisma.label.create({
        data: {
            name,
            color,
            cards: cardId ? { connect: [{ id: cardId }] } : undefined, // <- tableau obligatoire
        },
    });

    return NextResponse.json(label);
}