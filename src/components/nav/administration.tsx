import * as React from 'react';
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { Link } from '@tanstack/react-router';
import { Cog, Puzzle } from 'lucide-react';

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
                                to={`/models`}
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Puzzle />
                                <span>Manage Models</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {/* <SidebarMenuItem key="manage-documents">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to={`/documents`}
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Files />
                                <span>Manage Documents</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem> */}
                    <SidebarMenuItem key="manage-settings">
                        <SidebarMenuButton asChild>
                            <Link
                                search
                                to={`/settings`}
                                activeProps={{
                                    className: 'bg-sidebar-accent flex'
                                }}
                            >
                                <Cog />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
