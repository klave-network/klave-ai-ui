import { useLocation, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
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

    return (
        <Select value={selectedRag} onValueChange={handleChange}>
            <SelectTrigger
                className="w-[180px]"
                disabled={!isInChatView}
            >
                <SelectValue placeholder="Select RAG space" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available spaces</SelectLabel>
                    {rags.map(rag => (
                        <SelectItem
                            key={rag.rag_id}
                            value={rag.rag_id}
                        >
                            {rag.table_name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
