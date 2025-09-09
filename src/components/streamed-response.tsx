import React, { useEffect, useRef, useState } from 'react';

import { getLlmContextResponse } from '@/api/klave-ai-mcp-client';
import { inferenceGetResponse } from '@/api/klave-ai-multimodal';
import { LoadingDots } from '@/components/loading-dots';
import { CUR_USER_KEY } from '@/lib/constants';
import { useUserChatSettings } from '@/store';

type StreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string) => void;
    onToolCallRequired?: (toolCall: any) => void; // New callback for tool calls
};

export const StreamedResponse: React.FC<StreamedResponseProps> = ({
    context_name,
    onComplete,
    onToolCallRequired
}) => {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const fullResponseRef = useRef(''); // accumulate full response here
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const chatSettings = useUserChatSettings(currentUser);

    useEffect(() => {
        isMountedRef.current = true;

        setResponse('');
        fullResponseRef.current = '';
        setLoading(true);
        setError(null);

        if (chatSettings.currentMcpServer) {
            getLlmContextResponse({ context_name }, (result) => {
                if (!isMountedRef.current)
                    return true; // stop if unmounted

                if (typeof result === 'string') {
                    setError(result);
                    setLoading(false);
                    isMountedRef.current = false;
                    return true; // stop streaming on error
                }

                const chunkText = String.fromCharCode(...result.piece);
                fullResponseRef.current += chunkText;
                setResponse(fullResponseRef.current);

                // If tool call is detected, delegate to parent instead of handling here
                if (result.has_tool_call && onToolCallRequired) {
                    console.log('Tool call detected, delegating to parent:', result.tool_call);
                    setLoading(false);
                    onToolCallRequired(result.tool_call);
                    isMountedRef.current = false;
                    return true; // stop current streaming
                }

                if (result.complete === true) {
                    setLoading(false);
                    onComplete(fullResponseRef.current);
                    isMountedRef.current = false;
                }

                return result.complete === true;
            });
        }
        else {
            inferenceGetResponse({ context_name }, (result) => {
                if (!isMountedRef.current)
                    return true; // stop if unmounted

                if (typeof result === 'string') {
                    setError(result);
                    setLoading(false);
                    isMountedRef.current = false;
                    return true; // stop streaming on error
                }

                const chunkText = String.fromCharCode(...result.piece);
                fullResponseRef.current += chunkText;
                setResponse(fullResponseRef.current);

                if (result.complete === true) {
                    setLoading(false);
                    onComplete(fullResponseRef.current);
                    isMountedRef.current = false;
                }

                return result.complete === true;
            });
        }
    }, [context_name, onComplete, onToolCallRequired]);

    // Count words in the current response
    const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="whitespace-pre-wrap">
            {loading && wordCount < 5
                ? (
                        <div className="flex flex-col">
                            <span className="animate-pulse">Generating</span>
                            <LoadingDots />
                        </div>
                    )
                : (
                        response
                    )}
            {error && (
                <span className="text-red-600">
                    Error:
                    {error}
                </span>
            )}
        </div>
    );
};
