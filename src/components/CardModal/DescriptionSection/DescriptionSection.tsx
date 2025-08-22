"use client";

import { useEffect, useRef, useState } from "react";
import type QuillType from "quill";
import "quill/dist/quill.snow.css";
import styles from "./DescriptionSection.module.scss";

type DescriptionSectionProps = {
    value: string;
    onChange: (val: string) => void;
};

export default function DescriptionSection({ value, onChange }: DescriptionSectionProps) {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const toolbarRef = useRef<HTMLDivElement | null>(null);
    const quillRef = useRef<QuillType | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !editorRef.current || quillRef.current) return;

        import("quill").then((Quill) => {
            quillRef.current = new Quill.default(editorRef.current!, {
                theme: "snow",
                modules: {
                    toolbar: toolbarRef.current!,
                },
                placeholder: "Écrire la description ici...",
            });

            quillRef.current.root.innerHTML = value || "";

            quillRef.current.on("text-change", () => {
                const html = quillRef.current!.root.innerHTML;
                if (html !== value) {
                    onChange(html);
                }
            });
        });
    }, [isClient, value, onChange]);

    // Sync si value externe change
    useEffect(() => {
        if (quillRef.current && quillRef.current.root.innerHTML !== value) {
            quillRef.current.root.innerHTML = value;
        }
    }, [value]);

    return (
        <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Description</h4>

            <div ref={toolbarRef} className={styles.toolbar}>
                {/* Styles de texte */}
                <span className="ql-formats">
                    <button className="ql-bold"></button>
                    <button className="ql-italic"></button>
                    <button className="ql-underline"></button>
                    <button className="ql-strike"></button>
                </span>

                {/* Titres / paragraphes */}
                <span className="ql-formats">
                    <button className="ql-header" value="1">H1</button>
                    <button className="ql-header" value="2">H2</button>
                    <button className="ql-header" value="3">H3</button>
                    <button className="ql-header" value="">P</button> {/* Normal / paragraphe */}
                </span>

                {/* Listes */}
                <span className="ql-formats">
                    <button className="ql-list" value="ordered"></button>
                    <button className="ql-list" value="bullet"></button>
                </span>

                {/* Alignement */}
                <span className="ql-formats">
                    <button className="ql-align" value=""></button>      {/* align left */}
                    <button className="ql-align" value="center"></button>
                    <button className="ql-align" value="right"></button>
                    <button className="ql-align" value="justify"></button>
                </span>

                {/* Liens / images */}
                <span className="ql-formats">
                    <button className="ql-link"></button>
                    <button className="ql-image"></button>
                </span>

                {/* Nettoyage */}
                <span className="ql-formats">
                    <button className="ql-clean"></button>
                </span>
            </div>

            {/* Éditeur */}
            <div ref={editorRef} className={styles.textarea} />
        </div>
    );
}
