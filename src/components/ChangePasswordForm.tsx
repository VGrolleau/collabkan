// src/components/ChangePasswordForm.tsx
"use client";

import { useState } from "react";

export default function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setMessage("❌ Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const res = await fetch("/api/users/change-password", {
                method: "POST",
                body: JSON.stringify({ currentPassword, newPassword }),
                headers: { "Content-Type": "application/json" },
            });

            if (res.ok) {
                setMessage("✅ Mot de passe mis à jour avec succès !");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const errorText = await res.text();
                setMessage(`❌ Erreur : ${errorText}`);
            }
        } catch (err) {
            setMessage("❌ Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded shadow-sm space-y-4">
            <h2 className="text-xl font-semibold">Changer le mot de passe</h2>

            <div className="flex flex-col">
                <label htmlFor="current" className="mb-1 font-medium">Mot de passe actuel</label>
                <input
                    id="current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="border px-3 py-2 rounded"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="new" className="mb-1 font-medium">Nouveau mot de passe</label>
                <input
                    id="new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border px-3 py-2 rounded"
                    required
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="confirm" className="mb-1 font-medium">Confirmer le nouveau mot de passe</label>
                <input
                    id="confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border px-3 py-2 rounded"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Modification en cours..." : "Mettre à jour"}
            </button>

            {message && <p className="text-sm mt-2">{message}</p>}
        </form>
    );
}
