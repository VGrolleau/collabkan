// src/app/api/users/change-password/route.ts
import { compare, hash } from "bcrypt";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/session"; // par exemple

export async function POST(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    // 1. Vérifie que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!existingUser) {
        return new Response("Utilisateur non trouvé", { status: 404 });
    }

    // 2. Vérifie l'ancien mot de passe
    const isMatch = await compare(currentPassword, existingUser.password);
    if (!isMatch) {
        return new Response("Mot de passe actuel incorrect", { status: 403 });
    }

    // 3. Hash du nouveau mot de passe
    const hashedPassword = await hash(newPassword, 10);

    // 4. Mise à jour
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
    });

    return new Response("Mot de passe mis à jour", { status: 200 });
}
