type Props = {
    description: string;
    setDescription: (val: string) => void;
    onDelete: () => void;
};

export function DescriptionSection({ description, setDescription, onDelete }: Props) {
    return (
        <div className="card-section">
            <div className="section-header">
                <h3>Description</h3>
                <button onClick={onDelete}>🗑️</button>
            </div>
            <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ajoutez une description..."
            />
        </div>
    );
}
