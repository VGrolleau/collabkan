import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const column = await prisma.column.findUnique({
            where: { id },
            include: {
                cards: {
                    include: { labels: true, assignees: true, attachments: true, checklist: true, comments: { include: { author: true } } },
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!column) return NextResponse.json({ error: "Colonne introuvable" }, { status: 404 });

        const safeColumn = {
            ...column,
            cards: column.cards.map(c => ({
                ...c,
                dueDate: c.dueDate ? c.dueDate.toISOString() : null,
                comments: c.comments.map(cm => ({
                    id: cm.id,
                    content: cm.content,
                    author: cm.author?.name ?? "Inconnu",
                    date: cm.createdAt.toISOString(),
                })),
            })),
        };

        return NextResponse.json(safeColumn);
    } catch (error) {
        console.error("GET /api/columns/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { title } = await req.json();
        const updated = await prisma.column.update({
            where: { id },
            data: { title: String(title) },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/columns/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.column.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/columns/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
