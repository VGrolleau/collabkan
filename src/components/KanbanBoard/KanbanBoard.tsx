// src/components/KanbanBoard/KanbanBoard.tsx
"use client";

import { useState } from "react";
import { Kanban, Column, CardElement } from "../../types";
import { Card } from "../Card/Card";
import CardModal from "../CardModal/CardModal";
import KanbanHeaderEdit from "../KanbanHeaderEdit";
import InviteModal from "../InviteModal/InviteModal";

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

    // Ajouter une nouvelle colonne
    const addColumn = async () => {
        const name = prompt("Nom de la nouvelle colonne ?");
        if (name?.trim()) {
            const order = kanban.columns.length; // position = dernière
            const res = await fetch("/api/columns", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: name,
                    kanbanId: kanban.id,
                    order,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert("Erreur: " + error.error);
                return;
            }

            const newCol: Column = await res.json();
            updateKanbanColumns([...kanban.columns, newCol]);
        }
    };

    // Supprimer une colonne
    const deleteColumn = async (id: number | string) => {
        if (confirm("Supprimer cette colonne ?")) {
            await fetch(`/api/columns/${id}`, { method: "DELETE" });
            updateKanbanColumns(kanban.columns.filter((c) => c.id !== id));
        }
    };

    // Sauvegarder édition du nom d’une colonne
    const saveEdit = async (id: number | string) => {
        const trimmedName = newColumnName.trim();
        if (!trimmedName) return alert("Le nom de la colonne ne peut pas être vide.");

        await fetch(`/api/columns/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: trimmedName }),
        });

        updateKanbanColumns(
            kanban.columns.map((c) =>
                c.id === id ? { ...c, title: trimmedName } : c
            )
        );
        setEditingId(null);
    };

    // Ajouter une carte dans une colonne
    const addCard = async (columnId: number | string) => {
        const title = newCardTitle[columnId]?.trim();
        if (!title) return alert("Le titre de la carte est vide !");

        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, columnId }),
        });

        if (!res.ok) {
            const error = await res.json();
            alert("Erreur : " + error.error);
            return;
        }

        const newCard: CardElement = await res.json();

        // Met à jour localement la colonne et les cartes
        const updatedColumns = kanban.columns.map((col) => {
            if (col.id === columnId) {
                const updatedCards = [...(col.cards ?? []), newCard];
                const cardsWithNewOrder = updatedCards.map((card, i) => ({
                    ...card,
                    order: i,
                }));
                return { ...col, cards: cardsWithNewOrder };
            }
            return col;
        });

        updateKanbanColumns(updatedColumns);

        // Sauvegarder nouvel ordre des cartes
        await updateCardOrder(columnId, updatedColumns.find(c => c.id === columnId)?.cards ?? []);

        // Vider input nouvelle carte
        setNewCardTitle(prev => ({ ...prev, [columnId]: "" }));
    };

    // Cliquer sur une carte pour ouvrir le modal
    const handleCardClick = (card: CardElement) => {
        setSelectedCard(card);
    };

    // Sauvegarder les modifications d’une carte (déplacement ou édition)
    const handleCardSave = async (
        cardId: number | string,
        updatedData: Partial<CardElement> & { columnId?: number | string }
    ) => {
        let movedCard: CardElement | null = null;
        let oldColId: number | string | null = null;
        const newColId: number | string | null = updatedData.columnId ?? null;

        // Retirer la carte de sa colonne d’origine
        const intermediateColumns = kanban.columns.map((col) => {
            if (col.cards?.some((c) => c.id === cardId)) {
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

        // Sauvegarder modification carte côté serveur
        await fetch(`/api/cards/${cardId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...updatedData }),
        });

        // Ajouter la carte modifiée dans la nouvelle colonne
        const updatedColumns = intermediateColumns.map((col) =>
            col.id === targetColId
                ? { ...col, cards: [...(col.cards ?? []), movedCard!] }
                : col
        );

        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    // Supprimer une carte
    const handleCardDelete = async (cardId: number | string) => {
        await fetch(`/api/cards/${cardId}`, { method: "DELETE" });

        const updatedColumns = kanban.columns.map((col) => ({
            ...col,
            cards: col.cards.filter((c) => c.id !== cardId),
        }));
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    // Met à jour l’ordre des cartes dans une colonne via API
    async function updateCardOrder(columnId: string | number, cards: CardElement[]) {
        await fetch("/api/cards/reorder", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ columnId, cards }),
        });
    }

    // Déplacer une carte vers le haut dans la colonne
    const moveCardUp = async (columnId: number | string, cardId: number | string) => {
        const newCols = kanban.columns.map((col) => {
            if (col.id !== columnId) return col;

            const idx = col.cards.findIndex((c) => c.id === cardId);
            if (idx > 0) {
                const updatedCards = [...col.cards];
                [updatedCards[idx - 1], updatedCards[idx]] = [updatedCards[idx], updatedCards[idx - 1]];

                return { ...col, cards: updatedCards.map((c, i) => ({ ...c, order: i })) };
            }
            return col;
        });

        const movedColumn = newCols.find((col) => col.id === columnId);
        if (movedColumn) {
            await updateCardOrder(columnId, movedColumn.cards);
        }

        updateKanbanColumns(newCols);
    };

    // Déplacer une carte vers le bas dans la colonne
    const moveCardDown = async (columnId: number | string, cardId: number | string) => {
        const newCols = kanban.columns.map((col) => {
            if (col.id !== columnId) return col;

            const idx = col.cards.findIndex((c) => c.id === cardId);
            if (idx > -1 && idx < col.cards.length - 1) {
                const updatedCards = [...col.cards];
                [updatedCards[idx], updatedCards[idx + 1]] = [updatedCards[idx + 1], updatedCards[idx]];

                return { ...col, cards: updatedCards.map((c, i) => ({ ...c, order: i })) };
            }
            return col;
        });

        const movedColumn = newCols.find((col) => col.id === columnId);
        if (movedColumn) {
            await updateCardOrder(columnId, movedColumn.cards);
        }

        updateKanbanColumns(newCols);
    };

    return (
        <section>
            <KanbanHeaderEdit kanban={kanban} updateKanbanInfo={updateKanbanInfo} />

            <div style={{ marginBottom: 16 }}>
                <InviteModal kanbanId={kanban.id} />
            </div>

            <div
                className="cols-section"
                style={{
                    display: "flex",
                    gap: 16,
                    overflowX: "auto",
                    paddingBottom: 8,
                }}
            >
                {(kanban.columns ?? []).map((col) => (
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
                                <h3>{col.title}</h3>
                                <div>
                                    <button
                                        onClick={() => {
                                            setEditingId(col.id);
                                            setNewColumnName(col.title);
                                        }}
                                        title="Modifier la colonne"
                                    >
                                        ✏️
                                    </button>
                                    <button onClick={() => deleteColumn(col.id)} title="Supprimer la colonne">🗑️</button>
                                </div>
                            </div>
                        )}

                        <ul style={{ listStyle: "none", padding: 0, minHeight: 100, overflowY: "auto" }}>
                            {(col.cards ?? [])
                                .slice() // copie pour ne pas muter l'état
                                .sort((a, b) => a.order - b.order)
                                .map((card, idx) => (
                                    <li key={card.id} style={{ marginBottom: 8 }}>
                                        <Card
                                            card={card}
                                            onClick={() => handleCardClick(card)}
                                            onMoveUp={() => moveCardUp(col.id, card.id)}
                                            onMoveDown={() => moveCardDown(col.id, card.id)}
                                            isFirst={idx === 0}
                                            isLast={idx === col.cards.length - 1}
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
                    allLabels={[]}
                    allUsers={[]}
                    onClose={() => setSelectedCard(null)}
                    onSave={handleCardSave}
                    onDelete={handleCardDelete}
                // onUpdate={(updatedCard) => {
                //     const updatedColumns = kanban.columns.map((col) => ({
                //         ...col,
                //         cards: col.cards.map((c) =>
                //             c.id === updatedCard.id ? updatedCard : c
                //         ),
                //     }));
                //     updateKanbanColumns(updatedColumns);
                //     setSelectedCard(updatedCard); // met aussi à jour la modale ouverte
                // }}
                />
            )}
        </section>
    );
}
