import { CardElement } from "@/types";

// ✅ Fonction utilitaire pour mettre à jour une carte
export async function updateCard(
    id: string,
    updates: Partial<CardElement>
): Promise<CardElement> {
    const res = await fetch(`/api/cards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erreur API updateCard: ${errorText}`);
    }

    return res.json();
}
