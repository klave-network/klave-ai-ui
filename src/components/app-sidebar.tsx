import { LifeBuoy, MessageCirclePlus, Settings, Video } from 'lucide-react';
import * as React from 'react';

import { NavAdmin } from '@/components/nav/admin';
import { NavAdministration } from '@/components/nav/administration';
import { NavChats } from '@/components/nav/chats';
import { NavFooter } from '@/components/nav/footer';
import { NavHeader } from '@/components/nav/header';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from '@/components/ui/sidebar';

const routes = {
    user: {
        name: 'damitzi',
        email: 'damian@secretarium.org',
        avatar: '/avatars/shadcn.jpg'
    },
    navMain: [
        {
            title: 'Chat',
            url: '/chat',
            icon: MessageCirclePlus,
            className: 'bg-gradient-to-br from-kcy to-kbl/90 text-white'
        },
        {
            title: 'Lense',
            url: '/chat/lense',
            icon: Video,
            className: 'bg-gradient-to-br from-kbl to-kor/90 text-white'
        }
    ],
    navSecondary: [
        {
            title: 'Support',
            url: '#',
            icon: LifeBuoy
        },
        {
            title: 'Settings',
            url: '/settings',
            icon: Settings
        }
    ]
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <>
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader>
                    <NavHeader />
                </SidebarHeader>
                <SidebarContent>
                    <NavAdmin items={routes.navMain} />
                    <NavAdministration />
                    <NavChats />
                    {/* <NavSettings
                        items={routes.navSecondary}
                        className="mt-auto"
                    /> */}
                </SidebarContent>
                <SidebarFooter>
                    <NavFooter user={routes.user} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>
        </>
    );
}
