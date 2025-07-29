"use client";

import { useState, useEffect } from "react";
import { CardElement, ChecklistItem, Column } from "@/types";
import { TitleBar } from "./TitleBar";
import { ColumnSelect } from "./ColumnSelect";
import { DescriptionSection } from "./DescriptionSection";
import { ChecklistSection } from "./ChecklistSection";
import { SaveCloseActions } from "./SaveCloseActions";
import { CardLabels } from "./CardLabels";

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
    const [labels, setLabels] = useState(card.labels || []);

    useEffect(() => {
        const openSections: string[] = [];
        if (description) openSections.push("description");
        if (checklist.length > 0) openSections.push("checklist");
        if (labels && labels.length > 0) openSections.push("labels");

        setVisibleSections(openSections);

        const currentCol = kanbanColumns.find(col =>
            col.cards.some(c => c.id === card.id)
        );
        setColumnId(currentCol?.id);
    }, [card, kanbanColumns, checklist.length, description, labels]);

    const showSection = (section: string) => {
        if (!visibleSections.includes(section)) {
            setVisibleSections(prev => [...prev, section]);
        }
    };

    const hideSection = (section: string) => {
        setVisibleSections(prev => prev.filter(s => s !== section));
        if (section === "description") setDescription("");
        if (section === "checklist") setChecklist([]);
        if (section === "labels") setLabels([]);
    };

    const allLabels = [
        { id: 1, name: "Urgent", color: "#e53935" },
        { id: 2, name: "Bug", color: "#fb8c00" },
        { id: 3, name: "Amélioration", color: "#43a047" },
        { id: 4, name: "Revue", color: "#1e88e5" },
    ];

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
            labels,
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
                    {!visibleSections.includes("labels") && (
                        <button onClick={() => showSection("labels")}>➕ Ajouter un label</button>
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

                {visibleSections.includes("labels") && (
                    <CardLabels
                        allLabels={allLabels}
                        selectedLabels={labels}
                        onChange={setLabels}
                        onDelete={() => {
                            hideSection("labels");
                        }}
                    />
                )}

                <SaveCloseActions onSave={handleSave} onClose={onClose} />
            </div>
        </div>
    );
}
