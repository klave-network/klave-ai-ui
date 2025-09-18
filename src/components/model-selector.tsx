import { useLocation, useParams } from '@tanstack/react-router';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useCurrentUser, useCurrentUserChatSettings, useLlModels, useUserChat, useVlModels } from '@/hooks/use-klave-ai-store';
import {
    storeActions
} from '@/store';

export function ModelSelector() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';

    const isVideoChat = location.pathname.includes('/lense');
    const isChatView
        = location.pathname === '/chat' || location.pathname === '/chat/lense';

    const llModels = useLlModels();
    const vlModels = useVlModels();

    const models = isVideoChat ? vlModels : llModels;

    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const globalChatSettings = useCurrentUserChatSettings();

    const chatExists = Boolean(currentChat);

    // Safely determine baseSettings without casting
    let baseSettings = globalChatSettings ?? {};
    if (chatExists && currentChat) {
        baseSettings = currentChat.chatSettings ?? baseSettings;
    }

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
                className="w-[180px]"
                disabled={!isChatView || isDisabled}
            >
                <SelectValue placeholder="Select language model" />
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
