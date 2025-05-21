import { createFileRoute } from '@tanstack/react-router';
import { VideoRecorder } from '@/components/video-recorder';

export const Route = createFileRoute('/_auth/chat/video')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div>
            <VideoRecorder />
        </div>
    );
}
