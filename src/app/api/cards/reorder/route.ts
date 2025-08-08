import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
    try {
        const { columnId, cards } = await req.json();

        if (!Array.isArray(cards) || cards.length === 0) {
            return NextResponse.json({ error: "Aucune carte à mettre à jour" }, { status: 400 });
        }

        await Promise.all(
            cards.map(({ id, order }: { id: string; order: number }) =>
                prisma.card.update({
                    where: { id },
                    data: { order }, // uniquement order, pas columnId
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur mise à jour ordre cartes :", error);
        return NextResponse.json({ error: "Erreur lors de la mise à jour de l'ordre" }, { status: 500 });
    }
}
