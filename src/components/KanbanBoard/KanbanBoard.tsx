// src/components/KanbanBoard/KanbanBoard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Kanban, Column, CardElement } from "@/types";
import CardModal, { CardUpdatePayloadFull } from "../CardModal/CardModal";
import KanbanHeaderEdit from "../KanbanHeaderEdit";
import InviteModal from "../InviteModal/InviteModal";

type KanbanBoardProps = {
    kanban: Kanban;
    updateKanbanColumns: (columns: Column[]) => void;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => Promise<void>;
    onDeleteKanban: (id: string) => Promise<void>;
    userRights: {
        canEditKanban: boolean;
        canDeleteKanban: boolean;
        canAddColumn: boolean;
        canEditColumn: boolean;
        canDeleteColumn: boolean;
        canAddCard: boolean;
        canEditCard: boolean;
        canDeleteCard: boolean;
        canInvite: boolean;
    };
};

type DraggingState = {
    card: CardElement | null;
    fromColId: string | number | null;
};

type CommentWithAuthor = {
    id: string;
    content: string;
    date?: string;
    author: string | { id: string; name: string };
};

export default function KanbanBoard({
    kanban,
    updateKanbanColumns,
    updateKanbanInfo,
    onDeleteKanban,
    userRights,
}: KanbanBoardProps) {
    const [columns, setColumns] = useState<Column[]>(kanban.columns);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [newColumnName, setNewColumnName] = useState("");
    const [selectedCard, setSelectedCard] = useState<CardElement | null>(null);
    const [newCardTitle, setNewCardTitle] = useState<Record<string | number, string>>({});
    const dragging = useRef<DraggingState>({ card: null, fromColId: null });

    // 🔹 Quand le kanban change (par ex. rechargement via API), on met à jour les colonnes
    useEffect(() => {
        setColumns(
            kanban.columns.map(col => ({
                ...col,
                cards: (col.cards ?? []).map(c => ({
                    ...c,
                    dueDate: c.dueDate ? new Date(c.dueDate) : null,
                })),
            }))
        );
    }, [kanban]);

    // ============ DRAG & DROP ============
    const getInsertIndexFromPlaceholder = (container: HTMLElement, placeholder: HTMLElement) => {
        const children = Array.from(container.children) as HTMLElement[];
        let indexAmongCards = 0;

        for (const child of children) {
            if (child === placeholder) break;
            if (child.classList.contains("card") && !child.classList.contains("dragging")) {
                indexAmongCards++;
            }
        }

        return indexAmongCards;
    };

    const getDragAfterElement = (container: HTMLElement, y: number) => {
        const draggableEls = [...container.querySelectorAll<HTMLElement>(".card:not(.dragging)")];
        let closest: { offset: number; element: HTMLElement | null } = { offset: Number.NEGATIVE_INFINITY, element: null };

        for (const el of draggableEls) {
            const box = el.getBoundingClientRect();
            const offset = y - (box.top + box.height / 2); // centre de la carte
            if (offset < 0 && offset > closest.offset) {
                closest = { offset, element: el };
            }
        }
        return closest.element; // null si on doit append en bas
    };

    const onDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardElement, colId: string | number) => {
        dragging.current.card = card;
        dragging.current.fromColId = colId;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", card.id);
        const el = e.currentTarget as HTMLElement; // éviter le bug e.currentTarget null dans le setTimeout 
        setTimeout(() => el.classList.add("dragging"), 0);
    };

    const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        const el = e.currentTarget as HTMLElement;
        el.classList.remove("dragging");
        dragging.current.card = null;
        dragging.current.fromColId = null;
        document.querySelectorAll<HTMLElement>(".placeholder").forEach(ph => ph.remove());
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const container = e.currentTarget as HTMLElement; // .cards
        let placeholder = container.querySelector<HTMLElement>(".placeholder");
        if (!placeholder) {
            placeholder = document.createElement("div");
            placeholder.className = "placeholder";
            placeholder.style.border = "2px dashed var(--border)";
            placeholder.style.borderRadius = "8px";
            placeholder.style.margin = "2px 0";
            placeholder.style.pointerEvents = "none";
            const draggingCard = document.querySelector<HTMLElement>(".card.dragging");
            placeholder.style.height = draggingCard ? `${draggingCard.offsetHeight}px` : "40px";
            container.appendChild(placeholder);
        } // placer le placeholder au bon endroit

        if (placeholder.parentElement) placeholder.parentElement.removeChild(placeholder);

        const afterEl = getDragAfterElement(container, e.clientY);

        if (!afterEl) container.appendChild(placeholder); // colonne vide ou bas
        else container.insertBefore(placeholder, afterEl);
    };

    const onDrop = async (e: React.DragEvent<HTMLDivElement>, toColId: string | number) => {
        e.preventDefault(); const container = e.currentTarget as HTMLElement; // .cards
        const placeholder = container.querySelector<HTMLElement>(".placeholder");
        if (!dragging.current.card || !placeholder) return;
        const card = dragging.current.card;
        const fromCol = kanban.columns.find(c => c.id === dragging.current.fromColId);
        const toCol = kanban.columns.find(c => c.id === toColId);
        if (!fromCol || !toCol) return; // index d’insertion (supporte colonnes vides)
        const insertIndex = getInsertIndexFromPlaceholder(container, placeholder); // construire les nouvelles listes
        const moving = {
            ...card,
            columnId: toCol.id.toString()
        };

        if (fromCol.id === toCol.id) {
            const without = fromCol.cards.filter(c => c.id !== card.id);
            const nextCards = [
                ...without.slice(0, insertIndex),
                moving,
                ...without.slice(insertIndex)
            ].map((c, i) => ({
                ...c,
                order: i,
            }));
            const nextColumns = kanban.columns.map(c => (c.id === fromCol.id ? { ...c, cards: nextCards } : c));

            updateKanbanColumns(nextColumns);
            await fetch("/api/cards/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cards: nextCards }),
            });
        } else {
            const fromWithout = fromCol.cards.filter(c => c.id !== card.id).map((c, i) => ({ ...c, order: i, columnId: fromCol.id.toString() }));
            const toInserted = [...toCol.cards.slice(0, insertIndex), moving, ...toCol.cards.slice(insertIndex),].map((c, i) => ({ ...c, order: i, columnId: toCol.id.toString() }));
            const nextColumns = kanban.columns.map(c => {
                if (c.id === fromCol.id) return { ...c, cards: fromWithout };
                if (c.id === toCol.id) return { ...c, cards: toInserted };
                return c;
            });
            updateKanbanColumns(nextColumns);
            await fetch("/api/cards/reorder", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cards: [...fromWithout, ...toInserted] }),
            });
        }
        placeholder.remove();
        dragging.current.card = null;
        dragging.current.fromColId = null;
    };

    // ======== Actions Colonnes ======== 
    const addColumn = async () => {
        if (!userRights.canAddColumn) return;
        const name = prompt("Nom de la nouvelle colonne ?");
        if (!name?.trim()) return;
        const order = kanban.columns.length;
        const res = await fetch("/api/columns", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: name, kanbanId: kanban.id, order }),
        });

        if (!res.ok) {
            const error = await res.json();
            alert("Erreur: " + error.error);
            return;
        }

        const newCol: Column = await res.json();
        updateKanbanColumns([...kanban.columns, newCol]);
    };

    const deleteColumn = async (id: string | number) => {
        if (!userRights.canDeleteColumn) return;
        if (!confirm("Supprimer cette colonne ?")) return;
        await fetch(`/api/columns/${id}`, { method: "DELETE" });
        updateKanbanColumns(kanban.columns.filter(c => c.id !== id));
    };

    const saveEdit = async (id: string | number) => {
        if (!userRights.canEditColumn) return;
        const trimmedName = newColumnName.trim();
        if (!trimmedName) return alert("Le nom de la colonne ne peut pas être vide.");
        await fetch(`/api/columns/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: trimmedName }),
        });
        updateKanbanColumns(kanban.columns.map(c => (c.id === id ? { ...c, title: trimmedName } : c)));
        setEditingId(null);
    };

    // ======== Actions Cartes ======== 
    const addCard = async (colId: string | number) => {
        if (!userRights.canAddCard) return;
        const title = newCardTitle[colId]?.trim() || "Nouvelle carte";
        const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, columnId: colId, order: (kanban.columns.find(c => c.id === colId)?.cards.length || 0) + 1, description: "", }),
        });
        if (!res.ok) {
            const error = await res.json();
            alert("Erreur: " + error.error);
            return;
        }
        const savedCard: CardElement = await res.json();
        const updatedColumns = kanban.columns.map(c => c.id === colId ? { ...c, cards: [...(c.cards ?? []), savedCard] } : c);
        updateKanbanColumns(updatedColumns);
        setNewCardTitle(prev => ({ ...prev, [colId]: "" }));
    };

    const handleCardClick = (card: CardElement) => {
        setSelectedCard({
            ...card,
            comments: (card.comments as CommentWithAuthor[]).map(c => ({
                ...c,
                author: typeof c.author === "object" && c.author !== null ? c.author.name : c.author,
                date: c.date ? c.date : new Date().toISOString(),
            }))
        });
    };

    const handleCardSave = async (cardId: string, payload: CardUpdatePayloadFull) => {
        try {
            const res = await fetch(`/api/cards/${cardId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la mise à jour de la carte");
            }
            const updatedCardFromApi: CardElement = await res.json();
            const updatedCard: CardElement = {
                ...updatedCardFromApi,
                dueDate: updatedCardFromApi.dueDate ? new Date(updatedCardFromApi.dueDate) : null,
            };
            const finalColumns = columns.map(col => ({
                ...col,
                cards: col.cards.map(c => (c.id === cardId ? updatedCard : c)),
            }));
            setColumns(finalColumns);
            updateKanbanColumns(finalColumns);
            setSelectedCard(null);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la carte :", error);
            alert(error instanceof Error ? error.message : "Erreur inconnue");
        }
    };

    const handleCardDelete = async (cardId: string) => {
        await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
        const updatedColumns = columns.map(col => ({
            ...col,
            cards: col.cards.filter(c => c.id !== cardId),
        }));
        setColumns(updatedColumns);
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    return (
        <section>
            <KanbanHeaderEdit
                kanban={kanban}
                updateKanbanInfo={updateKanbanInfo}
                onDelete={userRights.canDeleteKanban ? onDeleteKanban : () => { }}
            />

            {userRights.canInvite && <InviteModal kanban={kanban} />}

            <div className="board">
                {columns.map(col => (
                    <div
                        key={col.id}
                        className="board-list"
                    // onDragOver={e => onDragOver(e, col.id)}
                    // onDrop={e => onDrop(e, col.id)}
                    >
                        {editingId === col.id ? (
                            <>
                                <input value={newColumnName} onChange={e => setNewColumnName(e.target.value)} disabled={!userRights.canEditColumn} />
                                <button onClick={() => saveEdit(col.id)} disabled={!userRights.canEditColumn}>💾</button>
                                <button onClick={() => setEditingId(null)}>✖️</button>
                            </>
                        ) : (
                            <div className="list-header">
                                <h3 className="list-title">{col.title}</h3>
                                <div className="list-actions">
                                    <button
                                        onClick={() => {
                                            setEditingId(col.id);
                                            setNewColumnName(col.title);
                                        }}
                                        disabled={!userRights.canEditColumn}
                                        title="Modifier"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => deleteColumn(col.id)}
                                        disabled={!userRights.canDeleteColumn}
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        )}
                        <div
                            className="cards"
                            onDragOver={onDragOver}
                            onDrop={e => onDrop(e, col.id)}
                            style={{ minHeight: '40px' }}
                        >
                            {(col.cards ?? [])
                                .slice()
                                .sort((a, b) => a.order - b.order)
                                .map(card => {
                                    const dueHtml = card.dueDate ? `⏰ ${new Date(card.dueDate).toLocaleString()}` : "";
                                    const memHtml = card.assignees?.length ? `👤 ${card.assignees.length}` : "";
                                    return (
                                        <div
                                            key={card.id}
                                            className="card"
                                            draggable={userRights.canEditCard}
                                            onDragStart={e => onDragStart(e, card, col.id)}
                                            onDragEnd={onDragEnd}
                                            onClick={() => userRights.canEditCard && handleCardClick(card)}
                                            data-card-id={card.id}
                                        >
                                            <div className="labels">
                                                {(card.labels || []).map(label => (
                                                    <span key={label.id} className="label" style={{ backgroundColor: label.color }} title={label.name} />
                                                ))}
                                            </div>
                                            <div className="title">{card.title}</div>
                                            <div className="card-meta">
                                                {dueHtml && <span className="chip">{dueHtml}</span>}
                                                {memHtml && <span className="chip">{memHtml}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                        <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                            <input
                                placeholder="Titre nouvelle carte"
                                value={newCardTitle[col.id] || ""}
                                onChange={e => setNewCardTitle(prev => ({ ...prev, [col.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === "Enter") addCard(col.id); }}
                                disabled={!userRights.canAddCard}
                            />
                            <button onClick={() => addCard(col.id)} disabled={!userRights.canAddCard}>➕</button>
                        </div>
                    </div>
                ))}
                <button onClick={addColumn} className="create-button" disabled={!userRights.canAddColumn}>
                    + Ajouter une colonne
                </button>
            </div>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    kanbanId={kanban.id}
                    kanbanColumns={columns} // ou kanban.columns si tu préfères
                    allLabels={[]} // tu peux mettre toutes les labels du kanban si tu veux
                    onClose={() => setSelectedCard(null)}
                    onSave={handleCardSave}
                    onDelete={handleCardDelete}
                />
            )}
        </section>
    );
}
