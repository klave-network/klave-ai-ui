import * as React from 'react';
import {
    AudioWaveform,
    FolderKanban,
    Command,
    GalleryVerticalEnd,
    LifeBuoy,
    Settings,
    MessageCirclePlus,
    Users,
    Boxes,
    FolderCode
} from 'lucide-react';

import { NavHeader } from '@/components/nav/header';
import { NavAdmin } from '@/components/nav/admin';
import { NavChats } from '@/components/nav/chats';
import { NavSettings } from '@/components/nav/settings';
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
        name: 'shadcn',
        email: 'm@example.com',
        avatar: '/avatars/shadcn.jpg'
    },
    teams: [
        {
            name: 'Acme Inc',
            logo: GalleryVerticalEnd,
            plan: 'Enterprise'
        },
        {
            name: 'Acme Corp.',
            logo: AudioWaveform,
            plan: 'Startup'
        },
        {
            name: 'Evil Corp.',
            logo: Command,
            plan: 'Free'
        }
    ],
    navMain: [
        {
            title: 'New chat',
            url: '/chat',
            icon: MessageCirclePlus
        },
        {
            title: 'Projects',
            url: '/projects',
            icon: FolderKanban
        },
        {
            title: 'Models',
            url: '/models',
            icon: FolderCode
        },
        {
            title: 'Templates',
            url: '/templates',
            icon: Boxes
        },
        {
            title: 'Community',
            url: '/community',
            icon: Users
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

const chats = [
    {
        title: 'Chat 1',
        url: '/chat/1'
    },
    {
        title: 'Chat 2',
        url: '/chat/2'
    },
    {
        title: 'Chat 3',
        url: '/chat/3'
    }
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <NavHeader teams={routes.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavAdmin items={routes.navMain} />
                <NavChats items={chats} />
                <NavSettings items={routes.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavFooter user={routes.user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
