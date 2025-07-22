import type { CameraType } from 'react-camera-pro';

import { load_image } from '@huggingface/transformers';
import prettyBytes from 'pretty-bytes';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera } from 'react-camera-pro';

import {
    graphDeleteExecutionContext,
    graphInitExecutionContext,
    inferenceAddFrame
} from '@/api/klave-ai';
import { CUR_USER_KEY } from '@/lib/constants';
import { useUserChatSettings, useUserVlModels } from '@/store';

import { StreamedResponse } from './streamed-response';

export function VideoStream() {
    const cameraRef = useRef<CameraType | null>(null);
    const currentContextName = useRef<string | null>(null);
    const ctxId = useRef(0);
    const [shouldRun, setShouldRun] = useState(true);
    const [hasQueried, setHasQueried] = useState(false);
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';

    // Get VL models and chat settings for current user
    const vlModels = useUserVlModels(currentUser);
    const chatSettings = useUserChatSettings(currentUser);

    // Use current VL model from chat settings or fallback to first VL model
    const currentModel
        = chatSettings?.currentVlModel || vlModels[0]?.name || '';

    const captureFrame = useCallback(async () => {
        if (currentContextName.current) {
            console.log(
                'Clearing previous context:',
                currentContextName.current
            );
            await graphDeleteExecutionContext(currentContextName.current);
            currentContextName.current = null;
        }

        const frameData = cameraRef.current?.takePhoto('base64url');
        if (!frameData) {
            console.warn('No frame data captured');
            return;
        }

        const frame = await getImageTreatment(frameData as string);
        const contextName = `stories_context_${ctxId.current++}`;

        console.log('Frame data:', prettyBytes(frame.data.length), frame);

        await graphInitExecutionContext({
            model_name: currentModel,
            context_name: contextName,
            system_prompt: 'What can you see?',
            temperature: 0.8,
            topp: 0.9,
            steps: 256,
            sliding_window: false,
            mode: 'chat',
            embeddings: false
        });

        currentContextName.current = contextName;

        await inferenceAddFrame({
            context_name: contextName,
            frame_bytes: Array.from(frame.data) as any
        });

        setHasQueried(true);
        setShouldRun(false);
    }, [currentModel]);

    useEffect(() => {
        if (cameraRef.current && shouldRun) {
            const timer = setInterval(captureFrame, 10000);
            return () => clearInterval(timer);
        }
    }, [cameraRef, captureFrame, shouldRun]);

    const handleStreamComplete = (fullResponse: string) => {
        if (!vlModels.length || !currentUser)
            return;

        console.log(
            'Stream complete, updating chat with response:',
            fullResponse
        );
        setShouldRun(true);

        // TODO: Implement chat update logic here if needed
    };

    console.log(currentContextName.current, hasQueried);

    return (
        <div className="max-w-xl mx-auto p-4">
            <Camera
                ref={cameraRef}
                errorMessages={{
                    noCameraAccessible: 'No camera accessible',
                    permissionDenied: 'Permission denied',
                    switchCamera: 'Switch camera'
                }}
                aspectRatio={4 / 3}
            />
            {currentContextName.current && hasQueried && (
                <StreamedResponse
                    key={currentContextName.current}
                    context_name={currentContextName.current}
                    onComplete={handleStreamComplete}
                />
            )}
        </div>
    );
}

async function getImageTreatment(data: string | null) {
    if (!data) {
        throw new Error('No image data provided');
    }

    function resizedataURL(
        datas: string,
        wantedWidth: number,
        wantedHeight: number
    ) {
        return new Promise<string>((resolve) => {
            const img = document.createElement('img');

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = wantedWidth;
                canvas.height = wantedHeight;

                ctx?.drawImage(img, 0, 0, wantedWidth, wantedHeight);
                const dataURI = canvas.toDataURL();
                resolve(dataURI);
            };

            img.src = datas;
        });
    }

    const scaledImage = await resizedataURL(data, 120, 160);
    const image = await load_image(scaledImage);

    return image;
}
