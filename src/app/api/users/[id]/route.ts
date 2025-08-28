// src/app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/session';

export async function DELETE(
    request: Request,
    context: { params: { id: string } } | Promise<{ params: { id: string } }>
) {
    const { params } = await context;
    const currentUser = await getUserFromRequest(request);

    if (!currentUser || currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    if (params.id === currentUser.id) {
        return NextResponse.json({ error: 'Vous ne pouvez pas vous supprimer vous-même' }, { status: 400 });
    }

    try {
        await prisma.user.delete({ where: { id: params.id } });
        return NextResponse.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}
