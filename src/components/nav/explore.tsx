import { Link } from '@tanstack/react-router';
import { Blocks, Hammer, Puzzle } from 'lucide-react';
import * as React from 'react';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';

export function NavExplore({
    ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel>Explore</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {/* <SidebarMenuItem key="lense">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/chat/lense"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Video />
                                <span>Lense</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem> */}
                    <SidebarMenuItem key="models">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/models"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Puzzle />
                                <span>Models</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="spaces">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/spaces"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Blocks />
                                <span>Spaces</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* <SidebarMenuItem key="mcp-servers">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/mcp-servers"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <MCPIcon />
                                <span>MCP Servers</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem> */}
                    <SidebarMenuItem key="tools">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/tools"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Hammer />
                                <span>Tools</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
