"use client";

import { useState, useEffect } from "react";
import { CardElement, ChecklistItem, Column, Label } from "@/types";
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
    const [labels, setLabels] = useState<Label[]>(card.labels || []);

    const [allLabels, setAllLabels] = useState<Label[]>([
        { id: 1, name: "Urgent", color: "#e53935" },
        { id: 2, name: "Bug", color: "#fb8c00" },
        { id: 3, name: "Amélioration", color: "#43a047" },
        { id: 4, name: "Revue", color: "#1e88e5" },
    ]);

    useEffect(() => {
        const openSections: string[] = [];
        if (description) openSections.push("description");
        if (checklist.length > 0) openSections.push("checklist");
        if (labels.length > 0) openSections.push("labels");
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

    const handleAddLabel = (name: string, color: string) => {
        const exists = allLabels.some(
            label => label.name.trim().toLowerCase() === name.trim().toLowerCase()
        );
        if (exists) {
            // La validation visuelle est gérée dans le composant enfant
            return;
        }

        const newLabel: Label = {
            id: Date.now(),
            name,
            color,
        };
        setAllLabels(prev => [...prev, newLabel]);
    };

    const handleUpdateLabel = (updated: Label) => {
        setAllLabels(prev => prev.map(label => label.id === updated.id ? updated : label));
        setLabels(prev => prev.map(label => label.id === updated.id ? updated : label));
    };

    const handleDeleteLabel = (id: number) => {
        setAllLabels(prev => prev.filter(label => label.id !== id));
        setLabels(prev => prev.filter(label => label.id !== id));
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
            labels,
        });
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <TitleBar title={title} setTitle={setTitle} onDelete={() => onDelete(card.id)} />
                <ColumnSelect columnId={columnId} setColumnId={setColumnId} kanbanColumns={kanbanColumns} />

                <div className="modal-scrollable-content">
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
                            onDelete={() => hideSection("labels")}
                            onAdd={handleAddLabel}
                            onUpdate={handleUpdateLabel}
                            onRemove={handleDeleteLabel}
                        />
                    )}
                </div>

                <SaveCloseActions onSave={handleSave} onClose={onClose} />
            </div>
        </div>
    );
}
