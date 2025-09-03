import { Play, RotateCw, StopCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function VideoRecorder() {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const timerRef = useRef<number | null>(null);
    const videoPreviewRef = useRef<HTMLVideoElement>(null);
    const RECORDING_MAX_DURATION = 240; // 4 minutes max

    useEffect(() => {
        if (!('MediaRecorder' in window)) {
            console.error('MediaRecorder not supported');
            return;
        }
        navigator.mediaDevices
            .getUserMedia({ audio: true, video: true })
            .then((stream) => {
                // console.log('Stream obtained:', stream);
                stream
                    .getTracks()
                    .forEach(track => console.log('Track:', track.kind));
            })
            .catch((err) => {
                console.error('Permission denied or error:', err);
            });
    }, []);

    useEffect(() => {
        // Request webcam video + audio on mount
        if (!mediaStream) {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setMediaStream(stream);
                    if (videoPreviewRef.current) {
                        videoPreviewRef.current.srcObject = stream;
                    }

                    const recorder = new MediaRecorder(stream, {
                        mimeType: 'video/webm'
                    });
                    setMediaRecorder(recorder);

                    let chunks: BlobPart[] = [];

                    recorder.ondataavailable = (event: BlobEvent) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };

                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: 'video/webm' });
                        setVideoBlob(blob);
                        chunks = [];
                    };
                })
                .catch((err) => {
                    console.error('Error accessing webcam:', err);
                });
        }

        return () => {
            // Cleanup on unmount
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);

    const stopRecording = () => {
        if (!mediaRecorder)
            return;

        mediaRecorder.stop();
        setIsRecording(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const startRecording = () => {
        if (!mediaRecorder)
            return;

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingTime(0);
        setVideoBlob(null);

        timerRef.current = window.setInterval(() => {
            setRecordingTime((prev) => {
                if (prev >= RECORDING_MAX_DURATION - 1) {
                    stopRecording();
                    return RECORDING_MAX_DURATION;
                }
                return prev + 1;
            });
        }, 1000);
    };

    const handleToggleRecording = (e: React.MouseEvent<HTMLButtonElement>) => {
        // console.log('handleToggleRecording');
        e.preventDefault();
        if (isRecording) {
            stopRecording();
        }
        else {
            startRecording();
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            <video
                ref={videoPreviewRef}
                className="w-full rounded border border-gray-300 mb-4"
                autoPlay
                muted
                playsInline
            />
            <Button
                type="button"
                onClick={handleToggleRecording}
                className={cn(
                    'hover:cursor-pointer w-full rounded font-bold',
                    isRecording
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                )}
            >
                {isRecording
                    ? (
                            <>
                                <StopCircle className="animate-pulse" />
                                {' '}
                                Stop Recording
                            </>
                        )
                    : videoBlob
                        ? (
                                <>
                                    <RotateCw />
                                    {' '}
                                    Redo Recording
                                </>
                            )
                        : (
                                <>
                                    <Play />
                                    {' '}
                                    Start Recording
                                </>
                            )}
            </Button>

            {isRecording && (
                <p className="mt-2 text-center text-gray-700">
                    Recording...
                    {' '}
                    {formatTime(recordingTime)}
                </p>
            )}

            {videoBlob && (
                <div className="mt-4">
                    <h3 className="mb-2 font-semibold">Preview Recording:</h3>
                    <video
                        controls
                        className="w-full rounded border border-gray-300"
                        src={URL.createObjectURL(videoBlob)}
                    />
                </div>
            )}
        </div>
    );
}
