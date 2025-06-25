import { STORE_KEY } from '@/lib/constants';
import { useStore, Store } from '@tanstack/react-store';
import { type Model } from '@/lib/types';

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp?: number;
};

type ChatSettings = {
    systemPrompt: string;
    temperature: number;
    topp: number;
    steps: number;
    slidingWindow: boolean;
    useRag: boolean;
};

export type ChatHistory = {
    id: string;
    messages: ChatMessage[];
    chatSettings: ChatSettings;
};

type KlaveAIState = Record<
    string,
    {
        chats?: ChatHistory[];
        models?: Model[];
        chatSettings: ChatSettings;
    }
>;

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
export const useUserChatHistory = (keyname: string) =>
    useStore(store, (state) => state[keyname]?.chats ?? []);

export const useUserChat = (keyname: string, chatId: string) =>
    useStore(store, (state) =>
        state[keyname]?.chats?.find((chat) => chat.id === chatId)
    );

export const useUserModels = (keyname: string) =>
    useStore(store, (state) => state[keyname]?.models ?? []);

export const useUserModel = (keyname: string, modelName: string) =>
    useStore(store, (state) =>
        state[keyname]?.models?.find((model) => model.name === modelName)
    );

export const useUserChatSettings = (keyname: string) =>
    useStore(store, (state) => state[keyname].chatSettings);

export const useUserDocumentSets = (keyname: string) => [keyname];

export const useUserDocumentSet = (keyname: string, documentSet: string) => [
    keyname,
    documentSet
];

// Actions
export const storeActions = {
    createChat: (
        userKeyname: string,
        chatId: string,
        message: ChatMessage,
        settings: ChatSettings
    ) => {
        const userData = store.state[userKeyname] ?? { chats: [], models: [] };
        const newChat: ChatHistory = {
            id: chatId,
            messages: [message],
            chatSettings: settings
        };

        store.setState((state) => ({
            ...state,
            [userKeyname]: {
                ...userData,
                chats: [...(userData.chats ?? []), newChat]
            }
        }));
    },

    updateChatSettings: (userKeyname: string, settings: ChatSettings) => {
        const userData = store.state[userKeyname] ?? {
            chats: [],
            models: [],
            chatSettings: {}
        };

        store.setState((state) => ({
            ...state,
            [userKeyname]: {
                ...userData,
                chatSettings: {
                    ...userData.chatSettings,
                    ...settings
                }
            }
        }));
    },

    deleteChat: (userKeyname: string, chatId: string) => {
        const userData = store.state[userKeyname] ?? { chats: [], models: [] };
        const updatedChats = userData.chats?.filter(
            (chat) => chat.id !== chatId
        );

        store.setState((prev) => ({
            ...prev,
            [userKeyname]: {
                ...userData,
                chats: updatedChats
            }
        }));
    },

    updateMessage: (
        userKeyname: string,
        chatId: string,
        messageId: string,
        updatedContent: Partial<Pick<ChatMessage, 'content' | 'timestamp'>>
    ) => {
        const userData = store.state[userKeyname] ?? { chats: [], models: [] };
        const updatedChats = userData.chats?.map((chat) => {
            if (chat.id !== chatId) return chat;

            const updatedMessages = chat.messages.map((msg) =>
                msg.id === messageId ? { ...msg, ...updatedContent } : msg
            );

            return { ...chat, messages: updatedMessages };
        });

        store.setState((prev) => ({
            ...prev,
            [userKeyname]: {
                ...userData,
                chats: updatedChats
            }
        }));
    },

    addMessage: (userKeyname: string, chatId: string, message: ChatMessage) => {
        const userData = store.state[userKeyname];
        if (!userData) return;

        const updatedChats = userData.chats?.map((chat) =>
            chat.id === chatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
        );

        store.setState((state) => ({
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
        const userData = store.state[userKeyname] ?? { chats: [], models: [] };

        store.setState((state) => ({
            ...state,
            [userKeyname]: {
                ...userData,
                chatSettings: {
                    systemPrompt: 'You are a helpful assistant.',
                    temperature: 0.8,
                    topp: 0.9,
                    steps: 256,
                    slidingWindow: false,
                    useRag: false
                },
                models
            }
        }));
    }
};
