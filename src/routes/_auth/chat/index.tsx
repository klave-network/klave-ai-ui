import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { graphInitExecutionContext, inferenceAddPrompt } from '@/api/sanctum';
import { generateSimpleId } from '@/lib/utils';
import { storeActions } from '@/store';
import { ChatInput } from '@/components/chat-input';
import { CUR_USER_KEY, CUR_MODEL_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/chat/')({
    component: RouteComponent
});

function RouteComponent() {
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const currentModel = localStorage.getItem(CUR_MODEL_KEY) ?? '';

    const handleCreateContext = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);

        // Create unique context ID for the chat name
        const contextId = generateSimpleId();
        const contextName = `stories_context_${contextId}`;

        try {
            await graphInitExecutionContext({
                model_name: currentModel,
                context_name: contextName,
                system_prompt: 'You are a helpful assistant.',
                temperature: 0.8,
                topp: 0.9,
                steps: 256,
                sliding_window: false,
                mode: 'generate'
            });

            await inferenceAddPrompt({
                context_name: contextName,
                user_prompt: userPrompt
            });

            // Create and add new chat to tanstack store
            storeActions.createChat(currentUser, contextId, {
                id: generateSimpleId(),
                content: userPrompt,
                role: 'user'
            });
            navigate({ to: `/chat/${contextId}` });
        } catch (error) {
            console.error('Error: ', error);
            setError('Failed to create context');
        }
    }, [userPrompt]);

    return (
        <div className="flex flex-col items-center h-full">
            {/* Welcome screen */}
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-4xl">
                    Welcome to Sanctum by Klave
                </h2>
                <p className="text-center max-w-xl">
                    Introducing Sanctum by Klave – an advanced AI to challenge
                    assumptions, generate ideas and help you think beyond the
                    obvious.
                </p>
            </div>

            {/* Chat input */}
            <ChatInput
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                error={error}
                onSend={handleCreateContext}
            />
        </div>
    );
}
