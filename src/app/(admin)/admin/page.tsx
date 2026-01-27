
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { UserActions } from "@/components/admin/user-actions"

export default async function AdminPage() {
    // 1. Fetch the Population
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            household: true
        }
    })

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Global Overwatch</h1>
                <Badge variant="outline" className="text-orange-500 border-orange-500">
                    POPULATION: {users.length}
                </Badge>
            </div>

            {/* The Data Grid */}
            <div className="rounded-md border border-slate-800 bg-slate-900">
                <Table>
                    <TableHeader className="bg-slate-950">
                        <TableRow className="hover:bg-slate-950 border-slate-800">
                            <TableHead className="text-slate-400">Identity</TableHead>
                            <TableHead className="text-slate-400">Role</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Joined</TableHead>
                            <TableHead className="text-right text-slate-400">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                                <TableCell className="font-medium text-slate-200">
                                    <div className="flex flex-col">
                                        <span>{user.email}</span>
                                        <span className="text-xs text-slate-500">{user.id}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`text-xs font-mono ${user.role === 'ADMIN' ? 'text-orange-500' : 'text-slate-400'}`}>
                                        {user.role}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        user.status === 'ACTIVE' ? 'bg-green-900 text-green-300 hover:bg-green-900' :
                                            user.status === 'PENDING' ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-900' :
                                                'bg-red-900 text-red-300'
                                    }>
                                        {user.status || 'UNKNOWN'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-slate-400">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    {/* We will add buttons here in the next mission */}
                                    <UserActions
                                        userId={user.id}
                                        userEmail={user.email}
                                        userRole={user.role}
                                        userStatus={user.status}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
