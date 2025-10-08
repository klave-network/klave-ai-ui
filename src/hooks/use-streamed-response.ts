import { useEffect, useRef, useState } from 'react';

import type { ChunkResult, McpChunkResult } from '@/lib/types';

import { getLlmContextResponse } from '@/api/klave-ai-mcp-client';
import { inferenceGetResponse } from '@/api/klave-ai-multimodal';
import { useCurrentUserChatSettings } from '@/hooks/use-klave-ai-store';

type UseStreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string, reasoningContent: string) => void;
    onToolCallRequired?: (toolCall: any) => void;
    triggerKey?: number; // Used to re-trigger streaming after tool execution
};

export function useStreamedResponse({
    context_name,
    onComplete,
    onToolCallRequired,
    triggerKey = 0
}: UseStreamedResponseProps) {
    const [response, setResponse] = useState('');
    const [reasoningContent, setReasoningContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const fullResponseRef = useRef('');
    const reasoningRef = useRef('');
    const chatSettings = useCurrentUserChatSettings();
    const toolCallInProgressRef = useRef(false);

    // Handler for MCP server response (pieces-based format from test.js)
    const handleMcpStreamResult = (result: McpChunkResult): boolean => {
        // console.log('📦 Received result:', JSON.stringify(result, null, 2));
        // console.log('🔍 isMountedRef.current:', isMountedRef.current);

        if (!isMountedRef.current) {
            // console.log('⚠️ Not mounted, returning true to stop stream');
            return true;
        }

        // Process pieces array (new format from backend)
        if (typeof result === 'object' && result.pieces && result.pieces.length > 0) {
            for (const piece of result.pieces) {
                if (piece.type === 'ReasoningContent') {
                    // Append to reasoning content
                    reasoningRef.current += piece.content;
                    setReasoningContent(reasoningRef.current);
                }
                else if (piece.type === 'Content') {
                    // Append content to response
                    fullResponseRef.current += piece.content;
                    setResponse(fullResponseRef.current);
                }
                else if (piece.type === 'ToolCalls') {
                    // Handle tool call
                    try {
                        const toolCallData = JSON.parse(piece.content);
                        // DON'T set loading to false or isMountedRef to false - we want to continue after tool execution
                        // Set flag to indicate tool call is in progress
                        toolCallInProgressRef.current = true;
                        if (onToolCallRequired) {
                            onToolCallRequired(toolCallData);
                        }
                        else {
                            console.warn('⚠️ onToolCallRequired is not defined!');
                        }
                        return true; // Stop this stream, will restart after tool execution
                    }
                    catch (e) {
                        console.error('❌ Failed to parse tool call:', e);
                    }
                }
            }
        }
        else {
            // console.log('No pieces in result or result is not an object');
        }

        // Check if response is complete (only after all pieces processed)
        if (result.complete) {
            // If a tool call is in progress, don't complete - we're waiting for the next iteration
            if (toolCallInProgressRef.current) {
                toolCallInProgressRef.current = false; // Reset flag for next iteration
                // Don't call onComplete, don't set loading to false, don't set isMountedRef to false
                // Just return true to stop this stream - the next one will start when triggerKey changes
                return true;
            }

            setLoading(false);
            onComplete(fullResponseRef.current, reasoningRef.current);
            isMountedRef.current = false;
            return true;
        }

        return false;
    };

    // Handler for multimodal API response (old single-piece format)
    const handleMultimodalStreamResult = (result: ChunkResult | string): boolean => {
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

        if (result.complete) {
            setLoading(false);
            onComplete(fullResponseRef.current, '');
            isMountedRef.current = false;
        }

        return result.complete;
    };

    useEffect(() => {
        // console.log(`🚀 useEffect TRIGGERED! triggerKey: ${triggerKey}, context: ${context_name}`);
        // console.log(`🔄 Starting stream iteration (triggerKey: ${triggerKey}, context: ${context_name})`);
        // console.log(`📊 Effect deps - context_name: ${context_name}, triggerKey: ${triggerKey}`);
        // console.log(`🔧 toolCallInProgressRef.current: ${toolCallInProgressRef.current}`);
        isMountedRef.current = true;
        setLoading(true);
        setError(null);

        const streamFn = chatSettings.agentMode ? getLlmContextResponse : inferenceGetResponse;
        const handler = chatSettings.agentMode ? handleMcpStreamResult : handleMultimodalStreamResult;

        streamFn({ context_name, token_id: '', nb_pieces: 5 }, handler as any)
            .then(() => {
                console.log('Stream Promise resolved (returned true from handler)');
            })
            .catch((err) => {
                console.error('❌ Stream error:', err);
                setError('Failed to stream response');
                setLoading(false);
                isMountedRef.current = false;
            });

        return () => {
            isMountedRef.current = false;
        };
    }, [context_name, triggerKey]); // Re-run when triggerKey changes (after tool execution)

    const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

    return {
        response,
        reasoningContent,
        loading,
        error,
        wordCount
    };
}
