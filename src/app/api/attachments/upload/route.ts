// src/app/api/attachments/upload/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const cardId = formData.get("cardId") as string;

        if (!file || !cardId) return NextResponse.json({ error: "Missing data" }, { status: 400 });

        // Créer dossier public/attachments si inexistant
        const attachmentsDir = path.join(process.cwd(), "public", "attachments");
        if (!fs.existsSync(attachmentsDir)) fs.mkdirSync(attachmentsDir, { recursive: true });

        // Générer un nom unique
        const filename = `${Date.now()}-${file.name}`;
        const filePath = path.join(attachmentsDir, filename);

        // Écrire le fichier
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        // Créer l'entrée dans la base
        const attachment = await prisma.attachment.create({
            data: {
                filename: file.name,
                url: `/attachments/${filename}`,
                card: { connect: { id: cardId } },
            },
        });

        return NextResponse.json(attachment);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
