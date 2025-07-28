"use client";

import { useState } from "react";
import { Kanban, Column, CardElement } from "../types";
import { Card } from "./Card";
import { CardModal } from "./CardModal";

type Props = {
    kanban: Kanban;
    updateKanbanColumns: (columns: Column[]) => void;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => void;
};

export default function KanbanBoard({ kanban, updateKanbanColumns, updateKanbanInfo }: Props) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newColumnName, setNewColumnName] = useState("");
    const [newCardTitle, setNewCardTitle] = useState<Record<number, string>>({});
    const [selectedCard, setSelectedCard] = useState<CardElement | null>(null);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingDesc, setEditingDesc] = useState(false);
    const [tempName, setTempName] = useState(kanban.name);
    const [tempDesc, setTempDesc] = useState(kanban.description);

    const addColumn = () => {
        const name = prompt("Nom de la nouvelle colonne ?");
        if (name?.trim()) {
            const newCol: Column = { id: Date.now(), name: name.trim(), cards: [] };
            updateKanbanColumns([...kanban.columns, newCol]);
        }
    };

    const deleteColumn = (id: number) => {
        if (confirm("Supprimer cette colonne ?")) {
            updateKanbanColumns(kanban.columns.filter(c => c.id !== id));
        }
    };

    const saveEdit = (id: number) => {
        updateKanbanColumns(
            kanban.columns.map(c =>
                c.id === id ? { ...c, name: newColumnName.trim() } : c
            )
        );
        setEditingId(null);
    };

    const addCard = (columnId: number) => {
        const title = newCardTitle[columnId]?.trim();
        if (!title) return alert("Le titre de la carte est vide !");
        const newCard: CardElement = {
            id: Date.now(),
            title,
        };
        const updatedColumns = kanban.columns.map((col) => {
            if (col.id === columnId) {
                const cards = col.cards ?? [];
                return { ...col, cards: [...cards, newCard] };
            }
            return col;
        });
        updateKanbanColumns(updatedColumns);
        setNewCardTitle(prev => ({ ...prev, [columnId]: "" }));
    };

    const handleCardClick = (card: CardElement) => {
        setSelectedCard(card);
    };

    const handleCardSave = (cardId: number | string, updatedData: Partial<CardElement>) => {
        const updatedColumns = kanban.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
                card.id === cardId ? { ...card, ...updatedData } : card
            )
        }));
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    const handleCardDelete = (cardId: number | string) => {
        const updatedColumns = kanban.columns.map(col => ({
            ...col,
            cards: col.cards.filter(c => c.id !== cardId)
        }));
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    return (
        <section>
            <div className="kanban-header">
                {/* TITRE */}
                {editingTitle ? (
                    <div className="edit-group">
                        <input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                updateKanbanInfo({ name: tempName });
                                setEditingTitle(false);
                            }}
                            title="Enregistrer"
                        >
                            💾
                        </button>
                        <button
                            onClick={() => {
                                setTempName(kanban.name);
                                setEditingTitle(false);
                            }}
                            title="Annuler"
                        >
                            ✖️
                        </button>
                    </div>
                ) : (
                    <h2>
                        {kanban.name}
                        <button onClick={() => setEditingTitle(true)} title="Modifier le titre">
                            ✏️
                        </button>
                    </h2>
                )}

                {/* DESCRIPTION */}
                {editingDesc ? (
                    <div className="edit-group">
                        <textarea
                            value={tempDesc}
                            onChange={(e) => setTempDesc(e.target.value)}
                            rows={3}
                            autoFocus
                        />
                        <button
                            onClick={() => {
                                updateKanbanInfo({ description: tempDesc });
                                setEditingDesc(false);
                            }}
                            title="Enregistrer"
                        >
                            💾
                        </button>
                        <button
                            onClick={() => {
                                setTempDesc(kanban.description);
                                setEditingDesc(false);
                            }}
                            title="Annuler"
                        >
                            ✖️
                        </button>
                    </div>
                ) : (
                    <p>
                        {kanban.description}
                        <button onClick={() => setEditingDesc(true)} title="Modifier la description">
                            ✏️
                        </button>
                    </p>
                )}
            </div>


            <div className="cols-section">
                {kanban.columns.map((col) => (
                    <div className="kanban-column" key={col.id}>
                        {editingId === col.id ? (
                            <>
                                <input
                                    type="text"
                                    value={newColumnName}
                                    onChange={(e) => setNewColumnName(e.target.value)}
                                />
                                <button onClick={() => saveEdit(col.id)}>💾</button>
                                <button onClick={() => setEditingId(null)}>✖️</button>
                            </>
                        ) : (
                            <>
                                <h3>{col.name}</h3>
                                <div className="column-actions">
                                    <button
                                        onClick={() => {
                                            setEditingId(col.id);
                                            setNewColumnName(col.name);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button onClick={() => deleteColumn(col.id)}>🗑️</button>
                                </div>
                            </>
                        )}

                        <ul className="cards-list">
                            {(col.cards ?? []).map(card => (
                                <Card key={card.id} card={card} onClick={() => handleCardClick(card)} />
                            ))}
                        </ul>

                        <div className="addcard-div">
                            <input
                                type="text"
                                placeholder="Titre nouvelle carte"
                                value={newCardTitle[col.id] || ""}
                                onChange={(e) =>
                                    setNewCardTitle((prev) => ({ ...prev, [col.id]: e.target.value }))
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
                <button className="add-col-btn" onClick={addColumn}>
                    ➕ Ajouter une colonne
                </button>
            </div>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    onSave={handleCardSave}
                    onDelete={handleCardDelete}
                />
            )}
        </section>
    );
}
