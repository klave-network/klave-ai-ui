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
import { CUR_USER_KEY } from '@/lib/constants';
import {
    storeActions,
    useUserChat,
    useUserChatSettings,
    useUserLlModels,
    useUserVlModels
} from '@/store';

export function ModelSelector() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';

    const isVideoChat = location.pathname.includes('/lense');
    const isChatView
        = location.pathname === '/chat' || location.pathname === '/chat/lense';

    const llModels = useUserLlModels(currentUser);
    const vlModels = useUserVlModels(currentUser);

    const models = isVideoChat ? vlModels : llModels;

    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const globalChatSettings = useUserChatSettings(currentUser);

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
