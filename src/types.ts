export type Column = {
    id: string;
    title: string;
    order: number;
    kanbanId: string;
    cards: CardElement[];
};

export type Kanban = {
    id: string;
    name: string;
    description?: string;
    columns: Column[];
    members?: User[];
};

export type CardElement = {
    id: string;
    title: string;
    description?: string;
    order: number;
    columnId: string;
    dueDate?: Date | null;
    labels: Label[];
    assignees: User[];
    attachments: Attachment[];
    checklist: ChecklistItem[];
    comments: Comment[];
};
export type ChecklistItem = {
    id: string;
    text: string;
    done: boolean;
};

export type Label = {
    id: string;
    name: string;
    color: string;
};

export type Comment = {
    id: string;
    author: string;
    date: string; // ISO string
    content: string;
};

export type Assignee = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
};

export type Attachment = {
    id: string;
    filename: string;
    url: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
};