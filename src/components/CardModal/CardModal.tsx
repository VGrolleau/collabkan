// src/components/CardModal/CardModal.tsx
"use client";

import { FC, useEffect, useRef, useState } from "react";
import {
    CardElement,
    Column,
    Label,
    User,
    Attachment,
    ChecklistItem,
    Comment,
} from "@/types";

import AttachmentsSection from "./AttachmentsSection";
import AssigneesSection from "./AssigneesSection";
import CardLabels from "./CardLabels";
import ChecklistSection from "./ChecklistSection";
import { CommentsSection } from "./CommentsSection";
import DescriptionSection from "./DescriptionSection";
import DueDateSection from "./DueDateSection";
import ColumnSelect from "./ColumnSelect";

type CardModalProps = {
    card: CardElement;
    kanbanColumns: Column[];
    allLabels: Label[];
    allUsers: User[];
    onClose: () => void;
    onSave: (cardId: string, updatedData: CardUpdatePayload) => void;
    onDelete: (cardId: string) => void;
};

export type CardUpdatePayload = {
    title?: string;
    description?: string;
    order?: number;
    columnId?: string;
    labels?: { id: string }[];
    assignees?: { id: string }[];
    dueDate?: Date | null;
};

type CardLocalState = CardElement & {
    checklist: ChecklistItem[];
    labels: Label[];
    attachments: Attachment[];
    assignees: User[];
    comments: Comment[];
};

const CardModal: FC<CardModalProps> = ({
    card,
    kanbanColumns,
    allLabels = [],
    allUsers = [],
    onClose,
    onSave,
    onDelete,
}) => {
    const [localCard, setLocalCard] = useState<CardLocalState>({
        ...card,
        checklist: card.checklist ?? [],
        labels: card.labels ?? [],
        attachments: card.attachments ?? [],
        assignees: (card.assignees as User[]) ?? [],
        comments: card.comments ?? [],
    });

    const contentRef = useRef<HTMLDivElement | null>(null);

    // Fermer avec ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Bloquer scroll page
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    const handleFieldChange = <K extends keyof CardLocalState>(
        field: K,
        value: CardLocalState[K]
    ) => {
        setLocalCard((prev) => ({ ...prev, [field]: value }));
    };

    // Sauvegarde
    const handleSave = async () => {
        const payload: CardUpdatePayload = {
            title: localCard.title,
            description: localCard.description,
            order: localCard.order,
            columnId: localCard.columnId,
            labels: localCard.labels.map((l) => ({ id: l.id })),
            assignees: localCard.assignees.map((u) => ({ id: u.id })),
            dueDate: localCard.dueDate ?? null,
        };

        await onSave(localCard.id, payload);
        onClose();
    };

    const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Récupération complète de la carte
    useEffect(() => {
        const fetchCard = async () => {
            const res = await fetch(`/api/cards/${card.id}`);
            if (!res.ok) return console.error("Impossible de récupérer la carte");
            const data: CardElement = await res.json();

            setLocalCard({
                ...data,
                checklist: data.checklist ?? [],
                labels: data.labels ?? [],
                attachments: data.attachments ?? [],
                assignees: data.assignees?.map(a => ({
                    id: a.id,
                    name: a.name,
                    email: a.email,
                    role: a.role,
                    avatarUrl: a.avatarUrl,
                })) ?? [],
                comments: data.comments ?? [],
            });
        };
        fetchCard();
    }, [card.id]);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Édition de la carte"
            onClick={onOverlayClick}
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: 16,
            }}
        >
            <div
                ref={contentRef}
                className="card-modal"
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: "min(900px, 95vw)",
                    maxHeight: "85vh",
                    overflowY: "auto",
                    backgroundColor: "#fff",
                    color: "#1a1a1a",
                    borderRadius: 12,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
                    padding: 20,
                    display: "grid",
                    gridTemplateRows: "auto auto 1fr auto",
                    gap: 12,
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                        value={localCard.title}
                        onChange={(e) => handleFieldChange("title", e.target.value)}
                        placeholder="Titre de la carte"
                        style={{
                            flex: 1,
                            fontSize: 20,
                            fontWeight: 600,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            padding: "8px 10px",
                            outline: "none",
                        }}
                    />
                    <button
                        onClick={onClose}
                        aria-label="Fermer la modale"
                        title="Fermer"
                        style={{
                            border: "none",
                            background: "transparent",
                            fontSize: 20,
                            lineHeight: 1,
                            cursor: "pointer",
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <button
                        onClick={() => onDelete(localCard.id)}
                        style={{
                            padding: "8px 12px",
                            background: "#eee",
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        Supprimer
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                        onClick={handleSave}
                        style={{
                            padding: "8px 14px",
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Save
                    </button>
                </div>

                {/* Corps */}
                <div style={{ display: "grid", gap: 12 }}>
                    <ColumnSelect
                        columns={kanbanColumns}
                        selectedColumnId={localCard.columnId}
                        onChange={(newColumnId) => handleFieldChange("columnId", newColumnId)}
                    />

                    <DescriptionSection
                        value={localCard.description ?? ""}
                        onChange={(desc) => handleFieldChange("description", desc)}
                    />

                    <DueDateSection
                        dueDate={localCard.dueDate ?? null}
                        onChange={(date) => handleFieldChange("dueDate", date)}
                    />

                    <ChecklistSection
                        checklist={localCard.checklist ?? []}
                        cardId={localCard.id}
                        onChange={(items) => handleFieldChange("checklist", items)}
                    />

                    <CardLabels
                        cardId={localCard.id}
                        selectedLabels={localCard.labels}
                        onChange={(labels) => handleFieldChange("labels", labels)}
                        allLabels={allLabels}
                    />

                    <AttachmentsSection
                        cardId={localCard.id}
                        attachments={localCard.attachments}
                        setAttachments={(newAttachments) =>
                            handleFieldChange("attachments", newAttachments)
                        }
                    />

                    <AssigneesSection
                        assignees={localCard.assignees}
                        allUsers={allUsers}
                        onChange={(newAssignees) =>
                            handleFieldChange("assignees", newAssignees)
                        }
                    />

                    <CommentsSection
                        cardId={localCard.id}
                        comments={localCard.comments}
                        setComments={(newComments) => handleFieldChange("comments", newComments)}
                    />
                </div>

                {/* Footer */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 12px",
                            background: "#eee",
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            cursor: "pointer",
                        }}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: "8px 14px",
                            background: "#16a34a",
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CardModal;
