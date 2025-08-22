// src/components/Modal.tsx
"use client";

import { ReactNode, useEffect, useRef } from "react";

type ModalProps = {
    title: string;
    children: ReactNode;
    onClose: () => void;
    onSave?: () => void;
    saveLabel?: string;
    closeLabel?: string;
};

export default function Modal({
    title,
    children,
    onClose,
    onSave,
    saveLabel = "Enregistrer",
    closeLabel = "Annuler",
}: ModalProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const titleId = "modal-title-" + Math.random().toString(36).slice(2, 8);

    // Fermer avec ESC
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Bloquer le scroll derrière la modale
    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, []);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={handleBackdropClick}
        >
            <div
                className="modal-content"
                ref={containerRef}
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id={titleId} style={{ marginBottom: "16px" }}>{title}</h2>

                {children}

                <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
                    <button onClick={onClose}>{closeLabel}</button>
                    {onSave && <button onClick={onSave}>{saveLabel}</button>}
                </div>
            </div>
        </div>
    );
}
