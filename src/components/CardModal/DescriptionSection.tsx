"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";

type Props = {
    description: string;
    setDescription: (val: string) => void;
    onDelete: () => void;
};

export function DescriptionSection({ description, setDescription, onDelete }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
        ],
        content: description,
        onUpdate: ({ editor }) => {
            setDescription(editor.getHTML());
        },
        immediatelyRender: false,
    });

    // Mise à jour si description externe change (ex: reset)
    useEffect(() => {
        if (editor && editor.getHTML() !== description) {
            editor.commands.setContent(description, { emitUpdate: false });
        }
    }, [description, editor]);


    if (!editor) {
        return null;
    }

    return (
        <div className="description-section">
            <div className="toolbar" style={{ marginBottom: "0.5rem" }}>
                <button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}>
                    <b>B</b>
                </button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}>
                    <i>I</i>
                </button>
                <button onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={!editor.can().chain().focus().toggleBulletList().run()}>
                    • Liste
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
                    ←
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
                    •
                </button>
                <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>
                    →
                </button>
                <button onClick={onDelete} style={{ float: "right", color: "red" }}>
                    🗑️ Supprimer
                </button>
            </div>

            <div
                style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    minHeight: "100px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    padding: "0.5rem",
                }}
            >
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
