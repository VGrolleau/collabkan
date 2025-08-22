// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ThemeToggleButton from '@/components/ThemeToggleButton'; // si tu as un bouton de thème

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const data = await res.json();
            setError(data.message || 'Erreur de connexion');
            return;
        }

        router.push('/');
    };

    return (
        <section className="auth">
            <div className="auth-card">
                <div className="auth-title">{`Se connecter à Collab'Kan`}</div>
                <div className="auth-sub">Entrez vos identifiants pour accéder à vos tableaux.</div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="field">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="vous@exemple.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

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
                        <button type="submit" className="btn primary">Se connecter</button>
                        <ThemeToggleButton className="btn" title="Basculer thème" />
                    </div>
                </form>
            </div>
        </section>
    );
}
