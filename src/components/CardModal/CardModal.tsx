"use client";

import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import {
    CardElement,
    Column,
    Label,
    Attachment,
    ChecklistItem,
    CardComment,
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
    dueDate?: string | null;
    checklist?: ChecklistItem[];
    comments?: CardComment[];
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

    const handleFieldChange = <K extends keyof CardElement>(field: K, value: CardElement[K]) =>
        setLocalCard(prev => ({ ...prev, [field]: value }));

    const setCommentsDispatch: React.Dispatch<React.SetStateAction<CardComment[]>> = useCallback(
        (value) => {
            setLocalCard(prev => {
                const prevComments = prev.comments ?? [];
                const nextComments = typeof value === "function"
                    ? (value as (prev: CardComment[]) => CardComment[])(prevComments)
                    : value;
                return { ...prev, comments: nextComments };
            });
        },
        [] // setLocalCard est stable, on peut garder [] ou [setLocalCard] selon lint
    );

    const commentsForDisplay: CardComment[] = (localCard.comments ?? []).map(c => ({
        ...c,
        author: typeof c.author === "object" && c.author !== null ? c.author : (c.author ?? "Utilisateur"),
    }));

    const handleSave = async () => {
        const payload: CardUpdatePayloadFull = {
            title: localCard.title,
            description: localCard.description,
            order: localCard.order,
            columnId: localCard.columnId,
            dueDate: localCard.dueDate ? (localCard.dueDate instanceof Date ? localCard.dueDate.toISOString() : new Date(localCard.dueDate).toISOString()) : null,
            labels: (localCard.labels ?? []).map(l => ({ id: l.id })),
            assignees: (localCard.assignees ?? []).map(a => ({ id: a.id })),
            checklist: localCard.checklist ?? [],
            attachments: localCard.attachments ?? [],
            comments: (localCard.comments ?? []).map(c => ({
                id: c.id,
                content: c.content,
                // envoyer un author sous forme de string (le backend doit mapper par authorId si nécessaire)
                author: typeof c.author === "object" && c.author !== null
                    ? c.author.name
                    : typeof c.author === "string"
                        ? c.author
                        : "Utilisateur",
                createdAt: c.createdAt,
            })),
        };

        try {
            await onSave(localCard.id, payload);
            onClose();
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la carte :", error);
            alert(error instanceof Error ? error.message : "Erreur inconnue");
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
                            comments={commentsForDisplay}
                            setComments={setCommentsDispatch}
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
