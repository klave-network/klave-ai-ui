import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCurrentUser, useCurrentUserChatSettings, useLlModels, useMcpModels } from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function AgentModeToggle() {
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const mcpModels = useMcpModels();
    const llModels = useLlModels();

    const isAgentMode = Boolean(chatSettings.agentMode);

    const handleToggle = (checked: boolean) => {
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
            <Switch id="agent-mode" checked={isAgentMode} onCheckedChange={handleToggle} />
            <Label htmlFor="agent-mode">Agent Mode</Label>
        </div>
    );
}
