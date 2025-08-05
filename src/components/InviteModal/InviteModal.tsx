'use client';

import { useState } from 'react';
import styles from './InviteModal.module.scss';

interface Props {
    kanbanId: string | number;
}

function isValidEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
}

export default function InviteModal({ kanbanId }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [invitationLink, setInvitationLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const toggleModal = () => {
        setIsOpen(!isOpen);
        if (isOpen) {
            // Reset des champs quand on ferme la modale
            setEmail('');
            setInvitationLink('');
            setError('');
            setLoading(false);
        }
    };

    const handleInvite = async () => {
        if (!isValidEmail(email)) {
            setError('Veuillez entrer un email valide');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, kanbanId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Erreur lors de la création du lien');
            }

            const { token } = await res.json();
            const baseUrl = window.location.origin;
            setInvitationLink(`${baseUrl}/api/invitations/${token}/accept`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Une erreur inconnue est survenue');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button className={styles.openButton} onClick={toggleModal}>
                Inviter un membre
            </button>

            {isOpen && (
                <div className={styles.modalOverlay} onClick={toggleModal}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2>Inviter un membre</h2>
                        <input
                            type="email"
                            placeholder="Email du collaborateur"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={styles.inputField}
                        />
                        <button onClick={handleInvite} disabled={loading || !isValidEmail(email)}>
                            {loading ? 'Génération...' : 'Générer le lien'}
                        </button>
                        {invitationLink && (
                            <div className={styles.linkBox}>
                                <p>Lien généré :</p>
                                <code>{invitationLink}</code>
                            </div>
                        )}
                        {error && <p className={styles.error}>{error}</p>}
                        <button className={styles.closeButton} onClick={toggleModal}>
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
