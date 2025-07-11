import { useState, useEffect } from 'react';
import { useLocation, useParams } from '@tanstack/react-router';
import {
    DropdownMenu,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    useUserRagDataSets,
    useUserChatSettings,
    storeActions,
    useUserChat
} from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

export const SpaceSelector = () => {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const rags = useUserRagDataSets(currentUser);
    const {
        systemPrompt,
        temperature,
        topp,
        steps,
        slidingWindow,
        modelName,
        ragSpace,
        ragChunks
    } = useUserChatSettings(currentUser);
    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const isInChatView = location.pathname === '/chat';

    // Initialize selectedRag prioritizing currentChat.ragSpace if it exists
    const [selectedRag, setSelectedRag] = useState<string | null>(
        currentChat?.chatSettings.ragSpace ?? ragSpace ?? null
    );

    // Sync selectedRag when ragSpace or currentChat.ragSpace changes and only if not in chat view
    useEffect(() => {
        if (!isInChatView) {
            setSelectedRag(
                currentChat?.chatSettings.ragSpace ?? ragSpace ?? null
            );
        }
        // Do NOT reset selectedRag when entering chat view to preserve user selection
    }, [currentChat?.chatSettings.ragSpace, ragSpace, isInChatView]);

    // Handle selection change, allowing deselect by clicking the selected item again
    const handleChange = (value: string) => {
        if (!isInChatView) return; // Prevent changes outside chat view

        try {
            const newSelectedRag = selectedRag === value ? '' : value; // '' means deselected

            setSelectedRag(newSelectedRag || null);

            const useRag = newSelectedRag !== '';

            storeActions.updateChatSettings(currentUser, {
                systemPrompt,
                temperature,
                topp,
                steps,
                slidingWindow,
                useRag,
                modelName,
                ragSpace: newSelectedRag,
                ragChunks
            });

            toast.success('Settings updated successfully');
        } catch (error) {
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
        if (!selectedRag) return 'Spaces';
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
                        value={selectedRag || ''}
                        onValueChange={handleChange}
                    >
                        {rags.map((rag) => (
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
};
