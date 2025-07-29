"use client";

import { useState, useEffect } from "react";
import { CardElement, ChecklistItem, Column } from "@/types";
import { TitleBar } from "./TitleBar";
import { ColumnSelect } from "./ColumnSelect";
import { DescriptionSection } from "./DescriptionSection";
import { ChecklistSection } from "./ChecklistSection";
import { SaveCloseActions } from "./SaveCloseActions";


export type CardModalProps = {
    card: CardElement;
    kanbanColumns: Column[];
    onClose: () => void;
    onSave: (
        cardId: number | string,
        updatedData: Partial<CardElement> & { columnId?: number }
    ) => void;
    onDelete: (cardId: number | string) => void;
};

export function CardModal({ card, kanbanColumns, onClose, onSave, onDelete }: CardModalProps) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");
    const [checklist, setChecklist] = useState<ChecklistItem[]>(card.checklist || []);
    const [newChecklistItem, setNewChecklistItem] = useState("");
    const [visibleSections, setVisibleSections] = useState<string[]>([]);
    const [columnId, setColumnId] = useState<number | undefined>(undefined);

    useEffect(() => {
        const openSections: string[] = [];
        if (description) openSections.push("description");
        if (checklist.length > 0) openSections.push("checklist");
        setVisibleSections(openSections);

        const currentCol = kanbanColumns.find(col =>
            col.cards.some(c => c.id === card.id)
        );
        setColumnId(currentCol?.id);
    }, [card, kanbanColumns, checklist.length, description]);

    const showSection = (section: string) => {
        if (!visibleSections.includes(section)) {
            setVisibleSections(prev => [...prev, section]);
        }
    };

    const hideSection = (section: string) => {
        setVisibleSections(prev => prev.filter(s => s !== section));
        if (section === "description") setDescription("");
        if (section === "checklist") setChecklist([]);
    };

    const handleSave = () => {
        if (!title.trim()) {
            alert("Le titre ne peut pas être vide");
            return;
        }

        onSave(card.id, {
            title,
            description,
            checklist,
            columnId,
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <TitleBar title={title} setTitle={setTitle} onDelete={() => onDelete(card.id)} />
                <ColumnSelect columnId={columnId} setColumnId={setColumnId} kanbanColumns={kanbanColumns} />

                <div className="card-options" style={{ marginTop: "1rem" }}>
                    {!visibleSections.includes("description") && (
                        <button onClick={() => showSection("description")}>➕ Ajouter une description</button>
                    )}
                    {!visibleSections.includes("checklist") && (
                        <button onClick={() => showSection("checklist")}>➕ Ajouter une checklist</button>
                    )}
                </div>

                {visibleSections.includes("description") && (
                    <DescriptionSection
                        description={description}
                        setDescription={setDescription}
                        onDelete={() => hideSection("description")}
                    />
                )}

                {visibleSections.includes("checklist") && (
                    <ChecklistSection
                        checklist={checklist}
                        setChecklist={setChecklist}
                        newItem={newChecklistItem}
                        setNewItem={setNewChecklistItem}
                        onDelete={() => hideSection("checklist")}
                    />
                )}

                <SaveCloseActions onSave={handleSave} onClose={onClose} />
            </div>
        </div>
    );
}
