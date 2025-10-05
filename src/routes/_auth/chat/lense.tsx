import type { CameraType } from 'react-camera-pro';

import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';
import { toast } from 'sonner';

import {
    graphDeleteExecutionContext,
    graphInitExecutionContext,
    inferenceAddFrame
} from '@/api/klave-ai-multimodal';
import { StreamedResponse } from '@/components/streamed-response';
import { useCurrentUserChatSettings, useCurrentUserLenseSettings, useVlModels } from '@/hooks/use-klave-ai-store';

// Define a type for the saved responses
type SavedResponse = {
    id: string;
    timestamp: Date;
    response: string;
    contextName: string;
};

export const Route = createFileRoute('/_auth/chat/lense')({
    component: RouteComponent
});

function RouteComponent() {
    const cameraRef = useRef<CameraType | null>(null);
    const currentContextName = useRef<string | null>(null);
    const ctxId = useRef(0);
    const [shouldRun, setShouldRun] = useState(true);
    const [hasQueried, setHasQueried] = useState(false);
    const [savedResponses, setSavedResponses] = useState<SavedResponse[]>([]);

    const lenseSettings = useCurrentUserLenseSettings();
    const vlModels = useVlModels();
    const chatSettings = useCurrentUserChatSettings();

    // Use current VL model from chat settings or fallback to first VL model
    const currentModel = chatSettings?.currentVlModel || vlModels[0]?.name || '';

    const captureFrame = useCallback(async () => {
        if (currentContextName.current) {
            // Clearing previous context
            await graphDeleteExecutionContext(currentContextName.current);
            currentContextName.current = null;
        }

        const frameData = cameraRef.current?.takePhoto('base64url');
        if (!frameData) {
            console.warn('No frame data captured');
            return;
        }

        const contextName = `SmolVLM_context_${Date.now()}_${ctxId.current++}`;

        await graphInitExecutionContext({
            model_name: currentModel,
            context_name: contextName,
            system_prompt: lenseSettings.systemPrompt,
            temperature: 0.8,
            topp: 0.9,
            steps: 256,
            sliding_window: false,
            mode: 'chat',
            embeddings: false,
            multimodal: true
        });

        currentContextName.current = contextName;

        const b64frames = (frameData as string).split(',')[1];

        await inferenceAddFrame({
            context_name: contextName,
            user_prompt: lenseSettings.userPrompt,
            frame_bytes_b64: b64frames
        });

        toast.success('Snapshot sent');

        setHasQueried(true);
        setShouldRun(false);
    }, [currentModel, lenseSettings.systemPrompt, lenseSettings.userPrompt]);

    useEffect(() => {
        if (cameraRef.current && shouldRun) {
            const timer = setInterval(captureFrame, lenseSettings.snapshotFrequency);
            return () => clearInterval(timer);
        }
    }, [cameraRef, captureFrame, shouldRun, lenseSettings.snapshotFrequency]);

    const handleStreamComplete = (fullResponse: string) => {
        if (!vlModels.length || !currentContextName.current)
            return;

        // Check if response is empty or only whitespace
        if (!fullResponse || fullResponse.trim() === '') {
            setShouldRun(true);
            return;
        }

        // Save the response
        const newResponse: SavedResponse = {
            id: `${currentContextName.current}_${Date.now()}`,
            timestamp: new Date(),
            response: fullResponse,
            contextName: currentContextName.current
        };

        setSavedResponses(prev => [newResponse, ...prev]); // Add to beginning of array
        setShouldRun(true);

        // TODO: Implement chat update logic here if needed
    };

    return (
        <div className="">
            <div className="max-w-xl mx-auto p-2 bg-gradient-to-br from-klave-cyan to-klave-blue/90 rounded-md">
                <Camera
                    ref={cameraRef}
                    errorMessages={{
                        noCameraAccessible: 'No camera accessible',
                        permissionDenied: 'Permission denied',
                        switchCamera: 'Switch camera'
                    }}
                    aspectRatio={4 / 3}
                />
            </div>
            <div className="mt-4 max-w-xl mx-auto">
                {currentContextName.current && hasQueried && (
                    <StreamedResponse
                        key={currentContextName.current}
                        context_name={currentContextName.current}
                        onComplete={handleStreamComplete}
                    />
                )}
            </div>

            {/* Display saved responses */}
            {savedResponses.length > 0 && (
                <div className="mt-4 max-w-xl mx-auto">
                    <h3 className="text-lg font-semibold mb-2">Recent Observations:</h3>
                    <div className="space-y-2 overflow-y-auto">
                        {savedResponses.map(saved => (
                            <div key={saved.id} className="p-3 bg-gray-100 rounded-md">
                                <div className="text-xs text-gray-500 mb-1">
                                    {saved.timestamp.toLocaleTimeString()}
                                </div>
                                <div className="text-sm whitespace-pre-wrap">
                                    {saved.response}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
