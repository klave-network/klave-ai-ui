import { Store } from '@tanstack/store';
import { STORE_KEY } from '@/lib/constants';
import { useStore } from '@tanstack/react-store';

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp?: number;
};

export type ChatHistory = {
    id: string;
    messages: ChatMessage[];
};

type SanctumState = {
    [userKeyname: string]: ChatHistory[];
};

const initialState: SanctumState = {};

export const store = new Store(initialState);

// Helper to persist state to localStorage
store.subscribe(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(store.state));
});

// Load initial state from localStorage
const savedState = localStorage.getItem(STORE_KEY);
if (savedState) {
    store.setState(() => ({
        ...JSON.parse(savedState)
    }));
}

// Hooks
export const useUserChatHistory = (keyname: string) =>
    useStore(store, (state) => state[keyname]);

export const useUserChat = (keyname: string, chatId: string) =>
    useStore(store, (state) =>
        state[keyname].find((chat) => chat.id === chatId)
    );

// Actions
export const storeActions = {
    createChat: (userKeyname: string, chatId: string, message: ChatMessage) => {
        const userChats = store.state[userKeyname] ?? [];
        const newChat: ChatHistory = {
            id: chatId,
            messages: [message]
        };

        store.setState((state) => ({
            ...state,
            [userKeyname]: [...userChats, newChat]
        }));
    },

    addMessage: (userKeyname: string, chatId: string, message: ChatMessage) => {
        const userChats = store.state[userKeyname];
        if (!userChats) return;

        const updatedChats = userChats.map((chat) =>
            chat.id === chatId
                ? { ...chat, messages: [...chat.messages, message] }
                : chat
        );

        store.setState((state) => ({
            ...state,
            [userKeyname]: updatedChats
        }));
    }
};
