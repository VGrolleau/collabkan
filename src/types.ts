export type Column = {
    id: string;
    title: string;
    cards: CardElement[];
};

export type Kanban = {
    id: string;
    name: string;
    description?: string;
    columns: Column[];
};

export type CardElement = {
    id: string;
    order: number;
    title: string;
    description?: string;
    labels?: Label[];
    dueDate?: Date | null;
    checklist?: ChecklistItem[];
    comments?: Comment[];
    assignees?: Assignee[];
    attachments?: Attachment[];
    columnId: string;
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
    date: string;
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