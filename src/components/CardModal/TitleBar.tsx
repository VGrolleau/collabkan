import { Dispatch, SetStateAction } from "react";

type Props = {
    title: string;
    setTitle: Dispatch<SetStateAction<string>>;
    onDelete: () => void;
};

export function TitleBar({ title, setTitle, onDelete }: Props) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{ fontSize: "1.5rem", fontWeight: "bold", flex: 1 }}
            />
            <button onClick={onDelete}>🗑️ Supprimer</button>
        </div>
    );
}
