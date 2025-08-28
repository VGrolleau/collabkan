"use client";

import { FC, useEffect, useRef, useState } from "react";
import {
    CardElement,
    Column,
    Label,
    User,
    Attachment,
    ChecklistItem,
} from "@/types";

import AttachmentsSection from "./AttachmentsSection/AttachmentsSection";
import AssigneesSection from "./AssigneesSection/AssigneesSection";
import CardLabels from "./CardLabels/CardLabels";
import ChecklistSection from "./ChecklistSection/ChecklistSection";
import { CommentsSection } from "./CommentsSection";
import DescriptionSection from "./DescriptionSection/DescriptionSection";
import DueDateSection from "./DueDateSection/DueDateSection";

import styles from "./CardModal.module.scss";

type CardModalProps = {
    card: CardElement;
    kanbanId: string;
    kanbanColumns: Column[];
    allLabels: Label[];
    onClose: () => void;
    onSave: (cardId: string, updatedData: CardUpdatePayloadFull) => Promise<void>;
    onDelete: (cardId: string) => void;
};

export type CardUpdatePayloadFull = {
    title?: string;
    description?: string;
    order?: number;
    columnId?: string;
    labels?: { id: string }[];
    assignees?: { id: string }[];
    dueDate?: string | null; // <-- string ISO pour l'API
    checklist?: ChecklistItem[];
    comments?: { content: string; authorId: string }[];
    attachments?: Attachment[];
};

const CardModal: FC<CardModalProps> = ({ card, kanbanId, onClose, onSave, onDelete }) => {
    const [localCard, setLocalCard] = useState<CardElement>({
        ...card,
        checklist: card.checklist ?? [],
        labels: card.labels ?? [],
        attachments: card.attachments ?? [],
        assignees: card.assignees ?? [],
        comments: card.comments ?? [],
    });

    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    const handleFieldChange = <K extends keyof CardElement>(
        field: K,
        value: CardElement[K]
    ) => setLocalCard(prev => ({ ...prev, [field]: value }));

    const handleSave = async () => {
        // Assurer que dueDate est un objet Date
        let dueDateIso: string | null = null;
        if (localCard.dueDate) {
            dueDateIso =
                localCard.dueDate instanceof Date
                    ? localCard.dueDate.toISOString()
                    : new Date(localCard.dueDate).toISOString();
        }

        const payload: CardUpdatePayloadFull = {
            title: localCard.title,
            description: localCard.description,
            order: localCard.order,
            columnId: localCard.columnId,
            labels: localCard.labels.map(l => ({ id: l.id })),
            assignees: localCard.assignees.map(u => ({ id: u.id })),
            dueDate: dueDateIso,
            checklist: localCard.checklist,
            attachments: localCard.attachments,
            // commentaires laissés de côté si pas authorId
        };

        try {
            await onSave(localCard.id, payload);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la carte :", error);
        }
    };

    const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.cardModalOverlay} onClick={onOverlayClick}>
            <div ref={contentRef} className={styles.cardModalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.cardModalBody}>
                    <div className={styles.leftPane}>
                        <input
                            className={styles.modalTitle}
                            value={localCard.title}
                            onChange={e => handleFieldChange("title", e.target.value)}
                            placeholder="Titre de la carte"
                        />
                        <DescriptionSection
                            value={localCard.description ?? ""}
                            onChange={desc => handleFieldChange("description", desc)}
                        />
                        <ChecklistSection
                            checklist={localCard.checklist}
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
                        />
                        <AssigneesSection
                            kanbanId={kanbanId}
                            assignees={localCard.assignees}
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
                <div className={styles.cardModalFooter}>
                    <button className={styles.deleteBtn} onClick={() => onDelete(localCard.id)}>Supprimer</button>
                    <button onClick={onClose}>Annuler</button>
                    <button className="saveBtn" onClick={handleSave}>Enregistrer</button>
                </div>
            </div>
        </div>
    );
};

export default CardModal;
