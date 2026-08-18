import { Link, router } from '@inertiajs/react';
import { LogOut, Settings } from 'lucide-react';
import {
    MenuGroup,
    MenuGroupLabel,
    MenuLinkItem,
    MenuSeparator,
} from '@/components/ui/menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <MenuGroupLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </MenuGroupLabel>
            <MenuSeparator />
            <MenuGroup>
                <MenuLinkItem
                    render={<Link href={edit()} onClick={cleanup} prefetch />}
                >
                    <Settings />
                    Réglages
                </MenuLinkItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuLinkItem
                render={
                    <Link
                        as="button"
                        data-test="logout-button"
                        href={logout()}
                        onClick={handleLogout}
                    />
                }
            >
                <LogOut />
                Se déconnecter
            </MenuLinkItem>
        </>
    );
}
