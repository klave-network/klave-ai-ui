import { Utils } from '@secretarium/connector';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useState } from 'react';

import { getQuote, verifyQuote } from '@/api/klave';
import {
    createLlmContext,
    getModels as getMcpModels,
    getMcpServerCapabilities,
    getMcpServers,
    getMcpTools,
    initMcpSession,
    sendLlmContextPrompt
} from '@/api/klave-ai-mcp-client';
import {
    getModels as getMultimodalModels,
    graphInitExecutionContext,
    inferenceAddPrompt
} from '@/api/klave-ai-multimodal';
import { getRagList } from '@/api/klave-ai-rag-mcp-server';
import { ChatInput } from '@/components/chat-input';
import { ChatSettingsModal } from '@/components/chat-settings-modal';
import { LoadingDots } from '@/components/loading-dots';
import { ModelSelector } from '@/components/model-selector';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUser, useCurrentUserChatSettings } from '@/hooks/use-klave-ai-store';
import { generateSimpleId } from '@/lib/utils';
import { store, storeActions } from '@/store';

export const Route = createFileRoute('/_auth/')({
    component: RouteComponent,
    loader: async () => {
        const currentUser = store.state.currentUser ?? '';
        const models = await getMultimodalModels();
        const mcpModels = await getMcpModels();
        const ragSets = await getRagList();
        const mcpServers = await getMcpServers();

        storeActions.addModels(currentUser, [...models]);
        storeActions.addMcpModels(mcpModels);
        storeActions.addMcpServers(mcpServers);
        storeActions.addRagDataSets(ragSets);

        // Initialize MCP sessions for all servers and fetch their tools
        const mcpSessions = [];
        for (const server of mcpServers) {
            try {
                // Get capabilities for this server
                const capsResponse = await getMcpServerCapabilities({ server_id: server.id });

                // Initialize session
                const session = await initMcpSession({
                    server_id: server.id,
                    capabilities: capsResponse.capabilities
                });

                mcpSessions.push(session);

                // Fetch tools for this session
                const toolsResponse = await getMcpTools({ session_id: session.session_id });

                // Update the server with its tools
                if (toolsResponse && toolsResponse.tools) {
                    storeActions.updateMcpServerTools(server.id, toolsResponse.tools);
                }
            }
            catch (error) {
                console.error(`Failed to initialize MCP server ${server.name}:`, error);
            }
        }

        // Store all sessions for the current user
        if (currentUser && mcpSessions.length > 0) {
            storeActions.addMcpSessions(currentUser, mcpSessions);
        }

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
                <span>Initializing Klave AI</span>
                <div className="flex flex-col justify-center items-center text-center mb-4">
                    <LoadingDots />
                </div>
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
                const selectedToolNames = chatSettings.selectedTools ?? [];
                const sessionIds: string[] = [];

                if (selectedToolNames.length > 0) {
                    // Get sessions for selected tools
                    const currentUserSessions = store.state.userData[currentUser ?? '']?.mcpSessions ?? [];
                    const mcpServers = store.state.mcpServers;

                    for (const toolName of selectedToolNames) {
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
                        system_prompt: `You are a helpful assistant with deep expertise in Secretarium's protocols, identity systems, and secure computing concepts. You have access to a knowledge base of Secretarium documents and a set of specialized tools via the MCP server, including:
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
                    selectedTools: chatSettings?.selectedTools ?? []
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
                    selectedTools: chatSettings?.selectedTools ?? []
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
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="w-full flex items-center justify-between gap-2 px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger />
                        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
                        <ModelSelector />
                    </div>
                    <ChatSettingsModal />
                </div>
            </header>

            <div className="flex flex-col items-center h-full">
                <div className="flex flex-col gap-6 items-center justify-center h-full w-full">
                    <h2 className="font-owners font-medium tracking-wide text-2xl md:text-3xl">What's on your mind?</h2>
                    <ChatInput
                        userPrompt={userPrompt}
                        setUserPrompt={setUserPrompt}
                        error={error}
                        onSend={handleCreateContext}
                        isDisabled={false}
                        secureButton={{ currentTime, challenge, quote, verification }}
                        agentMode={chatSettings.agentMode}
                    />
                </div>
            </div>
        </>
    );
}
