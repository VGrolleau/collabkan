"use client"

import { useState } from "react";
import { Attachment } from "@/types";

type Props = {
    attachments: Attachment[];
    setAttachments: (attachments: Attachment[]) => void;
    onDelete: () => void;
};

export function AttachmentsSection({ attachments, setAttachments, onDelete }: Props) {
    const [newFilename, setNewFilename] = useState("");
    const [newUrl, setNewUrl] = useState("");

    // Simuler upload et renvoyer une url locale (ou tu peux remplacer par un vrai upload)
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file); // url locale temporaire
        const newAttachment: Attachment = {
            id: Date.now(),
            filename: file.name,
            url,
        };
        setAttachments([...attachments, newAttachment]);
    };

    const handleAddUrl = () => {
        if (!newFilename.trim() || !newUrl.trim()) return;
        const newAttachment: Attachment = {
            id: Date.now(),
            filename: newFilename.trim(),
            url: newUrl.trim(),
        };
        setAttachments([...attachments, newAttachment]);
        setNewFilename("");
        setNewUrl("");
    };

    const handleRemove = (id: number) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    return (
        <div className="card-section">
            <div className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>Pièces jointes</h3>
                <button onClick={onDelete}>🗑️</button>
            </div>

            <ul>
                {attachments.map(a => (
                    <li key={a.id} style={{ marginBottom: 8 }}>
                        <a href={a.url} target="_blank" rel="noopener noreferrer">{a.filename}</a>
                        <button onClick={() => handleRemove(a.id)} style={{ marginLeft: "0.5rem" }}>❌</button>
                    </li>
                ))}
            </ul>

            <div>
                <label>
                    Ajouter un fichier :
                    <input type="file" onChange={handleFileChange} />
                </label>
            </div>

            <div style={{ marginTop: "1rem" }}>
                <input
                    type="text"
                    placeholder="Nom du fichier"
                    value={newFilename}
                    onChange={e => setNewFilename(e.target.value)}
                    style={{ marginRight: 8 }}
                />
                <input
                    type="text"
                    placeholder="URL du fichier"
                    value={newUrl}
                    onChange={e => setNewUrl(e.target.value)}
                    style={{ marginRight: 8 }}
                />
                <button onClick={handleAddUrl} disabled={!newFilename.trim() || !newUrl.trim()}>Ajouter via URL</button>
            </div>
        </div>
    );
}