import { createFileRoute } from '@tanstack/react-router';

import { VideoStream } from '@/components/video-stream';

export const Route = createFileRoute('/_auth/chat/video')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div>
            <VideoStream />
        </div>
    );
}
