// src/app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
    const response = NextResponse.json({ message: 'Déconnexion réussie' });

    // Supprime le cookie en le réinitialisant
    response.cookies.set('session_user_id', '', {
        path: '/',
        expires: new Date(0),
    });

    return response;
}
