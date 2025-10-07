import { Utils } from '@secretarium/connector';
import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon, Hammer, Lightbulb } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import { getQuote, isConnected as isKlaveConnected, verifyQuote } from '@/api/klave';
import { callMcpTool, sendLlmContextPrompt } from '@/api/klave-ai-mcp-client';
import { inferenceAddPrompt } from '@/api/klave-ai-multimodal';
import { ChatInput } from '@/components/chat-input';
import { LoadingDots } from '@/components/loading-dots';
import { StreamedResponse } from '@/components/streamed-response';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useCurrentUserChatSettings, useUserChat } from '@/hooks/use-klave-ai-store';
import { copyToClipboard, generateSimpleId } from '@/lib/utils';
import { store, storeActions } from '@/store';

export const Route = createFileRoute('/_auth/chat/$id')({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { id: chatId } = params;
        const currentUser = store.state.currentUser ?? '';
        const chat = store.state.userData[currentUser]?.chats?.find(chat => chat.id === chatId);

        // attestation information
        const challenge = Array.from(Utils.getRandomBytes(64));
        const currentTime = new Date().getTime();
        const isConnected = await isKlaveConnected();
        const quote = isConnected ? await getQuote({ challenge }) : undefined;
        const verification
            = isConnected && quote
                ? await verifyQuote({
                        quote: quote.quote_binary,
                        current_time: currentTime
                    })
                : undefined;

        if (!chat) {
            return {
                firstResponseId: '',
                challenge,
                currentTime,
                quote,
                verification
            };
        }

        const aiMessageExists = chat.messages.some(m => m.role === 'ai');
        if (!aiMessageExists) {
            const aiMessageId = generateSimpleId();
            storeActions.addMessage(currentUser ?? '', chatId, {
                id: aiMessageId,
                role: 'ai',
                content: '',
                timestamp: Date.now()
            });

            return {
                firstResponseId: aiMessageId,
                challenge,
                currentTime,
                quote,
                verification
            };
        }

        return {
            firstResponseId: '',
            challenge,
            currentTime,
            quote,
            verification
        };
    },
    pendingComponent: () => (
        <div className="min-h-screen grid place-items-center">
            <div className="flex flex-col items-center gap-2">
                <span>Creating chat</span>
                <div className="flex flex-col justify-center items-center text-center mb-4">
                    <LoadingDots />
                </div>
            </div>
        </div>
    )
});

