type Props = {
    onSave: () => void;
    onDelete: () => void;
    onClose: () => void;
};

export function SaveCloseActions({ onSave, onDelete, onClose }: Props) {
    return (
        <div className="save-close-actions">
            <button onClick={onSave}>💾 Enregistrer</button>
            <button onClick={onDelete}>🗑️ Supprimer</button>
            <button onClick={onClose}>✖️ Fermer</button>
        </div>
    );
}
