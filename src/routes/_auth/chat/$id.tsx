import { Utils } from '@secretarium/connector';
import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon } from 'lucide-react';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

import type { Reference } from '@/lib/types';

import {
    getQuote,
    isConnected as isKlaveConnected,
    verifyQuote
} from '@/api/klave';
import { callMcpTool, sendLlmContextPrompt } from '@/api/klave-ai-mcp-client';
import { inferenceAddPrompt, inferenceAddRagPrompt } from '@/api/klave-ai-multimodal';
import { ChatInput } from '@/components/chat-input';
import { LoadingDots } from '@/components/loading-dots';
import { StreamedResponse } from '@/components/streamed-response';
import { Button } from '@/components/ui/button';
import { useCurrentUser, useCurrentUserChatSettings, useUserChat } from '@/hooks/use-klave-ai-store';
import { copyToClipboard, generateSimpleId } from '@/lib/utils';
import { store, storeActions } from '@/store';

export const Route = createFileRoute('/_auth/chat/$id')({
    component: RouteComponent,
    loader: async ({ params }) => {
        // On mount: if AI message missing, add placeholder and start streaming
        const { id: chatId } = params;
        const currentUser = store.state.currentUser ?? '';
        const chat = store.state.userData[currentUser]?.chats?.find(
            chat => chat.id === chatId
        );

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
            <div className="flex flex-col  items-center gap-2">
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
    const { firstResponseId, challenge, currentTime, quote, verification }
        = Route.useLoaderData();
    const currentUser = useCurrentUser() ?? '';
    const chat = useUserChat(currentUser, chatId);
    const chatSettings = useCurrentUserChatSettings();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track AI message currently streaming
    const [streamingMessageId, setStreamingMessageId]
        = useState<string>(firstResponseId);

    // Track tool call processing
    const [processingToolCall, setProcessingToolCall] = useState(false);

    const handleSend = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);
        const promptToSend = userPrompt;
        let references: Reference[] = [];
        setUserPrompt('');

        try {
            if (chat?.chatSettings.ragSpace) {
                const result = await inferenceAddRagPrompt({
                    context_name: `context_${chatId}`,
                    user_prompt: promptToSend,
                    rag_id: chat?.chatSettings.ragSpace,
                    n_rag_chunks: chat?.chatSettings.ragChunks,
                    n_max_augmentations: 2
                });
                const seen = new Set();
                references = result.references.filter(
                    ref => !seen.has(ref.filename) && seen.add(ref.filename)
                );
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
                timestamp: Date.now(),
                references
            });

            storeActions.addMessage(currentUser, chatId, {
                id: aiMessageId,
                content: '',
                role: 'ai',
                timestamp: Date.now()
            });

            setStreamingMessageId(aiMessageId);
        }
        catch (error) {
            console.error('Error: ', error);
            setError('Failed to send message');
        }
    }, [userPrompt, chatId, currentUser]);

    const handleStreamComplete = (messageId: string, fullResponse: string) => {
        if (!chat || !currentUser)
            return;

        storeActions.updateMessage(
            currentUser,
            chatId,
            messageId,
            { content: fullResponse }
        );

        if (streamingMessageId === messageId) {
            setStreamingMessageId('');
        }
    };

    // Handle MCP tool calls
    const handleToolCallRequired = useCallback(async (toolCall: any) => {
        if (!chatSettings.sessionId || processingToolCall)
            return;

        setProcessingToolCall(true);

        try {
            console.log('Processing tool call:', toolCall);
            // Call the MCP tool
            const toolResult = await callMcpTool({
                session_id: chatSettings.sessionId,
                tool_name: toolCall.function_name,
                arguments: toolCall.arguments
            });

            console.log('Tool call result:', toolResult);

            // Send the tool result back to the LLM context
            const promptResult = await sendLlmContextPrompt({
                context_name: `context_${chatId}`,
                user_prompt: `Tool result: ${JSON.stringify(toolResult)}`
            });

            console.log('LLM prompt sent with tool result:', promptResult);

            // Create a new AI message for the tool response and start streaming again
            const aiMessageId = generateSimpleId();

            storeActions.addMessage(currentUser, chatId, {
                id: aiMessageId,
                content: '',
                role: 'ai',
                timestamp: Date.now(),
                toolCalled: toolCall.function_name
            });

            setStreamingMessageId(aiMessageId);
        }
        catch (error) {
            console.error('Error processing tool call:', error);
            setError('Failed to process tool call');
        }
        finally {
            setProcessingToolCall(false);
        }
    }, [chatId, currentUser, chatSettings.sessionId, processingToolCall]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    if (!chat)
        return <div className="p-4">Chat not found</div>;

    return (
        <div className="flex flex-col items-center h-full">
            {/* Chat */}
            <div className="max-w-2xl flex-1 overflow-auto mb-4 w-full">
                {chat.messages.map(({ id, role, content, references, toolCalled }) => {
                    const isStreaming
                        = streamingMessageId === id && role === 'ai';
                    return (
                        <Fragment key={id}>
                            <div
                                className={`w-fit mb-2 px-4 py-2 rounded-xl ${
                                    role === 'user'
                                        ? 'bg-gray-100 ml-auto'
                                        : 'mr-auto'
                                }`}
                            >
                                {isStreaming
                                    ? (
                                            <StreamedResponse
                                                key={`stream-${id}`}
                                                context_name={`context_${chatId}`}
                                                onComplete={fullResponse =>
                                                    handleStreamComplete(
                                                        id,
                                                        fullResponse
                                                    )}
                                                onToolCallRequired={handleToolCallRequired}
                                            />
                                        )
                                    : (
                                            <div className="flex flex-col">
                                                <div className="prose">
                                                    <ReactMarkdown>
                                                        {content}
                                                    </ReactMarkdown>
                                                </div>
                                                {role === 'ai' && (
                                                    <div className="mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="size-6 hover:cursor-pointer"
                                                            onClick={() =>
                                                                copyToClipboard(content, 'Chat response')}
                                                        >
                                                            <CopyIcon className="h-3.5 w-3.5" />
                                                            <span className="sr-only">Copy Chat response</span>
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                            </div>
                            {references?.length
                                ? (
                                        <div className="text-xs flex items-center gap-2 px-4">
                                            <h2 className="font-semibold mb-2">
                                                References:
                                                {' '}
                                            </h2>
                                            {references.map(reference => (
                                                <div
                                                    key={reference.filename}
                                                    className="text-xs mb-2 bg-blue-200 rounded-lg px-2 py-1"
                                                >
                                                    {reference.filename}
                                                </div>
                                            ))}
                                        </div>
                                    )
                                : null}
                            {(toolCalled && !isStreaming && !processingToolCall) && (
                                <div className="text-xs flex items-center gap-2 px-4">
                                    <h2 className="font-semibold mb-2">
                                        Tools called:
                                        {' '}
                                    </h2>
                                    <div className="text-xs mb-2 bg-blue-200 rounded-lg px-2 py-1">
                                        {toolCalled}
                                    </div>
                                </div>
                            )}
                        </Fragment>
                    );
                })}

                {/* Show tool processing indicator */}
                {processingToolCall && (
                    <div className="w-fit mb-2 px-4 py-2 rounded-xl mr-auto">
                        <div className="flex flex-col">
                            <span className="animate-pulse text-blue-600">
                                Calling MCP tool...
                            </span>
                            <LoadingDots />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <ChatInput
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                error={error}
                onSend={handleSend}
                isDisabled={streamingMessageId !== '' || processingToolCall}
                secureButton={{ currentTime, challenge, quote, verification }}
                agentMode={chatSettings.agentMode}
            />
        </div>
    );
}
