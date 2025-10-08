import { Utils } from '@secretarium/connector';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { getQuote, verifyQuote } from '@/api/klave';
import {
    createLlmContext,
    sendLlmContextPrompt
} from '@/api/klave-ai-mcp-client';
import {
    graphInitExecutionContext,
    inferenceAddPrompt
} from '@/api/klave-ai-multimodal';
import { ChatInput } from '@/components/chat-input';
import { useCurrentUser, useCurrentUserChatSettings } from '@/hooks/use-klave-ai-store';
import { generateSimpleId } from '@/lib/utils';
import { store, storeActions } from '@/store';

export const Route = createFileRoute('/_auth/chat/')({
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
                <span>Creating chat</span>
            </div>
        </div>
    )
});

function RouteComponent() {
    const { currentTime, challenge, quote, verification } = Route.useLoaderData();

    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const currentUser = useCurrentUser();

    // Use chat settings from store
    const chatSettings = useCurrentUserChatSettings();

    // Determine current model from chatSettings or fallback to first LL model
    const currentModel = chatSettings.agentMode ? chatSettings.currentMcpModel : chatSettings.currentLlModel;

    const handleCreateContext = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);

        const contextId = generateSimpleId();
        const contextName = `context_${contextId}`;

        try {
            if (chatSettings.agentMode) {
                // Step 1: Create LLM Context with MCP Integration
                // Get session IDs for selected tools
                const selectedTools = chatSettings.selectedTools ?? [];
                const selectedSpaces = chatSettings.selectedSpaces ?? [];
                const selectedToolsAndSpaces = [...selectedTools, ...selectedSpaces];
                const sessionIds: string[] = [];

                if (selectedToolsAndSpaces.length > 0) {
                    // Get sessions for selected tools
                    const currentUserSessions = store.state.userData[currentUser ?? '']?.mcpSessions ?? [];
                    const mcpServers = store.state.mcpServers;

                    for (const toolName of selectedToolsAndSpaces) {
                        // Find which server has this tool
                        const serverWithTool = mcpServers.find(server =>
                            server.tools.some(tool => tool.name === toolName)
                        );

                        if (serverWithTool) {
                            // Find the session for this server
                            const session = currentUserSessions.find(
                                s => s.server_id === serverWithTool.id
                            );

                            if (session && !sessionIds.includes(session.session_id)) {
                                sessionIds.push(session.session_id);
                            }
                        }
                    }
                }

                await createLlmContext({
                    context: {
                        model_name: currentModel ?? '',
                        context_name: contextName,
                        mode: 'chat',
                        system_prompt: `You are a highly capable AI assistant connected to a suite of external services via the Model Context Protocol (MCP). Your primary function is to use the available tools to fulfill user requests accurately and efficiently.\n\n\
                        Here are your core instructions:\n\n\
                        1.  **Understand User Intent:** Carefully analyze the user's request to determine their underlying goal.\n\
                        2.  **Discover and Select Tools:** You have access to a variety of tools provided by different MCP servers. The descriptions of these tools will be made available to you. Your task is to identify the most appropriate tool or sequence of tools to accomplish the user's request.\n\
                        3.  **Execute Tools:** Use the tool-calling mechanism to invoke the selected tools. You must provide all necessary arguments as specified in the tool's schema.\n\
                        4.  **Synthesize Information:** After a tool returns its result, integrate that information to form a complete and coherent response for the user. Do not simply output the raw tool result.\n\
                        5.  **Prioritize Tool Use:** Always attempt to solve the user's request by calling a tool before attempting to generate a response from your own knowledge. If a tool is available that can address the request, you must use it.\n\
                        6.  **Handle Ambiguity:** If the user's request is ambiguous, ask clarifying questions to get the information you need to select and use a tool correctly.\n\
                        7.  **Adapt to New Capabilities:** You should be able to adapt to new tools, resources, and prompts as they become available from different MCP servers. You will be provided with the latest list of capabilities for each session.\n\n\
                        Your goal is to be a resourceful, context-aware agent that leverages external systems to provide the most accurate and up-to-date information possible.\
                        Today is ${new Date().toLocaleDateString()}.`,
                        temperature: 0.0, // Lower temperature for more factual responses
                        topp: 0.1,
                        steps: 512,
                        sliding_window: false,
                        embeddings: false,
                        multimodal: false
                    },
                    session_ids: sessionIds,
                    token_id: ''
                });
                // Step 2: Send prompt to LLM Context
                await sendLlmContextPrompt({
                    context_name: contextName,
                    user_prompt: userPrompt,
                    token_id: ''
                });

                const message = {
                    id: generateSimpleId(),
                    content: userPrompt,
                    role: 'user' as const
                };

                // Prepare settings matching your store's ChatSettings type
                const settings = {
                    systemPrompt: chatSettings?.systemPrompt ?? 'You are a helpful assistant.',
                    temperature: 0.3,
                    topp: 0.9,
                    steps: 512,
                    slidingWindow: chatSettings?.slidingWindow ?? false,
                    currentLlModel: currentModel ?? '',
                    currentVlModel: chatSettings?.currentVlModel ?? '',
                    currentMcpModel: chatSettings?.currentMcpModel ?? '',
                    currentMcpServer: chatSettings?.currentMcpServer ?? '',
                    sessionId: chatSettings.sessionId,
                    agentMode: chatSettings?.agentMode ?? false,
                    selectedTools: chatSettings?.selectedTools ?? [],
                    selectedSpaces: chatSettings?.selectedSpaces ?? []
                };

                storeActions.createChat(currentUser ?? '', contextId, message, settings);
                navigate({ to: `/chat/${contextId}`, search: true });
            }
            else {
                await graphInitExecutionContext({
                    model_name: currentModel ?? '',
                    context_name: contextName,
                    system_prompt: chatSettings?.systemPrompt ?? 'You are a helpful assistant.',
                    temperature: chatSettings?.temperature ?? 0.8,
                    topp: chatSettings?.topp ?? 0.9,
                    steps: chatSettings?.steps ?? 256,
                    sliding_window: chatSettings?.slidingWindow ?? false,
                    mode: 'chat',
                    embeddings: false,
                    multimodal: false
                });

                await inferenceAddPrompt({
                    context_name: contextName,
                    user_prompt: userPrompt
                });

                const message = {
                    id: generateSimpleId(),
                    content: userPrompt,
                    role: 'user' as const
                };

                // Prepare settings matching your store's ChatSettings type
                const settings = {
                    systemPrompt: chatSettings?.systemPrompt ?? 'You are a helpful assistant.',
                    temperature: chatSettings?.temperature ?? 0.8,
                    topp: chatSettings?.topp ?? 0.9,
                    steps: chatSettings?.steps ?? 256,
                    slidingWindow: chatSettings?.slidingWindow ?? false,
                    currentLlModel: currentModel ?? '',
                    currentVlModel: chatSettings?.currentVlModel ?? '',
                    currentMcpModel: chatSettings?.currentMcpModel ?? '',
                    currentMcpServer: chatSettings?.currentMcpServer ?? '',
                    agentMode: chatSettings?.agentMode ?? false,
                    selectedTools: chatSettings?.selectedTools ?? [],
                    selectedSpaces: chatSettings?.selectedSpaces ?? []
                };

                storeActions.createChat(currentUser ?? '', contextId, message, settings);
                navigate({ to: `/chat/${contextId}`, search: true });
            }
        }
        catch (err) {
            console.error('Error: ', err);
            setError('Failed to create context');
        }
    }, [userPrompt, currentModel, chatSettings, currentUser, navigate]);

    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex flex-col gap-6 items-center justify-center h-full w-full">
                <h2 className="font-owners font-medium tracking-wide text-2xl md:text-3xl">What's on your mind?</h2>
                <ChatInput
                    userPrompt={userPrompt}
                    setUserPrompt={setUserPrompt}
                    error={error}
                    onSend={handleCreateContext}
                    isDisabled={false}
                    attestationButton={{ currentTime, challenge, quote, verification }}
                    agentMode={chatSettings.agentMode}
                />
            </div>
        </div>
    );
}
