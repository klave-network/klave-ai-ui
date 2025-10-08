import { Store } from '@tanstack/react-store';

import type { DriveFile, KeyPair, McpServer, McpSession, Model, Rag, Tool, ToolResult } from '@/lib/types';

import { STORE_KEY } from '@/lib/constants';

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    timestamp?: number;
    toolCalled?: string;
    toolResults?: ToolResult[];
    reasoningContent?: string;
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
    currentLlModel: string;
    currentVlModel: string;
    currentMcpModel?: string;
    currentMcpServer: string;
    sessionId?: string;
    agentMode?: boolean;
    selectedTools?: string[]; // Array of selected tool names (non-RAG tools)
    selectedSpaces?: string[]; // Array of selected space names (RAG tools)
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
    currentLlModel: '',
    currentVlModel: '',
    currentMcpModel: '',
    currentMcpServer: '',
    agentMode: false,
    selectedTools: [],
    selectedSpaces: []
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

// Helper to safely get or create a user's data
function ensureUserDataExists(state: KlaveAIState, userKeyname: string): UserData {
    return state.userData[userKeyname] ?? getDefaultUserData();
}

// Helper to update nested userData for a specific user in a immutable way
function updateUserData(
    state: KlaveAIState,
    userKeyname: string,
    updater: (current: UserData) => UserData
): KlaveAIState {
    const currentUserData = ensureUserDataExists(state, userKeyname);
    return {
        ...state,
        userData: {
            ...state.userData,
            [userKeyname]: updater(currentUserData)
        }
    };
}

// Load initial state from localStorage
const savedState = localStorage.getItem(STORE_KEY);
if (savedState) {
    try {
        const parsed = JSON.parse(savedState) as Partial<KlaveAIState> | null;
        if (parsed && typeof parsed === 'object') {
            // Shallow merge to keep any newly added defaults
            store.setState(() => ({
                ...initialState,
                ...parsed
            }));
        }
    }
    catch (err) {
        console.warn('Failed to parse persisted store state. Clearing persisted value.', err);
        try {
            localStorage.removeItem(STORE_KEY);
        }
        catch {
            // ignore
        }
    }
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
            ...updateUserData(state, userKeyname, current => current),
            currentUser: userKeyname
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
            const current = ensureUserDataExists(state, userKeyname);
            if (current.chats.some(chat => chat.id === chatId)) {
                return state; // Avoid duplicates
            }

            const newChat: ChatHistory = {
                id: chatId,
                messages: [message],
                chatSettings: settings
            };

            return updateUserData(state, userKeyname, u => ({
                ...u,
                chats: [...u.chats, newChat]
            }));
        });
    },

    updateLenseSettings: (userKeyname: string, settings: Partial<LenseSettings>) => {
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                lenseSettings: {
                    ...u.lenseSettings,
                    ...settings
                }
            }))
        );
    },

    updateChatSettings: (userKeyname: string, settings: Partial<ChatSettings>) => {
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                chatSettings: {
                    ...u.chatSettings,
                    ...settings
                }
            }))
        );
    },

    deleteChat: (userKeyname: string, chatId: string) => {
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                chats: u.chats.filter(chat => chat.id !== chatId)
            }))
        );
    },

    updateMessage: (
        userKeyname: string,
        chatId: string,
        messageId: string,
        updatedContent: Partial<Pick<ChatMessage, 'content' | 'timestamp' | 'toolResults' | 'reasoningContent'>>
    ) => {
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                chats: u.chats.map((chat) => {
                    if (chat.id !== chatId)
                        return chat;

                    return {
                        ...chat,
                        messages: chat.messages.map(msg =>
                            msg.id === messageId ? { ...msg, ...updatedContent } : msg
                        )
                    };
                })
            }))
        );
    },

    addToolResult: (userKeyname: string, chatId: string, messageId: string, toolResult: ToolResult) => {
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                chats: u.chats.map((chat) => {
                    if (chat.id !== chatId)
                        return chat;

                    return {
                        ...chat,
                        messages: chat.messages.map((msg) => {
                            if (msg.id !== messageId)
                                return msg;

                            return {
                                ...msg,
                                toolResults: [...(msg.toolResults || []), toolResult]
                            };
                        })
                    };
                })
            }))
        );
    },

    addMessage: (userKeyname: string, chatId: string, message: ChatMessage) => {
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                chats: u.chats.map(chat =>
                    chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
                )
            }))
        );
    },

    // add models fetched from the backend
    // and set initial chat settings
    addModels: (userKeyname: string, models: Model[]) => {
        const llModels = models.filter(m => m.metadata.description.task === 'text-generation');
        const vlModels = models.filter(m => m.metadata.description.task === 'image-to-text');

        const firstLlm = llModels[0];
        const firstVlm = vlModels[0];

        store.setState((state) => {
            const next = updateUserData(state, userKeyname, u => ({
                ...u,
                chatSettings: {
                    ...u.chatSettings,
                    currentLlModel: firstLlm?.name ?? '',
                    currentVlModel: firstVlm?.name ?? ''
                }
            }));
            return {
                ...next,
                llModels,
                vlModels
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
        store.setState(state =>
            updateUserData(state, userKeyname, u => ({
                ...u,
                mcpSessions
            }))
        );
    },

    // Update tools for a specific MCP server
    updateMcpServerTools: (serverId: string, tools: Tool[]) => {
        store.setState(state => ({
            ...state,
            mcpServers: state.mcpServers.map(server =>
                server.id === serverId ? { ...server, tools } : server
            )
        }));
    }
};
