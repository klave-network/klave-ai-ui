import { createFileRoute } from '@tanstack/react-router';
import { getModels, getRagList } from '@/api/klave-ai';
import { storeActions } from '@/store';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/')({
    component: RouteComponent,
    loader: async () => {
        const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
        const models = await getModels();
        const ragSets = await getRagList();
        storeActions.addModels(currentUser, models);
        storeActions.addRagDataSets(
            currentUser,
            Array.isArray(ragSets) ? ragSets : []
        );
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
                <h2 className="text-2xl md:text-3xl">
                    Welcome to <b>Klave for AI</b>
                </h2>
                <p className="text-center max-w-xl text-gray-500">
                    Introducing Klave for AI
                    <br />
                    Run your models and generate ideas or get help in total
                    privacy !
                </p>
            </div>
        </div>
    );
}
