import { useLocation, useParams } from '@tanstack/react-router';
import { ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useCurrentUser, useCurrentUserChatSettings, useRagDataSets, useUserChat } from '@/hooks/use-klave-ai-store';
import { storeActions } from '@/store';

export function SpaceSelector() {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const rags = useRagDataSets();
    const chatSettings = useCurrentUserChatSettings();
    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const isInChatView = location.pathname === '/chat';

    // Get selected ragSpace from currentChat settings or fallback
    const selectedRag = currentChat?.chatSettings.ragSpace ?? chatSettings.ragSpace ?? '';

    // Handle selection change (toggle deselect on same selection)
    const handleChange = (value: string) => {
        if (!isInChatView)
            return; // Prevent changes outside chat view

        try {
            const newSelectedRag = selectedRag === value ? '' : value;

            storeActions.updateChatSettings(currentUser, {
                ...currentChat?.chatSettings,
                systemPrompt: chatSettings.systemPrompt,
                temperature: chatSettings.temperature,
                topp: chatSettings.topp,
                steps: chatSettings.steps,
                slidingWindow: chatSettings.slidingWindow,
                useRag: newSelectedRag !== '',
                ragSpace: newSelectedRag,
                ragChunks: chatSettings.ragChunks,
                currentLlModel: chatSettings.currentLlModel,
                currentVlModel: chatSettings.currentVlModel
            });

            toast.success('Settings updated successfully');
        }
        catch (error) {
            toast.error('Failed to update settings');
            console.error('Error updating settings:', error);
        }
    };

    if (!rags || rags.length === 0) {
        return (
            <div className="text-gray-500 text-sm italic">
                No spaces available
            </div>
        );
    }

    const getDisplayText = () => {
        if (!selectedRag)
            return 'Spaces';
        return `1 space selected`;
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild disabled={!isInChatView}>
                <Button
                    variant="outline"
                    className="w-[180px] justify-between font-normal"
                >
                    {getDisplayText()}
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>Available spaces</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                        value={selectedRag}
                        onValueChange={handleChange}
                    >
                        {rags.map(rag => (
                            <DropdownMenuRadioItem
                                key={rag.rag_id}
                                value={rag.rag_id}
                            >
                                {rag.table_name}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
