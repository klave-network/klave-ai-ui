import { Store, useStore } from '@tanstack/react-store';

import type { Model, Rag, Reference } from '@/lib/types';

import { STORE_KEY } from '@/lib/constants';

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    references?: Reference[];
    timestamp?: number;
};

type ChatSettings = {
    systemPrompt: string;
    temperature: number;
    topp: number;
    steps: number;
    slidingWindow: boolean;
    useRag: boolean;
    currentLlModel: string;
    currentVlModel: string;
    ragSpace: string;
    ragChunks: number;
};

export type ChatHistory = {
    id: string;
    messages: ChatMessage[];
    chatSettings: ChatSettings;
};

type UserData = {
    chatSettings: ChatSettings;
    chats?: ChatHistory[];
    vlModels?: Model[];
    llModels?: Model[];
    ragDataSets?: Rag[];
};

type KlaveAIState = Record<string, UserData>;

const defaultChatSettings: ChatSettings = {
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.8,
    topp: 0.9,
    steps: 256,
    slidingWindow: false,
    useRag: false,
    currentLlModel: '',
    currentVlModel: '',
    ragSpace: '',
    ragChunks: 2
};

const initialState: KlaveAIState = {};

export const store = new Store(initialState);

// Helper to persist state to localStorage
store.subscribe(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store.state));
});

// Load initial state from localStorage
const savedState = localStorage.getItem(STORE_KEY);
if (savedState) {
    store.setState(() => ({
        ...(JSON.parse(savedState) as KlaveAIState)
    }));
}

// Hooks
export function useUserChatHistory(keyname: string) {
    return useStore(store, state => state[keyname]?.chats ?? []);
}

export function useUserChat(keyname: string, chatId: string) {
    return useStore(store, state =>
        state[keyname]?.chats?.find(chat => chat.id === chatId));
}

export function useUserLlModels(keyname: string) {
    return useStore(store, state => state[keyname]?.llModels ?? []);
}

export function useUserLlModel(keyname: string, modelName: string) {
    return useStore(store, state =>
        state[keyname]?.llModels?.find(model => model.name === modelName));
}

export function useUserVlModels(keyname: string) {
    return useStore(store, state => state[keyname]?.vlModels ?? []);
}

export function useUserVlModel(keyname: string, modelName: string) {
    return useStore(store, state =>
        state[keyname]?.vlModels?.find(model => model.name === modelName));
}

export function useUserRagDataSets(keyname: string) {
    return useStore(store, state => state[keyname]?.ragDataSets ?? []);
}

export function useUserRagDataSet(keyname: string, ragId: string) {
    return useStore(store, state =>
        state[keyname]?.ragDataSets?.find(rag => rag.rag_id === ragId));
}

export function useUserChatSettings(keyname: string) {
    return useStore(
        store,
        state => state[keyname]?.chatSettings ?? defaultChatSettings
    );
}

export const useUserDocumentSets = (keyname: string) => [keyname];

export function useUserDocumentSet(keyname: string, documentSet: string) {
    return [
        keyname,
        documentSet
    ];
}

// Actions
export const storeActions = {
    createChat: (
        userKeyname: string,
        chatId: string,
        message: ChatMessage,
        settings: ChatSettings
    ) => {
        store.setState((state) => {
            const userData: UserData = state[userKeyname] ?? {
                chats: [],
                llModels: [],
                vlModels: [],
                ragDataSets: [],
                chatSettings: defaultChatSettings
            };

            if (userData.chats?.some(chat => chat.id === chatId)) {
                return state; // Avoid duplicates
            }

            const newChat: ChatHistory = {
                id: chatId,
                messages: [message],
                chatSettings: settings
            };

            return {
                ...state,
                [userKeyname]: {
                    ...userData,
                    chats: [...(userData.chats ?? []), newChat]
                }
            };
        });
    },

    updateChatSettings: (
        userKeyname: string,
        settings: Partial<ChatSettings>
    ) => {
        store.setState((state) => {
            const userData = state[userKeyname] ?? {
                chats: [],
                llModels: [],
                vlModels: [],
                ragDataSets: [],
                chatSettings: defaultChatSettings
            };

            return {
                ...state,
                [userKeyname]: {
                    ...userData,
                    chatSettings: {
                        ...userData.chatSettings,
                        ...settings
                    }
                }
            };
        });
    },

    deleteChat: (userKeyname: string, chatId: string) => {
        store.setState((state) => {
            const userData: UserData = state[userKeyname] ?? {
                chats: [],
                llModels: [],
                vlModels: [],
                ragDataSets: [],
                chatSettings: defaultChatSettings
            };

            const updatedChats = userData.chats?.filter(
                chat => chat.id !== chatId
            );

            return {
                ...state,
                [userKeyname]: {
                    ...userData,
                    chats: updatedChats
                }
            };
        });
    },

    updateMessage: (
        userKeyname: string,
        chatId: string,
        messageId: string,
        updatedContent: Partial<Pick<ChatMessage, 'content' | 'timestamp'>>
    ) => {
        store.setState((state) => {
            const userData: UserData = state[userKeyname] ?? {
                chats: [],
                llModels: [],
                vlModels: [],
                ragDataSets: [],
                chatSettings: defaultChatSettings
            };

            const updatedChats = userData.chats?.map((chat) => {
                if (chat.id !== chatId)
                    return chat;

                const updatedMessages = chat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updatedContent } : msg
                );

                return { ...chat, messages: updatedMessages };
            });

            return {
                ...state,
                [userKeyname]: {
                    ...userData,
                    chats: updatedChats
                }
            };
        });
    },

    addMessage: (userKeyname: string, chatId: string, message: ChatMessage) => {
        const userData = store.state[userKeyname];
        if (!userData)
            return;

        const updatedChats = userData.chats?.map(chat =>
            chat.id === chatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
        );

        store.setState(state => ({
            ...state,
            [userKeyname]: {
                ...userData,
                chats: updatedChats
            }
        }));
    },

    // add models fetched from the backend
    // and set initial chat settings
    addModels: (userKeyname: string, models: Model[]) => {
        store.setState((state) => {
            const userData: UserData = state[userKeyname] ?? {
                chats: [],
                llModels: [],
                vlModels: [],
                ragDataSets: [],
                chatSettings: defaultChatSettings
            };

            const llModels = models.filter(
                m => m.metadata.description.task === 'text-generation'
            );
            const vlModels = models.filter(
                m => m.metadata.description.task === 'image-to-text'
            );

            const firstLlm = llModels[0];
            const firstVlm = vlModels[0];

            return {
                ...state,
                [userKeyname]: {
                    ...userData,
                    chatSettings: {
                        ...userData.chatSettings,
                        systemPrompt: 'You are a helpful assistant.',
                        temperature: 0.8,
                        topp: 0.9,
                        steps: 256,
                        slidingWindow: false,
                        useRag: false,
                        currentLlModel: firstLlm?.name ?? '',
                        currentVlModel: firstVlm?.name ?? '',
                        ragSpace: '',
                        ragChunks: 2
                    },
                    llModels,
                    vlModels
                }
            };
        });
    },

    // add RAG data sets fetched from the backend
    addRagDataSets: (userKeyname: string, ragDataSets: Rag[]) => {
        store.setState((state) => {
            const userData: UserData = state[userKeyname] ?? {
                chats: [],
                llModels: [],
                vlModels: [],
                ragDataSets: [],
                chatSettings: defaultChatSettings
            };

            return {
                ...state,
                [userKeyname]: {
                    ...userData,
                    ragDataSets
                }
            };
        });
    }
};
