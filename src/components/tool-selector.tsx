import { useParams } from '@tanstack/react-router';
import { ChevronDown, Hammer } from 'lucide-react';
import { toast } from 'sonner';

import { getMcpServerCapabilities, initMcpSession } from '@/api/klave-ai-mcp-client';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useCurrentUserChatSettings, useMcpServers, useRagDataSets, useUserChat } from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function ToolSelector() {
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const mcpServers = useMcpServers();
    const ragSpaces = useRagDataSets();
    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const chatExists = Boolean(currentChat);
    const isDisabled = chatExists;

    // Get current selections from chat settings
    const selectedTool = currentChat?.chatSettings?.currentMcpServer ?? chatSettings?.currentMcpServer ?? '';
    const selectedSpace = currentChat?.chatSettings?.ragSpace ?? chatSettings?.ragSpace ?? '';

    // Filter RAG spaces for a specific tool
    const getRagSpacesForTool = (toolId: string) => {
        const tool = mcpServers.find(s => s.id === toolId);
        if (!tool)
            return [];
        // Filter RAG spaces based on tool_name matching any of the tool's tools array
        return ragSpaces.filter(space =>
            tool.name.includes(space.tool_name)
        );
    };

    const handleToolSelect = async (toolId: string) => {
        if (isDisabled)
            return;

        try {
            const tool = mcpServers.find(s => s.id === toolId);
            if (!tool) {
                toast.error('Tool not found');
                return;
            }

            // Clear space selection when switching tools
            const newSettings = {
                ...chatSettings,
                currentMcpServer: toolId,
                ragSpace: '', // Clear space when switching tools
                useRag: false // Disable RAG when clearing space
            };

            // Initialize MCP session for the selected tool
            const caps = await getMcpServerCapabilities({ server_id: toolId });
            const session = await initMcpSession({ server_id: toolId, capabilities: caps.capabilities });

            // Add session to store and update settings
            storeActions.addMcpSessions(currentUser, [session]);
            storeActions.updateChatSettings(currentUser, {
                ...newSettings,
                sessionId: session.session_id
            });

            toast.success(`Tool "${tool.name}" selected and session initialized`);
        }
        catch (error) {
            toast.error('Failed to select tool');
            console.error('Error selecting tool:', error);
        }
    };

    const handleSpaceSelect = (spaceId: string) => {
        if (isDisabled)
            return;

        try {
            // Follow the same pattern as space-selector: toggle deselect on same selection
            const newSelectedSpace = selectedSpace === spaceId ? '' : spaceId;

            storeActions.updateChatSettings(currentUser, {
                ...chatSettings,
                useRag: newSelectedSpace !== '',
                ragSpace: newSelectedSpace
            });

            toast.success(newSelectedSpace ? 'Space selected' : 'Space deselected');
        }
        catch (error) {
            toast.error('Failed to update space selection');
            console.error('Error updating space selection:', error);
        }
    };

    const getSelectedToolName = () => {
        const tool = mcpServers.find(s => s.id === selectedTool);
        return tool?.name || null;
    };

    const getSelectedSpaceName = () => {
        const space = ragSpaces.find(s => s.rag_id === selectedSpace);
        return space?.table_name || null;
    };

    if (mcpServers.length === 0) {
        return (
            <div className="text-gray-500 text-sm italic">
                No tools available
            </div>
        );
    }

    const toolName = getSelectedToolName();
    const spaceName = getSelectedSpaceName();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    disabled={isDisabled}
                    className="flex items-center gap-2"
                >
                    <Hammer className="h-4 w-4" />
                    {toolName
                        ? (
                                <span>
                                    Tools
                                    {spaceName && (
                                        <span className="text-blue-600">
                                            {' '}
                                            +
                                            Space
                                        </span>
                                    )}
                                </span>
                            )
                        : (
                                'Select Tool'
                            )}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuLabel>Available tools</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {mcpServers.map((tool) => {
                    const toolSpaces = getRagSpacesForTool(tool.id);

                    return (
                        <DropdownMenuSub key={tool.id}>
                            <DropdownMenuSubTrigger
                                className={`flex gap-2 items-center justify-between ${
                                    selectedTool === tool.id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => handleToolSelect(tool.id)}
                            >
                                <span>{tool.name}</span>
                                {selectedTool === tool.id && (
                                    <span className="text-blue-600 text-xs">Selected</span>
                                )}
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-auto">
                                <DropdownMenuLabel>
                                    Available spaces
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {toolSpaces.length === 0
                                    ? (
                                            <div className="px-2 py-1.5 text-sm text-gray-500">
                                                No spaces available for this tool
                                            </div>
                                        )
                                    : (
                                            toolSpaces.map(space => (
                                                <DropdownMenuCheckboxItem
                                                    key={space.rag_id}
                                                    checked={selectedTool === tool.id && selectedSpace === space.rag_id}
                                                    onCheckedChange={() => {
                                                        // First select the tool if not already selected
                                                        if (selectedTool !== tool.id) {
                                                            handleToolSelect(tool.id);
                                                        }
                                                        // Then handle space selection
                                                        handleSpaceSelect(space.rag_id);
                                                    }}
                                                    disabled={selectedTool !== tool.id}
                                                >
                                                    {space.table_name}
                                                </DropdownMenuCheckboxItem>
                                            ))
                                        )}
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
