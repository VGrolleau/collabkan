import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // const adminPassword = process.env.ADMIN_PASSWORD;

    // if (!adminPassword) {
    //     throw new Error("ADMIN_PASSWORD n'est pas défini dans le fichier .env");
    // }

    // const passwordHash = await bcrypt.hash(adminPassword, 10);

    // const admin = await prisma.user.upsert({
    //     where: { email: 'contact@virginiegrolleau.com' },
    //     update: {},
    //     create: {
    //         email: 'contact@virginiegrolleau.com',
    //         name: 'Virginie',
    //         role: Role.ADMIN,
    //         password: passwordHash,
    //         avatarUrl: '', // ou une image par défaut
    //     },
    // });

    // console.log('✅ Utilisateur admin créé :', admin.name);

    // await prisma.label.createMany({
    //     data: [
    //         { name: "Urgent", color: "#FF4D4F" },
    //         { name: "En cours", color: "#1890FF" },
    //         { name: "Bloqué", color: "#FAAD14" },
    //         { name: "Terminé", color: "#52C41A" },
    //     ],
    //     skipDuplicates: true, // évite les doublons si déjà existants
    // });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
