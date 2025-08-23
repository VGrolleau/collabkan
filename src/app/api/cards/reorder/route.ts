import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const { cards } = await req.json();

        if (!Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json({ error: "Aucune carte à mettre à jour" }, { status: 400 });
        }

        // Mise à jour de toutes les cartes en parallèle
        await Promise.all(
            cards.map(({ id, order, columnId }: { id: string; order: number; columnId: string }) =>
                prisma.card.update({
                    where: { id },
                    data: { order, columnId },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur mise à jour cartes :", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour des cartes" }, { status: 500 });
    }
}
