import { Store } from '@tanstack/react-store';

import type { DriveFile, KeyPair, McpServer, McpSession, Model, Rag, Reference } from '@/lib/types';

import { STORE_KEY } from '@/lib/constants';

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    references?: Reference[];
    timestamp?: number;
    toolCalled?: string;
};

type LenseSettings = {
    systemPrompt: string;
    snapshotFrequency: number;
    userPrompt: string;
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
    currentMcpModel?: string;
    currentMcpServer: string;
    ragSpace: string;
    ragChunks: number;
    sessionId?: string;
    agentMode?: boolean;
};

export type ChatHistory = {
    id: string;
    messages: ChatMessage[];
    chatSettings: ChatSettings;
};

type UserData = {
    chatSettings: ChatSettings;
    lenseSettings: LenseSettings;
    chats: ChatHistory[];
    mcpSessions: McpSession[];
};

type KlaveAIState = {
    currentUser: string | null;
    klaveDriveId: string | null;
    driveFiles: DriveFile[];
    keyPairs: KeyPair[];
    userData: Record<string, UserData>;
    vlModels: Model[];
    llModels: Model[];
    mcpModels: Model[];
    ragDataSets: Rag[];
    mcpServers: McpServer[];
};

export const defaultChatSettings: ChatSettings = {
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.8,
    topp: 0.9,
    steps: 256,
    slidingWindow: false,
    useRag: false,
    currentLlModel: '',
    currentVlModel: '',
    currentMcpModel: '',
    currentMcpServer: '',
    ragSpace: '',
    ragChunks: 2,
    agentMode: false
};

export const defaultLenseSettings = {
    systemPrompt: 'You are a helpful assistant.',
    userPrompt: 'What do you see?',
    snapshotFrequency: 10000
};

function getDefaultUserData(): UserData {
    return {
        chats: [],
        mcpSessions: [],
        chatSettings: defaultChatSettings,
        lenseSettings: defaultLenseSettings
    };
}

const initialState: KlaveAIState = {
    currentUser: null,
    klaveDriveId: null,
    driveFiles: [],
    keyPairs: [],
    userData: {},
    vlModels: [],
    llModels: [],
    mcpModels: [],
    ragDataSets: [],
    mcpServers: []
};

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

// Actions
export const storeActions = {
    addDriveFile: (driveFiles: DriveFile[]) => {
        store.setState(state => ({
            ...state,
            driveFiles
        }));
    },

    addKlaveDriveId: (klaveDriveId: string) => {
        store.setState(state => ({
            ...state,
            klaveDriveId
        }));
    },

    addKeyPair: (keyPair: KeyPair) => {
        store.setState((state) => {
            // Check if key pair already exists
            if (state.keyPairs.some(kp => kp.name === keyPair.name)) {
                return state; // Avoid duplicates
            }

            return {
                ...state,
                keyPairs: [...state.keyPairs, keyPair]
            };
        });
    },

    removeKeyPair: (keyname: string) => {
        store.setState(state => ({
            ...state,
            keyPairs: state.keyPairs.filter(kp => kp.name !== keyname),
            // If removing current user's key, logout
            currentUser: state.currentUser === keyname ? null : state.currentUser
        }));
    },

    setCurrentUser: (userKeyname: string) => {
        store.setState(state => ({
            ...state,
            currentUser: userKeyname,
            // Ensure user data exists when they become current user
            userData: {
                ...state.userData,
                [userKeyname]: state.userData[userKeyname] ?? getDefaultUserData()
            }
        }));
    },

    logout: () => {
        store.setState(state => ({
            ...state,
            currentUser: null,
            klaveDriveId: null
        }));
    },
    createChat: (userKeyname: string, chatId: string, message: ChatMessage, settings: ChatSettings) => {
        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            if (userData.chats.some(chat => chat.id === chatId)) {
                return state; // Avoid duplicates
            }

            const newChat: ChatHistory = {
                id: chatId,
                messages: [message],
                chatSettings: settings
            };

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        chats: [...userData.chats, newChat]
                    }
                }
            };
        });
    },

    updateLenseSettings: (userKeyname: string, settings: Partial<LenseSettings>) => {
        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        lenseSettings: {
                            ...userData.lenseSettings,
                            ...settings
                        }
                    }
                }
            };
        });
    },

    updateChatSettings: (userKeyname: string, settings: Partial<ChatSettings>) => {
        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        chatSettings: {
                            ...userData.chatSettings,
                            ...settings
                        }
                    }
                }
            };
        });
    },

    deleteChat: (userKeyname: string, chatId: string) => {
        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            const updatedChats = userData.chats.filter(chat => chat.id !== chatId);

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        chats: updatedChats
                    }
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
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            const updatedChats = userData.chats.map((chat) => {
                if (chat.id !== chatId)
                    return chat;

                const updatedMessages = chat.messages.map(msg =>
                    msg.id === messageId ? { ...msg, ...updatedContent } : msg
                );

                return { ...chat, messages: updatedMessages };
            });

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        chats: updatedChats
                    }
                }
            };
        });
    },

    addMessage: (userKeyname: string, chatId: string, message: ChatMessage) => {
        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            const updatedChats = userData.chats.map(chat =>
                chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
            );

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        chats: updatedChats
                    }
                }
            };
        });
    },

    // add models fetched from the backend
    // and set initial chat settings
    addModels: (userKeyname: string, models: Model[]) => {
        const llModels = models.filter(m => m.metadata.description.task === 'text-generation');
        const vlModels = models.filter(m => m.metadata.description.task === 'image-to-text');

        const firstLlm = llModels[0];
        const firstVlm = vlModels[0];

        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            return {
                ...state,
                // Update global models
                llModels,
                vlModels,
                // Update user chat settings with first available models
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        chatSettings: {
                            ...userData.chatSettings,
                            currentLlModel: firstLlm?.name ?? '',
                            currentVlModel: firstVlm?.name ?? ''
                        }
                    }
                }
            };
        });
    },

    // Update global MCP models
    addMcpModels: (mcpModels: Model[]) => {
        store.setState(state => ({
            ...state,
            mcpModels
        }));
    },

    // add RAG data sets fetched from the backend
    addRagDataSets: (ragDataSets: Rag[]) => {
        store.setState(state => ({
            ...state,
            ragDataSets
        }));
    },

    // add MCP servers fetched from the backend
    addMcpServers: (mcpServers: McpServer[]) => {
        store.setState(state => ({
            ...state,
            mcpServers
        }));
    },

    // add MCP sessions created on the frontend
    addMcpSessions: (userKeyname: string, mcpSessions: McpSession[]) => {
        store.setState((state) => {
            const userData = state.userData[userKeyname] ?? getDefaultUserData();

            return {
                ...state,
                userData: {
                    ...state.userData,
                    [userKeyname]: {
                        ...userData,
                        mcpSessions
                    }
                }
            };
        });
    }
};
