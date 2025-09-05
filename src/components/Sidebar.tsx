// src/components/Sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
import AddKanbanModal from "./AddKanbanModal";
import { Kanban } from "../types";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

type Props = {
    kanbans: Kanban[];
    onSelect: (kanban: Kanban) => void;
    onAddKanban?: (data: { title: string; description: string }) => Promise<Kanban | null>;
    onDeleteKanban?: (id: string) => Promise<void> | void;
};

export default function Sidebar({ kanbans, onSelect, onAddKanban, onDeleteKanban }: Props) {
    const { user } = useUser();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKanbanId, setSelectedKanbanId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (kanbans.length > 0 && !selectedKanbanId) {
            setSelectedKanbanId(kanbans[0].id);
            onSelect(kanbans[0]);
        }
    }, [kanbans, selectedKanbanId, onSelect]);

    useEffect(() => {
        if (!selectedKanbanId) return;
        const stillExists = kanbans.some(k => k.id === selectedKanbanId);
        if (!stillExists && kanbans.length > 0) {
            setSelectedKanbanId(kanbans[0].id);
            onSelect(kanbans[0]);
        }
    }, [kanbans, selectedKanbanId, onSelect]);

    const getInitials = (name?: string | null) => {
        if (!name) return "??";
        const parts = name.trim().split(/\s+/);
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    if (!user) return null; // utilisateur non connecté

    return (
        <>
            <button
                className={`sidebar-toggle ${sidebarOpen ? "open" : ""}`}
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label={sidebarOpen ? "Fermer la sidebar" : "Ouvrir la sidebar"}
            >
                {/* {sidebarOpen ? "X" : "☰"} */}
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <line
                        x1="3"
                        y1={sidebarOpen ? "12" : "6"}
                        x2="21"
                        y2={sidebarOpen ? "12" : "6"}
                        stroke="white"
                        strokeWidth="2"
                        transform={sidebarOpen ? "rotate(45 12 12)" : "rotate(0 12 12)"}
                        style={{ transition: "all 0.3s ease" }}
                    />
                    <line
                        x1="3"
                        y1="12"
                        x2="21"
                        y2="12"
                        stroke="white"
                        strokeWidth="2"
                        style={{ opacity: sidebarOpen ? 0 : 1, transition: "all 0.3s ease" }}
                    />
                    <line
                        x1="3"
                        y1={sidebarOpen ? "12" : "18"}
                        x2="21"
                        y2={sidebarOpen ? "12" : "18"}
                        stroke="white"
                        strokeWidth="2"
                        transform={sidebarOpen ? "rotate(-45 12 12)" : "rotate(0 12 12)"}
                        style={{ transition: "all 0.3s ease" }}
                    />
                </svg>
            </button>

            <aside className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
                <div
                    className="user-block"
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push("/profile")}
                >
                    <div className="avatar">
                        {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.name || "User"} />
                        ) : (
                            getInitials(user.name)
                        )}
                    </div>
                    <div className="user-info">
                        <div className="user-name">{user.name || "Utilisateur"}</div>
                        <div className="user-email">{user.email}</div>
                    </div>
                </div>

                <div className="group-title">{`MES COLLAB'`}</div>
                <ul className="sidebar-list">
                    {kanbans.map(k => (
                        <li
                            key={k.id}
                            className={clsx("sidebar-item", selectedKanbanId === k.id && "active")}
                            onClick={() => { onSelect(k); setSelectedKanbanId(k.id); }}
                        >
                            <div className="sidebar-item-row">
                                <span>{k.name}</span>
                                {onDeleteKanban && (
                                    <button
                                        className="delete-btn"
                                        onClick={async e => {
                                            e.stopPropagation();
                                            await onDeleteKanban(k.id);
                                            if (selectedKanbanId === k.id) setSelectedKanbanId(null);
                                        }}
                                        title="Supprimer"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                {onAddKanban ? (
                    <>
                        <div className="group-title">ACTIONS</div>
                        <div className="create-button" onClick={() => setIsModalOpen(true)}>
                            + Créer un tableau
                        </div>
                    </>
                ) : null}

                {isModalOpen && (
                    <AddKanbanModal
                        onClose={() => setIsModalOpen(false)}
                        onAdd={async data => {
                            if (!onAddKanban) return;
                            const newKanban = await onAddKanban(data);
                            setIsModalOpen(false);
                            if (newKanban) {
                                setSelectedKanbanId(newKanban.id);
                                onSelect(newKanban);
                            }
                        }}
                    />
                )}
            </aside>
        </>
    );
}
