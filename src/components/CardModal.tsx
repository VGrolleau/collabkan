// src/components/CardModal.tsx
"use client";

import { useState } from "react";
import { CardElement } from "../types";

type Props = {
    card: CardElement;
    onClose: () => void;
    onSave?: (updatedCard: CardElement) => void;
};

export function CardModal({ card, onClose, onSave }: Props) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || "");

    const handleSave = () => {
        if (onSave) {
            onSave({ ...card, title, description });
        }
        onClose();
    };

    return (
        <div
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: "fixed",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "white",
                    padding: "1rem",
                    borderRadius: "8px",
                    width: "400px",
                    maxWidth: "90%",
                }}
            >
                <h2>Modifier la carte</h2>

                <label>
                    Titre :
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                </label>

                <label>
                    Description :
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        style={{ width: "100%", marginBottom: "0.5rem" }}
                    />
                </label>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                    <button onClick={onClose}>Annuler</button>
                    <button onClick={handleSave}>Sauvegarder</button>
                </div>
            </div>
        </div>
    );
}
