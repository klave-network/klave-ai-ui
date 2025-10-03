import { Link } from '@tanstack/react-router';

import klaveIcon from '@/assets/klave-icon.svg';
import { Logo } from '@/components/logo';
import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';

export function NavHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="relative group/logo flex items-center justify-between gap-2 w-full">
                    {/* Collapsed: icon only */}
                    <Link
                        search
                        to="/"
                        className="hidden group-data-[collapsible=icon]:flex h-10 items-center gap-2 w-full justify-center"
                    >
                        <div className="size-6 flex items-center justify-center transition-all group-hover/logo:invisible">
                            <img src={klaveIcon} alt="klave logo" className="size-4" />
                        </div>
                    </Link>
                    {/* Expanded: horizontal logo */}
                    <Logo type="horizontal" className="pl-2 h-5 group-data-[collapsible=icon]:hidden" />
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
