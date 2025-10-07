import { createContext, use } from 'react';

export type SidebarContextProps = {
    left: {
        state: 'expanded' | 'collapsed';
        open: boolean;
        setOpen: (open: boolean) => void;
        openMobile: boolean;
        setOpenMobile: (open: boolean) => void;
        toggleSidebar: () => void;
    };
    right: {
        state: 'expanded' | 'collapsed';
        open: boolean;
        setOpen: (open: boolean) => void;
        openMobile: boolean;
        setOpenMobile: (open: boolean) => void;
        toggleSidebar: () => void;
    };
    isMobile: boolean;
};

export const SidebarContext = createContext<SidebarContextProps | null>(null);

export function useSidebar(side: 'left' | 'right' = 'left') {
    const context = use(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }

    const sidebarState = side === 'left' ? context.left : context.right;

    return {
        ...sidebarState,
        isMobile: context.isMobile
    };
}
