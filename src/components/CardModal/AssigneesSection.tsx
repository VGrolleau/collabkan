// src/components/CardModal/AssigneesSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types";

type AssigneesSectionProps = {
    assignees: User[];
    allUsers: User[];
    onChange: (newAssignees: User[]) => void;
    cardId?: string; // optionnel si besoin
};

const AssigneesSection: React.FC<AssigneesSectionProps> = ({
    assignees,
    onChange,
}) => {
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("/api/users");
                if (!res.ok) throw new Error("Impossible de récupérer les utilisateurs");
                const data: User[] = await res.json();
                setAllUsers(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const toggleAssignee = (user: User) => {
        const exists = assignees.some((u) => u.id === user.id);
        if (exists) {
            onChange(assignees.filter((u) => u.id !== user.id));
        } else {
            onChange([...assignees, user]);
        }
    };

    if (loading) return <p>Chargement des utilisateurs…</p>;

    return (
        <div style={{ marginBottom: 16 }}>
            <h4>Assignés</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {allUsers.map((user) => {
                    const selected = assignees.some((a) => a.id === user.id);
                    return (
                        <label
                            key={user.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                cursor: "pointer",
                            }}
                        >
                            <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => toggleAssignee(user)}
                            />
                            {user.name} ({user.email})
                        </label>
                    );
                })}
            </div>
        </div>
    );
};

export default AssigneesSection;
