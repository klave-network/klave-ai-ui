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

export function NavAdmin({
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
                            <SidebarMenuButton asChild>
                                <Link
                                    search
                                    to={item.url}
                                    className="h-12"
                                    activeProps={{
                                        className: 'bg-sidebar-accent'
                                    }}
                                    activeOptions={{ exact: true }}
                                >
                                    <div className={cn('rounded-md w-8 h-8 p-1 flex justify-center items-center', item.className)}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}
