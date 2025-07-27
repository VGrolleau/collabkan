type SidebarProps = {
    kanbans: { id: number; name: string }[];
    onSelect: (id: number) => void;
    onAddKanbanClick: () => void;
};

export default function Sidebar({ kanbans, onSelect, onAddKanbanClick }: SidebarProps) {
    return (
        <aside>
            <h1>Liste de mes tableaux :</h1>
            <ul>
                {kanbans.map((kanban) => (
                    <li key={kanban.id}>
                        <button onClick={() => onSelect(kanban.id)}>{kanban.name}</button>
                    </li>
                ))}
            </ul>
            <button onClick={onAddKanbanClick}>Ajouter un tableau</button>
        </aside>
    );
}
