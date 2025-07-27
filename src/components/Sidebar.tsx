"use client";

type Kanban = {
    id: number;
    name: string;
};

export default function Sidebar({
    kanbans,
    onSelect,
}: {
    kanbans: Kanban[];
    onSelect: (id: number) => void;
}) {
    return (
        <aside>
            <h1>{`Collab'Kan`}</h1>
            <h2>{`Mes collab' :`}</h2>
            <ul>
                {kanbans.map((kanban) => (
                    <li key={kanban.id}>
                        <button onClick={() => onSelect(kanban.id)}>{kanban.name}</button>
                    </li>
                ))}
            </ul>
            <button>Ajouter un tableau</button>
        </aside>
    );
}
