"use client"

import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"
import { useState } from "react"
import { toPng } from "html-to-image"
import jsPDF from "jspdf"

export function ReportGenerator() {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleGenerate = async () => {
        setIsGenerating(true)
        try {
            const element = document.getElementById('dashboard-content') || document.querySelector('main') as HTMLElement
            if (!element) throw new Error("Dashboard content not found")

            // html-to-image is much better at modern CSS (like oklch/lab)
            const dataUrl = await toPng(element, {
                cacheBust: true,
                backgroundColor: '#ffffff', // Ensure opaque background
                filter: (node) => {
                    // Filter out buttons/navs to clean up the PDF
                    const el = node as HTMLElement
                    return !(el.tagName === 'BUTTON' || el.tagName === 'NAV')
                }
            })

            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()

            // Create a temporary image to calculate aspect ratio
            const img = new Image()
            img.src = dataUrl
            await new Promise((resolve) => { img.onload = resolve })

            const imgWidth = img.width
            const imgHeight = img.height

            const ratio = pdfWidth / imgWidth
            const totalHeight = imgHeight * ratio

            pdf.setFontSize(20)
            pdf.text("Household Financial Report", 10, 15)
            pdf.setFontSize(10)
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 22)

            pdf.addImage(dataUrl, 'PNG', 0, 30, pdfWidth, totalHeight)
            pdf.save(`Household_Report_${new Date().toISOString().split('T')[0]}.pdf`)

        } catch (e) {
            console.error(e)
            alert(`Failed to generate report: ${e instanceof Error ? e.message : "Unknown error"}`)
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <Button onClick={handleGenerate} variant="outline" disabled={isGenerating} size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            {isGenerating ? "Exporting..." : "Export Report"}
        </Button>
    )
}
