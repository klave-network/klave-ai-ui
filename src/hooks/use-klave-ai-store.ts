import { useStore } from '@tanstack/react-store';

import { defaultChatSettings, defaultLenseSettings, store } from '@/store';

export function useKeyPairs() {
    return useStore(store, state => state.keyPairs);
}

export function useKeyPair(keyname: string) {
    return useStore(store, state =>
        state.keyPairs.find(kp => kp.name === keyname));
}

export function useKlaveDriveId() {
    return useStore(store, state => state.klaveDriveId);
}

export function useCurrentUser() {
    return useStore(store, state => state.currentUser);
}

export function useCurrentUserData() {
    return useStore(store, state =>
        state.currentUser ? state.userData[state.currentUser] : null);
}

export function useCurrentUserChats() {
    return useStore(store, state =>
        state.currentUser ? state.userData[state.currentUser]?.chats ?? [] : []);
}

export function useCurrentUserChatSettings() {
    return useStore(store, state =>
        state.currentUser
            ? state.userData[state.currentUser]?.chatSettings ?? defaultChatSettings
            : defaultChatSettings);
}

export function useCurrentUserLenseSettings() {
    return useStore(store, state =>
        state.currentUser
            ? state.userData[state.currentUser]?.lenseSettings ?? defaultLenseSettings
            : defaultLenseSettings);
}

export function useCurrentUserMcpSessions() {
    return useStore(store, state =>
        state.currentUser
            ? state.userData[state.currentUser]?.mcpSessions ?? []
            : []);
}

export function useUserChatHistory(keyname: string) {
    return useStore(store, state => state.userData[keyname].chats);
}

export function useUserChat(keyname: string, chatId: string) {
    return useStore(store, state =>
        state.userData[keyname].chats?.find(chat => chat.id === chatId));
}

export function useLlModels() {
    return useStore(store, state => state.llModels);
}

export function useLlModel(modelName: string) {
    return useStore(store, state =>
        state.llModels?.find(model => model.name === modelName));
}

export function useVlModels() {
    return useStore(store, state => state.vlModels);
}

export function useVlModel(modelName: string) {
    return useStore(store, state =>
        state.vlModels?.find(model => model.name === modelName));
}

export function useMcpModels() {
    return useStore(store, state => state.mcpModels);
}

export function useMcpModel(modelName: string) {
    return useStore(store, state =>
        state.mcpModels?.find(model => model.name === modelName));
}

export function useRagDataSets() {
    return useStore(store, state => state.ragDataSets);
}

export function useRagDataSet(ragId: string) {
    return useStore(store, state =>
        state.ragDataSets?.find(rag => rag.rag_id === ragId));
}

export function useMcpServers() {
    return useStore(store, state => state.mcpServers);
}

export function useMcpServer(serverId: string) {
    return useStore(store, state =>
        state.mcpServers?.find(server => server.id === serverId));
}

export function useUserMcpSessions(keyname: string) {
    return useStore(store, state => state.userData[keyname].mcpSessions);
}

export function useUserMcpSession(keyname: string, sessionId: string) {
    return useStore(store, state =>
        state.userData[keyname].mcpSessions?.find(session => session.session_id === sessionId));
}

export function useUserChatSettings(keyname: string) {
    return useStore(
        store,
        state => state.userData[keyname]?.chatSettings ?? defaultChatSettings
    );
}

export function useUserLenseSettings(keyname: string) {
    return useStore(
        store,
        state => state.userData[keyname]?.lenseSettings ?? defaultLenseSettings
    );
}
