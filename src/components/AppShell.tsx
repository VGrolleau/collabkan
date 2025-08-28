"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard/KanbanBoard";
import { Kanban, Column } from "../types";
import { User } from "@prisma/client";
import { fetchKanbanById } from "@/utils/fetchKanbanById";
import Topbar from "./Topbar";
import { UserProvider, useUser } from "@/context/UserContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { user, refreshUser } = useUser();

    useEffect(() => {
        async function fetchKanbans() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/kanbans", { credentials: "include" });
                if (!res.ok) throw new Error("Erreur lors du chargement");
                const data: Kanban[] = await res.json();
                setKanbans(data);
                if (data.length > 0) setSelected(data[0]);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        }

        fetchKanbans();
        refreshUser(); // on rafraîchit l'utilisateur depuis le contexte
    }, []);

    const handleSelectKanban = async (kanban: Kanban) => {
        const fullKanban = await fetchKanbanById(kanban.id);
        if (fullKanban) setSelected(fullKanban);
        else alert("Impossible de charger le kanban.");
    };

    const handleAddKanban = async (data: { title: string; description: string }) => {
        try {
            const res = await fetch("/api/kanbans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) throw new Error("Erreur lors de la création");
            const createdKanban: Kanban = await res.json();
            setKanbans(prev => [...prev, createdKanban]);
            setSelected(createdKanban);
            return createdKanban;
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
            return null;
        }
    };

    const handleDeleteKanban = async (id: string) => {
        if (!window.confirm("Supprimer ce kanban ?")) return;
        try {
            const res = await fetch(`/api/kanbans/${id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("Erreur lors de la suppression");
            setKanbans(prev => prev.filter(k => k.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
        }
    };

    const updateKanbanInfo = async (updated: { name?: string; description?: string }) => {
        if (!selected) return;
        try {
            const res = await fetch(`/api/kanbans/${selected.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });
            if (!res.ok) throw new Error("Impossible de modifier le Kanban");
            const updatedFullKanban = await fetchKanbanById(selected.id);
            if (updatedFullKanban) {
                setKanbans(prev => prev.map(k => (k.id === selected.id ? updatedFullKanban : k)));
                setSelected(updatedFullKanban);
            }
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur réseau");
        }
    };

    const updateKanbanColumns = (columns: Column[]) => {
        if (!selected) return;
        setKanbans(prev => prev.map(k => (k.id === selected.id ? { ...k, columns } : k)));
        setSelected(prev => (prev ? { ...prev, columns } : prev));
    };

    if (loading) return <p>Chargement…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return <p>Non connecté</p>;

    const isProfilePage = pathname === "/profile";

    return (
        <div className="layout">
            <Sidebar
                kanbans={kanbans}
                onSelect={handleSelectKanban}
                onAddKanban={user.role === "ADMIN" ? handleAddKanban : undefined}
                onDeleteKanban={user.role === "ADMIN" ? handleDeleteKanban : undefined}
            />
            <main className="board-wrap">
                <Topbar />
                <section className="board">
                    {isProfilePage ? children : selected ? (
                        <KanbanBoard
                            key={selected.id}
                            kanban={selected}
                            updateKanbanColumns={updateKanbanColumns}
                            updateKanbanInfo={updateKanbanInfo}
                            onDeleteKanban={handleDeleteKanban}
                            userRights={{
                                canEditKanban: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canDeleteKanban: user.role === "ADMIN",
                                canAddColumn: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canEditColumn: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canDeleteColumn: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canAddCard: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canEditCard: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canDeleteCard: ["ADMIN", "COLLABORATOR"].includes(user.role),
                                canInvite: user.role === "ADMIN",
                            }}
                        />
                    ) : (
                        <p>{`Bienvenue ! Sélectionnez une collab' pour commencer.`}</p>
                    )}
                </section>
            </main>
        </div>
    );
}
