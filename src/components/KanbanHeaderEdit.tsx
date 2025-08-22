"use client";

import { useState, useRef, useEffect } from "react";
import { Kanban } from "../types";
import Modal from "./Modal";

type Props = {
    kanban: Kanban;
    updateKanbanInfo: (updated: { name?: string; description?: string }) => void;
    onDelete: (id: string) => void;
};

type EditField = "title" | "description" | null;

export default function KanbanHeaderEdit({ kanban, updateKanbanInfo, onDelete }: Props) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [editField, setEditField] = useState<EditField>(null);
    const [tempValue, setTempValue] = useState("");

    // Synchronise la valeur quand on ouvre la modale
    useEffect(() => {
        if (editField === "title") setTempValue(kanban.name);
        if (editField === "description") setTempValue(kanban.description || "");
    }, [editField, kanban]);

    // Fermeture du menu si clic à l'extérieur
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const save = () => {
        if (editField === "title") {
            updateKanbanInfo({ name: tempValue });
        }
        if (editField === "description") {
            updateKanbanInfo({ description: tempValue });
        }
        setEditField(null);
    };

    return (
        <div className="kanban-header-edit">
            <div className="kanban-header-title">
                <h2>
                    {`Collab' : `}
                    <span>{kanban.name}</span>
                </h2>
                {kanban.description && (
                    <p className="mt-2">{kanban.description}</p>
                )}
            </div>

            {/* Menu kebab */}
            <div className="kebab" ref={menuRef}>
                <button className="btn sm" onClick={() => setMenuOpen((o) => !o)}>⋮</button>
                {menuOpen && (
                    <div className="menu">
                        <div className="menu-item" onClick={() => { setEditField("title"); setMenuOpen(false); }}>✏️ Modifier le titre</div>
                        <div className="menu-item" onClick={() => { setEditField("description"); setMenuOpen(false); }}>✏️ Modifier la description</div>
                        <div className="menu-item" style={{ color: "var(--danger)" }} onClick={() => onDelete(kanban.id)}>🗑️ Supprimer le kanban</div>
                    </div>
                )}
            </div>

            {/* Modale d'édition */}
            {editField && (
                <Modal
                    title={editField === "title" ? "Modifier le titre" : "Modifier la description"}
                    onClose={() => setEditField(null)}
                    onSave={save}
                >
                    {editField === "title" ? (
                        <input
                            type="text"
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            autoFocus
                        />
                    ) : (
                        <textarea
                            rows={4}
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            autoFocus
                        />
                    )}
                </Modal>
            )}
        </div>
    );
}
