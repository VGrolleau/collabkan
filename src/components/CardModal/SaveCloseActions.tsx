type Props = {
    onSave: () => void;
    onClose: () => void;
};

export function SaveCloseActions({ onSave, onClose }: Props) {
    return (
        <div>
            <button style={{ marginTop: "1rem" }} onClick={onSave}>
                💾 Enregistrer
            </button>
            <button onClick={onClose}>✖️ Fermer</button>
        </div>
    );
}
