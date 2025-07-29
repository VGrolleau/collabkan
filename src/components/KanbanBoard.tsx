// src/components/KanbanBoard.tsx
"use client";

import { useState } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Kanban, Column, CardElement } from "../types";
import { Card } from "./Card";
import { CardModal } from "./CardModal/CardModal";
import KanbanHeaderEdit from "./KanbanHeaderEdit";

type Props = {
    kanban: Kanban;
    updateKanbanColumns: (columns: Column[]) => void;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => void;
};

function SortableCard({
    card,
    onClick,
}: {
    card: CardElement;
    onClick: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "grab",
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
        >
            <Card card={card} onClick={onClick} />
        </li>
    );
}

export default function KanbanBoard({
    kanban,
    updateKanbanColumns,
    updateKanbanInfo,
}: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newColumnName, setNewColumnName] = useState("");
    const [newCardTitle, setNewCardTitle] = useState<Record<number, string>>({});
    const [selectedCard, setSelectedCard] = useState<CardElement | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    );

    const addColumn = () => {
        const name = prompt("Nom de la nouvelle colonne ?");
        if (name?.trim()) {
            const newCol: Column = { id: Date.now(), name: name.trim(), cards: [] };
            updateKanbanColumns([...kanban.columns, newCol]);
        }
    };

    const deleteColumn = (id: number) => {
        if (confirm("Supprimer cette colonne ?")) {
            updateKanbanColumns(kanban.columns.filter((c) => c.id !== id));
        }
    };

    const saveEdit = (id: number) => {
        updateKanbanColumns(
            kanban.columns.map((c) =>
                c.id === id ? { ...c, name: newColumnName.trim() } : c
            )
        );
        setEditingId(null);
    };

    const addCard = (columnId: number) => {
        const title = newCardTitle[columnId]?.trim();
        if (!title) return alert("Le titre de la carte est vide !");
        const newCard: CardElement = { id: Date.now(), title };
        const updatedColumns = kanban.columns.map((col) =>
            col.id === columnId
                ? { ...col, cards: [...(col.cards ?? []), newCard] }
                : col
        );
        updateKanbanColumns(updatedColumns);
        setNewCardTitle((prev) => ({ ...prev, [columnId]: "" }));
    };

    const handleCardClick = (card: CardElement) => {
        setSelectedCard(card);
    };

    const handleCardSave = (
        cardId: number | string,
        updatedData: Partial<CardElement> & { columnId?: number }
    ) => {
        let movedCard: CardElement | null = null;
        let oldColId: number | null = null;
        const newColId: number | null = updatedData.columnId ?? null;

        const intermediateColumns = kanban.columns.map((col) => {
            if (col.cards.some((c) => c.id === cardId)) {
                oldColId = col.id;
                const filteredCards = col.cards.filter((c) => {
                    if (c.id === cardId) {
                        movedCard = { ...c, ...updatedData };
                        return false;
                    }
                    return true;
                });
                return { ...col, cards: filteredCards };
            }
            return col;
        });

        if (!movedCard) return;
        const targetColId = newColId ?? oldColId;

        const updatedColumns = intermediateColumns.map((col) =>
            col.id === targetColId
                ? { ...col, cards: [...(col.cards ?? []), movedCard!] }
                : col
        );

        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    const handleCardDelete = (cardId: number | string) => {
        const updatedColumns = kanban.columns.map((col) => ({
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
        }));
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    const allCardIds = kanban.columns.flatMap((col) => col.cards.map((c) => c.id));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        let sourceColIdx = -1;
        let destColIdx = -1;
        let activeIdx = -1;
        let overIdx = -1;

        kanban.columns.forEach((col, colIdx) => {
            const i1 = col.cards.findIndex((c) => c.id === active.id);
            const i2 = col.cards.findIndex((c) => c.id === over.id);
            if (i1 > -1) {
                sourceColIdx = colIdx;
                activeIdx = i1;
            }
            if (i2 > -1) {
                destColIdx = colIdx;
                overIdx = i2;
            }
        });

        if (sourceColIdx === -1 || destColIdx === -1) return;

        const newCols = [...kanban.columns];
        const [movedCard] = newCols[sourceColIdx].cards.splice(activeIdx, 1);
        newCols[destColIdx].cards.splice(overIdx, 0, movedCard);
        updateKanbanColumns(newCols);
    };

    return (
        <section>
            <KanbanHeaderEdit kanban={kanban} updateKanbanInfo={updateKanbanInfo} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={allCardIds} strategy={verticalListSortingStrategy}>
                    <div className="cols-section" style={{ display: "flex", gap: 16 }}>
                        {kanban.columns.map((col) => (
                            <div
                                key={col.id}
                                className="kanban-column"
                                style={{
                                    flex: 1,
                                    border: "1px solid #ddd",
                                    borderRadius: 6,
                                    padding: 8,
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                {editingId === col.id ? (
                                    <>
                                        <input
                                            value={newColumnName}
                                            onChange={(e) => setNewColumnName(e.target.value)}
                                        />
                                        <button onClick={() => saveEdit(col.id)}>💾</button>
                                        <button onClick={() => setEditingId(null)}>✖️</button>
                                    </>
                                ) : (
                                    <>
                                        <h3>{col.name}</h3>
                                        <button onClick={() => { setEditingId(col.id); setNewColumnName(col.name); }}>✏️</button>
                                        <button onClick={() => deleteColumn(col.id)}>🗑️</button>
                                    </>
                                )}
                                <ul style={{ listStyle: "none", padding: 0, minHeight: 100 }}>
                                    {(col.cards ?? []).map((card) => (
                                        <SortableCard
                                            key={card.id}
                                            card={card}
                                            onClick={() => handleCardClick(card)}
                                        />
                                    ))}
                                </ul>
                                <div style={{ marginTop: 8 }}>
                                    <input
                                        placeholder="Titre nouvelle carte"
                                        value={newCardTitle[col.id] || ""}
                                        onChange={(e) =>
                                            setNewCardTitle((prev) => ({
                                                ...prev,
                                                [col.id]: e.target.value,
                                            }))
                                        }
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCard(col.id);
                                            }
                                        }}
                                    />
                                    <button onClick={() => addCard(col.id)}>➕</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={addColumn}>➕ Ajouter une colonne</button>
                    </div>
                </SortableContext>
            </DndContext>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    kanbanColumns={kanban.columns}
                    onClose={() => setSelectedCard(null)}
                    onSave={handleCardSave}
                    onDelete={handleCardDelete}
                />
            )}
        </section>
    );
}
