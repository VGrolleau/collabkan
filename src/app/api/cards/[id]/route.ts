import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type CardUpdateBody = {
    title?: string;
    description?: string;
    order?: number;
    columnId?: string;
    dueDate?: string | null;
    labels?: { id: string }[];
    assignees?: { id: string }[];
    checklist?: {
        id: string;
        text: string;
        done: boolean;
    }[];
};

function buildCardUpdateInput(body: CardUpdateBody): Prisma.CardUpdateInput {
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
            set: body.labels.map(l => ({ id: l.id })),
        };
    }

    if (body.assignees !== undefined) {
        data.assignees = {
            set: body.assignees.map(a => ({ id: a.id })),
        };
    }

    if (body.checklist !== undefined) {
        data.checklist = {
            connect: body.checklist.map(i => ({ id: i.id }))
        };
    }

    return data;
}

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const card = await prisma.card.findUnique({
            where: { id },
            include: {
                labels: true,
                assignees: true,
                comments: {
                    include: {
                        author: { select: { id: true, name: true } },
                    },
                    orderBy: { createdAt: "asc" },
                },
                checklist: true,
                attachments: true,
            },
        });

        if (!card) {
            return NextResponse.json({ error: "Carte introuvable" }, { status: 404 });
        }

        return NextResponse.json(card);
    } catch (err) {
        console.error("Erreur GET card:", err);
        return NextResponse.json(
            { error: "Erreur serveur lors de la récupération de la carte" },
            { status: 500 }
        );
    }
}

// ---- PUT mise à jour carte ----
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body: CardUpdateBody = await req.json();
        const data = buildCardUpdateInput(body);

        const updatedCard = await prisma.card.update({
            where: { id },
            data,
            include: {
                assignees: true,
                labels: true,
                comments: true,
                attachments: true,
                checklist: true,
            },
        });

        return NextResponse.json(updatedCard);
    } catch (error) {
        console.error("Erreur update card:", error);
        return new NextResponse("Erreur interne", { status: 500 });
    }
}

// ---- DELETE suppression carte ----
export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
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

export const dynamic = "force-dynamic";
