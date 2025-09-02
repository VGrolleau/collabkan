import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const label = await prisma.label.findUnique({ where: { id } });
        if (!label) return NextResponse.json({ error: "Label non trouvé" }, { status: 404 });
        return NextResponse.json(label);
    } catch (error) {
        console.error("GET /api/labels/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const { name, color } = await req.json();
        const updated = await prisma.label.update({ where: { id }, data: { name, color } });
        return NextResponse.json(updated);
    } catch (error) {
        console.error("PUT /api/labels/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        await prisma.label.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/labels/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
