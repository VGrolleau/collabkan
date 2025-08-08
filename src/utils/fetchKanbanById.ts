import { Kanban } from "../types";

export async function fetchKanbanById(id: string): Promise<Kanban | null> {
    try {
        const res = await fetch(`/api/kanbans/${id}`, {
            credentials: "include",
        });

        if (!res.ok) {
            console.error("Erreur API:", await res.text());
            return null;
        }

        const data: Kanban = await res.json();
        return data;
    } catch (error) {
        console.error("Erreur fetchKanbanById:", error);
        return null;
    }
}
