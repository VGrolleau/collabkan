export type Column = {
    id: number;
    name: string;
};

export type Kanban = {
    id: number;
    name: string;
    description: string;
    columns: Column[];
};