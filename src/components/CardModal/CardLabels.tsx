"use client";

import { FC, useEffect, useState } from "react";
import { Label } from "@/types";

type CardLabelsProps = {
    cardId: string;
    selectedLabels: Label[];
    onChange: (labels: Label[]) => void;
    allLabels?: Label[]; // <--- ajoute cette ligne
};

const CardLabels: FC<CardLabelsProps> = ({ cardId, selectedLabels, onChange }) => {
    const [allLabels, setAllLabels] = useState<Label[]>([]);
    const [newName, setNewName] = useState("");
    const [newColor, setNewColor] = useState("#cccccc");

    // Charger tous les labels existants
    useEffect(() => {
        fetch("/api/labels")
            .then(res => res.json())
            .then((labels: Label[]) => setAllLabels(labels))
            .catch(console.error);
    }, []);

    // Sélection / désélection d’un label pour la carte
    const toggleLabel = (label: Label) => {
        const newSelection = selectedLabels.some(l => l.id === label.id)
            ? selectedLabels.filter(l => l.id !== label.id)
            : [...selectedLabels, label];
        onChange(newSelection);
    };

    // Ajouter un label global et l’associer à la carte
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
            setNewName("");
            setNewColor("#cccccc");
        } catch (err) {
            console.error(err);
        }
    };

    // Supprimer un label global
    const deleteLabel = async (id: string) => {
        try {
            await fetch(`/api/labels/${id}`, { method: "DELETE" });
            setAllLabels(prev => prev.filter(l => l.id !== id));
            onChange(selectedLabels.filter(l => l.id !== id)); // retirer de la sélection si présent
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <h4>Étiquettes</h4>

            {/* Liste des labels existants */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                {allLabels.map(label => (
                    <div key={label.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <button
                            onClick={() => toggleLabel(label)}
                            style={{
                                padding: "2px 8px",
                                borderRadius: 4,
                                border: selectedLabels.some(l => l.id === label.id)
                                    ? "2px solid black"
                                    : "1px solid #ccc",
                                backgroundColor: label.color,
                                cursor: "pointer",
                            }}
                        >
                            {label.name}
                        </button>
                        <button
                            onClick={() => deleteLabel(label.id)}
                            title="Supprimer le label"
                            style={{ cursor: "pointer", border: "none", background: "transparent" }}
                        >
                            ✖️
                        </button>
                    </div>
                ))}
            </div>

            {/* Formulaire d’ajout */}
            <div style={{ display: "flex", gap: 4 }}>
                <input
                    placeholder="Nom"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ flex: 1, padding: 4, borderRadius: 4, border: "1px solid #ccc" }}
                />
                <input
                    type="color"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    style={{ width: 40, height: 32, border: "none", padding: 0 }}
                />
                <button
                    onClick={addLabel}
                    style={{
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        cursor: "pointer",
                        background: "#eee",
                    }}
                >
                    ➕
                </button>
            </div>
        </div>
    );
};

export default CardLabels;
