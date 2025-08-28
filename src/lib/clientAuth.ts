// src/lib/clientAuth.ts
export function getToken() {
    return localStorage.getItem('token');
}

export function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export function getUserRole(): string | null {
    const token = getToken();
    if (!token) return null;
    const payload = parseJwt(token);
    return payload?.role || null;
}
