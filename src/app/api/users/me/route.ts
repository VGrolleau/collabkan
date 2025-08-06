import { getUserFromRequest } from "@/lib/session"; // ta méthode d'authentification

export async function GET(req: Request) {
    const user = await getUserFromRequest(req);
    if (!user) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Renvoie uniquement ce qui est safe à exposer côté client
    return new Response(
        JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl ?? null,
        }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
            },
        }
    );
}
