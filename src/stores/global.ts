import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { KeyPair, McpServer, McpSession, Model, Rag, Reference } from '@/lib/types';

type ChatMessage = {
    id: string;
    role: 'user' | 'ai';
    content: string;
    references?: Reference[];
    timestamp?: number;
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
    currentMcpServer: string;
    ragSpace: string;
    ragChunks: number;
    sessionId?: string;
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

type KlaveAiState = {
    // State
    keys: KeyPair[];
    vlModels: Model[];
    llModels: Model[];
    ragDataSets: Rag[];
    mcpServers: McpServer[];
    userData: Record<string, UserData>;

    // Key actions
    addKey: (key: KeyPair) => void;
    getKey: (id: string) => KeyPair | undefined;
    getKeys: () => KeyPair[];

    // Chat actions
    addChat: (userKeyname: string, chatId: string, message: ChatMessage, settings: ChatSettings) => void;
    getChat: (userKeyname: string, chatId: string) => ChatHistory | undefined;
    getChats: (userKeyname: string) => ChatHistory[];
    deleteChat: (userKeyname: string, chatId: string) => void;
    updateChatSettings: (userKeyname: string, settings: Partial<ChatSettings>) => void;
    updateLenseSettings: (userKeyname: string, settings: Partial<LenseSettings>) => void;
    updateChatMessage: (userKeyname: string, chatId: string, messageId: string, updatedContent: Partial<Pick<ChatMessage, 'content' | 'timestamp'>>) => void;
    addChatMessage: (userKeyname: string, chatId: string, message: ChatMessage) => void;

    // MCP actions
    addMcpSession: (userKeyname: string, mcpSession: McpSession) => void;
    addMcpSessions: (userKeyname: string, mcpSessions: McpSession[]) => void;
    getMcpSessions: (userKeyname: string) => McpSession[];
    getMcpSession: (userKeyname: string, sessionId: string) => McpSession | undefined;
    addMcpServer: (mcpServer: McpServer) => void;
    addMcpServers: (mcpServers: McpServer[]) => void;
    getMcpServers: () => McpServer[];
    getMcpServer: (serverId: string) => McpServer | undefined;

    // RAG actions
    addRagDataSets: (ragDataSets: Rag[]) => void;
    addRagDataSet: (ragDataSet: Rag) => void;
    getRagDataSets: () => Rag[];
    getRagDataSet: (ragId: string) => Rag | undefined;

    // Model actions
    addLlModel: (model: Model) => void;
    addLlModels: (models: Model[]) => void;
    getLlModel: (modelId: string) => Model | undefined;
    getLlModels: () => Model[];
    addVlModel: (model: Model) => void;
    addVlModels: (models: Model[]) => void;
    getVlModel: (modelId: string) => Model | undefined;
    getVlModels: () => Model[];

    // Utility actions
    reset: () => void;
};

export const useKlaveAiStore = create<KlaveAiState>()(
    persist(
        (set, get) => ({
            // State
            keys: [],
            vlModels: [],
            llModels: [],
            ragDataSets: [],
            mcpServers: [],
            userData: {},

            // Key actions
            addKey: (key: KeyPair) => {
                set(state => ({
                    ...state,
                    keys: [...state.keys, key]
                }));
            },
            getKey: (id: string) => {
                return get().keys.find(key => key.id === id);
            },
            getKeys: () => {
                return get().keys;
            },

            // Chat actions
            addChat: (userKeyname: string, chatId: string, message: ChatMessage, settings: ChatSettings) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

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
            getChat: (userKeyname: string, chatId: string) => {
                return get().userData[userKeyname]?.chats?.find(chat => chat.id === chatId);
            },
            getChats: (userKeyname: string) => {
                return get().userData[userKeyname]?.chats ?? [];
            },
            deleteChat: (userKeyname: string, chatId: string) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

                    const updatedChats = userData.chats.filter(
                        chat => chat.id !== chatId
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
            updateChatSettings: (userKeyname: string, settings: Partial<ChatSettings>) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

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
            updateLenseSettings: (userKeyname: string, settings: Partial<LenseSettings>) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

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
            updateChatMessage: (
                userKeyname: string,
                chatId: string,
                messageId: string,
                updatedContent: Partial<Pick<ChatMessage, 'content' | 'timestamp'>>
            ) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

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
            addChatMessage: (userKeyname: string, chatId: string, message: ChatMessage) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

                    const updatedChats = userData.chats.map(chat =>
                        chat.id === chatId
                            ? { ...chat, messages: [...chat.messages, message] }
                            : chat
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

            // MCP actions
            addMcpSession: (userKeyname: string, mcpSession: McpSession) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

                    return {
                        ...state,
                        userData: {
                            ...state.userData,
                            [userKeyname]: {
                                ...userData,
                                mcpSessions: [...userData.mcpSessions, mcpSession]
                            }
                        }
                    };
                });
            },
            addMcpSessions: (userKeyname: string, mcpSessions: McpSession[]) => {
                set((state) => {
                    const userData = state.userData[userKeyname];

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
            },
            getMcpSessions: (userKeyname: string) => {
                return get().userData[userKeyname]?.mcpSessions ?? [];
            },
            getMcpSession: (userKeyname: string, sessionId: string) => {
                return get().userData[userKeyname]?.mcpSessions?.find(session => session.session_id === sessionId);
            },
            addMcpServer: (mcpServer: McpServer) => {
                set(state => ({
                    ...state,
                    mcpServers: [...state.mcpServers, mcpServer]
                }));
            },
            addMcpServers: (mcpServers: McpServer[]) => {
                set(state => ({
                    ...state,
                    mcpServers
                }));
            },
            getMcpServers: () => {
                return get().mcpServers;
            },
            getMcpServer: (serverId: string) => {
                return get().mcpServers.find(server => server.id === serverId);
            },

            // RAG actions
            addRagDataSets: (ragDataSets: Rag[]) => {
                set(state => ({
                    ...state,
                    ragDataSets
                }));
            },
            addRagDataSet: (ragDataSet: Rag) => {
                set(state => ({
                    ...state,
                    ragDataSets: [...state.ragDataSets, ragDataSet]
                }));
            },
            getRagDataSets: () => {
                return get().ragDataSets;
            },
            getRagDataSet: (ragId: string) => {
                return get().ragDataSets.find(rag => rag.rag_id === ragId);
            },

            // Model actions
            addLlModel: (model: Model) => {
                set(state => ({
                    ...state,
                    llModels: [...state.llModels, model]
                }));
            },
            addLlModels: (models: Model[]) => {
                set(state => ({
                    ...state,
                    llModels: models
                }));
            },
            getLlModel: (modelId: string) => {
                return get().llModels.find(model => model.name === modelId);
            },
            getLlModels: () => {
                return get().llModels;
            },
            addVlModel: (model: Model) => {
                set(state => ({
                    ...state,
                    vlModels: [...state.vlModels, model]
                }));
            },
            addVlModels: (models: Model[]) => {
                set(state => ({
                    ...state,
                    vlModels: models
                }));
            },
            getVlModel: (modelId: string) => {
                return get().vlModels.find(model => model.name === modelId);
            },
            getVlModels: () => {
                return get().vlModels;
            },

            // Utility actions
            reset: () => {
                set({
                    keys: [],
                    vlModels: [],
                    llModels: [],
                    ragDataSets: [],
                    mcpServers: [],
                    userData: {}
                });
            }
        }),
        {
            name: 'klave-ai-store',
            version: 1
        }
    )
);
