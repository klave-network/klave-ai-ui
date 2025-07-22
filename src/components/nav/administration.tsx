import { Link } from '@tanstack/react-router';
import { Blocks, Puzzle } from 'lucide-react';
import * as React from 'react';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';

export function NavAdministration({
    ...props
}: React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem key="manage-models">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/models"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Puzzle />
                                <span>Manage Models</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem key="manage-spaces">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to="/spaces"
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Blocks />
                                <span>Manage Spaces</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
