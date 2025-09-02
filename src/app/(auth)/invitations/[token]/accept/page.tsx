// app/(auth)/invitations/[token]/AcceptInvitationTest.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// import styles from './AcceptInvitation.module.scss';

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
            setMessage('Mot de passe créé ! Redirection vers la page de connexion…');

            setTimeout(() => {
                router.push(`/`);
            }, 1500);
        } catch (err) {
            console.error(err);
            setError('Erreur inconnue lors de l’acceptation');
            setLoading(false);
        }
    };

    if (!token) return <p style={{ color: "red", fontWeight: "bold" }}>Token manquant</p>;

    return (
        <section className="auth">
            <div className="auth-card">
                <div className="auth-title">Créer votre mot de passe</div>
                <div className="auth-sub">
                    Entrez un mot de passe pour activer votre compte et rejoindre le tableau.
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
                {message && <p className="text-green-600 text-sm">{message}</p>}

                {!userId && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAccept();
                        }}
                        className="space-y-4"
                    >
                        <div className="field">
                            <label className="label">Mot de passe</label>
                            <input
                                type="password"
                                className="input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="btns-connection">
                            <button type="submit" className="btn primary" disabled={loading}>
                                {loading ? 'Validation…' : 'Valider'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
