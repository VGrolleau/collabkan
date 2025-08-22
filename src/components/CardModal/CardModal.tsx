// src/components/CardModal/CardModal.tsx
"use client";

import { FC, useEffect, useRef, useState } from "react";
import { CardElement, Column, Label, User, Attachment, ChecklistItem, Comment } from "@/types";
import AttachmentsSection from "./AttachmentsSection/AttachmentsSection";
import AssigneesSection from "./AssigneesSection/AssigneesSection";
import CardLabels from "./CardLabels/CardLabels";
import ChecklistSection from "./ChecklistSection/ChecklistSection";
import { CommentsSection } from "./CommentsSection";
import DescriptionSection from "./DescriptionSection/DescriptionSection";
import DueDateSection from "./DueDateSection/DueDateSection";
import ColumnSelect from "./ColumnSelect";

import styles from "./CardModal.module.scss";

type CardModalProps = {
    card: CardElement;
    kanbanColumns: Column[];
    allLabels: Label[];
    // allUsers: User[];
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
    // allLabels = [],
    // allUsers = [],
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

    const handleFieldChange = <K extends keyof CardLocalState>(field: K, value: CardLocalState[K]) => {
        setLocalCard(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        const payload: CardUpdatePayload = {
            title: localCard.title,
            description: localCard.description,
            order: localCard.order,
            columnId: localCard.columnId,
            labels: localCard.labels.map(l => ({ id: l.id })),
            assignees: localCard.assignees.map(u => ({ id: u.id })),
            dueDate: localCard.dueDate ?? null,
        };
        await onSave(localCard.id, payload);
        onClose();
    };

    const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.cardModalOverlay} onClick={onOverlayClick}>
            <div ref={contentRef} className={styles.cardModalContent} onClick={e => e.stopPropagation()}>
                {/* Body scrollable */}
                <div className={styles.cardModalBody}>
                    {/* <button className={styles.modalClose} onClick={onClose}>
                        X
                    </button> */}
                    <div className={styles.leftPane}>
                        <div className={styles.modalHeader}>
                            <input
                                className={styles.modalTitle}
                                value={localCard.title}
                                onChange={e => handleFieldChange("title", e.target.value)}
                                placeholder="Titre de la carte"
                            />
                        </div>
                        {/* <ColumnSelect
                        columns={kanbanColumns}
                        selectedColumnId={localCard.columnId}
                        onChange={newColumnId => handleFieldChange("columnId", newColumnId)}
                    /> */}
                        <DescriptionSection
                            value={localCard.description ?? ""}
                            onChange={desc => handleFieldChange("description", desc)}
                        />
                        <ChecklistSection
                            checklist={localCard.checklist ?? []}
                            cardId={localCard.id}
                            onChange={items => handleFieldChange("checklist", items)}
                        />
                        <CommentsSection
                            cardId={localCard.id}
                            comments={localCard.comments}
                            setComments={newComments => handleFieldChange("comments", newComments)}
                        />
                    </div>
                    <div className={styles.rightPane}>
                        <CardLabels
                            cardId={localCard.id}
                            selectedLabels={localCard.labels}
                            onChange={labels => handleFieldChange("labels", labels)}
                        // allLabels={allLabels}
                        />
                        <AssigneesSection
                            assignees={localCard.assignees}
                            // allUsers={allUsers}
                            onChange={newAssignees => handleFieldChange("assignees", newAssignees)}
                        />
                        <DueDateSection
                            dueDate={localCard.dueDate ?? null}
                            onChange={date => handleFieldChange("dueDate", date)}
                        />
                        <AttachmentsSection
                            cardId={localCard.id}
                            attachments={localCard.attachments}
                            setAttachments={newAttachments => handleFieldChange("attachments", newAttachments)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className={styles.cardModalFooter}>
                    <button className={styles.deleteBtn} onClick={() => onDelete(localCard.id)}>Supprimer la carte</button>
                    <button onClick={onClose}>Annuler</button>
                    <button className="saveBtn" onClick={handleSave}>Enregistrer</button>
                </div>
            </div>
        </div>
    );
};

export default CardModal;
