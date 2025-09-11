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
import { useCurrentUser, useCurrentUserChatSettings, useMcpServers, useUserChat } from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function McpSelector() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();

    const isChatView = location.pathname === '/chat' || location.pathname === '/chat/lense';
    const mcpServers = useMcpServers();

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
