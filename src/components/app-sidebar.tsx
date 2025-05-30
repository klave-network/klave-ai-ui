import * as React from 'react';
import {
    // FolderKanban,
    LifeBuoy,
    Settings,
    MessageCirclePlus
    // Users,
    // Boxes,
    // FolderCode,
    // Video
} from 'lucide-react';

import { NavHeader } from '@/components/nav/header';
import { NavAdmin } from '@/components/nav/admin';
import { NavChats } from '@/components/nav/chats';
// import { NavSettings } from '@/components/nav/settings';
import { NavFooter } from '@/components/nav/footer';
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
            title: 'New chat',
            url: '/chat',
            icon: MessageCirclePlus
        }
        // {
        //     title: 'Video chat',
        //     url: '/chat/video',
        //     icon: Video
        // },
        // {
        //     title: 'Projects',
        //     url: '/projects',
        //     icon: FolderKanban
        // },
        // {
        //     title: 'Models',
        //     url: '/models',
        //     icon: FolderCode
        // },
        // {
        //     title: 'Templates',
        //     url: '/templates',
        //     icon: Boxes
        // },
        // {
        //     title: 'Community',
        //     url: '/community',
        //     icon: Users
        // }
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
