import { useParams } from '@tanstack/react-router';

import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    useCurrentUser,
    useCurrentUserChatSettings,
    useLlModels,
    useMcpModels,
    useUserChat
} from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function AgentModeToggle() {
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const mcpModels = useMcpModels();
    const llModels = useLlModels();
    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const chatExists = Boolean(currentChat);

    const isAgentMode = chatExists ? Boolean(currentChat?.chatSettings?.agentMode) : Boolean(chatSettings.agentMode);

    const handleToggle = (checked: boolean) => {
        if (chatExists)
            return;
        const firstMcpModel = mcpModels[0]?.name ?? '';
        const firstLlModel = llModels[0]?.name ?? '';

        storeActions.updateChatSettings(currentUser, {
            agentMode: checked,
            currentMcpModel: checked ? firstMcpModel : chatSettings.currentMcpModel ?? '',
            currentLlModel: checked ? chatSettings.currentLlModel ?? firstLlModel : firstLlModel,
            // reset contextual selections that might conflict when switching modes
            ragSpace: '',
            currentMcpServer: ''
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Switch id="agent-mode" checked={isAgentMode} onCheckedChange={handleToggle} disabled={chatExists} />
            <Label htmlFor="agent-mode">Agent Mode</Label>
        </div>
    );
}
