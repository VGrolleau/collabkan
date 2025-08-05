// src/components/AppShell.tsx
"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard/KanbanBoard";
import { Kanban, Column } from "../types";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les kanbans depuis l'API au chargement du composant
    useEffect(() => {
        async function fetchKanbans() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch('/api/kanbans', {
                    credentials: 'include', // <-- envoi des cookies avec la requête
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Erreur lors du chargement');
                }

                const data: Kanban[] = await res.json();
                setKanbans(data);
                if (data.length > 0) setSelected(data[0]);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    setError(e.message);
                } else {
                    setError('Erreur inconnue');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchKanbans();
    }, []);

    const handleAddKanban = async (data: { title: string; description: string }) => {
        try {
            const res = await fetch("/api/kanbans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la création");
            }

            const createdKanban: Kanban = await res.json();

            setKanbans((prev) => [...prev, createdKanban]);
            setSelected(createdKanban);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
        }
    };

    const handleDeleteKanban = async (id: number) => {
        const confirm = window.confirm("Supprimer ce kanban ? Cette action est irréversible.");
        if (!confirm) return;

        try {
            const res = await fetch(`/api/kanbans/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la suppression");
            }

            // Mise à jour de l'état local seulement si la suppression réussit
            setKanbans(prev => prev.filter(k => k.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
        }
    };

    const updateKanbanInfo = (updated: { name?: string; description?: string }) => {
        if (!selected) return;

        setKanbans(prev =>
            prev.map(k =>
                k.id === selected.id ? { ...k, ...updated } : k
            )
        );

        setSelected(prev =>
            prev ? { ...prev, ...updated } : prev
        );
    };

    const updateKanbanColumns = (columns: Column[]) => {
        if (!selected) return;

        setKanbans(prev =>
            prev.map(k =>
                k.id === selected.id ? { ...k, columns } : k
            )
        );

        setSelected(prev =>
            prev ? { ...prev, columns } : prev
        );
    };

    if (loading) return <p>Chargement des kanbans...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <>
            <Sidebar
                kanbans={kanbans}
                onSelect={setSelected}
                onAddKanban={handleAddKanban}
                onDeleteKanban={handleDeleteKanban}
            />
            <main>
                {selected ? (
                    <KanbanBoard
                        kanban={selected}
                        updateKanbanColumns={updateKanbanColumns}
                        updateKanbanInfo={updateKanbanInfo}
                    />
                ) : (
                    <p>{`Bienvenue ! Sélectionnez une collab' pour commencer.`}</p>
                )}
                {children}
            </main>
        </>
    );
}
