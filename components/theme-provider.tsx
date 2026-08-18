"use client"

import { ThemeProvider as NextThemes } from "next-themes"

/** Dark is the intended reading experience; light is there for daylight. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <NextThemes attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            {children}
        </NextThemes>
    )
}
