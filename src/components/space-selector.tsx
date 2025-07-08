import { useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUserRagDataSets, useUserChatSettings, storeActions } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';
import { toast } from 'sonner';
import { ChevronDown } from 'lucide-react';

export const SpaceSelector = () => {
    const location = useLocation();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const rags = useUserRagDataSets(currentUser);
    const { systemPrompt, temperature, topp, steps, slidingWindow } =
        useUserChatSettings(currentUser);
    const [selectedRags, setSelectedRags] = useState<Set<string>>(new Set());

    // Check if we're in chat view
    const isInChatView = location.pathname === '/chat';

    const handleChange = (ragId: string, checked: boolean) => {
        try {
            const newSelectedRags = new Set(selectedRags);

            if (checked) {
                newSelectedRags.add(ragId);
            } else {
                newSelectedRags.delete(ragId);
            }

            setSelectedRags(newSelectedRags);

            // Update chat settings with useRag based on whether any RAG is selected
            const useRag = newSelectedRags.size > 0;

            storeActions.updateChatSettings(currentUser, {
                systemPrompt,
                temperature,
                topp,
                steps,
                slidingWindow,
                useRag
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
        if (selectedRags.size === 0) return 'Spaces';
        if (selectedRags.size === 1) return `1 space selected`;
        return `${selectedRags.size} spaces selected`;
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
                    {rags.map((rag) => (
                        <DropdownMenuCheckboxItem
                            key={rag.rag_id}
                            checked={selectedRags.has(rag.rag_id)}
                            onCheckedChange={(checked) =>
                                handleChange(rag.rag_id, checked)
                            }
                        >
                            {rag.table_name}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
