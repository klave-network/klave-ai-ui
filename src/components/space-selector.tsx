import { useParams } from '@tanstack/react-router';
import { Blocks, ChevronDown } from 'lucide-react';
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

export function SpaceSelector() {
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const mcpServers = useMcpServers();
    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const chatExists = Boolean(currentChat);
    const isDisabled = chatExists;

    // Get current selections from chat settings
    const selectedTools = currentChat?.chatSettings?.selectedTools ?? chatSettings?.selectedTools ?? [];

    // Get all available tools from RAG servers only (is_rag: true)
    const ragServers = mcpServers.filter(server => server.description?.is_rag === true);
    const allSpaceTools = ragServers.flatMap(server =>
        (server.tools || []).map(tool => ({
            ...tool,
            serverId: server.id,
            serverName: server.name
        }))
    );

    const handleSpaceToggle = (toolName: string) => {
        if (isDisabled)
            return;

        try {
            const currentSelections = selectedTools || [];
            let newSelections: string[];

            if (currentSelections.includes(toolName)) {
                // Remove tool
                newSelections = currentSelections.filter(t => t !== toolName);
                toast.success(`Space "${toolName}" deselected`);
            }
            else {
                // Add tool
                newSelections = [...currentSelections, toolName];
                toast.success(`Space "${toolName}" selected`);
            }

            storeActions.updateChatSettings(currentUser, {
                ...chatSettings,
                selectedTools: newSelections
            });
        }
        catch (error) {
            toast.error('Failed to update space selection');
            console.error('Error updating space selection:', error);
        }
    };

    if (allSpaceTools.length === 0) {
        return null;
    }

    // Count only selected spaces (tools from RAG servers)
    const selectedSpaceNames = allSpaceTools.map(tool => tool.name);
    const selectedCount = selectedTools.filter(tool => selectedSpaceNames.includes(tool)).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={isDisabled}
                    className="flex items-center gap-2 border-none shadow-none"
                >
                    <Blocks className="h-4 w-4" />
                    <span>
                        {selectedCount > 0 ? `Spaces (${selectedCount})` : 'Select Spaces'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                <DropdownMenuLabel>Available Spaces</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {ragServers.map((server) => {
                    if (!server.tools || server.tools.length === 0)
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
                                    onCheckedChange={() => handleSpaceToggle(tool.name)}
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
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
