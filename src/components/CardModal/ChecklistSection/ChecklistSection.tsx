import { FC, useCallback } from "react";
import { ChecklistItem } from "@/types";
import styles from "./ChecklistSection.module.scss";

type ChecklistSectionProps = {
    checklist: ChecklistItem[];
    cardId: string;
    onChange: (items: ChecklistItem[]) => void;
};

const ChecklistSection: FC<ChecklistSectionProps> = ({ checklist, cardId, onChange }) => {
    // Calcul du pourcentage de complétion
    const completion = checklist.length
        ? Math.round((checklist.filter((i) => i.done).length / checklist.length) * 100)
        : 0;

    // Auto-resize des textareas
    const autoResize = useCallback((el: HTMLTextAreaElement | null) => {
        if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
        }
    }, []);

    // Toggle d’un item (done)
    const toggleDone = async (index: number) => {
        const item = checklist[index];
        const updated = { ...item, done: !item.done };

        // Optimistic UI
        const newList = [...checklist];
        newList[index] = updated;
        onChange(newList);

        // Persist côté serveur
        await fetch(`/api/checklist-items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ done: updated.done }),
        });
    };

    // Modification du texte d’un item
    const updateText = async (index: number, text: string) => {
        const item = checklist[index];
        const updated = { ...item, text };

        const newList = [...checklist];
        newList[index] = updated;
        onChange(newList);

        await fetch(`/api/checklist-items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
    };

    // Ajouter un nouvel item
    const addItem = async () => {
        const res = await fetch(`/api/checklist-items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: "", done: false, cardId }),
        });
        const created: ChecklistItem = await res.json();
        onChange([...checklist, created]);
    };

    // Supprimer un item
    const removeItem = async (index: number) => {
        const item = checklist[index];
        const newList = [...checklist];
        newList.splice(index, 1);
        onChange(newList);

        await fetch(`/api/checklist-items/${item.id}`, {
            method: "DELETE",
        });
    };

    return (
        <div className={styles.section}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>Checklist</div>
                <div className={styles.completion}>{completion}%</div>
            </div>

            {/* Progress bar */}
            <div className={styles.progress}>
                <div style={{ width: `${completion}%` }} />
            </div>

            {/* Items */}
            {checklist.map((item, idx) => (
                <div key={item.id} className={styles.checklistItem}>
                    <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => toggleDone(idx)}
                    />
                    <textarea
                        ref={autoResize}
                        value={item.text}
                        onChange={(e) => updateText(idx, e.target.value)}
                        placeholder="Nouvel item"
                        rows={1}
                        className={styles.textarea}
                    />
                    <button className={styles.btn} onClick={() => removeItem(idx)}>🗑️</button>
                </div>
            ))}

            {/* Ajouter un item */}
            <div className={styles.addRow}>
                <input
                    className={styles.input}
                    placeholder="Nouvelle tâche…"
                    onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
                <button className={styles.btn} onClick={addItem}>Ajouter</button>
            </div>
        </div>
    );
};

export default ChecklistSection;
