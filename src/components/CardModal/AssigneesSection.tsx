"use client"

// import { useState } from "react";
import { Assignee } from "@/types";

type Props = {
    assignees: Assignee[];
    setAssignees: (assignees: Assignee[]) => void;
    allUsers: Assignee[];
    onDelete: () => void;
};

export function AssigneesSection({ assignees, setAssignees, allUsers, onDelete }: Props) {
    const handleToggle = (user: Assignee) => {
        const exists = assignees.some(a => a.id === user.id);
        if (exists) {
            setAssignees(assignees.filter(a => a.id !== user.id));
        } else {
            setAssignees([...assignees, user]);
        }
    };

    return (
        <div className="card-section">
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Assignés</h3>
                <button onClick={onDelete}>🗑️</button>
            </div>

            <ul style={{ maxHeight: 200, overflowY: "auto" }}>
                {allUsers.map(user => (
                    <li key={user.id} style={{ cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center" }}
                        onClick={() => handleToggle(user)}>
                        <input
                            type="checkbox"
                            checked={assignees.some(a => a.id === user.id)}
                            readOnly
                            style={{ marginRight: 8 }}
                        />
                        {user.avatarUrl && <img src={user.avatarUrl} alt={user.name} style={{ width: 24, height: 24, borderRadius: "50%", marginRight: 8 }} />}
                        {user.name}
                    </li>
                ))}
            </ul>
        </div>
    );
}
