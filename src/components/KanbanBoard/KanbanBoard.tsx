"use client";

import { useState } from "react";
import { Kanban, Column, CardElement } from "../../types";
import { Card } from "../Card";
import { CardModal } from "../CardModal/CardModal";
import KanbanHeaderEdit from "../KanbanHeaderEdit";

type Props = {
    kanban: Kanban;
    updateKanbanColumns: (columns: Column[]) => void;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => void;
};

export default function KanbanBoard({
    kanban,
    updateKanbanColumns,
    updateKanbanInfo,
}: Props) {
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [newColumnName, setNewColumnName] = useState("");
    const [newCardTitle, setNewCardTitle] = useState<Record<number | string, string>>({});
    const [selectedCard, setSelectedCard] = useState<CardElement | null>(null);

    const addColumn = async () => {
        const name = prompt("Nom de la nouvelle colonne ?");
        if (name?.trim()) {
            const res = await fetch("/api/columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, kanbanId: kanban.id }),
            });
            const newCol: Column = await res.json();
            updateKanbanColumns([...kanban.columns, newCol]);
        }
    };

    const deleteColumn = async (id: number | string) => {
        if (confirm("Supprimer cette colonne ?")) {
            await fetch(`/api/columns/${id}`, { method: "DELETE" });
            updateKanbanColumns(kanban.columns.filter((c) => c.id !== id));
        }
    };

    const saveEdit = async (id: number | string) => {
        const trimmedName = newColumnName.trim();
        if (!trimmedName) return alert("Le nom de la colonne ne peut pas être vide.");

        await fetch(`/api/columns/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: trimmedName }),
        });

        updateKanbanColumns(
            kanban.columns.map((c) =>
                c.id === id ? { ...c, name: trimmedName } : c
            )
        );
        setEditingId(null);
    };

    const addCard = async (columnId: number | string) => {
        const title = newCardTitle[columnId]?.trim();
        if (!title) return alert("Le titre de la carte est vide !");

        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, columnId }),
        });

        const newCard: CardElement = await res.json();

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

    const handleCardSave = async (
        cardId: number | string,
        updatedData: Partial<CardElement> & { columnId?: number | string }
    ) => {
        let movedCard: CardElement | null = null;
        let oldColId: number | string | null = null;
        const newColId: number | string | null = updatedData.columnId ?? null;

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

        await fetch(`/api/cards/${cardId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...updatedData }),
        });

        const updatedColumns = intermediateColumns.map((col) =>
            col.id === targetColId
                ? { ...col, cards: [...(col.cards ?? []), movedCard!] }
                : col
        );

        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    const handleCardDelete = async (cardId: number | string) => {
        await fetch(`/api/cards/${cardId}`, { method: "DELETE" });

        const updatedColumns = kanban.columns.map((col) => ({
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
        }));
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    const moveCardUp = (columnId: number | string, cardId: number | string) => {
        const newCols = kanban.columns.map((col) => {
            if (col.id !== columnId) return col;
            const idx = col.cards.findIndex((c) => c.id === cardId);
            if (idx > 0) {
                const updatedCards = [...col.cards];
                [updatedCards[idx - 1], updatedCards[idx]] = [updatedCards[idx], updatedCards[idx - 1]];
                return { ...col, cards: updatedCards };
            }
            return col;
        });
        updateKanbanColumns(newCols);
        // pas de requête API ici, juste du réarrangement local
    };

    const moveCardDown = (columnId: number | string, cardId: number | string) => {
        const newCols = kanban.columns.map((col) => {
            if (col.id !== columnId) return col;
            const idx = col.cards.findIndex((c) => c.id === cardId);
            if (idx > -1 && idx < col.cards.length - 1) {
                const updatedCards = [...col.cards];
                [updatedCards[idx], updatedCards[idx + 1]] = [updatedCards[idx + 1], updatedCards[idx]];
                return { ...col, cards: updatedCards };
            }
            return col;
        });
        updateKanbanColumns(newCols);
        // idem, pas d'appel API
    };

    return (
        <section>
            <KanbanHeaderEdit kanban={kanban} updateKanbanInfo={updateKanbanInfo} />

            <div
                className="cols-section"
                style={{
                    display: "flex",
                    gap: 16,
                    overflowX: "auto",
                    paddingBottom: 8,
                }}
            >
                {kanban.columns.map((col) => (
                    <div
                        key={col.id}
                        className="kanban-column"
                        style={{
                            flex: "0 0 300px",
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            padding: 8,
                            backgroundColor: "#f9f9f9",
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "80vh",
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
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h3>{col.name}</h3>
                                <div>
                                    <button
                                        onClick={() => {
                                            setEditingId(col.id);
                                            setNewColumnName(col.name);
                                        }}
                                        title="Modifier la colonne"
                                    >
                                        ✏️
                                    </button>
                                    <button onClick={() => deleteColumn(col.id)} title="Supprimer la colonne">🗑️</button>
                                </div>
                            </div>
                        )}

                        <ul style={{ listStyle: "none", padding: 0, minHeight: 100 }}>
                            {col.cards.map((card, idx) => (
                                <li key={card.id} style={{ marginBottom: 8 }}>
                                    <Card
                                        card={card}
                                        onClick={() => handleCardClick(card)}
                                        onMoveUp={() => moveCardUp(col.id, card.id)}
                                        onMoveDown={() => moveCardDown(col.id, card.id)}
                                        isFirst={idx === 0}
                                        isLast={idx === col.cards.length - 1}
                                        style={{ minHeight: 100 }}
                                    />
                                </li>
                            ))}
                        </ul>

                        <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
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
                                style={{
                                    flexGrow: 1,
                                    padding: 6,
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                }}
                            />
                            <button
                                onClick={() => addCard(col.id)}
                                style={{ cursor: "pointer", padding: "6px 12px" }}
                                title="Ajouter une carte"
                            >
                                ➕
                            </button>
                        </div>
                    </div>
                ))}
                <button
                    onClick={addColumn}
                    style={{
                        height: 40,
                        alignSelf: "start",
                        marginLeft: 12,
                        padding: "0 16px",
                        cursor: "pointer",
                        borderRadius: 6,
                        border: "1px dashed #aaa",
                        backgroundColor: "transparent",
                        color: "white",
                        fontWeight: "600",
                        flex: "0 0 auto",
                    }}
                    title="Ajouter une colonne"
                >
                    + Ajouter une colonne
                </button>
            </div>

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
