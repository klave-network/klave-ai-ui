import { useLocation, useParams } from '@tanstack/react-router';
import { useEffect } from 'react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useCurrentUser, useCurrentUserChatSettings, useLlModels, useMcpModels, useUserChat, useVlModels } from '@/hooks/use-klave-ai-store';
import {
    storeActions
} from '@/store';

export function ModelSelector() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';

    const isVideoChat = location.pathname.includes('/lense');
    const isAgentChat = location.pathname.includes('/agent');
    const isChatView
        = location.pathname === '/chat' || location.pathname === '/chat/lense' || location.pathname === '/chat/agent';

    const llModels = useLlModels();
    const vlModels = useVlModels();
    const mcpModels = useMcpModels();

    const models = isVideoChat ? vlModels : isAgentChat ? mcpModels : llModels;

    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const globalChatSettings = useCurrentUserChatSettings();

    const chatExists = Boolean(currentChat);

    // Safely determine baseSettings without casting
    let baseSettings = globalChatSettings ?? {};
    if (chatExists && currentChat) {
        baseSettings = currentChat.chatSettings ?? baseSettings;
    }

    // *********TEST THIS*********
    // Reset currentLlModel when switching between regular chat and agent chat modes
    useEffect(() => {
        // Only reset if we're in a chat view and not in an existing chat (where model should be preserved)
        if (isChatView && !chatExists) {
            storeActions.updateChatSettings(currentUser, {
                ...baseSettings,
                currentLlModel: ''
            });
        }
    }, [isAgentChat, currentUser, isChatView, chatExists]);

    const selectedModel = isVideoChat
        ? (baseSettings.currentVlModel ?? models[0]?.name ?? '')
        : (baseSettings.currentLlModel ?? models[0]?.name ?? '');

    const isDisabled = chatExists;

    if (models.length === 0) {
        return (
            <div className="text-gray-500 text-sm italic">
                No models available. Please add a model first.
            </div>
        );
    }

    const handleChange = (modelName: string) => {
        if (isDisabled)
            return;

        storeActions.updateChatSettings(currentUser, {
            ...baseSettings,
            ragSpace: '',
            currentMcpServer: '',
            currentLlModel: isVideoChat
                ? (baseSettings.currentLlModel ?? '')
                : modelName,
            currentVlModel: isVideoChat
                ? modelName
                : (baseSettings.currentVlModel ?? '')
        });
    };

    return (
        <Select value={selectedModel} onValueChange={handleChange}>
            <SelectTrigger
                className="w-auto max-w-[200px]"
                disabled={!isChatView || isDisabled}
            >
                <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available language models</SelectLabel>
                    {models.map(model => (
                        <SelectItem key={model.name} value={model.name}>
                            {model.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
