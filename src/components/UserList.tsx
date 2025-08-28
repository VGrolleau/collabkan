// src/components/UserList.tsx
'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';

interface User {
    id: string;
    email: string;
    role: string;
}

interface Props {
    isAdmin: boolean;
}

export default function UserList({ isAdmin }: Props) {
    const { user: currentUser } = useUser(); // utilisateur connecté
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAdmin) return;

        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                if (res.ok) {
                    const data: User[] = await res.json();
                    setUsers(data);
                } else {
                    console.error('Erreur lors de la récupération des utilisateurs');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAdmin]);

    const handleDelete = async (id: string) => {
        if (id === currentUser?.id) {
            alert('Vous ne pouvez pas vous supprimer vous-même !');
            return;
        }
        if (!confirm('Supprimer cet utilisateur ?')) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (err) {
            console.error(err);
            alert('Erreur réseau');
        }
    };

    if (!isAdmin) return null;
    if (loading) return <p>Chargement des utilisateurs…</p>;

    return (
        <div className="user-list-card">
            <h3>Membres</h3>
            <ul>
                {users.map(u => (
                    <li key={u.id}>
                        <span className={u.role.toLowerCase()}>
                            {u.email} ({u.role}) {u.id === currentUser?.id && <em>(vous)</em>}
                        </span>
                        {u.id !== currentUser?.id && (
                            <button onClick={() => handleDelete(u.id)}>Supprimer</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
