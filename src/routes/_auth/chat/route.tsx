import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router';

import { ChatSettingsModal } from '@/components/chat-settings-modal';
import { LenseSettingsModal } from '@/components/lense-settings-modal';
import { McpSelector } from '@/components/mcp-selector';
import { ModelSelector } from '@/components/model-selector';
import { SpaceSelector } from '@/components/space-selector';
import { useCurrentUserChatSettings, useRagDataSets } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/chat')({
    component: RouteComponent
});

function RouteComponent() {
    const location = useLocation();
    const chatSettings = useCurrentUserChatSettings();
    const rags = useRagDataSets();

    const currentLlModel = chatSettings.currentLlModel;
    const hasMatchingRagModel = rags?.some(rag => rag.model_name === currentLlModel);

    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="w-full flex items-center gap-2 px-4">
                    <ModelSelector />
                    {currentLlModel.includes('Mistral-Small') && <McpSelector />}
                    {location.pathname === '/chat/lense' ? null : hasMatchingRagModel && <SpaceSelector />}
                    <div className="ml-auto">
                        {location.pathname === '/chat/lense' ? <LenseSettingsModal /> : <ChatSettingsModal />}
                    </div>
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Outlet />
            </div>
        </>
    );
}
