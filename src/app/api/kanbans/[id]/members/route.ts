import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type Params = {
    params: { id: string };
};

export async function GET(req: Request, { params }: Params) {
    try {
        const kanbanId = params.id;

        const kanban = await prisma.kanban.findUnique({
            where: { id: kanbanId },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        role: true,
                    },
                },
            },
        });

        if (!kanban) {
            return NextResponse.json({ error: "Kanban introuvable" }, { status: 404 });
        }

        return NextResponse.json(kanban.members);
    } catch (error) {
        console.error("Erreur API /kanbans/[id]/members :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
