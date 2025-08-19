import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();

        const data: Prisma.CardUpdateInput = {};

        if (body.title !== undefined) data.title = body.title;
        if (body.description !== undefined) data.description = body.description;
        if (body.order !== undefined) data.order = body.order;

        if (body.columnId !== undefined) {
            data.column = { connect: { id: body.columnId } };
        }

        if (body.labels !== undefined) {
            data.labels = {
                set: [], // reset labels existants
                connect: body.labels.map((l: { id: string }) => ({ id: l.id })),
            };
        }

        if (body.assignees !== undefined) {
            data.assignees = {
                set: [], // reset assignees existants
                connect: body.assignees.map((a: { id: string }) => ({ id: a.id })),
            };
        }

        if (body.attachments !== undefined) {
            data.attachments = {
                deleteMany: {}, // supprime tous les anciens
                create: body.attachments.map((a: { url: string; name: string }) => ({
                    url: a.url,
                    name: a.name,
                })),
            };
        }

        if (body.comments !== undefined) {
            data.comments = {
                create: body.comments.map((c: { text: string }) => ({ text: c.text })),
            };
        }

        if (body.dueDate !== undefined) {
            data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        }

        const updatedCard = await prisma.card.update({
            where: { id },
            data,
            include: {
                labels: true,
                checklist: true,
                comments: { include: { author: true } },
                assignees: true,
                attachments: true,
            },
        });

        return NextResponse.json(updatedCard);
    } catch (error) {
        console.error("Erreur update card:", error);
        return NextResponse.json(
            { error: "Erreur lors de la mise à jour de la carte" },
            { status: 500 }
        );
    }
}

export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await ctx.params;

        await prisma.card.delete({
            where: { id },
        });

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Erreur DELETE /api/cards/[id]:", error);
        return NextResponse.json(
            { error: "Impossible de supprimer la carte" },
            { status: 500 }
        );
    }
}

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const card = await prisma.card.findUnique({
            where: { id: params.id },
            include: {
                checklist: true,
                labels: true,
                comments: { include: { author: true } },
                assignees: true,
                attachments: true,
            },
        });

        if (!card) {
            return NextResponse.json(
                { error: "Carte introuvable" },
                { status: 404 }
            );
        }

        // 🔑 On clone la carte et on ne touche qu'aux commentaires
        const safeCard = {
            ...card,
            comments: card.comments.map((c) => ({
                id: c.id,
                content: c.content,
                createdAt: c.createdAt.toISOString(),
                author: c.author?.name ?? "Inconnu",
            })),
        };

        return NextResponse.json(safeCard);
    } catch (error) {
        console.error("GET /api/cards/[id] error:", error);
        return NextResponse.json(
            { error: "Erreur serveur" },
            { status: 500 }
        );
    }
}