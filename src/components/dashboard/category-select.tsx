import * as React from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type CategoryOption = {
    id: string
    name: string
    icon?: string | null
}

interface CategorySelectProps {
    categories: CategoryOption[]
    value?: string
    onChange: (value: string) => void
}

export function CategorySelect({ categories, value, onChange }: CategorySelectProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
                {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
