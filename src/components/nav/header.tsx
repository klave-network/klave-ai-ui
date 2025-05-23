import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

export function NavHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Logo className="p-2" />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
