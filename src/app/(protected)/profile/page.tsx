"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { useUser } from "@/context/UserContext";

export default function ProfilePage() {
    const { user, setUser } = useUser();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const getInitials = (name?: string | null) => {
        if (!name) return "??";
        const parts = name.trim().split(" ");
        return parts.length === 1
            ? parts[0][0].toUpperCase()
            : (parts[0][0] + parts[1][0]).toUpperCase();
    };

    const passwordStrength = () => {
        if (password.length > 8 && /[A-Z]/.test(password) && /\d/.test(password)) return "strong";
        if (password.length > 5) return "medium";
        return "weak";
    };

    const strengthColors: Record<string, string> = {
        weak: "#e74c3c",
        medium: "#f39c12",
        strong: "#2ecc71",
    };

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        setMessage(null);

        try {
            const body: { name: string; email: string; password?: string } = { name, email };
            if (password) body.password = password;

            const res = await fetch("/api/users/me", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const err = await res.json();
                setMessage(err.error || "Erreur lors de la sauvegarde");
            } else {
                const updatedUser: User = await res.json();
                setUser(updatedUser); // ⚡ met à jour le contexte → Sidebar se rafraîchit
                setPassword("");
                setMessage("Profil mis à jour ✅");
            }
        } catch {
            setMessage("Erreur réseau ❌");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <p>Chargement...</p>;

    return (
        <div className="profile">
            <div className="profile-card">
                <div className="profile-row">
                    <div>
                        <div className="avatar lg">
                            {user.avatarUrl ? <img src={user.avatarUrl} alt={user.name || "User"} /> : getInitials(user.name)}
                        </div>
                    </div>
                    <div>
                        <div className="field">
                            <label className="label">Nom</label>
                            <input className="input" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="label">Email</label>
                            <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div className="field">
                            <label className="label">Mot de passe</label>
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                                <input type={showPwd ? "text" : "password"} className="input" value={password} onChange={e => setPassword(e.target.value)} />
                                <button type="button" className="btn sm" onClick={() => setShowPwd(p => !p)}>👁️</button>
                            </div>
                            <div className="password-strength">
                                <div style={{
                                    height: "100%",
                                    width: passwordStrength() === "strong" ? "100%" : passwordStrength() === "medium" ? "60%" : "30%",
                                    background: strengthColors[passwordStrength()],
                                    transition: "width 0.3s ease"
                                }} />
                            </div>
                        </div>

                        {message && <p style={{ marginTop: "8px" }}>{message}</p>}

                        <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                            <button className="btn primary" onClick={handleSave} disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
                            <button className="btn" onClick={() => router.push("/")}>← Retour au Kanban</button>
                            <button className="btn danger" onClick={async () => { await fetch("/api/auth/logout"); router.push("/login"); }}>Se déconnecter</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
