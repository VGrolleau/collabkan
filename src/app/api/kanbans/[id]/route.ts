// src/app/api/kanbans/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ---- GET un Kanban complet (colonnes + cartes + détails) ----
export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const kanban = await prisma.kanban.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                columns: {
                    orderBy: { order: "asc" },
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        cards: {
                            orderBy: { order: "asc" },
                            select: {
                                id: true,
                                title: true,
                                order: true,
                                description: true,
                                dueDate: true,
                                labels: {
                                    select: { id: true, name: true, color: true },
                                },
                                assignees: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        role: true,
                                        avatarUrl: true,
                                    },
                                },
                                comments: {
                                    orderBy: { createdAt: "asc" },
                                    select: {
                                        id: true,
                                        content: true,
                                        createdAt: true,
                                        author: {
                                            select: { id: true, name: true },
                                        },
                                    },
                                },
                                attachments: {
                                    select: { id: true, url: true, filename: true },
                                },
                            },
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

// ---- PUT mise à jour Kanban ----
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

// ---- DELETE suppression Kanban ----
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
