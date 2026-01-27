"use client"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react"

import Link from "next/link"

export function UserNav({ user }: { user: { name?: string | null, email?: string | null, displayName?: string | null, avatarUrl?: string | null, role?: string | null } }) {
    const displayName = user.displayName || user.email?.split("@")[0] || "User"
    const displayEmail = user.email || ""
    const initial = displayName.charAt(0).toUpperCase()



    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200">
                    <span className="font-semibold text-slate-700">{initial}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-slate-900">{displayName}</p>
                        <p className="text-xs leading-none text-slate-500">
                            {displayEmail}
                        </p>
                        <p className="text-[10px] uppercase font-mono text-slate-400">
                            Role: {user.role || 'UNDEFINED'}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {user.role === 'ADMIN' && (
                        <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer font-bold text-red-600 focus:text-red-700">
                                Command Tower
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                        <Link href="/profile" className="cursor-pointer">
                            Profile & Security
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                            Household Settings
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/sign-in" })} className="cursor-pointer text-red-600 focus:text-red-600">
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
