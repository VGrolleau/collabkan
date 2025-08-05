// src/app/api/debug/admin/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    const admin = await prisma.user.findUnique({
        where: { email: 'contact@virginiegrolleau.com' },
    });

    if (!admin) {
        return NextResponse.json({ message: 'Admin non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        password: admin.password,
        avatarUrl: admin.avatarUrl,
        createdAt: admin.createdAt,
    });
}
