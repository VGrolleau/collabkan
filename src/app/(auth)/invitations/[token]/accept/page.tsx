// app/(auth)/invitations/[token]/AcceptInvitationTest.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './AcceptInvitation.module.scss';

export default function AcceptInvitationTest() {
    const router = useRouter();
    const params = useParams(); // { token }
    const token = params?.token;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [password, setPassword] = useState('');
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            setError('Token manquant');
            setLoading(false);
            return;
        }
        // On ne fait rien côté serveur tant que l’utilisateur n’a pas saisi son mot de passe
        setLoading(false);
    }, [token]);

    const handleAccept = async () => {
        if (!password) {
            setError('Veuillez saisir un mot de passe');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`/api/invitations/${token}/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Impossible d’accepter l’invitation');
                setLoading(false);
                return;
            }

            setUserId(data.user.id);
            setMessage('Mot de passe créé ! Redirection vers le Kanban…');

            setTimeout(() => {
                router.push(`/`);
            }, 1500);
        } catch (err) {
            console.error(err);
            setError('Erreur inconnue lors de l’acceptation');
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userId) return;
        if (!confirm('Supprimer cet utilisateur pour tester à nouveau ?')) return;

        try {
            const res = await fetch(`/api/test/delete-user/${userId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erreur lors de la suppression');
            setMessage('Utilisateur supprimé. Vous pouvez retester l’invitation.');
            setUserId(null);
            setPassword('');
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Erreur inconnue lors de la suppression');
        }
    };

    if (!token) return <p className={styles.error}>Token manquant</p>;

    return (
        <div className={styles.container}>
            {error && <p className={styles.error}>{error}</p>}
            {message && <p className={styles.success}>{message}</p>}

            {!userId && (
                <>
                    <label>Créer votre mot de passe</label>
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className={styles.inputField}
                    />
                    <button className={styles.openButton} onClick={handleAccept} disabled={loading}>
                        {loading ? 'Validation…' : 'Valider'}
                    </button>
                </>
            )}

            {userId && !loading && (
                <button className={styles.openButton} onClick={handleDeleteUser}>
                    Supprimer l’utilisateur (test)
                </button>
            )}
        </div>
    );
}
