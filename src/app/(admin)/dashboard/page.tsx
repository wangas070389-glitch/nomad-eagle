"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUsers, toggleUserStatus, terminateEntity } from "@/server/actions/admin"
import { useToast } from "@/components/ui/use-toast"
import { Search, MoreHorizontal, Power, Trash2, AlertTriangle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserStatus } from "@prisma/client"
import { ReplicationAction } from "@/components/admin/replication-action"

export default function AdminDashboard() {
    const [users, setUsers] = useState<any[]>([])
    const [filter, setFilter] = useState("")
    const { toast } = useToast()

    const fetchUsers = async () => {
        try {
            const data = await getUsers()
            setUsers(data)
        } catch (e) {
            toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" })
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleStatusChange = async (id: string, newStatus: UserStatus) => {
        const res = await toggleUserStatus(id, newStatus)
        if (res.success) {
            toast({ title: "Status Updated", description: `User is now ${newStatus}` })
            fetchUsers()
        }
    }

    const handleTerminate = async (id: string) => {
        if (!confirm("CRITICAL WARNING: This will permanently delete the user and their data. This cannot be undone. Proceed?")) return

        const res = await terminateEntity(id, 'USER')
        if (res.success) {
            toast({ title: "Terminated", description: "Entity removed from the system.", variant: "destructive" })
            fetchUsers()
        } else {
            toast({ title: "Error", description: res.error, variant: "destructive" })
        }
    }

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(filter.toLowerCase()) ||
        (u.name || "").toLowerCase().includes(filter.toLowerCase())
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Overwatch Grid</h1>
                    <p className="text-slate-500">Global Governance & Access Control</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={fetchUsers} variant="outline" size="sm">Refresh Signal</Button>
                </div>
            </div>

            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Population Registry</CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search via email or alias..."
                                className="pl-8 bg-slate-50 border-slate-200 focus-visible:ring-slate-400"
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[100px]">Status</TableHead>
                                <TableHead>Identity</TableHead>
                                <TableHead>Household</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Command</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                user.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    user.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        'bg-red-50 text-red-700 border-red-200'
                                            }
                                        >
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{user.displayName || user.name || "Unknown"}</span>
                                            <span className="text-xs text-slate-500 font-mono">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.household ? (
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                                                <span className="text-sm font-medium">{user.household.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Unassigned</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`text-xs font-bold tracking-wider ${user.role === 'ADMIN' ? 'text-indigo-600' : 'text-slate-500'}`}>
                                            {user.role}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
                                                    Copy ID
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "ACTIVE")}>
                                                    <Power className="mr-2 h-4 w-4 text-green-600" />
                                                    Approve / Activate
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(user.id, "REJECTED")}>
                                                    <AlertTriangle className="mr-2 h-4 w-4 text-yellow-600" />
                                                    Suspend / Reject
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleTerminate(user.id)} className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Terminate Entity
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <ReplicationAction sourceEmail={user.email} />
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
