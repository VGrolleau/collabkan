"use client";

import { FC, useEffect, useState } from "react";
import { CardComment } from "@/types";
import { useUser } from "@/context/UserContext";
import styles from "./CardModal.module.scss";

type CommentsSectionProps = {
    cardId: string;
    comments: CardComment[];
    setComments: (comments: CardComment[]) => void;
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
                const dataFromApi: Array<{ id: string; content: string; createdAt: string; author?: { name: string } | string }> = await res.json();
                const mapped: CardComment[] = dataFromApi.map(c => ({
                    id: c.id,
                    content: c.content,
                    author: typeof c.author === "string" ? c.author : c.author?.name ?? "Utilisateur",
                    date: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
                }));
                if (alive) setComments(mapped);
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
            if (!res.ok) throw new Error("Erreur lors de l’ajout du commentaire");
            const savedCommentFromApi = await res.json();
            const savedComment: CardComment = {
                id: savedCommentFromApi.id,
                content: savedCommentFromApi.content,
                date: new Date(savedCommentFromApi.createdAt).toISOString(),
                author: savedCommentFromApi.author.name ?? "Moi",
            };
            setComments([...comments, savedComment]);
            setNewComment("");
        } catch (e) {
            console.error("addComment error:", e);
        } finally {
            setSending(false);
        }
    };

    const deleteComment = async (id: string) => {
        const prev = [...comments];
        setComments(comments.filter(c => c.id !== id));
        try {
            await fetch(`/api/comments/${id}`, { method: "DELETE" });
        } catch (e) {
            console.error("deleteComment error:", e);
            setComments(prev); // rollback
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
                        <li key={comment.id}>
                            <div style={{ flexGrow: 1 }}>
                                <p style={{ margin: 0 }}>
                                    <strong>{typeof comment.author === "string" ? comment.author : comment.author.name}</strong>: {comment.content}
                                </p>
                                <small>{comment.date ? new Date(comment.date).toLocaleString() : "Date inconnue"}</small>
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
