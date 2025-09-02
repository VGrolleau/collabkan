// src/app/api/kanbans/[id]/members/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        const kanban = await prisma.kanban.findUnique({
            where: { id },
            include: {
                members: {
                    select: { id: true, name: true, email: true, avatarUrl: true, role: true },
                },
            },
        });

        if (!kanban) {
            return NextResponse.json({ error: "Kanban introuvable" }, { status: 404 });
        }

        return NextResponse.json(kanban.members);
    } catch (error) {
        console.error("GET /api/kanbans/[id]/members error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
