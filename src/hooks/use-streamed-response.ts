import { useEffect, useRef, useState } from 'react';

import { getLlmContextResponse } from '@/api/klave-ai-mcp-client';
import { inferenceGetResponse } from '@/api/klave-ai-multimodal';
import { useCurrentUserChatSettings } from '@/hooks/use-klave-ai-store';

type StreamResult = {
    piece: number[];
    complete: boolean;
    has_tool_call?: boolean;
    tool_call?: any;
};

type UseStreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string) => void;
    onToolCallRequired?: (toolCall: any) => void;
};

export function useStreamedResponse({
    context_name,
    onComplete,
    onToolCallRequired
}: UseStreamedResponseProps) {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const fullResponseRef = useRef('');
    const chatSettings = useCurrentUserChatSettings();

    const handleStreamResult = (result: StreamResult | string): boolean => {
        if (!isMountedRef.current)
            return true;

        if (typeof result === 'string') {
            setError(result);
            setLoading(false);
            isMountedRef.current = false;
            return true;
        }

        const chunkText = String.fromCharCode(...result.piece);
        fullResponseRef.current += chunkText;
        setResponse(fullResponseRef.current);

        // Handle tool calls (only relevant for MCP server)
        if (result.has_tool_call && onToolCallRequired) {
            console.log('Tool call detected, delegating to parent:', result.tool_call);
            setLoading(false);
            onToolCallRequired(result.tool_call);
            isMountedRef.current = false;
            return true;
        }

        if (result.complete) {
            setLoading(false);
            onComplete(fullResponseRef.current);
            isMountedRef.current = false;
        }

        return result.complete;
    };

    useEffect(() => {
        isMountedRef.current = true;
        setResponse('');
        fullResponseRef.current = '';
        setLoading(true);
        setError(null);

        const streamFn = chatSettings.currentLlModel.includes('Mistral-Small')
            ? getLlmContextResponse
            : inferenceGetResponse;

        streamFn({ context_name }, handleStreamResult);

        return () => {
            isMountedRef.current = false;
        };
    }, [context_name, onComplete, onToolCallRequired]);

    const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

    return {
        response,
        loading,
        error,
        wordCount
    };
}
