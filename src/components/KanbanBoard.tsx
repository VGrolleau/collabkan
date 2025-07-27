type Kanban = {
    id: number;
    name: string;
    description: string;
};

export default function KanbanBoard({ kanban }: { kanban: Kanban }) {
    return (
        <section>
            <h2>{kanban.name}</h2>
            <p>{kanban.description}</p>
            {/* Plus tard, les colonnes, cartes, etc */}
        </section>
    );
}
