"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard/KanbanBoard";
import { Kanban, Column } from "../types";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);

    // 🔽 Charger les kanbans depuis localStorage
    useEffect(() => {
        const stored = localStorage.getItem("kanbans");
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as Kanban[];
                setKanbans(parsed);
                if (parsed.length > 0) {
                    setSelected(parsed[0]); // sélectionne le premier par défaut
                }
            } catch (e) {
                console.error("Erreur de parsing des kanbans :", e);
            }
        }
    }, []);

    // 🔼 Sauvegarder les kanbans dans localStorage à chaque changement
    useEffect(() => {
        localStorage.setItem("kanbans", JSON.stringify(kanbans));
    }, [kanbans]);

    const handleAddKanban = (data: { title: string; description: string }) => {
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
        if (selected?.id === id) {
            setSelected(null);
        }
    };

    const updateKanbanInfo = (updated: { name?: string; description?: string }) => {
        if (!selected) return;

        setKanbans((prev) =>
            prev.map(k =>
                k.id === selected.id ? { ...k, ...updated } : k
            )
        );

        setSelected((prev) =>
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
        setSelected(prev => (prev ? { ...prev, columns } : prev));
    };

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
