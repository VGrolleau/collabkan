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

    const handleAddKanban = (data: { title: string; description: string }) => {
        // Tu peux ici aussi envoyer la création au backend, pour l'exemple on reste en local
        const newKanban: Kanban = {
            id: Date.now(),
            name: data.title,
            description: data.description,
            columns: [
                { id: 1, name: "À faire", cards: [{ id: Date.now() + 1, title: "Ma première carte" }] },
                { id: 2, name: "En cours", cards: [] },
                { id: 3, name: "Terminé", cards: [] },
            ],
        };
        setKanbans(prev => [...prev, newKanban]);
        setSelected(newKanban);
    };

    const handleDeleteKanban = (id: number) => {
        setKanbans(prev => prev.filter(k => k.id !== id));
        if (selected?.id === id) setSelected(null);
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
