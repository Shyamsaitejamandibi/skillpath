import { CopyCode } from "@/components/copy-code"
import { Message } from "@/components/message"
import { ThemeToggle } from "@/components/theme-toggle"
import { conversation, meta } from "@/data/conversation"
import { renderMarkdown } from "@/lib/markdown"

/**
 * Markdown and syntax highlighting run here, on the server, at build time —
 * the client receives finished HTML and never loads a parser or a grammar.
 */
export default async function Page() {
    const turns = await Promise.all(
        conversation.map(async (turn) => ({
            speaker: turn.speaker,
            note: turn.note,
            html: await renderMarkdown(turn.body),
            wide: turn.body.length > 280 || /^#{1,6}\s|```/m.test(turn.body),
        }))
    )

    return (
        <div className="min-h-svh">
            <CopyCode />

            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
                <div className="mx-auto flex h-13 max-w-3xl items-center gap-3 px-5">
                    <span className="truncate text-sm font-medium">{meta.title}</span>
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-3xl px-5 pb-32">
                <div className="border-b py-10">
                    <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
                    <p className="mt-2 text-[15px] text-pretty text-muted-foreground">
                        {meta.subtitle}
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground/70">
                        {conversation.length} {conversation.length === 1 ? "turn" : "turns"} · {meta.date}
                    </p>
                </div>

                <div className="flex flex-col gap-9 pt-10">
                    {turns.map((turn, i) => (
                        <Message key={i} turn={turn} index={i} />
                    ))}
                </div>
            </main>
        </div>
    )
}
