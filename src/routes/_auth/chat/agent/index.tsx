import { Utils } from '@secretarium/connector';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import type { Reference } from '@/lib/types';

import { getQuote, verifyQuote } from '@/api/klave';
import { createLlmContext, sendLlmContextPrompt } from '@/api/klave-ai-mcp-client';
import { ChatInput } from '@/components/chat-input';
import { LoadingDots } from '@/components/loading-dots';
import { useCurrentUser, useCurrentUserChatSettings, useLlModels } from '@/hooks/use-klave-ai-store';
import { generateSimpleId } from '@/lib/utils';
import { storeActions } from '@/store';

export const Route = createFileRoute('/_auth/chat/agent/')({
    component: RouteComponent,
    loader: async () => {
        const challenge = Array.from(Utils.getRandomBytes(64));
        const currentTime = new Date().getTime();
        const quote = await getQuote({ challenge });
        const verification = await verifyQuote({
            quote: quote.quote_binary,
            current_time: currentTime
        });

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
    const { currentTime, challenge, quote, verification }
        = Route.useLoaderData();

    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const currentUser = useCurrentUser();

    // Use LL models
    const llModels = useLlModels();
    // Use chat settings from store
    const chatSettings = useCurrentUserChatSettings();

    // Determine current model from chatSettings or fallback to first LL model
    const currentModel = chatSettings?.currentLlModel || llModels[0]?.name || '';

    const handleCreateContext = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);

        const contextId = generateSimpleId();
        const contextName = `stories_context_${contextId}`;
        const references: Reference[] = [];

        try {
            // Step 1: Create LLM Context with MCP Integration
            await createLlmContext({
                context: {
                    model_name: currentModel,
                    context_name: contextName,
                    mode: 'chat',
                    system_prompt: `You are a helpful assistant with deep expertise in Secretarium’s protocols, identity systems, and secure computing concepts. You have access to a knowledge base of Secretarium documents and a set of specialized tools via the MCP server, including:
                        - Document search and retrieval
                        - Identity protocol analysis
                        - Ceremony process review
                        - Security and cryptography best practices
                        When users ask about Secretarium, its identity protocol, ceremony processes, or trustless self-sovereign identity, use the available tools to fetch, analyze, and present the most relevant information from the RAG database. Always reference document details and explain concepts clearly for both technical and non-technical users. If a question involves security, privacy, or cryptography, use the tools to highlight best practices and important considerations. Today is ${new Date().toLocaleDateString()}.`,
                    temperature: 0.3, // Lower temperature for more factual responses
                    topp: 0.9,
                    steps: 512,
                    sliding_window: false,
                    embeddings: false,
                    multimodal: false
                },
                session_ids: [chatSettings.sessionId ?? '']
            });
            // Step 2: Send prompt to LLM Context
            await sendLlmContextPrompt({
                context_name: contextName,
                user_prompt: userPrompt
            });

            const message = {
                id: generateSimpleId(),
                content: userPrompt,
                role: 'user' as const,
                references
            };

            // Prepare settings matching your store's ChatSettings type
            const settings = {
                systemPrompt:
                        chatSettings?.systemPrompt
                        ?? 'You are a helpful assistant.',
                temperature: 0.3,
                topp: 0.9,
                steps: 512,
                slidingWindow: chatSettings?.slidingWindow ?? false,
                useRag: chatSettings?.useRag ?? false,
                currentLlModel: currentModel,
                currentVlModel: chatSettings?.currentVlModel ?? '',
                currentMcpServer: chatSettings?.currentMcpServer ?? '',
                ragSpace: chatSettings?.ragSpace ?? '',
                ragChunks: chatSettings?.ragChunks ?? 2,
                sessionId: chatSettings.sessionId
            };

            storeActions.createChat(currentUser ?? '', contextId, message, settings);
            navigate({ to: `/chat/agent/${contextId}`, search: true });
        }
        catch (err) {
            console.error('Error: ', err);
            setError('Failed to create context');
        }
    }, [
        userPrompt,
        currentModel,
        chatSettings,
        currentUser,
        navigate
    ]);

    return (
        <div className="flex flex-col items-center h-full">
            {/* Welcome screen */}
            <div className="flex flex-col gap-6 items-center justify-center h-full w-full">
                <h2 className="font-owners font-medium tracking-wide text-2xl md:text-3xl">What's on your mind?</h2>
                {/* Chat input */}
                <ChatInput
                    userPrompt={userPrompt}
                    setUserPrompt={setUserPrompt}
                    error={error}
                    onSend={handleCreateContext}
                    agentMode={true}
                    isDisabled={false}
                    secureButton={{ currentTime, challenge, quote, verification }}
                />
            </div>

        </div>
    );
}
