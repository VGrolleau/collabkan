"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard";

const initialKanbans = [
    { id: 1, name: "Kanban 1", description: "Test 1" },
    { id: 2, name: "Kanban 2", description: "Test 2" },
];

export default function AppShell() {
    const [kanbans] = useState(initialKanbans);
    const [selectedKanban, setSelectedKanban] = useState<typeof initialKanbans[0] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleSelectKanban(id: number) {
        const kanban = kanbans.find(k => k.id === id) || null;
        setSelectedKanban(kanban);
    }

    return (
        <>
            <Sidebar kanbans={kanbans} onSelect={handleSelectKanban} onAddKanbanClick={() => setIsModalOpen(true)} />
            <main>
                {selectedKanban ? (
                    <KanbanBoard kanban={selectedKanban} />
                ) : (
                    <p>Sélectionnez un tableau à gauche</p>
                )}
            </main>
        </>
    );
}
