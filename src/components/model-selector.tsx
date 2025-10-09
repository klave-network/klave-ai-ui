import { useLocation, useNavigate, useParams } from '@tanstack/react-router';
import { Bot } from 'lucide-react';

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
import { getModelLogo } from '@/lib/utils';
import { storeActions } from '@/store';

export function ModelSelector() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const chatExists = Boolean(currentChat);

    const isAgentMode = chatExists ? Boolean(currentChat?.chatSettings?.agentMode) : Boolean(chatSettings.agentMode);

    const isVideoChat = location.pathname.includes('/lense');
    const isChatView
        = location.pathname === '/chat' || location.pathname === '/chat/lense' || location.pathname === '/chat/agent';

    const llModels = useLlModels();
    const vlModels = useVlModels();
    const mcpModels = useMcpModels();

    const models = isVideoChat ? vlModels : isAgentMode ? mcpModels : llModels;

    // Safely determine baseSettings without casting
    let baseSettings = chatSettings ?? {};
    if (chatExists && currentChat) {
        baseSettings = currentChat.chatSettings ?? baseSettings;
    }

    const selectedModel = isVideoChat
        ? baseSettings.currentVlModel ?? models[0]?.name ?? ''
        : isAgentMode
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
            navigate({ to: '/chat', search: true });
        }
    };

    // Find the current selected model to display in trigger
    const allModels = [...llModels, ...mcpModels, ...vlModels];
    const currentModel = allModels.find(m => m.name === selectedModel);
    const currentLogoPath = currentModel ? getModelLogo(currentModel.name) : null;

    return (
        <Select value={selectedModel} onValueChange={handleChange}>
            {/* Remove default styles and push to the left to have the same spacing */}
            <SelectTrigger className="w-auto border-none shadow-none -ml-2" disabled={!isChatView || isDisabled}>
                {currentModel
                    ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 flex items-center justify-center shrink-0">
                                    {currentLogoPath
                                        ? (
                                                <img
                                                    src={currentLogoPath}
                                                    alt={`${currentModel.name} logo`}
                                                    className="h-4 w-4 object-contain"
                                                />
                                            )
                                        : (
                                                <Bot className="h-4 w-4" />
                                            )}
                                </div>
                                <span className="font-medium">{currentModel.name}</span>
                            </div>
                        )
                    : (
                            <SelectValue placeholder="Select model" />
                        )}
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available LLMs (Ask Mode)</SelectLabel>
                    {llModels.map((model) => {
                        const logoPath = getModelLogo(model.name);
                        return (
                            <SelectItem key={model.name} value={model.name}>
                                <div className="flex items-start gap-2 max-w-sm">
                                    <div className="h-5 w-5 flex items-center justify-center shrink-0">
                                        {logoPath
                                            ? (
                                                    <img
                                                        src={logoPath}
                                                        alt={`${model.name} logo`}
                                                        className="h-4 w-4 object-contain"
                                                    />
                                                )
                                            : (
                                                    <Bot className="h-4 w-4" />
                                                )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-medium break-words">{model.name}</span>
                                        <span className="text-xs text-muted-foreground break-words whitespace-normal">
                                            {model.metadata.description.brief}
                                        </span>
                                    </div>
                                </div>
                            </SelectItem>
                        );
                    })}
                    <SelectLabel>Available LLMs (Agent Mode)</SelectLabel>
                    {mcpModels.map((model) => {
                        const logoPath = getModelLogo(model.name);
                        return (
                            <SelectItem key={model.name} value={model.name}>
                                <div className="flex items-start gap-2 max-w-sm">
                                    <div className="h-5 w-5 flex items-center justify-center shrink-0">
                                        {logoPath
                                            ? (
                                                    <img
                                                        src={logoPath}
                                                        alt={`${model.name} logo`}
                                                        className="h-4 w-4 object-contain"
                                                    />
                                                )
                                            : (
                                                    <Bot className="h-4 w-4" />
                                                )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-medium break-words">{model.name}</span>
                                        <span className="text-xs text-muted-foreground break-words whitespace-normal">
                                            {model.metadata.description.brief}
                                        </span>
                                    </div>
                                </div>
                            </SelectItem>
                        );
                    })}
                    <SelectLabel>Available VLMs</SelectLabel>
                    {vlModels.map((model) => {
                        const logoPath = getModelLogo(model.name);
                        return (
                            <SelectItem key={model.name} value={model.name}>
                                <div className="flex items-start gap-2 max-w-sm">
                                    <div className="h-5 w-5 flex items-center justify-center shrink-0">
                                        {logoPath
                                            ? (
                                                    <img
                                                        src={logoPath}
                                                        alt={`${model.name} logo`}
                                                        className="h-4 w-4 object-contain"
                                                    />
                                                )
                                            : (
                                                    <Bot className="h-4 w-4" />
                                                )}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-medium break-words">{model.name}</span>
                                        <span className="text-xs text-muted-foreground break-words whitespace-normal">
                                            {model.metadata.description.brief}
                                        </span>
                                    </div>
                                </div>
                            </SelectItem>
                        );
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
