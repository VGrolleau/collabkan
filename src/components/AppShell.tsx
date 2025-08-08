"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import KanbanBoard from "./KanbanBoard/KanbanBoard";
import { Kanban, Column } from "../types";
import { User } from "@prisma/client";
import { fetchKanbanById } from "@/utils/fetchKanbanById";

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname(); // 👈 récupère l’URL courante

    const [kanbans, setKanbans] = useState<Kanban[]>([]);
    const [selected, setSelected] = useState<Kanban | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userLoading, setUserLoading] = useState(true);

    // Charger les kanbans
    useEffect(() => {
        async function fetchKanbans() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch("/api/kanbans", { credentials: "include" });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Erreur lors du chargement");
                }

                const data: Kanban[] = await res.json();
                setKanbans(data);
                if (data.length > 0) setSelected(data[0]);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "Erreur inconnue");
            } finally {
                setLoading(false);
            }
        }

        fetchKanbans();
    }, []);

    // Charger l'utilisateur connecté
    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch("/api/users/me", { credentials: "include" });
                if (!res.ok) throw new Error("Utilisateur non authentifié");
                const data: User = await res.json();
                setUser(data);
            } catch (e) {
                console.error("Erreur utilisateur :", e);
                setUser(null);
            } finally {
                setUserLoading(false);
            }
        }

        fetchUser();
    }, []);

    const handleSelectKanban = async (kanban: Kanban) => {
        const fullKanban = await fetchKanbanById(kanban.id);

        if (fullKanban) {
            setSelected(fullKanban);
        } else {
            alert("Impossible de charger le kanban.");
        }
    };

    const handleAddKanban = async (data: { title: string; description: string }) => {
        try {
            const res = await fetch("/api/kanbans", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la création");
            }

            const createdKanban: Kanban = await res.json();
            setKanbans((prev) => [...prev, createdKanban]);
            setSelected(createdKanban);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
        }
    };

    const handleDeleteKanban = async (id: string) => {
        const confirm = window.confirm("Supprimer ce kanban ? Cette action est irréversible.");
        if (!confirm) return;

        try {
            const res = await fetch(`/api/kanbans/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Erreur lors de la suppression");
            }

            setKanbans(prev => prev.filter(k => k.id !== id));
            if (selected?.id === id) setSelected(null);
        } catch (e) {
            alert(e instanceof Error ? e.message : "Erreur inconnue");
        }
    };

    const updateKanbanInfo = async (updated: { name?: string; description?: string }) => {
        if (!selected) return;

        try {
            // Envoie la mise à jour au backend
            const res = await fetch(`/api/kanbans/${selected.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updated),
            });

            if (!res.ok) {
                const err = await res.json();
                alert("Erreur : " + (err.error || "Impossible de modifier le Kanban"));
                return;
            }

            // Recharge le kanban complet (avec ses colonnes)
            const updatedFullKanban = await fetchKanbanById(selected.id);
            if (!updatedFullKanban) {
                alert("Erreur : le kanban mis à jour n’a pas pu être rechargé.");
                return;
            }

            // Met à jour l'état global
            setKanbans(prev =>
                prev.map(k => (k.id === selected.id ? updatedFullKanban : k))
            );
            setSelected(updatedFullKanban);
        } catch (error) {
            alert("Erreur réseau");
        }
    };

    const updateKanbanColumns = (columns: Column[]) => {
        if (!selected) return;

        setKanbans(prev =>
            prev.map(k =>
                k.id === selected.id ? { ...k, columns } : k
            )
        );

        setSelected(prev =>
            prev ? { ...prev, columns } : prev
        );
    };

    // Affichage conditionnel pendant les chargements
    if (loading || userLoading) return <p>Chargement…</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!user) return <p>Non connecté</p>;

    const isProfilePage = pathname === "/profile"; // 👈 vérifie si on est sur /profile

    return (
        <>
            <Sidebar
                kanbans={kanbans}
                onSelect={handleSelectKanban}
                onAddKanban={handleAddKanban}
                onDeleteKanban={handleDeleteKanban}
                user={user}
            />
            <main>
                {isProfilePage ? (
                    children // 👈 affiche ton composant de profil ici
                ) : selected ? (
                    <KanbanBoard
                        key={selected?.id}
                        kanban={selected}
                        updateKanbanColumns={updateKanbanColumns}
                        updateKanbanInfo={updateKanbanInfo}
                    />
                ) : (
                    <p>{`Bienvenue ! Sélectionnez une collab' pour commencer.`}</p>
                )}
            </main>
        </>
    );
}
