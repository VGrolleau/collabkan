// src/api/kanban.ts
import { Kanban, Column } from "../types";

const API_BASE = "/api/kanban";

export async function fetchKanban(id: number): Promise<Kanban> {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Erreur lors du chargement du kanban");
    return res.json();
}

export async function updateKanbanColumns(id: number, columns: Column[]): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}/columns`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columns }),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour des colonnes");
}

export async function updateKanbanInfo(id: number, updated: { name?: string; description?: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour des infos");
}
