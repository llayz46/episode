import { Link, router } from '@inertiajs/react';
import { LogOut, MonitorCog, ShieldCheck, UserRound } from 'lucide-react';
import {
    MenuGroup,
    MenuGroupLabel,
    MenuItem,
    MenuLinkItem,
    MenuSeparator,
} from '@/components/ui/menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { User } from '@/types';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
        router.post(logout());
    };

    return (
        <>
            <MenuGroup>
                <MenuGroupLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <UserInfo user={user} showEmail={true} />
                    </div>
                </MenuGroupLabel>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup>
                <MenuLinkItem
                    render={<Link href={edit()} onClick={cleanup} prefetch />}
                >
                    <UserRound />
                    Profil
                </MenuLinkItem>
                <MenuLinkItem
                    render={
                        <Link
                            href={editSecurity()}
                            onClick={cleanup}
                            prefetch
                        />
                    }
                >
                    <ShieldCheck />
                    Sécurité
                </MenuLinkItem>
                <MenuLinkItem
                    render={
                        <Link
                            href={editAppearance()}
                            onClick={cleanup}
                            prefetch
                        />
                    }
                >
                    <MonitorCog />
                    Apparence
                </MenuLinkItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem
                closeOnClick
                data-test="logout-button"
                onClick={handleLogout}
                variant="destructive"
            >
                <LogOut />
                Se déconnecter
            </MenuItem>
        </>
    );
}
