// src/components/DeleteKanbanModal.tsx
"use client";

import { useState } from "react";

type Props = {
    kanban: {
        id: number;
        name: string;
        description: string;
    };
    onCancel: () => void;
    onConfirm: () => void;
};

export default function DeleteKanbanModal({ kanban, onCancel, onConfirm }: Props) {
    const [inputValue, setInputValue] = useState("");

    const isMatch = inputValue === kanban.name;

    const handleOverlayClick = () => {
        onCancel();
    };

    const handleContentClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isMatch) {
            onConfirm();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={handleContentClick}>
                <h1>{`Suppression d'une collab'`}</h1>
                <p>
                    Pour confirmer la suppression, tapez le nom exact :{" "}
                    <strong>{kanban.name}</strong>
                </p>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="confirm-name">Nom de la collab :</label>
                        <input
                            id="confirm-name"
                            name="confirm-name"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={!isMatch}>
                            Supprimer
                        </button>
                        <button type="button" onClick={onCancel}>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
