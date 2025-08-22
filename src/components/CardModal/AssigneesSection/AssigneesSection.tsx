// src/components/CardModal/AssigneesSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types";
import styles from "./AssigneesSection.module.scss";

type AssigneesSectionProps = {
    assignees: User[];
    onChange: (newAssignees: User[]) => void;
};

const AssigneesSection: React.FC<AssigneesSectionProps> = ({ assignees, onChange }) => {
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
        <div className={styles.section}>
            <h4>Membres</h4>
            <div className={styles.members}>
                {allUsers.map((user) => {
                    const selected = assignees.some((a) => a.id === user.id);
                    return (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => toggleAssignee(user)}
                            className={`${styles.avatar} ${selected ? styles.selected : ""}`}
                            title={user.name}
                        >
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} />
                            ) : (
                                <span>{user.name[0]}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AssigneesSection;
