"use client";

import { FC, useEffect, useState } from "react";
import { Comment, User } from "@/types";
import styles from "./CardModal.module.scss";

type CommentsSectionProps = {
    cardId: string;
    comments: Comment[];
    setComments: (comments: Comment[]) => void;
};

export const CommentsSection: FC<CommentsSectionProps> = ({
    cardId,
    comments,
    setComments,
}) => {
    const [newComment, setNewComment] = useState("");
    const [me, setMe] = useState<User | null>(null);
    const [sending, setSending] = useState(false);

    // Récupération du user connecté
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const res = await fetch("/api/users/me");
                if (!res.ok) return;
                const data: User = await res.json();
                if (alive) setMe(data);
            } catch {
                // ignore
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    const addComment = async () => {
        const trimmed = newComment.trim();
        if (!trimmed || !me?.id) return;

        setSending(true);
        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: trimmed,
                    authorId: me.id,
                    cardId,
                }),
            });

            const serverComment: { id: string; content: string; createdAt?: string } | null =
                res.ok ? await res.json() : null;

            const uiComment: Comment = {
                id: serverComment?.id ?? crypto.randomUUID(),
                content: trimmed,
                date: serverComment?.createdAt ?? new Date().toISOString(),
                author: me.name ?? "Moi",
            };

            setComments([...comments, uiComment]);
            setNewComment("");
        } catch (e) {
            console.error("addComment error:", e);
        } finally {
            setSending(false);
        }
    };

    const deleteComment = async (id: string) => {
        const prev = comments;
        setComments(comments.filter((c) => c.id !== id));
        try {
            await fetch(`/api/comments/${id}`, { method: "DELETE" });
        } catch (e) {
            console.error("deleteComment error:", e);
            setComments(prev);
        }
    };

    return (
        <div className={styles.commentsSection}>
            <h4>Commentaires</h4>

            <ul>
                {comments.map((comment) => (
                    <li key={comment.id}>
                        <div style={{ flexGrow: 1 }}>
                            <p style={{ margin: 0 }}>
                                <strong>{comment.author} :</strong> {comment.content}
                            </p>
                            <small>{new Date(comment.date).toLocaleString()}</small>
                        </div>
                        <button
                            onClick={() => deleteComment(comment.id)}
                            title="Supprimer le commentaire"
                            style={{ marginLeft: 8 }}
                        >
                            🗑️
                        </button>
                    </li>
                ))}
            </ul>

            <div className={styles.newComment}>
                <input
                    type="text"
                    placeholder={me ? "Ajouter un commentaire..." : "Connexion requise"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") addComment();
                    }}
                    disabled={!me || sending}
                />
                <button onClick={addComment} disabled={!me || sending}>
                    ➕
                </button>
            </div>
        </div>
    );
};
