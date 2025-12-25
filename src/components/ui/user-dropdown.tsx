import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { Icon } from "@iconify/react";

interface UserDropdownProps {
    user?: {
        name: string;
        username: string;
        avatar: string;
        initials: string;
        status: string;
    };
    onAction?: (action: string) => void;
    // Keeping these props to avoid breaking consumers, but they might be unused now
    onStatusChange?: (status: string) => void;
    selectedStatus?: string;
    promoDiscount?: string;
}

export const UserDropdown = ({
    user = {
        name: "Ayman Echakar",
        username: "@aymanch-03",
        avatar: "https://avatars.githubusercontent.com/u/126724835?v=4",
        initials: "AE",
        status: "online"
    },
    onAction = () => { },
}: UserDropdownProps) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8 lg:w-10 lg:h-10 border border-white dark:border-gray-700 transition-transform hover:scale-105">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[240px] rounded-xl bg-white dark:bg-gray-950 p-2" align="end">
                <div className="flex items-center gap-3 p-2 mb-2">
                    <Avatar className="w-10 h-10 border border-gray-200 dark:border-gray-800">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{user.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.username}</p>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1 bg-gray-200 dark:bg-gray-800" />

                <DropdownMenuGroup>
                    <DropdownMenuItem
                        className="flex items-center gap-2 p-2 rounded-lg cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/10 focus:text-red-600 dark:focus:text-red-400"
                        onClick={() => onAction('logout')}
                    >
                        <Icon icon="solar:logout-2-bold-duotone" className="w-5 h-5" />
                        <span className="font-medium text-sm">Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

