import { createFileRoute } from '@tanstack/react-router';

import { getModels as getMcpModels, getMcpServers } from '@/api/klave-ai-mcp-client';
import { getModels as getMultimodalModels } from '@/api/klave-ai-multimodal';
import { getRagList } from '@/api/klave-ai-rag-mcp-server';
import { CUR_USER_KEY } from '@/lib/constants';
import { storeActions } from '@/store';

export const Route = createFileRoute('/_auth/')({
    component: RouteComponent,
    loader: async () => {
        const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
        const models = await getMultimodalModels();
        const mcpModels = await getMcpModels();
        const ragSets = await getRagList();
        const mcpServers = await getMcpServers();
        // const caps = await getMcpServerCapabilities({ server_id: mcpServers[0].id });
        // const session = await initMcpSession({ server_id: mcpServers[0].id, capabilities: caps.capabilities });
        console.log('Logs: ', ragSets, mcpServers);
        storeActions.addModels(currentUser, [...models, ...mcpModels]);
        storeActions.addMcpServers(currentUser, mcpServers);
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
                    Welcome to
                    {' '}
                    <b>Klave AI</b>
                </h2>
                <p className="text-center max-w-xl text-gray-500">
                    Introducing Klave AI
                    <br />
                    Run your models and generate ideas or get help in total
                    privacy!
                </p>
            </div>
        </div>
    );
}
