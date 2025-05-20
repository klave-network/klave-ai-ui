import { createFileRoute } from '@tanstack/react-router';
import { useUserChat, storeActions, store } from '@/store';
import { useEffect, useRef, useCallback, useState } from 'react';
import { inferenceAddPrompt } from '@/api/sanctum';
import { ArrowUp, Mic, Video, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { StreamedResponse } from '@/components/streamed-response';

export const Route = createFileRoute('/_auth/chat/$id')({
    component: RouteComponent
});

function RouteComponent() {
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { id } = Route.useParams();
    const currentUser = localStorage.getItem('currentUser');
    const chat = useUserChat(currentUser ?? '', id);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Track AI message currently streaming
    const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
        null
    );

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserPrompt(event.target.value);
    };

    const handleSend = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);

        const contextName = `stories_context_${id}`;
        try {
            const addPromptInput = {
                context_name: contextName,
                user_prompt: userPrompt
            };
            console.log(userPrompt);
            const result1 = await inferenceAddPrompt(addPromptInput);

            console.log('Add Prompt Result:', result1);
        } catch (error) {
            console.error('Error: ', error);
            setError('Failed to send message');
        }
    }, [userPrompt]);

    // On mount: if AI message missing, add placeholder and start streaming
    useEffect(() => {
        if (!chat) return;

        const aiMessageExists = chat.messages.some((m) => m.role === 'ai');
        if (!aiMessageExists) {
            const aiMessageId = crypto.randomUUID();
            storeActions.addMessage(currentUser ?? '', id, {
                id: aiMessageId,
                role: 'ai',
                content: '',
                timestamp: Date.now()
            });
            setStreamingMessageId(aiMessageId);
        }
    }, [chat, id, currentUser]);

    const handleStreamComplete = (fullResponse: string) => {
        if (!streamingMessageId || !chat || !currentUser) return;

        const updatedMessages = chat.messages.map((msg) =>
            msg.id === streamingMessageId
                ? { ...msg, content: fullResponse }
                : msg
        );

        store.setState((prev) => ({
            ...prev,
            [currentUser]: prev[currentUser].map((c) =>
                c.id === id ? { ...c, messages: updatedMessages } : c
            )
        }));

        setStreamingMessageId(null);
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chat?.messages]);

    if (!chat) return <div className="p-4">Chat not found</div>;

    return (
        <div className="flex flex-col items-center h-full">
            {/* Chat */}
            <div className="flex-1 overflow-auto mb-4 w-full">
                {chat.messages.map(({ id, role, content }) => {
                    const isStreaming =
                        streamingMessageId === id && role === 'ai';

                    return (
                        <div
                            key={id}
                            className={`w-fit mb-2 px-4 py-2 rounded-xl ${
                                role === 'user'
                                    ? 'bg-gray-300 ml-auto text-gray-900'
                                    : 'bg-blue-100 mr-auto text-blue-900'
                            }`}
                        >
                            {isStreaming ? (
                                <StreamedResponse
                                    context_name={id}
                                    onComplete={handleStreamComplete}
                                />
                            ) : (
                                content
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Text input */}
            <div className="max-w-3xl w-full mt-auto">
                {error && (
                    <p
                        className="bg-red-100 border border-red-500 rounded-xl p-4 text-red-500 text-sm font-semibold mb-2"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
                <div className="flex flex-col gap-4 rounded-xl border p-4">
                    <textarea
                        placeholder="Ask anything..."
                        className="flex-1 focus:outline-none resize-none field-sizing-content max-h-80"
                        rows={2}
                        value={userPrompt}
                        onChange={handleChange}
                        aria-label="User prompt input"
                    />
                    <div className="flex justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                className="hover:cursor-pointer"
                            >
                                <Paperclip className="h-4 w-4" />
                                Add files
                            </Button>
                            <Button
                                variant="ghost"
                                className="hover:cursor-pointer"
                            >
                                <Mic className="h-4 w-4" />
                                Use microphone
                            </Button>
                            <Button
                                variant="ghost"
                                className="hover:cursor-pointer"
                            >
                                <Video className="h-4 w-4" />
                                Use camera
                            </Button>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="hover:cursor-pointer"
                                        onClick={handleSend}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Send message</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}
