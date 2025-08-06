// src/components/Sidebar.tsx
"use client";

import React, { useState } from "react";
import AddKanbanModal from "./AddKanbanModal";
import { Kanban } from "../types";
import LogoutButton from "./LogoutButton";
import { useRouter } from "next/navigation";
import { User } from "@prisma/client";

type Props = {
    kanbans: Kanban[];
    onSelect: (kanban: Kanban) => void;
    onAddKanban: (data: { title: string; description: string }) => void;
    onDeleteKanban: (id: string) => void;
    user: User;
};

export default function Sidebar({
    kanbans,
    onSelect,
    onAddKanban,
    onDeleteKanban,
    user
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();

    const handleDelete = (kanban: Kanban) => {
        const confirmation = prompt(
            `Pour supprimer « ${kanban.name} », tapez son nom :`
        );
        if (confirmation === kanban.name) {
            onDeleteKanban(kanban.id);
        } else {
            alert("Nom incorrect. Suppression annulée.");
        }
    };

    function getInitials(name: string | null | undefined): string {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return (
        <aside>
            <h1
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/")}
            >
                {`Collab'Kan`}
            </h1>

            <section>
                <h2>{`Mes collab' :`}</h2>
                <ul>
                    {kanbans.map((k) => (
                        <li key={k.id}>
                            <button onClick={() => {
                                onSelect(k);
                                router.push("/");
                            }}>{k.name}</button>
                            <button onClick={() => handleDelete(k)}>🗑️</button>
                        </li>
                    ))}
                </ul>
                <button onClick={() => setIsModalOpen(true)}>Ajouter un tableau</button>
            </section>

            <section>
                <button
                    onClick={() => router.push("/profile")}
                    aria-label="Profile"
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        overflow: "hidden",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#ddd",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        cursor: "pointer",
                    }}
                >
                    {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Photo de profil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                        getInitials(user.name)
                    )}
                </button>
                <LogoutButton />
            </section>

            {isModalOpen && (
                <AddKanbanModal
                    onClose={() => setIsModalOpen(false)}
                    onAdd={(data) => {
                        onAddKanban(data);
                        setIsModalOpen(false);
                    }}
                />
            )}
        </aside>
    );
}
