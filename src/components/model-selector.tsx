import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useUserModels } from '@/store';
import { CUR_MODEL_KEY, CUR_USER_KEY } from '@/lib/constants';

export const ModelSelector = () => {
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const models = useUserModels(currentUser);
    const currentModel = localStorage.getItem(CUR_MODEL_KEY) ?? models[0]?.name;

    if (!models || models.length === 0) {
        return (
            <div className="text-gray-500">
                No models available. Please add a model first.
            </div>
        );
    }

    return (
        <Select
            defaultValue={currentModel}
            onValueChange={(value) =>
                localStorage.setItem(CUR_MODEL_KEY, value)
            }
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Language model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Available language models</SelectLabel>
                    {models.map((model) => (
                        <SelectItem key={model.name} value={model.name}>
                            {model.name}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