function RouteComponent() {
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { id: chatId } = Route.useParams();
    const { firstResponseId, challenge, currentTime, quote, verification } = Route.useLoaderData();
    const currentUser = useCurrentUser() ?? '';
    const chat = useUserChat(currentUser, chatId);
    const chatSettings = useCurrentUserChatSettings();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track AI message currently streaming
    const [streamingMessageId, setStreamingMessageId] = useState<string>(firstResponseId);

    // Track tool call processing
    const [processingToolCall, setProcessingToolCall] = useState(false);

    // Track stream trigger key - increment this to restart streaming after tool execution
    const [streamTriggerKey, setStreamTriggerKey] = useState(0);

    const handleSend = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);
        const promptToSend = userPrompt;
        setUserPrompt('');

        try {
            if (chat?.chatSettings.agentMode) {
                // Agent mode: use MCP client with sendLlmContextPrompt
                await sendLlmContextPrompt({
                    context_name: `context_${chatId}`,
                    user_prompt: promptToSend,
                    token_id: ''
                });
            }
            else {
                await inferenceAddPrompt({
                    context_name: `context_${chatId}`,
                    user_prompt: promptToSend
                });
            }

            const userMessageId = generateSimpleId();
            const aiMessageId = generateSimpleId();

            storeActions.addMessage(currentUser, chatId, {
                id: userMessageId,
                content: promptToSend,
                role: 'user',
                timestamp: Date.now()
            });

            storeActions.addMessage(currentUser, chatId, {
                id: aiMessageId,
                content: '',
                role: 'ai',
                timestamp: Date.now()
            });

            setStreamingMessageId(aiMessageId);
            setStreamTriggerKey(0); // Reset trigger key for new message
        }
        catch (error) {
            console.error('Error: ', error);
            setError('Failed to send message');
        }
    }, [userPrompt, chatId, currentUser, chat?.chatSettings.agentMode]);

    const handleStreamComplete = (messageId: string, fullResponse: string, reasoningContent: string) => {
        if (!chat || !currentUser)
            return;

        storeActions.updateMessage(currentUser, chatId, messageId, {
            content: fullResponse,
            reasoningContent
        });

        // Only stop streaming if we're not waiting for a tool call response
        if (streamingMessageId === messageId) {
            setStreamingMessageId('');
        }
    };

    // Handle MCP tool calls - following test.js pattern
    const handleToolCallRequired = useCallback(
        async (toolCall: unknown) => {
            if (processingToolCall)
                return;

            setProcessingToolCall(true);

            try {
                console.log('🔧 Processing tool call:', toolCall);
                const toolCallData = toolCall as { name: string; arguments: unknown };

                // Find the session ID for the tool being called
                const currentUserSessions = store.state.userData[currentUser ?? '']?.mcpSessions ?? [];
                const mcpServers = store.state.mcpServers;

                // Find which server has this tool
                const serverWithTool = mcpServers.find(server =>
                    server.tools.some(tool => tool.name === toolCallData.name)
                );

                if (!serverWithTool) {
                    throw new Error(`No server found with tool: ${toolCallData.name}`);
                }

                // Find the session for this server
                const session = currentUserSessions.find(
                    s => s.server_id === serverWithTool.id
                );

                if (!session) {
                    throw new Error(`No session found for server: ${serverWithTool.name}`);
                }

                // Step 1: Call the MCP tool (matches test.js mcpClientToolCall)
                const toolResult = await callMcpTool({
                    session_id: session.session_id,
                    tool_name: toolCallData.name,
                    arguments: toolCallData.arguments
                });

                console.log('✅ Tool call result received:', toolResult);

                // Store the tool result in the message
                const newToolResult = {
                    toolName: toolCallData.name,
                    result: toolResult,
                    timestamp: Date.now()
                };

                console.log('📦 Storing tool result to message:', newToolResult);
                storeActions.addToolResult(currentUser, chatId, streamingMessageId, newToolResult);

                // Step 2: Send the tool result back to the LLM context (matches test.js)
                await sendLlmContextPrompt({
                    context_name: `context_${chatId}`,
                    user_prompt: `Tool result: ${JSON.stringify(toolResult)}`,
                    token_id: ''
                });

                console.log('📤 Tool result sent back to LLM, continuing stream...');

                // Step 3: Increment trigger key to restart streaming (matches test.js loop pattern)
                setProcessingToolCall(false);
                setStreamTriggerKey(prev => prev + 1);
            }
            catch (error) {
                console.error('❌ Error processing tool call:', error);
                setError('Failed to process tool call');
                setProcessingToolCall(false);
            }
        },
        [chatId, processingToolCall, currentUser, streamingMessageId, chat?.chatSettings.selectedTools]
    );

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    if (!chat)
        return <div className="p-4">Chat not found</div>;

    return (
        <div className="flex flex-col h-full">
            {/* Chat */}
            <div className="flex-1 overflow-auto pb-32">
                <div className="max-w-2xl mx-auto w-full">
                    {chat.messages.map(({ id, role, content, toolCalled, toolResults, reasoningContent }) => {
                        const isStreaming = streamingMessageId === id && role === 'ai';
                        return (
                            <Fragment key={id}>
                                <div
                                    className={`w-fit mb-2 px-4 py-2 rounded-xl ${
                                        role === 'user' ? 'bg-klave-blue/20 ml-auto' : 'mr-auto'
                                    }`}
                                >
                                    {isStreaming
                                        ? (
                                                <StreamedResponse
                                                    key={`stream-${id}`}
                                                    context_name={`context_${chatId}`}
                                                    onComplete={(fullResponse, reasoning) => handleStreamComplete(id, fullResponse, reasoning)}
                                                    onToolCallRequired={handleToolCallRequired}
                                                    triggerKey={streamTriggerKey}
                                                />
                                            )
                                        : (
                                                <div className="flex flex-col">
                                                    <div className="prose">
                                                        <ReactMarkdown>{content}</ReactMarkdown>
                                                    </div>
                                                    {role === 'ai' && (
                                                        <div className="mt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-6 hover:cursor-pointer"
                                                                onClick={() => copyToClipboard(content, 'Chat response')}
                                                            >
                                                                <CopyIcon className="h-3.5 w-3.5" />
                                                                <span className="sr-only">Copy Chat response</span>
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                </div>

                                {/* Display reasoning content in accordion */}
                                {!isStreaming && reasoningContent && reasoningContent.trim() && (
                                    <div className="w-full mb-2">
                                        <Accordion type="single" collapsible className="w-full">
                                            <AccordionItem value="reasoning" className="border bg-card rounded-lg px-2">
                                                <AccordionTrigger className="text-xs font-mono text-muted-foreground hover:no-underline py-2">
                                                    <span className="flex items-center gap-2 ">
                                                        <Lightbulb className="size-4" />
                                                        {' '}
                                                        Thinking...
                                                    </span>
                                                </AccordionTrigger>
                                                <AccordionContent className="text-xs text-gray-700 whitespace-pre-wrap">
                                                    {reasoningContent}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </div>
                                )}

                                {/* Display tool results from message history */}
                                {!isStreaming && toolResults && toolResults.length > 0 && (
                                    <div className="w-full mb-2">
                                        <Accordion type="multiple" className="w-full space-y-2">
                                            {toolResults.map((toolResult, idx) => (
                                                <AccordionItem
                                                    key={idx}
                                                    value={`tool-${idx}`}
                                                    className="border bg-card rounded-lg px-2"
                                                >
                                                    <AccordionTrigger className="text-xs font-mono text-muted-foreground hover:no-underline py-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex items-center gap-2">
                                                                <Hammer className="size-4" />
                                                                {toolResult.toolName}
                                                            </span>
                                                            <span className="text-xs text-gray-500 font-normal">
                                                                {new Date(toolResult.timestamp).toLocaleTimeString()}
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="bg-white rounded-lg p-3 shadow-sm">
                                                            {toolResult.result?.content && Array.isArray(toolResult.result.content)
                                                                ? (
                                                                        <div className="space-y-2">
                                                                            <div className="text-xs font-semibold text-indigo-900 mb-2">
                                                                                📚 Retrieved
                                                                                {' '}
                                                                                {toolResult.result.content.length}
                                                                                {' '}
                                                                                document chunks
                                                                            </div>
                                                                            {toolResult.result.content.map((item: any, itemIdx: number) => {
                                                                                try {
                                                                                    const data = JSON.parse(item.text);
                                                                                    return (
                                                                                        <div key={itemIdx} className="bg-gray-50 rounded p-2 border border-gray-200">
                                                                                            <div className="text-xs font-medium text-indigo-800 mb-1 flex items-center gap-1">
                                                                                                📄
                                                                                                {' '}
                                                                                                {data.filename}
                                                                                                <span className="text-gray-500">
                                                                                                    • Chunk
                                                                                                    {' '}
                                                                                                    {data.chunk_id}
                                                                                                </span>
                                                                                            </div>
                                                                                            <div className="text-xs text-gray-700">
                                                                                                {data.content}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                                catch {
                                                                                    return (
                                                                                        <div key={itemIdx} className="bg-gray-50 rounded p-2 border border-gray-200">
                                                                                            <div className="text-xs text-gray-700">
                                                                                                {item.text}
                                                                                            </div>
                                                                                        </div>
                                                                                    );
                                                                                }
                                                                            })}
                                                                        </div>
                                                                    )
                                                                : (
                                                                        <pre className="text-xs whitespace-pre-wrap overflow-x-auto max-h-60 overflow-y-auto text-gray-700">
                                                                            {JSON.stringify(toolResult.result, null, 2)}
                                                                        </pre>
                                                                    )}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                )}
                                {toolCalled && !isStreaming && !processingToolCall && (
                                    <div className="text-xs flex items-center gap-2 px-4 mb-2">
                                        <h2 className="font-semibold">Tools called: </h2>
                                        <div className="text-xs bg-blue-200 rounded-lg px-2 py-1">{toolCalled}</div>
                                    </div>
                                )}
                            </Fragment>
                        );
                    })}

                    {/* Show tool processing indicator */}
                    {processingToolCall && (
                        <div className="w-fit mb-2 px-4 py-2 rounded-xl mr-auto bg-blue-50">
                            <div className="flex flex-col">
                                <span className="animate-pulse text-blue-600">Calling MCP tool...</span>
                                <LoadingDots />
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Chat input - Fixed to bottom */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-4 z-10">
                <div className="max-w-2xl mx-auto w-full flex justify-center">
                    <ChatInput
                        userPrompt={userPrompt}
                        setUserPrompt={setUserPrompt}
                        error={error}
                        onSend={handleSend}
                        isDisabled={streamingMessageId !== '' || processingToolCall}
                        attestationButton={{ currentTime, challenge, quote, verification }}
                        agentMode={chatSettings.agentMode}
                    />
                </div>
            </div>
        </div>
    );
}
