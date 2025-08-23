// src/components/KanbanBoard/KanbanBoard.tsx
"use client";

import { useState, useRef } from "react";
import { Kanban, Column, CardElement, Label, Assignee, ChecklistItem, CommentClient, Attachment } from "@/types";
import CardModal, { CardUpdatePayloadFull } from "../CardModal/CardModal";
import KanbanHeaderEdit from "../KanbanHeaderEdit";
import InviteModal from "../InviteModal/InviteModal";

type Props = {
    kanban: Kanban;
    updateKanbanColumns: (columns: Column[]) => void;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => void;
    onDeleteKanban: (id: string) => void;
};

export default function KanbanBoard({ kanban, updateKanbanColumns, updateKanbanInfo, onDeleteKanban }: Props) {
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [newColumnName, setNewColumnName] = useState("");
    const [newCardTitle, setNewCardTitle] = useState<Record<number | string, string>>({});
    const [selectedCard, setSelectedCard] = useState<CardElement | null>(null);

    const dragging = useRef<{ card: CardElement | null; fromColId: number | string | null }>({ card: null, fromColId: null });
    const lastPositions = useRef<Map<string, DOMRect>>(new Map());

    // ===================== UTILITAIRES DND =====================
    const capturePositions = () => {
        lastPositions.current.clear();
        document.querySelectorAll<HTMLElement>(".card").forEach(el => {
            if (el.dataset.cardId) lastPositions.current.set(el.dataset.cardId, el.getBoundingClientRect());
        });
    };

    const playReorderAnimations = () => {
        document.querySelectorAll<HTMLElement>(".card").forEach(el => {
            const id = el.dataset.cardId!;
            const prev = lastPositions.current.get(id);
            if (!prev) return;

            const now = el.getBoundingClientRect();
            const dx = prev.left - now.left;
            const dy = prev.top - now.top;

            if (dx || dy) {
                el.style.transform = `translate(${dx}px, ${dy}px)`;

                requestAnimationFrame(() => {
                    el.style.transition = "transform 200ms ease";
                    el.style.transform = "";
                });
            }
        });
    };

    const ensurePlaceholder = (container: HTMLElement) => {
        let ph = container.querySelector(".placeholder") as HTMLElement;
        if (!ph) {
            ph = document.createElement("div");
            ph.className = "placeholder";
            ph.style.border = "2px dashed var(--border)";
            ph.style.borderRadius = "8px";
            ph.style.margin = "2px 0";
            ph.style.transition = "all 0.2s ease";
            ph.style.pointerEvents = "none";
        }

        const draggingCard = container.querySelector(".card.dragging") as HTMLElement;
        if (draggingCard) {
            // transition douce pour la hauteur
            ph.style.height = draggingCard.offsetHeight + "px";
        }

        return ph;
    };

    const getDragAfterElement = (container: HTMLElement, y: number) => {
        const els = [...container.querySelectorAll<HTMLElement>(".card:not(.dragging)")];
        return els.reduce<{ offset: number; element: HTMLElement | null }>((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset, element: child };
            return closest;
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    };

    // ===================== ACTIONS KANBAN =====================
    const handleDeleteKanban = async (id: string) => {
        const confirmDelete = window.confirm("Supprimer ce kanban ? Cette action est irréversible.");
        if (!confirmDelete) return;

        try {
            const res = await fetch(`/api/kanbans/${id}`, { method: "DELETE" });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la suppression");
            }
            onDeleteKanban(id);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
        }
    };

    // ===================== ACTIONS COLONNES =====================
    const addColumn = async () => {
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

    const deleteColumn = async (id: number | string) => {
        if (!confirm("Supprimer cette colonne ?")) return;
        await fetch(`/api/columns/${id}`, { method: "DELETE" });
        updateKanbanColumns(kanban.columns.filter(c => c.id !== id));
    };

    const saveEdit = async (id: number | string) => {
        const trimmedName = newColumnName.trim();
        if (!trimmedName) return alert("Le nom de la colonne ne peut pas être vide.");
        await fetch(`/api/columns/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: trimmedName }),
        });
        updateKanbanColumns(kanban.columns.map(c => c.id === id ? { ...c, title: trimmedName } : c));
        setEditingId(null);
    };

    // ===================== ACTIONS CARTES =====================
    const addCard = async (colId: number | string) => {
        const title = newCardTitle[colId]?.trim() || "Nouvelle carte";

        try {
            const res = await fetch("/api/cards", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    columnId: colId,
                    order: kanban.columns.find(c => c.id === colId)?.cards.length || 0,
                    description: "",
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert("Erreur: " + error.error);
                return;
            }

            const savedCard: CardElement = await res.json();

            // Mise à jour locale avec l'objet renvoyé par l’API (donc persisté)
            const updatedColumns = kanban.columns.map(c =>
                c.id === colId
                    ? { ...c, cards: [...(c.cards ?? []), savedCard] }
                    : c
            );

            updateKanbanColumns(updatedColumns);
            setNewCardTitle(prev => ({ ...prev, [colId]: "" }));
        } catch (err) {
            console.error("Erreur lors de l'ajout de carte", err);
            alert("Impossible d'ajouter la carte.");
        }
    };

    const handleCardClick = async (card: CardElement) => {
        try {
            const res = await fetch(`/api/cards/${card.id}`);
            if (!res.ok) throw new Error("Impossible de charger la carte");
            const fullCard: CardElement = await res.json();
            setSelectedCard(fullCard); // maintenant, CardModal reçoit une carte complète
        } catch (err) {
            console.error(err);
            alert("Erreur lors du chargement de la carte");
        }
    };

    const handleCardSave = async (cardId: string, payload: CardUpdatePayloadFull) => {
        // Optimistic update uniquement sur les champs simples (pas comments, labels, assignees)
        const updatedColumns = kanban.columns.map(col => ({
            ...col,
            cards: col.cards.map(c =>
                c.id === cardId
                    ? {
                        ...c,
                        title: payload.title ?? c.title,
                        description: payload.description ?? c.description,
                        order: payload.order ?? c.order,
                        columnId: payload.columnId?.toString() ?? c.columnId,
                        dueDate: payload.dueDate ? new Date(payload.dueDate) : c.dueDate,
                        checklist: payload.checklist ?? c.checklist ?? [],
                        attachments: payload.attachments ?? c.attachments ?? [],
                        // labels, assignees et comments non touchés
                    }
                    : c
            ),
        }));

        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);

        // Envoi au serveur
        const res = await fetch(`/api/cards/${cardId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error("Erreur lors de la mise à jour de la carte");
            return;
        }

        // Typage de la réponse API
        type ApiCard = Omit<CardElement, "dueDate"> & { dueDate: string | null };
        const updatedCardFromApi: ApiCard = await res.json();

        // Conversion de dueDate en Date
        const updatedCard: CardElement = {
            ...updatedCardFromApi,
            dueDate: updatedCardFromApi.dueDate ? new Date(updatedCardFromApi.dueDate) : null,
        };

        // Mise à jour finale avec la carte complète
        const finalColumns = kanban.columns.map(col => ({
            ...col,
            cards: col.cards.map(c => (c.id === cardId ? updatedCard : c)),
        }));

        updateKanbanColumns(finalColumns);
    };

    const handleCardDelete = async (cardId: string) => {
        await fetch(`/api/cards/${cardId}`, { method: "DELETE" });
        const updatedColumns = kanban.columns.map(col => ({
            ...col,
            cards: col.cards.filter(c => c.id !== cardId)
        }));
        updateKanbanColumns(updatedColumns);
        setSelectedCard(null);
    };

    const updateCardOrder = async (cards: CardElement[]) => {
        await fetch("/api/cards/reorder", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cards }),
        });
    };

    // ===================== DND =====================
    const onDragStart = (e: React.DragEvent<HTMLDivElement>, card: CardElement, colId: number | string) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", card.id);
        dragging.current.card = card;
        dragging.current.fromColId = colId;

        const target = e.currentTarget as HTMLElement;
        setTimeout(() => target.classList.add("dragging"), 0);

        capturePositions();
    };

    const onDragEnd = (e: React.DragEvent) => {
        (e.currentTarget as HTMLElement).classList.remove("dragging");
        dragging.current.card = null;
        dragging.current.fromColId = null;
        playReorderAnimations();

        // Nettoyage placeholder au cas où
        document.querySelectorAll<HTMLElement>(".placeholder").forEach(ph => ph.remove());
    };

    const onDragOver = (e: React.DragEvent, colId: number | string) => {
        e.preventDefault();
        const container = e.currentTarget.querySelector<HTMLElement>(".cards")!;
        let placeholder = container.querySelector<HTMLElement>(".placeholder");

        // Supprime les placeholders des autres colonnes
        document.querySelectorAll<HTMLElement>(".placeholder").forEach(ph => {
            if (!container.contains(ph)) ph.remove();
        });

        if (!placeholder) {
            placeholder = document.createElement("div");
            placeholder.className = "placeholder";
            placeholder.style.border = "2px dashed var(--border)";
            placeholder.style.borderRadius = "8px";
            placeholder.style.margin = "2px 0";
            placeholder.style.transition = "all 0.2s ease";
            placeholder.style.pointerEvents = "none";
            container.appendChild(placeholder);
        }

        // Ajuste la hauteur à la carte en train d'être déplacée
        const draggingCard = document.querySelector<HTMLElement>(".card.dragging");
        if (draggingCard) {
            placeholder.style.height = draggingCard.offsetHeight + "px";
        }

        const afterEl = getDragAfterElement(container, e.clientY);

        if (afterEl == null) container.appendChild(placeholder);
        else container.insertBefore(placeholder, afterEl);
    };

    const onDrop = async (e: React.DragEvent, colId: number | string) => {
        e.preventDefault();
        const container = e.currentTarget.querySelector<HTMLElement>(".cards")!;
        const placeholder = container.querySelector<HTMLElement>(".placeholder");
        if (!dragging.current.card || !placeholder) return;

        const card = dragging.current.card;
        const fromCol = kanban.columns.find(c => c.id === dragging.current.fromColId);
        const toCol = kanban.columns.find(c => c.id === colId);
        if (!fromCol || !toCol) return;

        // 🔹 Supprime la carte de la colonne source
        const idxFrom = fromCol.cards.findIndex(c => c.id === card.id);
        if (idxFrom > -1) fromCol.cards.splice(idxFrom, 1);

        // 🔹 Détermine l'index exact pour l'insertion dans la colonne cible
        const cardElements = Array.from(container.querySelectorAll<HTMLElement>(".card"));
        const newIndex = cardElements.indexOf(placeholder);
        toCol.cards.splice(newIndex, 0, card);

        // 🔹 Réindexe les cartes de la colonne cible
        toCol.cards = toCol.cards.map((c, i) => ({
            ...c,
            order: i,
            columnId: colId.toString(),
        }));

        // 🔹 Réindexe les cartes de la colonne source si la carte a été déplacée
        if (fromCol.id !== toCol.id) {
            fromCol.cards = fromCol.cards.map((c, i) => ({
                ...c,
                order: i,
                columnId: fromCol.id.toString(),
            }));
        }

        // 🔹 Mise à jour locale
        updateKanbanColumns([...kanban.columns]);

        // 🔹 Nettoyage du placeholder
        document.querySelectorAll<HTMLElement>(".placeholder").forEach(ph => ph.remove());

        // 🔹 Prépare les cartes à envoyer au serveur
        const cardsToUpdate = [...toCol.cards];
        if (fromCol.id !== toCol.id) cardsToUpdate.push(...fromCol.cards);

        // 🔹 Envoi au serveur
        await fetch("/api/cards/reorder", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cards: cardsToUpdate }),
        });

        // 🔹 Reset drag
        dragging.current.card = null;
        dragging.current.fromColId = null;
    };

    // ===================== RENDER =====================
    return (
        <section>
            <KanbanHeaderEdit
                kanban={kanban}
                updateKanbanInfo={updateKanbanInfo}
                onDelete={handleDeleteKanban} // <-- suppression via le kebab
            />
            <div style={{ marginBottom: 16 }}>
                <InviteModal kanbanId={kanban.id} />
            </div>

            <div className="board">
                {kanban.columns.map(col => (
                    <div key={col.id} className="board-list" onDragOver={e => onDragOver(e, col.id)} onDrop={e => onDrop(e, col.id)}>
                        {editingId === col.id ? (
                            <>
                                <input value={newColumnName} onChange={e => setNewColumnName(e.target.value)} />
                                <button onClick={() => saveEdit(col.id)}>💾</button>
                                <button onClick={() => setEditingId(null)}>✖️</button>
                            </>
                        ) : (
                            <div className="list-header">
                                <h3 className="list-title">{col.title}</h3>
                                <div className="list-actions">
                                    <button onClick={() => { setEditingId(col.id); setNewColumnName(col.title); }} title="Modifier">✏️</button>
                                    <button onClick={() => deleteColumn(col.id)} title="Supprimer">🗑️</button>
                                </div>
                            </div>
                        )}

                        <div className="cards">
                            {col.cards.map(card => (
                                <div
                                    key={card.id}
                                    className="card"
                                    draggable
                                    onDragStart={e => onDragStart(e, card, col.id)}
                                    onDragEnd={onDragEnd}
                                    onClick={() => handleCardClick(card)}
                                    data-card-id={card.id}
                                >
                                    <div className="labels">{(card.labels || []).map(l => <span key={l.id} className={`label ${l.id}`} />)}</div>
                                    <div className="title">{card.title}</div>
                                    <div className="card-meta">
                                        {card.dueDate && <span className="chip">⏰ {new Date(card.dueDate).toLocaleDateString()}</span>}
                                        {card.assignees?.length ? <span className="chip">👤 {card.assignees.length}</span> : null}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                            <input
                                placeholder="Titre nouvelle carte"
                                value={newCardTitle[col.id] || ""}
                                onChange={e => setNewCardTitle(prev => ({ ...prev, [col.id]: e.target.value }))}
                                onKeyDown={e => { if (e.key === "Enter") addCard(col.id); }}
                            />
                            <button onClick={() => addCard(col.id)}>➕</button>
                        </div>
                    </div>
                ))}

                <button onClick={addColumn} className="create-button">+ Ajouter une colonne</button>
            </div>

            {selectedCard && (
                <CardModal
                    card={selectedCard}
                    kanbanColumns={kanban.columns}
                    allLabels={[]}
                    onClose={() => setSelectedCard(null)}
                    onSave={handleCardSave}
                    onDelete={handleCardDelete}
                />
            )}
        </section>
    );
}
