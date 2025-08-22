import { getUserFromRequest } from "@/lib/session";
import { prisma } from "@/lib/prisma"; // ton client Prisma

export async function GET(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    return new Response(
        JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl ?? null,
        }),
        {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }
    );
}

export async function PUT(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, email, avatarUrl } = body;

        // ⚠️ Tu peux filtrer/valider les champs à mettre à jour ici
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: name ?? undefined,
                email: email ?? undefined,
                avatarUrl: avatarUrl ?? undefined,
            },
        });

        return new Response(
            JSON.stringify({
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatarUrl: updatedUser.avatarUrl ?? null,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        );
    } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
