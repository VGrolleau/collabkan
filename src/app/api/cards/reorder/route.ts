// src/app/api/cards/reorder/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const { cards } = await req.json();

        if (!Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json(
                { error: "Aucune carte à mettre à jour" },
                { status: 400 }
            );
        }

        // Groupement par colonne
        const byColumn: Record<string, { id: string; order: number; columnId: string }[]> = {};
        for (const card of cards) {
            if (!card.id || card.order === undefined || !card.columnId) continue;
            if (!byColumn[card.columnId]) byColumn[card.columnId] = [];
            byColumn[card.columnId].push(card);
        }

        // Réordonner proprement chaque colonne
        for (const colId in byColumn) {
            byColumn[colId] = byColumn[colId]
                .sort((a, b) => a.order - b.order)
                .map((c, idx) => ({ ...c, order: idx }));
        }

        // Mise à jour transactionnelle
        await prisma.$transaction(
            Object.values(byColumn).flat().map(c =>
                prisma.card.update({
                    where: { id: c.id },
                    data: { order: c.order, columnId: c.columnId },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur mise à jour cartes :", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour des cartes" },
            { status: 500 }
        );
    }
}
