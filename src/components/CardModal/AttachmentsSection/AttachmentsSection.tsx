// src/components/CardModal/AttachmentsSection/AttachmentsSection.tsx
"use client";

import React, { useRef, useState } from "react";
import { Attachment } from "@/types";
import styles from "./AttachmentsSection.module.scss";

type AttachmentsSectionProps = {
    attachments: Attachment[];
    setAttachments: (newAttachments: Attachment[]) => void;
    cardId: string;
};

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
    attachments,
    setAttachments,
    cardId,
}) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setUploading(true);

        const file = e.target.files[0];

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("cardId", cardId);

            const res = await fetch("/api/attachments/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Erreur upload fichier");

            const newAttachment: Attachment = await res.json();
            setAttachments([...attachments, newAttachment]);
        } catch (err) {
            console.error(err);
            alert("Erreur lors de l’upload du fichier");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleRemove = async (id: string) => {
        try {
            const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Erreur suppression fichier");
            setAttachments(attachments.filter(att => att.id !== id));
        } catch (err) {
            console.error(err);
            alert("Impossible de supprimer le fichier");
        }
    };

    return (
        <div className={styles.section}>
            <h4>Pièces jointes</h4>

            <button
                className={styles.btn}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? "Téléversement..." : "Téléverser…"}
            </button>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Liste des fichiers */}
            <ul className={styles.attachmentsList}>
                {attachments.map(att => (
                    <li key={att.id} className={styles.attachmentItem}>
                        <a href={att.url} target="_blank" rel="noopener noreferrer">
                            {att.filename}
                        </a>
                        <button onClick={() => handleRemove(att.id)}>🗑️</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttachmentsSection;
