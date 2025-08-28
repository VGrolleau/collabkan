'use client';

import { useState, useEffect } from 'react';
import styles from './InviteModal.module.scss';
import { User, Kanban } from '@/types';

interface Props {
    kanban: Kanban;
}

type InvitePayload = {
    kanbanId: string;
    email?: string;
    userId?: string;
};

export default function InviteModal({ kanban }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [existingUsers, setExistingUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [invitationLink, setInvitationLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleModal = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            // reset champs quand on ferme
            setEmail('');
            setSelectedUserId('');
            setInvitationLink('');
            setError('');
            setLoading(false);
        }
    };

    const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

    useEffect(() => {
        if (!isOpen) return;

        fetch('/api/users')
            .then(res => res.json())
            .then((data: User[]) => setExistingUsers(data))
            .catch(console.error);
    }, [isOpen]);

    const handleInvite = async () => {
        if (!kanban) {
            setError("Kanban non défini");
            return;
        }

        if (!email && !selectedUserId) {
            setError('Veuillez saisir un email ou sélectionner un utilisateur existant.');
            return;
        }

        if (email && !isValidEmail(email)) {
            setError('Email invalide');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const body: InvitePayload = {
                kanbanId: kanban.id,
                ...(email ? { email } : {}),
                ...(selectedUserId ? { userId: selectedUserId } : {}),
            };

            const res = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Erreur');

            if (email && data.token) {
                const baseUrl = window.location.origin;
                setInvitationLink(`${baseUrl}/invitations/${data.token}/accept`);
            } else {
                alert(`Utilisateur ajouté au Kanban !`);
                toggleModal();
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Une erreur inconnue est survenue');
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les utilisateurs déjà membres du Kanban
    const availableUsers = existingUsers.filter(
        u => !kanban.members?.some(m => m.id === u.id)
    );

    return (
        <>
            <button className={styles.openButton} onClick={toggleModal}>
                Inviter un membre
            </button>

            {isOpen && (
                <div className={styles.modalOverlay} onClick={toggleModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Inviter un membre</h2>

                        <div>
                            <select
                                value={selectedUserId}
                                onChange={e => setSelectedUserId(e.target.value)}
                            >
                                <option value="">Sélectionner un utilisateur existant</option>
                                {availableUsers.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <p>Ou saisir un nouvel email :</p>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div style={{ marginTop: '1rem' }}>
                            <button onClick={handleInvite} disabled={loading}>
                                {loading ? 'Invitation…' : 'Inviter'}
                            </button>
                            <button className={styles.closeButton} onClick={toggleModal}>
                                Fermer
                            </button>
                        </div>

                        {invitationLink && (
                            <div className={styles.linkBox}>
                                <p>Lien généré :</p>
                                <code>{invitationLink}</code>
                            </div>
                        )}

                        {error && <p className={styles.error}>{error}</p>}
                    </div>
                </div>
            )}
        </>
    );
}
