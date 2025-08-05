import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clear() {
    await prisma.invitation.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.checklistItem.deleteMany();
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.kanban.deleteMany();
    await prisma.user.deleteMany(); // à la fin, car tout est lié

    console.log("✅ Données supprimées");
}

clear()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
