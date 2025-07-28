"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard";
import DeleteKanbanModal from "./DeleteKanbanModal";

type Kanban = {
    id: number;
    name: string;
    description: string;
};

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);
    const [kanbanToDelete, setKanbanToDelete] = useState<Kanban | null>(null);

    const handleAddKanban = (kanban: Kanban) => {
        setKanbans((prev) => [...prev, kanban]);
        setSelected(kanban); // Optionnel : sélectionner le nouveau
    };

    const handleConfirmDelete = () => {
        if (kanbanToDelete) {
            setKanbans(prev => prev.filter(k => k.id !== kanbanToDelete.id));
            if (selected?.id === kanbanToDelete.id) {
                setSelected(null);
            }
            setKanbanToDelete(null);
        }
    };

    return (
        <>
            <Sidebar
                kanbans={kanbans}
                onSelect={setSelected}
                onAddKanban={handleAddKanban}
                onRequestDelete={setKanbanToDelete}
            />
            <main>
                {selected ? (
                    <KanbanBoard kanban={selected} />
                ) : (
                    <p>{`Bienvenue ! Sélectionnez une collab' pour commencer.`}</p>
                )}
                {children}
            </main>

            {kanbanToDelete && (
                <DeleteKanbanModal
                    kanban={kanbanToDelete}
                    onCancel={() => setKanbanToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    );
}
