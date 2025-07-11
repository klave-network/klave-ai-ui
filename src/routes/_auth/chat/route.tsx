import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ModelSelector } from '@/components/model-selector';
import { ModeSelector } from '@/components/mode-selector';
import { SettingsModal } from '@/components/settings-modal';

export const Route = createFileRoute('/_auth/chat')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="w-full flex items-center gap-2 px-4">
                    <ModelSelector />
                    <ModeSelector />
                    <SettingsModal />
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Outlet />
            </div>
        </>
    );
}
