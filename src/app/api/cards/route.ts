// src/app/api/cards/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---- GET toutes les cartes triées ----
export async function GET() {
    try {
        const cards = await prisma.card.findMany({
            orderBy: [
                { columnId: "asc" }, // d’abord par colonne
                { order: "asc" },    // puis par ordre
            ],
        });

        return NextResponse.json(cards);
    } catch (error) {
        console.error("Erreur récupération cartes:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}

// ---- POST nouvelle carte ----
export async function POST(request: Request) {
    try {
        const { title, description = "", columnId } = await request.json();

        if (!title || !columnId) {
            return NextResponse.json(
                { error: "Titre et colonne requis" },
                { status: 400 }
            );
        }

        // On place la nouvelle carte à la fin de sa colonne
        const existingCards = await prisma.card.count({
            where: { columnId },
        });

        const card = await prisma.card.create({
            data: {
                title,
                description,
                columnId,
                order: existingCards, // 0-based, la nouvelle sera à la fin
            },
        });

        return NextResponse.json(card);
    } catch (error) {
        console.error("Erreur création carte:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}
