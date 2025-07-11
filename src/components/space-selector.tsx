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
    ragSpace: '',
    ragChunks: 2
};

export const SpaceSelector = () => {
    const location = useLocation();
    const params = useParams({ strict: false });
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const rags = useUserRagDataSets(currentUser);

    const chatSettings =
        useUserChatSettings(currentUser) ?? defaultChatSettings;
    const currentChat = useUserChat(currentUser, params?.id ?? '');

    const isInChatView = location.pathname === '/chat';

    // Get selected ragSpace from currentChat settings or fallback
    const selectedRag =
        currentChat?.chatSettings.ragSpace ?? chatSettings.ragSpace ?? '';

    // Handle selection change (toggle deselect on same selection)
    const handleChange = (value: string) => {
        if (!isInChatView) return; // Prevent changes outside chat view

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
                        value={selectedRag}
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
