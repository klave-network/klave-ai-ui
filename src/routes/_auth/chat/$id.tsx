import { createFileRoute } from '@tanstack/react-router';
import { useUserChat, storeActions, store } from '@/store';
import { useEffect, useRef, useCallback, useState } from 'react';
import { inferenceAddPrompt } from '@/api/klave-ai';
import { StreamedResponse } from '@/components/streamed-response';
import { generateSimpleId } from '@/lib/utils';
import { ChatInput } from '@/components/chat-input';
import { CUR_USER_KEY } from '@/lib/constants';
import { Utils } from '@secretarium/connector';
import { getQuote, verifyQuote } from '@/api/klave';

export const Route = createFileRoute('/_auth/chat/$id')({
    component: RouteComponent,
    loader: async ({ params }) => {
        // On mount: if AI message missing, add placeholder and start streaming
        const { id: chatId } = params;
        const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
        const chat = store.state[currentUser].chats.find(
            (chat) => chat.id === chatId
        );

        // attestation information
        const challenge = Array.from(Utils.getRandomBytes(64));
        const currentTime = new Date().getTime();
        const quote = await getQuote({ challenge });
        const verification = await verifyQuote({
            quote: quote.quote_binary,
            current_time: currentTime
        });

        if (!chat)
            return {
                firstResponseId: '',
                challenge,
                currentTime,
                quote,
                verification
            };

        const aiMessageExists = chat.messages.some((m) => m.role === 'ai');
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
            <div className="flex items-center gap-2">
                <span>Creating chat...</span>
            </div>
        </div>
    )
});

function RouteComponent() {
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { id: chatId } = Route.useParams();
    const { firstResponseId, challenge, currentTime, quote, verification } =
        Route.useLoaderData();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const chat = useUserChat(currentUser ?? '', chatId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track AI message currently streaming
    const [streamingMessageId, setStreamingMessageId] =
        useState<string>(firstResponseId);

    const handleSend = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);
        const promptToSend = userPrompt;
        setUserPrompt('');

        try {
            await inferenceAddPrompt({
                context_name: `stories_context_${chatId}`,
                user_prompt: promptToSend
            });

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
        } catch (error) {
            console.error('Error: ', error);
            setError('Failed to send message');
        }
    }, [userPrompt, chatId, currentUser]);

    const handleStreamComplete = (messageId: string, fullResponse: string) => {
        if (!chat || !currentUser) return;

        store.setState((prev) => {
            const userChats = prev[currentUser]?.chats || [];
            const updatedChats = userChats.map((c) => {
                if (c.id !== chatId) return c;
                const updatedMessages = c.messages.map((msg) =>
                    msg.id === messageId
                        ? { ...msg, content: fullResponse }
                        : msg
                );
                return { ...c, messages: updatedMessages };
            });

            return {
                ...prev,
                [currentUser]: {
                    ...prev[currentUser],
                    chats: updatedChats
                }
            };
        });

        if (streamingMessageId === messageId) {
            setStreamingMessageId('');
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    if (!chat) return <div className="p-4">Chat not found</div>;

    return (
        <div className="flex flex-col items-center h-full">
            {/* Chat */}
            <div className="max-w-3xl flex-1 overflow-auto mb-4 w-full">
                {chat.messages.map(({ id, role, content }) => {
                    const isStreaming =
                        streamingMessageId === id && role === 'ai';
                    return (
                        <div
                            key={id}
                            className={`w-fit mb-2 px-4 py-2 rounded-xl ${
                                role === 'user'
                                    ? 'bg-gray-100 ml-auto'
                                    : 'mr-auto'
                            }`}
                        >
                            {isStreaming ? (
                                <StreamedResponse
                                    key={`stream-${id}`}
                                    context_name={`stories_context_${chatId}`}
                                    onComplete={(fullResponse) =>
                                        handleStreamComplete(id, fullResponse)
                                    }
                                />
                            ) : (
                                content
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <ChatInput
                userPrompt={userPrompt}
                setUserPrompt={setUserPrompt}
                error={error}
                onSend={handleSend}
                isDisabled={streamingMessageId !== ''}
                secureButton={{ currentTime, challenge, quote, verification }}
            />
        </div>
    );
}
