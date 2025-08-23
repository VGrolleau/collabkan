// src/app/api/cards/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Type côté requête PUT
type CardUpdateBody = {
    title?: string;
    description?: string;
    order?: number;
    columnId?: string;
    labels?: { id: string }[];
    assignees?: { id: string }[];
    attachments?: { filename: string; url: string }[];
    checklist?: { text: string; done: boolean }[];
    comments?: { content: string; authorId?: string }[];
    dueDate?: string | null;
};

// Type côté client (comme dans CardModal.tsx)
export type CommentClient = {
    id: string;
    author: string;
    date: string;
    content: string;
};

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body: CardUpdateBody = await req.json();

        const data: Prisma.CardUpdateInput = {};

        if (body.title !== undefined) data.title = body.title;
        if (body.description !== undefined) data.description = body.description;
        if (body.order !== undefined) data.order = body.order;
        if (body.dueDate !== undefined)
            data.dueDate = body.dueDate ? new Date(body.dueDate) : null;

        if (body.columnId !== undefined) {
            data.column = { connect: { id: body.columnId } };
        }

        if (body.labels !== undefined) {
            data.labels = {
                set: [],
                connect: body.labels.map((l) => ({ id: l.id })),
            };
        }

        if (body.assignees !== undefined) {
            data.assignees = {
                set: [],
                connect: body.assignees.map((a) => ({ id: a.id })),
            };
        }

        if (body.checklist) {
            data.checklist = {
                deleteMany: {},
                create: body.checklist.map((item) => ({
                    text: item.text,
                    done: item.done,
                })),
            };
        }

        if (body.attachments) {
            data.attachments = {
                deleteMany: {},
                create: body.attachments.map((a) => ({
                    filename: a.filename,
                    url: a.url,
                })),
            };
        }

        if (body.comments) {
            // Si authorId manquant (nouveau commentaire), on peut injecter l'ID de l'utilisateur connecté
            const userId = "CURRENT_USER_ID"; // <-- à remplacer par l'ID réel du user connecté
            data.comments = {
                create: body.comments.map((c) => ({
                    content: c.content,
                    author: { connect: { id: c.authorId || userId } },
                })),
            };
        }

        const updatedCard = await prisma.card.update({
            where: { id },
            data,
            include: {
                labels: true,
                checklist: true,
                assignees: true,
                attachments: true,
                comments: { include: { author: true } },
            },
        });

        // 🔑 Mapper les commentaires côté client
        const mappedCard = {
            ...updatedCard,
            comments: updatedCard.comments.map((c) => ({
                id: c.id,
                content: c.content,
                author: c.author?.name || "Inconnu",
                date: c.createdAt.toISOString(),
            })),
        };

        return NextResponse.json(mappedCard);
    } catch (error) {
        console.error("Erreur update card:", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

export const dynamic = "force-dynamic";

export async function DELETE(
    _req: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await ctx.params;

        await prisma.card.delete({ where: { id } });

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
            return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
        }

        // 🔑 Mapper les commentaires pour le front
        const safeCard = {
            ...card,
            comments: card.comments.map((c) => ({
                id: c.id,
                content: c.content,
                author: c.author?.name ?? "Inconnu",
                date: c.createdAt.toISOString(),
            })),
        };

        return NextResponse.json(safeCard);
    } catch (error) {
        console.error("GET /api/cards/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
