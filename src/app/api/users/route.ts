// src/app/api/users/route.ts
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatarUrl: true,
                createdAt: true,
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
