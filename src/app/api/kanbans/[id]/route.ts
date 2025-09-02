// src/app/api/kanbans/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Récupérer un kanban par ID
export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const kanban = await prisma.kanban.findUnique({
            where: { id },
            include: {
                columns: {
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        cards: {
                            orderBy: { order: "asc" },
                            select: { id: true, title: true, order: true, description: true }
                        },
                    },
                },
            },
        });

        if (!kanban) {
            return NextResponse.json({ error: "Kanban non trouvé" }, { status: 404 });
        }

        return NextResponse.json(kanban);
    } catch (error) {
        console.error("GET /api/kanbans/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Mettre à jour un kanban
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { name, description } = await req.json();

        const updated = await prisma.kanban.update({
            where: { id },
            data: { name, description },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/kanbans/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

// Supprimer un kanban
export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        await prisma.kanban.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/kanbans/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export const dynamic = "force-dynamic";
