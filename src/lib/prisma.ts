import { PrismaClient } from "@prisma/client";

declare global {
    // On garde une instance globale pour éviter les doublons en dev
    var prisma: PrismaClient | undefined;
}

export const prisma =
    global.prisma ??
    new PrismaClient({
        log: ["query", "error", "warn"],
    });

if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}