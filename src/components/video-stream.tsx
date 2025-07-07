import { useEffect, useState, useRef, useCallback } from 'react';
import {
    graphDeleteExecutionContext,
    graphInitExecutionContext,
    inferenceAddFrame
} from '@/api/klave-ai';
import { CUR_MODEL_KEY, CUR_USER_KEY } from '@/lib/constants';
import { load_image } from '@huggingface/transformers';
import { Camera, type CameraType } from 'react-camera-pro';
import { StreamedResponse } from './streamed-response';
import { useUserModels } from '@/store';
import prettyBytes from 'pretty-bytes';

export const VideoStream = () => {
    const cameraRef = useRef<CameraType | null>(null);
    const currentContextName = useRef<string | null>(null);
    const ctxId = useRef(0);
    const [shouldRun, setShouldRun] = useState(true);
    const [hasQueried, setHasQueried] = useState(false);
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const models = useUserModels(currentUser);
    // const currentModel = localStorage.getItem(CUR_MODEL_KEY) ?? models[0].name;
    const currentModel = 'mistral';

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
            frame_bytes: frame.data
        });
        setHasQueried(true);
        setShouldRun(false);
    }, [currentModel]);

    useEffect(() => {
        if (cameraRef.current && shouldRun) {
            const timer = setInterval(captureFrame, 10000);
            return () => {
                clearInterval(timer);
            };
        }
    }, [cameraRef, captureFrame, shouldRun]);

    const handleStreamComplete = (fullResponse: string) => {
        if (!models || !currentUser) return;

        console.log(
            'Stream complete, updating chat with response:',
            fullResponse
        );
        setShouldRun(true);
        // store.setState((prev) => {
        //     const userChats = prev[currentUser]?.chats || [];
        //     const updatedChats = userChats.map((c) => {
        //         if (c.id !== chatId) return c;
        //         const updatedMessages = c.messages.map((msg) =>
        //             msg.id === messageId
        //                 ? { ...msg, content: fullResponse }
        //                 : msg
        //         );
        //         return { ...c, messages: updatedMessages };
        //     });

        //     return {
        //         ...prev,
        //         [currentUser]: {
        //             ...prev[currentUser],
        //             chats: updatedChats
        //         }
        //     };
        // });

        // if (streamingMessageId === messageId) {
        //     setStreamingMessageId('');
        // }
    };

    console.log(currentContextName.current, hasQueried);

    return (
        <div className="max-w-xl mx-auto p-4">
            {/* <div className="block w-1/2 h-1/2"> */}
            <Camera
                ref={cameraRef}
                errorMessages={{
                    noCameraAccessible: 'No camera accessible',
                    permissionDenied: 'Permission denied',
                    switchCamera: 'Switch camera'
                }}
                aspectRatio={4 / 3}
            />
            {/* <Button
                type="button"
                onClick={handleToggleRecording}
                className='hover:cursor-pointer w-full rounded font-bold'
            >Go
            </Button> */}
            {/* </div> */}
            {currentContextName.current && hasQueried ? (
                <StreamedResponse
                    key={currentContextName.current}
                    context_name={currentContextName.current}
                    onComplete={handleStreamComplete}
                />
            ) : null}
        </div>
    );
};

const getImageTreatment = async (data: string | null) => {
    if (!data) {
        throw new Error('No image data provided');
    }

    function resizedataURL(
        datas: string,
        wantedWidth: number,
        wantedHeight: number
    ) {
        return new Promise(function (resolve) {
            // We create an image to receive the Data URI
            const img = document.createElement('img');

            // When the event "onload" is triggered we can resize the image.
            img.onload = function () {
                // We create a canvas and get its context.
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // We set the dimensions at the wanted size.
                canvas.width = wantedWidth;
                canvas.height = wantedHeight;

                // We resize the image with the canvas method drawImage();
                ctx?.drawImage(img, 0, 0, wantedWidth, wantedHeight);

                const dataURI = canvas.toDataURL();

                // This is the return of the Promise
                resolve(dataURI);
            };

            // We put the Data URI in the image's src attribute
            img.src = datas;
        });
    }
    const scaledImage = await resizedataURL(data, 120, 160);
    const image = await load_image(scaledImage);

    return image;
};
