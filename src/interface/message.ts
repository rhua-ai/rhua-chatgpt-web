export interface ChatMessage {

    id: string;

    type: string;

    name: string;

    content: string;

    additions?: ChatMessageAddition[];

    completed: boolean;
}

export interface ChatMessageAddition {

    type: string;

    content: string;
}

export interface ChatSession {

    id: string;

    name: string;

    avatar: string;

    content: string;

    time: string;

    config: ChatSessionConfig;
}

export interface ChatSessionConfig {

    roleId: string;

    model: string;

    modelPrecision: "creativity" | "balance" | "precision";
}