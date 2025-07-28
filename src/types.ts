export type Column = {
    id: number;
    name: string;
    cards: CardElement[];
};

export type Kanban = {
    id: number;
    name: string;
    description: string;
    columns: Column[];
};

export type CardElement = {
    id: number;
    title: string;
    description?: string;
    // plus tard : catégorie, deadline, checklist...
};