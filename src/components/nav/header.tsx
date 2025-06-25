import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

export function NavHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className='pl-2 flex gap-2 items-start justify-start'>
                    <Logo type='horizontal' className="h-6" /><span className='text-2xl'>for AI</span>
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
