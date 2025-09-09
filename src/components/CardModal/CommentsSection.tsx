"use client";

import React, { FC, useEffect, useState } from "react";
import { CardComment } from "@/types";
import { useUser } from "@/context/UserContext";
import styles from "./CardModal.module.scss";

type CommentsSectionProps = {
    cardId: string;
    comments: CardComment[]; // affichage (peut venir du parent)
    setComments: React.Dispatch<React.SetStateAction<CardComment[]>>; // setter stable venant du parent (CardModal)
};

export const CommentsSection: FC<CommentsSectionProps> = ({
    cardId,
    comments,
    setComments,
}) => {
    const { user: me } = useUser();
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        (async () => {
            try {
                const res = await fetch(`/api/cards/${cardId}/comments`);
                if (!res.ok) throw new Error("Impossible de charger les commentaires");
                const dataFromApi: Array<{ id: string; content: string; createdAt?: string | null; author?: { name?: string } | string | null }> = await res.json();
                console.log("dataFromApi:", dataFromApi);

                const mapped: CardComment[] = dataFromApi.map(c => ({
                    id: c.id,
                    content: c.content,
                    author: typeof c.author === "string" ? c.author : c.author?.name ?? "Utilisateur",
                    createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : undefined,
                }));

                if (alive) {
                    // Remplace la liste *uniquement* (on ne touche pas aux dates individuelles ni aux autres champs)
                    setComments(mapped);
                }
            } catch (e) {
                console.error("fetch comments error:", e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [cardId, setComments]);

    const addComment = async () => {
        if (!newComment.trim() || !me?.id) return;
        setSending(true);
        try {
            const res = await fetch(`/api/cards/${cardId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newComment.trim(), authorId: me.id }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                throw new Error(err?.error || "Erreur lors de l’ajout du commentaire");
            }

            const savedCommentFromApi = await res.json();

            // Pour le nouveau commentaire : si l'API renvoie createdAt -> on l'utilise,
            // sinon on met la date courante (uniquement pour CE commentaire).
            const savedComment: CardComment = {
                id: savedCommentFromApi.id,
                content: savedCommentFromApi.content,
                createdAt: savedCommentFromApi.createdAt ? new Date(savedCommentFromApi.createdAt).toISOString() : new Date().toISOString(),
                author:
                    typeof savedCommentFromApi.author === "string"
                        ? savedCommentFromApi.author
                        : savedCommentFromApi.author?.name ?? (me?.name ?? "Moi"),
            };

            // Ajout *sans toucher* aux autres commentaires
            setComments(prev => [...prev, savedComment]);
            setNewComment("");
        } catch (e) {
            console.error("addComment error:", e);
            alert(e instanceof Error ? e.message : "Erreur lors de l'ajout du commentaire");
        } finally {
            setSending(false);
        }
    };

    const deleteComment = async (id: string) => {
        // optimiste, mais on fait rollback si erreur
        setComments(prev => prev.filter(c => c.id !== id));
        try {
            const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Impossible de supprimer le commentaire");
        } catch (e) {
            console.error("deleteComment error:", e);
            // re-fetch ou rollback côté parent : ici simple re-fetch possible,
            // mais comme on ne connaît pas l'API exacte, on remet un message d'erreur pour l'instant.
            alert("Impossible de supprimer le commentaire, réessayez.");
            // Option : re-fetch en appelant setComments([]) puis forcer un reload via parent
        }
    };

    return (
        <div className={styles.commentsSection}>
            <h4>Commentaires</h4>
            {loading ? (
                <p>Chargement...</p>
            ) : (
                <ul>
                    {comments.map(comment => (
                        <li key={comment.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flexGrow: 1 }}>
                                <p style={{ margin: 0 }}>
                                    <strong>{typeof comment.author === "string" ? comment.author : comment.author?.name ?? "Utilisateur inconnu"}</strong>: {comment.content}
                                </p>
                                <small>{comment.createdAt ? new Date(comment.createdAt).toLocaleString("fr-FR") : "Date inconnue"}</small>
                            </div>
                            <button onClick={() => deleteComment(comment.id)} title="Supprimer le commentaire" style={{ marginLeft: 8 }}>
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <div className={styles.newComment}>
                <input
                    type="text"
                    placeholder={me ? "Ajouter un commentaire..." : "Connexion requise"}
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") addComment(); }}
                    disabled={!me || sending}
                />
                <button onClick={addComment} disabled={!me || sending}>➕</button>
            </div>
        </div>
    );
};
