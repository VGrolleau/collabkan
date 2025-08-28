"use client"

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@prisma/client";
import { useUser } from "@/context/UserContext";
import UserList from "@/components/UserList";

export default function ProfilePage() {
    const { user, setUser } = useUser();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profileMessage, setProfileMessage] = useState<string | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

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

    const handleChangePassword = async () => {
        if (!currentPassword || !password) {
            setPasswordMessage("Veuillez remplir les deux champs de mot de passe");
            return;
        }

        setSaving(true);
        setPasswordMessage(null);

        try {
            const res = await fetch("/api/users/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword: password }),
            });

            if (!res.ok) {
                const text = await res.text();
                setPasswordMessage(text || "Erreur lors du changement de mot de passe");
            } else {
                setPasswordMessage("Mot de passe mis à jour ✅");
                setCurrentPassword("");
                setPassword("");
            }
        } catch (err) {
            setPasswordMessage("Erreur réseau ❌");
        } finally {
            setSaving(false);
        }
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
        setProfileMessage(null);

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
                setProfileMessage(err.error || "Erreur lors de la sauvegarde");
            } else {
                const updatedUser: User = await res.json();
                setUser(updatedUser); // ⚡ met à jour le contexte → Sidebar se rafraîchit
                setPassword("");
                setProfileMessage("Profil mis à jour ✅");
            }
        } catch {
            setProfileMessage("Erreur réseau ❌");
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <p>Chargement...</p>;

    return (
        <div className="profile">
            {/* Section Actions générales */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "30px" }}>
                <button className="btn" onClick={() => router.push("/")}>
                    ← Retour au Kanban
                </button>
                <button
                    className="btn danger"
                    onClick={async () => {
                        await fetch("/api/auth/logout");
                        router.push("/login");
                    }}
                >
                    Se déconnecter
                </button>
            </div>

            <div className="profile-row" style={{ gridTemplateColumns: "1fr 1fr 1fr", alignItems: "start" }}>
                {/* Section Profil */}
                <div className="profile-card">
                    <div className="profile-row">
                        <div style={{ justifySelf: "center" }}>
                            <div className="avatar lg">
                                {user.avatarUrl ? (
                                    <img src={user.avatarUrl} alt={user.name || "User"} />
                                ) : (
                                    getInitials(user.name)
                                )}
                            </div>
                        </div>
                        <div>
                            <h2>Informations du profil</h2>

                            <div className="field">
                                <label className="label">Nom</label>
                                <input
                                    className="input"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div className="field">
                                <label className="label">Email</label>
                                <input
                                    className="input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            {profileMessage && (
                                <p style={{ marginTop: "8px" }}>{profileMessage}</p>
                            )}

                            <button
                                className="btn primary"
                                onClick={handleSave}
                                disabled={saving}
                                style={{ marginTop: "8px" }}
                            >
                                {saving ? "Enregistrement..." : "💾 Enregistrer"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Section Sécurité */}
                <div className="profile-card">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2>
                            Sécurité
                        </h2>
                        <button
                            type="button"
                            className="btn"
                            onClick={() => setShowPwd(p => !p)}
                        >
                            {showPwd ? "🙈 Masquer" : "👁️ Voir"}
                        </button>
                    </div>

                    <div className="field">
                        <label className="label">Mot de passe actuel</label>
                        <input
                            type={showPwd ? "text" : "password"}
                            className="input"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label className="label">Nouveau mot de passe</label>
                        <input
                            type={showPwd ? "text" : "password"}
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        {/* jauge de force */}
                        <div
                            className="password-strength"
                            style={{
                                height: "6px",
                                background: "#eee",
                                borderRadius: "3px",
                                marginTop: "4px"
                            }}
                        >
                            <div
                                style={{
                                    height: "100%",
                                    width:
                                        passwordStrength() === "strong"
                                            ? "100%"
                                            : passwordStrength() === "medium"
                                                ? "60%"
                                                : "30%",
                                    background: strengthColors[passwordStrength()],
                                    transition: "width 0.3s ease",
                                    borderRadius: "3px"
                                }}
                            />
                        </div>
                    </div>

                    {passwordMessage && (
                        <p style={{ marginTop: "8px" }}>{passwordMessage}</p>
                    )}

                    <button
                        className="btn secondary"
                        onClick={handleChangePassword}
                        disabled={saving}
                        style={{ marginTop: "8px" }}
                    >
                        {saving ? "Enregistrement..." : "🔑 Changer le mot de passe"}
                    </button>
                </div>

                {/* Section Admin */}
                {user.role === "ADMIN" && (
                    <div className="profile-card">
                        <h2>Administration</h2>
                        <UserList isAdmin={true} />
                    </div>
                )}
            </div>
        </div>
    );
}
