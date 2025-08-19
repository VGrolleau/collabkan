// src/components/CardModal/AttachmentsSection.tsx
"use client";

import React, { useRef, useState } from "react";
import { Attachment } from "@/types";

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
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);

        const file = e.target.files[0];

        try {
            // 1️⃣ Upload vers le serveur
            const formData = new FormData();
            formData.append("file", file);
            formData.append("cardId", cardId);

            const res = await fetch("/api/attachments/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Erreur upload fichier");

            const newAttachment: Attachment = await res.json();

            // 2️⃣ Mettre à jour l'état local
            setAttachments([...attachments, newAttachment]);
        } catch (error) {
            console.error(error);
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
            setAttachments(attachments.filter((att) => att.id !== id));
        } catch (error) {
            console.error(error);
            alert("Impossible de supprimer le fichier");
        }
    };

    return (
        <div style={{ marginBottom: 16 }}>
            <h4>Pièces jointes</h4>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ marginBottom: 8 }}
            />

            <ul style={{ listStyle: "none", padding: 0 }}>
                {attachments.map((att) => (
                    <li
                        key={att.id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                            alignItems: "center",
                        }}
                    >
                        <a
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "underline", color: "#0070f3" }}
                        >
                            {att.filename}
                        </a>
                        <button onClick={() => handleRemove(att.id)}>Supprimer</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AttachmentsSection;
