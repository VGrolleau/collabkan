import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const session = req.cookies.get('session_user_id');

    const isLoggedIn = Boolean(session);
    const isLoginPage = req.nextUrl.pathname === '/login';

    if (!isLoggedIn && !isLoginPage) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    if (isLoggedIn && isLoginPage) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/kanban/:path*',
        '/profile', // ✅ ajoute cette ligne
    ],
};
