import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { graphInitExecutionContext, inferenceAddPrompt } from '@/api/klave-ai';
import { generateSimpleId } from '@/lib/utils';
import { storeActions, useUserModels, useUserChatSettings } from '@/store';
import { ChatInput } from '@/components/chat-input';
import { CUR_USER_KEY, CUR_MODEL_KEY, CUR_MODE_KEY } from '@/lib/constants';
import {
    getQuote,
    verifyQuote,
    isConnected as isKlaveConnected
} from '@/api/klave';
import { Utils } from '@secretarium/connector';
import { LoadingDots } from '@/components/loading-dots';

export const Route = createFileRoute('/_auth/chat/')({
    component: RouteComponent,
    loader: async () => {
        const challenge = Array.from(Utils.getRandomBytes(64));
        const currentTime = new Date().getTime();
        const isConnected = await isKlaveConnected();
        const quote = isConnected ? await getQuote({ challenge }) : undefined;
        const verification =
            isConnected && quote
                ? await verifyQuote({
                      quote: quote.quote_binary,
                      current_time: currentTime
                  })
                : undefined;

        return {
            currentTime,
            challenge,
            quote,
            verification
        };
    },
    pendingComponent: () => (
        <div className="min-h-screen grid place-items-center">
            <div className="flex flex-col items-center gap-2">
                <span>Checking</span>
                <div className="flex flex-col justify-center items-center text-center mb-4">
                    <LoadingDots />
                </div>
            </div>
        </div>
    )
});

function RouteComponent() {
    const { currentTime, challenge, quote, verification } =
        Route.useLoaderData();
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const models = useUserModels(currentUser);
    const currentModel = localStorage.getItem(CUR_MODEL_KEY) ?? models[0].name;
    const currentMode = localStorage.getItem(CUR_MODE_KEY) ?? 'generate';
    const { systemPrompt, steps, slidingWindow, useRag, topp, temperature } =
        useUserChatSettings(currentUser);

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
                system_prompt: systemPrompt,
                temperature: temperature,
                topp: topp,
                steps: steps,
                sliding_window: slidingWindow,
                mode: currentMode,
                embeddings: false
            });

            await inferenceAddPrompt({
                context_name: contextName,
                user_prompt: userPrompt
            });

            // Create and add new chat to tanstack store
            storeActions.createChat(currentUser, contextId, {
                id: generateSimpleId(),
                content: userPrompt,
                role: 'user' as const
            });

            const message = {
                id: generateSimpleId(),
                content: userPrompt,
                role: 'user' as const
            };

            const settings = {
                systemPrompt: systemPrompt,
                temperature: temperature,
                topp: topp,
                steps: steps,
                slidingWindow: slidingWindow,
                useRag: useRag
            };

            // Create and add new chat to tanstack store
            storeActions.createChat(currentUser, contextId, message, settings);
            navigate({ to: `/chat/${contextId}`, search: true });
        } catch (error) {
            console.error('Error: ', error);
            setError('Failed to create context');
        }
    }, [userPrompt]);

    return (
        <div className="flex flex-col items-center h-full">
            {/* Welcome screen */}
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-4xl bg-gradient-to-r from-kor via-kbl to-kcy inline-block text-transparent bg-clip-text font-bold">
                    Hello, let's chat
                </h2>
            </div>

            {/* Chat input */}
            <ChatInput
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                error={error}
                onSend={handleCreateContext}
                secureButton={{ currentTime, challenge, quote, verification }}
            />
        </div>
    );
}
