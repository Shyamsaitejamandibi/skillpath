"use client"

import { useEffect } from "react"

/**
 * The code blocks are server-rendered HTML strings, so there is no React
 * element to hang an onClick on. One delegated listener covers every block on
 * the page and survives any number of them.
 */
export default function CopyCode() {
    useEffect(() => {
        function onClick(event: MouseEvent) {
            const target = event.target as HTMLElement | null
            const button = target?.closest?.(".code-copy") as HTMLButtonElement | null
            if (!button) return

            const code = button.dataset.code ?? ""
            navigator.clipboard.writeText(code).then(
                () => flash(button, "Copied"),
                () => flash(button, "Failed")
            )
        }

        function flash(button: HTMLButtonElement, label: string) {
            button.textContent = label
            button.classList.add("is-done")
            window.setTimeout(() => {
                button.textContent = "Copy"
                button.classList.remove("is-done")
            }, 1400)
        }

        document.addEventListener("click", onClick)
        return () => document.removeEventListener("click", onClick)
    }, [])

    return null
}
