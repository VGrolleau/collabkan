import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { title, description } = await request.json();

    if (!title) {
        return NextResponse.json({ error: "Le titre est requis" }, { status: 400 });
    }

    try {
        const newKanban = await prisma.kanban.create({
            data: {
                name: title,
                description: description || "",
                ownerId: user.id,
                members: { connect: { id: user.id } },
                columns: {
                    create: [
                        {
                            title: "À faire",
                            order: 1,
                            cards: {
                                create: [{ title: "Ma première carte", order: 1, description: "" }],
                            },
                        },
                        { title: "En cours", order: 2, cards: { create: [] } },
                        { title: "Terminé", order: 3, cards: { create: [] } },
                    ],
                },
            },
            include: {
                columns: {
                    include: { cards: true },
                },
            },
        });

        return NextResponse.json(newKanban);
    } catch (error) {
        return NextResponse.json({ error: "Erreur lors de la création" }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const user = await getUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    try {
        // Charger uniquement les infos essentielles pour la liste
        const kanbans = await prisma.kanban.findMany({
            where: { members: { some: { id: user.id } } },
            select: {
                id: true,
                name: true,
                description: true,
                columns: {
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        // juste le nombre de cartes pour l'aperçu
                        _count: { select: { cards: true } },
                    },
                    orderBy: { order: "asc" },
                },
            },
        });

        return NextResponse.json(kanbans);
    } catch (error) {
        console.error("GET /api/kanbans error:", error);
        return NextResponse.json({ error: "Erreur lors de la récupération" }, { status: 500 });
    }
}