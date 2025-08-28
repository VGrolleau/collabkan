"use client";

import React, { useEffect, useState } from "react";
import { User } from "@/types";
import styles from "./AssigneesSection.module.scss";

type AssigneesSectionProps = {
    kanbanId: string;
    assignees: User[];
    onChange: (newAssignees: User[]) => void;
};

const AssigneesSection: React.FC<AssigneesSectionProps> = ({ kanbanId, assignees, onChange }) => {
    const [members, setMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const res = await fetch(`/api/kanbans/${kanbanId}/members`);
                if (!res.ok) throw new Error("Impossible de récupérer les utilisateurs du kanban");
                const data: User[] = await res.json();
                setMembers(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [kanbanId]);

    const toggleAssignee = (user: User) => {
        const exists = assignees.some(u => u.id === user.id);
        if (exists) {
            onChange(assignees.filter(u => u.id !== user.id));
        } else {
            onChange([...assignees, user]);
        }
    };

    const getInitials = (name?: string | null) => {
        if (!name) return "??";
        const parts = name.trim().split(/\s+/);
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    if (loading) return <p>Chargement des membres…</p>;

    return (
        <div className={styles.section}>
            <h4>Membres</h4>
            <div className={styles.members}>
                {members.map(user => {
                    const selected = assignees.some(a => a.id === user.id);
                    return (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => toggleAssignee(user)}
                            className={`${styles.avatar} ${selected ? styles.selected : ""}`}
                            title={user.name}
                        >
                            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name} /> : <span>{getInitials(user.name)}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AssigneesSection;
