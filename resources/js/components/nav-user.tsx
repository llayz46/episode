import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';
import { Menu, MenuPopup, MenuTrigger } from '@/components/ui/menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { UserMenuContent } from '@/components/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    if (!auth.user) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Menu>
                    <MenuTrigger
                        render={
                            <SidebarMenuButton
                                className="text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent"
                                size="lg"
                            />
                        }
                    >
                        <UserInfo user={auth.user} />
                        <ChevronsUpDown className="ml-auto size-4" />
                    </MenuTrigger>
                    <MenuPopup
                        align="end"
                        className="min-w-56 rounded-lg"
                        side={
                            isMobile
                                ? 'bottom'
                                : state === 'collapsed'
                                  ? 'left'
                                  : 'bottom'
                        }
                    >
                        <UserMenuContent user={auth.user} />
                    </MenuPopup>
                </Menu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
