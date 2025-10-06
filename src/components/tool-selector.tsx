import { useParams } from '@tanstack/react-router';
import { ChevronDown, Hammer } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useCurrentUserChatSettings, useMcpServers, useUserChat } from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function ToolSelector() {
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const mcpServers = useMcpServers();
    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const chatExists = Boolean(currentChat);
    const isDisabled = chatExists;

    // Get current selections from chat settings
    const selectedTools = currentChat?.chatSettings?.selectedTools ?? chatSettings?.selectedTools ?? [];

    // Get all available tools from all servers
    const allTools = mcpServers.flatMap(server =>
        server.tools.map(tool => ({
            ...tool,
            serverId: server.id,
            serverName: server.name
        }))
    );

    const handleToolToggle = (toolName: string) => {
        if (isDisabled)
            return;

        try {
            const currentSelections = selectedTools || [];
            let newSelections: string[];

            if (currentSelections.includes(toolName)) {
                // Remove tool
                newSelections = currentSelections.filter(t => t !== toolName);
                toast.success(`Tool "${toolName}" deselected`);
            }
            else {
                // Add tool
                newSelections = [...currentSelections, toolName];
                toast.success(`Tool "${toolName}" selected`);
            }

            storeActions.updateChatSettings(currentUser, {
                ...chatSettings,
                selectedTools: newSelections
            });
        }
        catch (error) {
            toast.error('Failed to update tool selection');
            console.error('Error updating tool selection:', error);
        }
    };

    if (allTools.length === 0) {
        return (
            <div className="text-gray-500 text-sm italic">
                No tools available
            </div>
        );
    }

    const selectedCount = selectedTools.length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={isDisabled}
                    className="flex items-center gap-2"
                >
                    <Hammer className="h-4 w-4" />
                    <span>
                        {selectedCount > 0 ? `Tools (${selectedCount})` : 'Select Tools'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Available Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {mcpServers.map((server) => {
                    if (server.tools.length === 0)
                        return null;

                    return (
                        <div key={server.id} className="py-2">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                {server.name}
                            </div>
                            {server.tools.map(tool => (
                                <DropdownMenuCheckboxItem
                                    key={`${server.id}-${tool.name}`}
                                    checked={selectedTools.includes(tool.name)}
                                    onCheckedChange={() => handleToolToggle(tool.name)}
                                    className="pl-6"
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium">{tool.name}</span>
                                        {tool.description && (
                                            <span className="text-xs text-muted-foreground">
                                                {tool.description}
                                            </span>
                                        )}
                                    </div>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </div>
                    );
                })}

                {allTools.length === 0 && (
                    <div className="px-2 py-1.5 text-sm text-gray-500">
                        No tools available
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
