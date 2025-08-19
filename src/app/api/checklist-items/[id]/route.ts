import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const { text, done } = await req.json();
        const updated = await prisma.checklistItem.update({
            where: { id: params.id },
            data: {
                text: text !== undefined ? String(text) : undefined,
                done: done !== undefined ? Boolean(done) : undefined,
            },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/checklist-items/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.checklistItem.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/checklist-items/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
