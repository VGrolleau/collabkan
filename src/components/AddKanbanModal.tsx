"use client";

import { useState } from "react";

type Props = {
    onClose: () => void;
    onAdd: (kanban: { title: string; description: string }) => void;
};

export default function AddKanbanModal({ onClose, onAdd }: Props) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ title, description });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h1>{`Création d'une collab'`}</h1>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="title">Titre :</label>
                        <input
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="description">Description :</label>
                        <textarea
                            id="description"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <button type="submit">Créer</button>
                        <button type="button" onClick={onClose}>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
