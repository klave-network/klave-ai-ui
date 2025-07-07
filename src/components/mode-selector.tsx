import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { CUR_MODE_KEY } from '@/lib/constants';

export const ModeSelector = () => {
    const currentModel = localStorage.getItem(CUR_MODE_KEY) ?? 'chat';

    return (
        <Select
            defaultValue={currentModel}
            onValueChange={(value) => localStorage.setItem(CUR_MODE_KEY, value)}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available modes</SelectLabel>
                    <SelectItem value="generate">Generate</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
