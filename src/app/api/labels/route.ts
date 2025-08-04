import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET() {
    try {
        const labels = await prisma.label.findMany();
        return NextResponse.json(labels);
    } catch (error) {
        console.error('GET /api/labels error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, color } = await req.json();
        const label = await prisma.label.create({
            data: {
                name: String(name),
                color: String(color),
            },
        });
        return NextResponse.json(label);
    } catch (error) {
        console.error('POST /api/labels error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
