import { Comment } from "@/types";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
    comments: Comment[];
    onAddComment: (comment: Comment) => void;
    onDelete: (commentId: number) => void;
};

export const CommentsSection = ({ comments, onAddComment, onDelete }: Props) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: "",
        immediatelyRender: false,
    });

    const handleAdd = () => {
        if (!editor || editor.isEmpty) return;
        const html = editor.getHTML();
        const newComment: Comment = {
            id: Date.now(),
            author: "Moi", // TODO: remplacer avec utilisateur connecté
            date: new Date().toISOString(),
            content: html,
        };
        onAddComment(newComment);
        editor.commands.clearContent();
    };

    return (
        <div className="comments-section">
            <h3>Commentaires</h3>
            <EditorContent editor={editor} className="editor" />
            <button onClick={handleAdd} className="btn">💬 Ajouter</button>

            <div className="comments-list">
                {comments.map(c => (
                    <div key={c.id} className="comment-item">
                        <div className="comment-meta">
                            <strong>{c.author}</strong> – {new Date(c.date).toLocaleString()}
                            <button onClick={() => onDelete(c.id)} style={{ marginLeft: '1rem', color: 'red' }}>
                                🗑 Supprimer
                            </button>
                        </div>
                        <div dangerouslySetInnerHTML={{ __html: c.content }} />
                    </div>
                ))}

            </div>
        </div>
    );
};
