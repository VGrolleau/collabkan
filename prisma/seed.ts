import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            role: 'ADMIN',
        },
    });

    const existingKanban = await prisma.kanban.findFirst({
        where: { name: 'Seed Kanban' },
    });

    if (!existingKanban) {
        await prisma.kanban.create({
            data: {
                name: 'Seed Kanban',
                ownerId: admin.id,
                members: { connect: { id: admin.id } },
            },
        });
    }

    console.log('Seed terminé');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
