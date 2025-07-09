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
import { useState, useEffect } from 'react';

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
        if (location.pathname.includes('/video')) {
            return `${CUR_MODEL_KEY}_video`;
        } else {
            return `${CUR_MODEL_KEY}_chat`;
        }
    };

    // Use state to track current model
    const [currentModel, setCurrentModel] = useState(() => {
        const savedModel = localStorage.getItem(getModelKey());
        // Check if saved model exists in filtered models
        if (savedModel && models.some((model) => model.name === savedModel)) {
            return savedModel;
        }
        // Fallback to first available model
        return models[0]?.name || '';
    });

    // Update current model when route changes or models change
    useEffect(() => {
        const savedModel = localStorage.getItem(getModelKey());

        if (savedModel && models.some((model) => model.name === savedModel)) {
            setCurrentModel(savedModel);
        } else {
            const fallbackModel = models[0]?.name || '';
            setCurrentModel(fallbackModel);
            if (fallbackModel) {
                localStorage.setItem(getModelKey(), fallbackModel);
            }
        }
    }, [location.pathname, models]);

    // Handle model selection
    const handleModelChange = (value: string) => {
        setCurrentModel(value);
        localStorage.setItem(getModelKey(), value);
    };

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
        <Select value={currentModel} onValueChange={handleModelChange}>
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
