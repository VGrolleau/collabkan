import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
    try {
        const kanbans = await prisma.kanban.findMany({
            include: {
                columns: {
                    include: {
                        cards: true,
                    },
                },
                owner: true,
                members: true,
            },
        });
        return NextResponse.json(kanbans);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
