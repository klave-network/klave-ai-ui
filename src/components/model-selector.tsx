import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';

export const ModelSelector = () => {
    return (
        <Select>
            <SelectTrigger className="w-[180px] border-none shadow-none">
                <SelectValue placeholder="Language model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available language models</SelectLabel>
                    <SelectItem value="abcd">ABCD</SelectItem>
                    <SelectItem value="efgh">EFGH</SelectItem>
                    <SelectItem value="ijkl">IJKL</SelectItem>
                    <SelectItem value="mnop">MNOP</SelectItem>
                    <SelectItem value="qrst">QRST</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
