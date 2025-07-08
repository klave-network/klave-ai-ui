import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useLocation } from '@tanstack/react-router';
import { useUserModels } from '@/store';
import { CUR_MODEL_KEY, CUR_USER_KEY } from '@/lib/constants';

export const ModelSelector = () => {
    const location = useLocation();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const allModels = useUserModels(currentUser);

    // Filter models based on current route
    const models = allModels.filter((model) => {
        if (location.pathname === '/chat') {
            return model.description?.task === 'text-generation';
        } else if (location.pathname === '/chat/video') {
            return model.description?.task === 'image-text-to-text';
        }
        // For other routes, show all models
        return true;
    });

    // Get route-specific localStorage key
    const getModelKey = () => {
        if (location.pathname === '/chat') {
            return `${CUR_MODEL_KEY}_chat`;
        } else if (location.pathname === '/chat/video') {
            return `${CUR_MODEL_KEY}_video`;
        }
        return CUR_MODEL_KEY;
    };

    // Get current model for this route, fallback to first available model
    const getCurrentModel = () => {
        const savedModel = localStorage.getItem(getModelKey());
        // Check if saved model exists in filtered models
        if (savedModel && models.some((model) => model.name === savedModel)) {
            return savedModel;
        }
        // Fallback to first available model
        return models[0]?.name || '';
    };

    const currentModel = getCurrentModel();

    // Check if we're in chat view
    const isInChatView =
        location.pathname === '/chat' || location.pathname === '/chat/video';

    if (!models || models.length === 0) {
        return (
            <div className="text-gray-500">
                No models available. Please add a model first.
            </div>
        );
    }

    return (
        <Select
            value={currentModel}
            onValueChange={(value) =>
                localStorage.setItem(getModelKey(), value)
            }
        >
            <SelectTrigger className="w-[180px]" disabled={!isInChatView}>
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
