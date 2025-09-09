import { useLocation, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';

import { getMcpServerCapabilities, initMcpSession } from '@/api/klave-ai-mcp-client';
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
    useUserMcpServers
} from '@/store';

// Default chat settings fallback
const defaultChatSettings = {
    systemPrompt: 'You are a helpful assistant.',
    temperature: 0.8,
    topp: 0.9,
    steps: 256,
    slidingWindow: false,
    useRag: false,
    currentLlModel: '',
    currentVlModel: '',
    currentMcpServer: '',
    ragSpace: '',
    ragChunks: 2
};

export function McpSelector() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const chatSettings = useUserChatSettings(currentUser) ?? defaultChatSettings;

    const isChatView = location.pathname === '/chat' || location.pathname === '/chat/lense';
    const mcpServers = useUserMcpServers(currentUser);

    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const chatExists = Boolean(currentChat);

    const isDisabled = chatExists;

    const handleChange = async (mcpServerId: string) => {
        if (isDisabled)
            return;

        try {
            const server = mcpServers.find(s => s.id === mcpServerId);
            if (!server) {
                toast.error('Failed to update settings');
                throw new Error('MCP Server not found');
            }

            const caps = await getMcpServerCapabilities({ server_id: server.id });
            const session = await initMcpSession({ server_id: server.id, capabilities: caps.capabilities });

            storeActions.addMcpSessions(currentUser, [session]);
            storeActions.updateChatSettings(currentUser, {
                ...chatSettings,
                currentMcpServer: mcpServerId,
                sessionId: session.session_id
            });

            toast.success(`Session initialized ${session.session_id}`);
        }
        catch (error) {
            toast.error('Failed to update settings');
            console.error('Error updating settings:', error);
        }
    };

    return (
        <Select onValueChange={handleChange}>
            <SelectTrigger
                className="w-[180px]"
                disabled={!isChatView || isDisabled}
            >
                <SelectValue placeholder="Select MCP server" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available MCP servers</SelectLabel>
                    {mcpServers.map(server => (
                        <SelectItem key={server.id} value={server.id}>
                            {server.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
