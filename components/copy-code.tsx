"use client"

import { useEffect } from "react"

/**
 * The code blocks are server-rendered HTML strings, so there is no React
 * element to hang an onClick on. One delegated listener covers every block on
 * the page.
 */
export function CopyCode() {
    useEffect(() => {
        function onClick(event: MouseEvent) {
            const target = event.target as HTMLElement | null
            const button = target?.closest?.(".code-copy") as HTMLButtonElement | null
            if (!button) return

            navigator.clipboard.writeText(button.dataset.code ?? "").then(
                () => flash(button, "Copied"),
                () => flash(button, "Failed")
            )
        }

        function flash(button: HTMLButtonElement, label: string) {
            button.textContent = label
            button.dataset.state = "done"
            window.setTimeout(() => {
                button.textContent = "Copy"
                delete button.dataset.state
            }, 1400)
        }

        document.addEventListener("click", onClick)
        return () => document.removeEventListener("click", onClick)
    }, [])

    return null
}
