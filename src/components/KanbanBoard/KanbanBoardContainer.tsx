"use client";

import { useEffect, useState } from "react";
import { Kanban, Column } from "../../types";
import KanbanBoard from "./KanbanBoard";
import { fetchKanban, updateKanbanColumns, updateKanbanInfo } from "./api";

export default function KanbanBoardContainer() {
    const [kanban, setKanban] = useState<Kanban | null>(null);
    const [loading, setLoading] = useState(true);
    const kanbanId = 1;

    useEffect(() => {
        fetchKanban(kanbanId)
            .then((data) => {
                setKanban(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [kanbanId]);

    const handleUpdateColumns = async (columns: Column[]) => {
        if (!kanban) return;
        setKanban({ ...kanban, columns });

        try {
            await updateKanbanColumns(kanban.id, columns);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateInfo = async (updated: { name?: string; description?: string }) => {
        if (!kanban) return;
        setKanban({ ...kanban, ...updated });

        try {
            await updateKanbanInfo(kanban.id, updated);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (!kanban) return <div>Kanban non trouvé</div>;

    return (
        <KanbanBoard
            kanban={kanban}
            updateKanbanColumns={handleUpdateColumns}
            updateKanbanInfo={handleUpdateInfo}
        />
    );
}
