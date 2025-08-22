// src/components/CardModal/CardLabels/CardLabels.tsx
"use client";

import { FC, useEffect, useState } from "react";
import { Label } from "@/types";
import styles from "./CardLabels.module.scss";

type CardLabelsProps = {
    cardId: string;
    selectedLabels: Label[];
    onChange: (labels: Label[]) => void;
};

const CardLabels: FC<CardLabelsProps> = ({ cardId, selectedLabels, onChange }) => {
    const [allLabels, setAllLabels] = useState<Label[]>([]);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [appearing, setAppearing] = useState<string | null>(null);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#cccccc");

    useEffect(() => {
        fetch("/api/labels")
            .then(res => res.json())
            .then((labels: Label[]) => setAllLabels(labels))
            .catch(console.error);
    }, []);

    const toggleLabel = (label: Label) => {
        const newSelection = selectedLabels.some(l => l.id === label.id)
            ? selectedLabels.filter(l => l.id !== label.id)
            : [...selectedLabels, label];
        onChange(newSelection);
    };

    const addLabel = async () => {
        if (!newName.trim()) return;

        try {
            const res = await fetch("/api/labels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, color: newColor, cardId }),
            });

            if (!res.ok) throw new Error("Erreur lors de la création du label");

            const newLabel: Label = await res.json();
            setAllLabels(prev => [...prev, newLabel]);
            onChange([...selectedLabels, newLabel]);

            // animation d’apparition
            setAppearing(newLabel.id);
            setTimeout(() => setAppearing(null), 300);

            setNewName("");
            setNewColor("#cccccc");
        } catch (err) {
            console.error(err);
        }
    };

    const deleteLabel = async (id: string) => {
        setDeleting(id);
        setTimeout(async () => {
            try {
                await fetch(`/api/labels/${id}`, { method: "DELETE" });
                setAllLabels(prev => prev.filter(l => l.id !== id));
                onChange(selectedLabels.filter(l => l.id !== id));
            } catch (err) {
                console.error(err);
            } finally {
                setDeleting(null);
            }
        }, 300);
    };

    return (
        <div className={styles.cardLabels}>
            <h4>Étiquettes</h4>

            <div className={styles.labelsEdit}>
                {allLabels.map(label => {
                    const selected = selectedLabels.some(l => l.id === label.id);
                    return (
                        <div
                            key={label.id}
                            className={`${styles.labelChip} 
                                ${selected ? styles.selected : ""} 
                                ${deleting === label.id ? styles.fadeOut : ""} 
                                ${appearing === label.id ? styles.fadeIn : ""}`}
                            style={{ backgroundColor: label.color }}
                            onClick={() => toggleLabel(label)}
                        >
                            {label.name}
                            <span
                                className={styles.deleteIcon}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLabel(label.id);
                                }}
                                title="Supprimer le label"
                            >
                                🗑️
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className={styles.addLabelForm}>
                <input
                    placeholder="Nom"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                />
                <button onClick={addLabel}>➕</button>
            </div>
        </div>
    );
};

export default CardLabels;
