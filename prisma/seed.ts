import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fonction simple pour générer un token aléatoire (à remplacer en prod)
function generateToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

async function main() {
    console.log('Seeding database...');

    // 1. Users
    const adminEmail = 'admin@example.com';

    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
        admin = await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin',
                role: 'ADMIN',
            },
        });
    }

    const collabEmail = 'collab@example.com';

    let collab = await prisma.user.findUnique({ where: { email: collabEmail } });
    if (!collab) {
        collab = await prisma.user.create({
            data: {
                email: collabEmail,
                name: 'Collaborator',
                role: 'COLLABORATOR',
            },
        });
    }

    // 2. Kanban
    const kanban = await prisma.kanban.create({
        data: {
            name: 'Projet Alpha',
            description: 'Un projet important pour gérer nos tâches',
            ownerId: admin.id,
            members: {
                connect: [{ id: admin.id }, { id: collab.id }],
            },
        },
    });

    // 3. Colonnes
    const todo = await prisma.column.create({
        data: {
            title: 'À faire',
            order: 1,
            kanbanId: kanban.id,
        },
    });

    const doing = await prisma.column.create({
        data: {
            title: 'En cours',
            order: 2,
            kanbanId: kanban.id,
        },
    });

    const done = await prisma.column.create({
        data: {
            title: 'Fait',
            order: 3,
            kanbanId: kanban.id,
        },
    });

    // 4. Labels
    const urgentLabel = await prisma.label.create({
        data: {
            name: 'Urgent',
            color: 'red',
        },
    });

    // 5. Cards
    const card = await prisma.card.create({
        data: {
            title: 'Configurer le backend',
            description: 'Installer Prisma, créer les modèles, faire les migrations.',
            order: 1,
            columnId: todo.id,
            assignees: {
                connect: [{ id: admin.id }, { id: collab.id }],
            },
            labels: {
                connect: [{ id: urgentLabel.id }],
            },
            checklist: {
                create: [
                    { text: 'Installer Prisma', done: true },
                    { text: 'Créer les modèles', done: false },
                    { text: 'Lancer la migration', done: false },
                ],
            },
            comments: {
                create: {
                    content: 'N’oublie pas d’utiliser PostgreSQL !',
                    authorId: admin.id,
                },
            },
            attachments: {
                create: {
                    filename: 'schema.png',
                    url: 'https://example.com/schema.png',
                },
            },
        },
    });

    // 6. Invitation (exemple d'invitation pour un futur utilisateur)
    const inviteEmail = 'newuser@example.com';

    await prisma.invitation.create({
        data: {
            email: inviteEmail,
            token: generateToken(40),
            kanbanId: kanban.id,
            role: 'COLLABORATOR',
            used: false,
        },
    });

    console.log('🌱 Seeding terminé.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
