import { Bot, Hammer, Layers, LifeBuoy, MessageCircle, MessageCirclePlus, Settings, Video } from 'lucide-react';
import * as React from 'react';

import { NavChats } from '@/components/nav/chats';
import { NavExplore } from '@/components/nav/explore';
import { NavFooter } from '@/components/nav/footer';
import { NavHeader } from '@/components/nav/header';
import { NavMain } from '@/components/nav/main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail
} from '@/components/ui/sidebar';

import { MCPIcon } from './mcp-icon';

const routes = {
    user: {
        name: 'damitzi',
        email: 'damian@secretarium.org',
        avatar: '/avatars/shadcn.jpg'
    },
    navMain: [
        {
            title: 'New chat',
            url: '/',
            icon: MessageCirclePlus,
            className: 'bg-gradient-to-br from-klave-blue via-klave-blue to-klave-cyan/90 text-white'
        },
        {
            title: 'Lense',
            url: '/chat/lense',
            icon: Video,
            className: 'bg-gradient-to-br from-klave-blue via-klave-blue to-klave-cyan/90 text-white'
        }
    ],
    navExplore: [
        {
            title: 'Chats',
            url: '/chats',
            icon: MessageCircle
        },
        {
            title: 'Models',
            url: '/models',
            icon: Bot
        },
        {
            title: 'Spaces',
            url: '/spaces',
            icon: Layers
        },
        {
            title: 'MCP Servers',
            url: '/mcp-servers',
            icon: MCPIcon
        },
        {
            title: 'Tools',
            url: '/tools',
            icon: Hammer
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
                    <NavMain items={routes.navMain} />
                    <NavExplore />
                    <NavChats />
                    {/* <NavSettings
                        items={routes.navSecondary}
                        className="mt-auto",
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
