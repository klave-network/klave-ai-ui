import type { LucideIcon } from 'lucide-react';

import { Link } from '@tanstack/react-router';

import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function NavMain({
    items
}: {
    items: {
        title: string;
        url: string;
        icon: LucideIcon;
        className?: string;
    }[];
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent>
                <SidebarMenu>
                    {items.map(item => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild tooltip={item.title}>
                                <Link
                                    search
                                    to={item.url}
                                    className="h-10 flex items-center gap-2 w-full group-data-[collapsible=icon]:justify-center"
                                    activeProps={{
                                        className: 'bg-sidebar-accent'
                                    }}
                                    activeOptions={{ exact: true }}
                                >
                                    <div
                                        className={cn(
                                            // Default expanded size
                                            'rounded-md size-8 p-1 flex justify-center items-center',
                                            // When collapsed shrink to fit the icon-only sidebar
                                            'group-data-[collapsible=icon]:size-6 group-data-[collapsible=icon]:p-1',
                                            item.className
                                        )}
                                    >
                                        <item.icon className="size-4" />
                                    </div>
                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
