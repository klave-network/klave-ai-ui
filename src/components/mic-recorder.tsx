import { useEffect, useRef, useState } from 'react';

export function MicRecorder() {
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
        null
    );
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [recordingTime, setRecordingTime] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const RECORDING_MAX_DURATION = 240; // 4 minutes in seconds

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
        if (!audioStream) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    setAudioStream(stream);
                    const recorder = new MediaRecorder(stream);
                    setMediaRecorder(recorder);

                    let audioChunks: BlobPart[] = [];

                    recorder.ondataavailable = (event: BlobEvent) => {
                        if (event.data.size > 0) {
                            audioChunks.push(event.data);
                        }
                    };

                    recorder.onstop = () => {
                        const audioBlob = new Blob(audioChunks, {
                            type: 'audio/wav'
                        });
                        setAudioBlob(audioBlob);
                        audioChunks = []; // reset chunks for next recording
                        // console.log('audioBlob', audioBlob);
                    };
                })
                .catch((error) => {
                    console.error('Error accessing microphone:', error);
                });
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            // Also stop audio stream tracks on unmount to release mic
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [audioStream]);

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
        setAudioBlob(null);

        timerRef.current = setInterval(() => {
            setRecordingTime((prevTime) => {
                if (prevTime >= RECORDING_MAX_DURATION - 1) {
                    stopRecording();
                    return RECORDING_MAX_DURATION;
                }
                return prevTime + 1;
            });
        }, 1000);
    };

    // Event handler type for button click
    const handleToggleRecording = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        event.preventDefault();
        if (isRecording) {
            stopRecording();
        }
        else {
            startRecording();
        }
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    };

    return (
        <div>
            <button
                onClick={handleToggleRecording}
                className="bg-red-400 hover:opacity-80 text-white font-bold py-2 px-4 rounded"
                type="button"
            >
                {isRecording
                    ? (
                            <>
                                <span
                                    className={`mr-3 ${isRecording && 'animate-pulse'}`}
                                >
                                    ●
                                </span>
                                {' '}
                                Stop Recording
                            </>
                        )
                    : audioBlob
                        ? (
                                'Redo recording'
                            )
                        : (
                                'Start Recording'
                            )}
            </button>
            <div>
                {isRecording && (
                    <div>
                        <p>Recording...</p>
                        <p>
                            Time:
                            {formatTime(recordingTime)}
                        </p>
                    </div>
                )}
            </div>
            {audioBlob && (
                <>
                    <div>Preview recording before submitting:</div>
                    <audio controls>
                        <source
                            src={URL.createObjectURL(audioBlob)}
                            type="audio/wav"
                        />
                    </audio>
                </>
            )}
        </div>
    );
}
