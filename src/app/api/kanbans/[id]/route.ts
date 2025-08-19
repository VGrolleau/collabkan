// src/app/api/kanbans/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { name, description } = await req.json();
        const updated = await prisma.kanban.update({
            where: { id: params.id },
            data: { name, description },
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('PUT /api/kanbans/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;

    try {
        await prisma.kanban.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/kanbans/[id] error:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        const kanban = await prisma.kanban.findUnique({
            where: { id: params.id },
            include: {
                columns: {
                    orderBy: { order: "asc" },
                    include: { cards: { orderBy: { id: "asc" } } },
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
