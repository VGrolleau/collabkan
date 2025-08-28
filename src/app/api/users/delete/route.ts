import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 });

    try {
        await prisma.user.deleteMany({ where: { email } });
        return NextResponse.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}