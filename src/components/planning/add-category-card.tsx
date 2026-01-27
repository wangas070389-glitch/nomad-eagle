"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createCategoryAction } from "@/server/actions/categories" // Reuse existing action

export function AddCategoryCard({ existingCategories }: { existingCategories: any[] }) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [icon, setIcon] = useState("🏷️")
    const [error, setError] = useState("")
    const [isPending, setIsPending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Client-side duplicate check
        const normalized = name.trim().toLowerCase()
        const exists = existingCategories.some(c => c.name.toLowerCase() === normalized)

        if (exists) {
            setError("Category already exists.")
            return
        }

        setIsPending(true)
        const formData = new FormData()
        formData.append("name", name)
        formData.append("icon", icon)
        formData.append("type", "EXPENSE") // Default for budget purposes

        const result = await createCategoryAction(null, formData)
        setIsPending(false)

        if (result?.error) {
            setError(result.error)
        } else {
            setOpen(false)
            setName("")
            setIcon("🏷️")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div role="button" className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition-all cursor-pointer h-full min-h-[100px] text-muted-foreground hover:text-indigo-600">
                    <Plus className="h-8 w-8 mb-2" />
                    <span className="font-medium">New Category</span>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Custom Category</DialogTitle>
                    <DialogDescription>
                        Add a new category for your unique spending needs.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Lego Collection"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="icon">Icon</Label>
                        <div className="flex gap-2">
                            <Input
                                id="icon"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-16 text-center text-xl"
                                maxLength={2}
                            />
                            <div className="text-xs text-muted-foreground flex items-center">
                                Pick an emoji to represent this category.
                            </div>
                        </div>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
