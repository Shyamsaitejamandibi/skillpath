"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    // The server can't know which theme is stored, so the icon is only decided
    // after mount; a fixed placeholder avoids a hydration mismatch.
    useEffect(() => setMounted(true), [])

    const dark = resolvedTheme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(dark ? "light" : "dark")}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="text-muted-foreground"
        >
            {mounted && !dark ? <Sun /> : <Moon />}
        </Button>
    )
}
