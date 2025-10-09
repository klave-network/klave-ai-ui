import { createFileRoute, Outlet, useLocation, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { ChatSettingsModal } from '@/components/chat-settings-modal';
import { LenseSettingsModal } from '@/components/lense-settings-modal';
import { ModelSelector } from '@/components/model-selector';
import { SpaceSelector } from '@/components/space-selector';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCurrentUser, useCurrentUserChatSettings, useUserChat } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/chat')({
    component: RouteComponent
});

function RouteComponent() {
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const params = useParams({ strict: false });
    const currentUser = useCurrentUser() ?? '';
    const chatSettings = useCurrentUserChatSettings();
    const currentChat = useUserChat(currentUser, params?.id ?? '');
    const chatExists = Boolean(currentChat);

    const isAgentMode = chatExists ? Boolean(currentChat?.chatSettings?.agentMode) : Boolean(chatSettings.agentMode);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <header className={`sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 bg-background transition-all ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 ${isScrolled ? 'shadow-md' : ''}`}>
                <div className="w-full flex items-center justify-between gap-2 px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger side="left" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <ModelSelector />
                        {isAgentMode && (
                            <>
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 data-[orientation=vertical]:h-4"
                                />
                                <SpaceSelector />
                            </>
                        )}
                    </div>
                    {location.pathname === '/chat/lense' ? <LenseSettingsModal /> : <ChatSettingsModal />}
                </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <Outlet />
            </div>
        </>
    );
}
