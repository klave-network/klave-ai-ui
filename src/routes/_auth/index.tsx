import { createFileRoute } from '@tanstack/react-router';
import { getModels } from '@/api/klave-ai';
import { storeActions } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/')({
    component: RouteComponent,
    loader: async () => {
        const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
        const models = await getModels();
        storeActions.addModels(currentUser, models);
    },
    pendingComponent: () => (
        <div className="min-h-screen grid place-items-center">
            <div className="flex items-center gap-2">
                <span>Loading models...</span>
            </div>
        </div>
    )
});

function RouteComponent() {
    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-4xl">Welcome to Klave-AI</h2>
                <p className="text-center max-w-xl">
                    Introducing Klave-AI – an advanced AI to challenge
                    assumptions, generate ideas and help you think beyond the
                    obvious.
                </p>
            </div>
        </div>
    );
}
