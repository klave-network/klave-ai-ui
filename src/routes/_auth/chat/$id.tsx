import { createFileRoute } from '@tanstack/react-router';
import { useUserChat, storeActions, store } from '@/store';
import { useEffect, useRef, useCallback, useState } from 'react';
import { inferenceAddPrompt } from '@/api/sanctum';
import { StreamedResponse } from '@/components/streamed-response';
import { generateSimpleId } from '@/lib/utils';
import { ChatInput } from '@/components/chat-input';

export const Route = createFileRoute('/_auth/chat/$id')({
    component: RouteComponent
});

function RouteComponent() {
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { id: chatId } = Route.useParams();
    const currentUser = localStorage.getItem('currentUser') ?? '';
    const chat = useUserChat(currentUser ?? '', chatId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track AI message currently streaming
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
        null
    );

    const handleSend = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);

        try {
            const promptToSend = userPrompt; // Capture prompt before clearing
            setUserPrompt('');

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

    // On mount: if AI message missing, add placeholder and start streaming
    useEffect(() => {
        if (!chat) return;

        const aiMessageExists = chat.messages.some((m) => m.role === 'ai');
        if (!aiMessageExists) {
            const aiMessageId = generateSimpleId();
            storeActions.addMessage(currentUser ?? '', chatId, {
                id: aiMessageId,
                role: 'ai',
                content: '',
                timestamp: Date.now()
            });
            setStreamingMessageId(aiMessageId);
        }
    }, []);

    const handleStreamComplete = (messageId: string, fullResponse: string) => {
        if (!chat || !currentUser) return;

        const updatedMessages = chat.messages.map((msg) =>
            msg.id === messageId ? { ...msg, content: fullResponse } : msg
        );

        store.setState((prev) => ({
            ...prev,
            [currentUser]: prev[currentUser].map((c) =>
                c.id === chatId ? { ...c, messages: updatedMessages } : c
            )
        }));

        if (streamingMessageId === messageId) {
            setStreamingMessageId(null);
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
                                    : 'bg-blue-100 mr-auto text-blue-900'
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
            />
        </div>
    );
}
