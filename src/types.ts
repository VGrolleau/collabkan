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
    id: number | string;
    title: string;
    description?: string;
    labels?: { id: number; name: string; color: string }[];
    dueDate?: string; // ISO string
    checklist?: ChecklistItem[];
    comments?: { id: number; author: string; date: string; content: string }[];
    assignees?: { id: number; name: string; avatarUrl?: string }[];
    attachments?: { id: number; filename: string; url: string }[];
}

export type ChecklistItem = {
    text: string;
    done: boolean;
};

export type Label = {
    id: number;
    name: string;
    color: string;
};

export type Comment = {
    id: number;
    author: string;
    date: string;
    content: string;
};

export type Assignee = {
    id: number;
    name: string;
    avatarUrl?: string;
};

export type Attachment = {
    id: number;
    filename: string;
    url: string;
};