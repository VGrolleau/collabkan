// src/app/api/cards/[id]/comments/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id: cardId } = await context.params;

    const comments = await prisma.comment.findMany({
        where: { cardId },
        include: { author: true },
        orderBy: { createdAt: "asc" },
    });

    // Transformer pour le front
    const mapped = comments.map(c => ({
        id: c.id,
        content: c.content,
        date: c.createdAt.toISOString(),
        author: c.author.name ?? "Utilisateur",
    }));

    return NextResponse.json(mapped);
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id: cardId } = await context.params;
    const { content, authorId } = await req.json();

    if (!content || !authorId) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const newComment = await prisma.comment.create({
        data: {
            content,
            cardId,
            authorId,
        },
        include: { author: true },
    });

    const mapped = {
        id: newComment.id,
        content: newComment.content,
        date: newComment.createdAt.toISOString(),
        author: newComment.author.name ?? "Utilisateur",
    };

    return NextResponse.json(mapped);
}
