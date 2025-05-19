import { Circle } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@tanstack/react-router';

export function NavHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Link
                    to="/"
                    className="flex items-center gap-2 self-center font-medium p-2"
                >
                    <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Circle className="size-4" />
                    </div>
                    Sanctum
                </Link>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
