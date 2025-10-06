import { useLocation, useNavigate, useParams } from '@tanstack/react-router';

import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    useCurrentUser,
    useCurrentUserChatSettings,
    useLlModels,
    useMcpModels,
    useUserChat,
    useVlModels
} from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function ModelSelector() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';

    const isVideoChat = location.pathname.includes('/lense');
    const isAgentChat = location.pathname.includes('/agent');
    const isChatView
        = location.pathname === '/' || location.pathname === '/chat/lense' || location.pathname === '/chat/agent';

    const llModels = useLlModels();
    const vlModels = useVlModels();
    const mcpModels = useMcpModels();
    const globalChatSettings = useCurrentUserChatSettings();

    const isAgent = isAgentChat || Boolean(globalChatSettings?.agentMode);
    const models = isVideoChat ? vlModels : isAgent ? mcpModels : llModels;

    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const chatExists = Boolean(currentChat);

    // Safely determine baseSettings without casting
    let baseSettings = globalChatSettings ?? {};
    if (chatExists && currentChat) {
        baseSettings = currentChat.chatSettings ?? baseSettings;
    }

    const selectedModel = isVideoChat
        ? baseSettings.currentVlModel ?? models[0]?.name ?? ''
        : isAgent
            ? baseSettings.currentMcpModel ?? models[0]?.name ?? ''
            : baseSettings.currentLlModel ?? models[0]?.name ?? '';

    const isDisabled = chatExists;

    if (models.length === 0) {
        return <div className="text-gray-500 text-sm italic">No models available. Please add a model first.</div>;
    }

    const handleChange = (modelName: string) => {
        if (isDisabled)
            return;

        const isMcpSelected = mcpModels.some(model => model.name === modelName);
        const isLlSelected = llModels.some(model => model.name === modelName);
        const isVlSelected = vlModels.some(model => model.name === modelName);
        storeActions.updateChatSettings(currentUser, {
            ...baseSettings,
            currentMcpServer: '',
            currentLlModel: isVideoChat
                ? baseSettings.currentLlModel ?? ''
                : isLlSelected
                    ? modelName
                    : baseSettings.currentLlModel ?? '',
            currentVlModel: isVideoChat ? modelName : isVlSelected ? modelName : baseSettings.currentVlModel ?? '',
            currentMcpModel: isVideoChat
                ? baseSettings.currentMcpModel ?? ''
                : isMcpSelected
                    ? modelName
                    : baseSettings.currentMcpModel ?? '',
            agentMode: isVideoChat ? baseSettings.agentMode : isMcpSelected
        });

        if (isVlSelected && !isVideoChat) {
            navigate({ to: '/chat/lense', search: true });
        }
        else if (isVideoChat && (isLlSelected || isMcpSelected)) {
            navigate({ to: '/', search: true });
        }
    };

    return (
        <Select value={selectedModel} onValueChange={handleChange}>
            {/* Remove default styles and push to the left to have the same spacing */}
            <SelectTrigger className="w-auto border-none shadow-none -ml-2" disabled={!isChatView || isDisabled}>
                <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available models</SelectLabel>
                    {llModels.map(model => (
                        <SelectItem key={model.name} value={model.name} className="flex items-center gap-2">
                            {model.name}
                            <Badge className="bg-klave-blue">LLM Ask</Badge>
                        </SelectItem>
                    ))}
                    {mcpModels.map(model => (
                        <SelectItem key={model.name} value={model.name} className="flex items-center gap-2">
                            {model.name}
                            <Badge className="bg-klave-cyan text-black">LLM Agent</Badge>
                        </SelectItem>
                    ))}
                    {vlModels.map(model => (
                        <SelectItem key={model.name} value={model.name} className="flex items-center gap-2">
                            {model.name}
                            <Badge className="bg-klave-orange">VLM</Badge>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
