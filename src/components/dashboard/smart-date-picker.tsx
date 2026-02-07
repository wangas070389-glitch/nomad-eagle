"use client"

import * as React from "react"
import { format, subDays } from "date-fns"
import { Calendar as CalendarIcon, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface SmartDatePickerProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
}

export function SmartDatePicker({ date, setDate }: SmartDatePickerProps) {
    const [isOpen, setIsOpen] = React.useState(false)

    // Helper to set date while preserving current time (Red Team Req 1)
    const handleDateSelect = (newDate: Date | undefined) => {
        if (!newDate) {
            setDate(undefined)
            return
        }

        const now = new Date()
        // If the selected day is TODAY, use exact current time.
        // If it's another day, keep the current time of day to avoid 00:00 stacking.
        const dateWithTime = new Date(newDate)
        dateWithTime.setHours(now.getHours(), now.getMinutes(), now.getSeconds())

        setDate(dateWithTime)
        setIsOpen(false)
    }

    const setToday = () => {
        setDate(new Date()) // Exact now
    }

    const setYesterday = () => {
        const yest = subDays(new Date(), 1)
        setDate(yest)
    }

    return (
        <div className="flex items-center gap-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP p") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        initialFocus
                        disabled={(date) => date > new Date()} // Prevent future? Maybe allowed. Let's allow for now.
                    />
                </PopoverContent>
            </Popover>

            <div className="flex gap-1">
                <Button type="button" variant="secondary" size="sm" onClick={setToday}>
                    Today
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={setYesterday} className="hidden sm:inline-flex">
                    Yesterday
                </Button>
            </div>

            {/* Hidden Input for Form Submission if needed, but we usually control state in parent */}
            {date && <input type="hidden" name="date" value={date.toISOString()} />}
        </div>
    )
}
