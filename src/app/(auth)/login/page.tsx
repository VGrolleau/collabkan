'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

        // Connexion réussie → redirige vers la page d’accueil
        router.push('/');
    };

    return (
        <main className="flex items-center justify-center min-h-screen">
            <form onSubmit={handleSubmit} className="p-6 border rounded w-80 space-y-4">
                <h1 className="text-xl font-bold">Connexion</h1>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                />
                <button type="submit" className="w-full bg-black text-white p-2 rounded">
                    Se connecter
                </button>
            </form>
        </main>
    );
}
