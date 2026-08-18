import { cn } from "@/lib/utils"
import type { Speaker } from "@/data/conversation"

export type RenderedTurn = {
    speaker: Speaker
    note?: string
    /** Finished HTML from the server. */
    html: string
}

/**
 * One turn. Mine sits in a quiet bubble; Claude's runs as plain text on the
 * page — the asymmetry is what carries the speaker, so neither needs a label.
 */
export function Message({ turn, index }: { turn: RenderedTurn; index: number }) {
    const mine = turn.speaker === "me"

    return (
        <div id={`turn-${index + 1}`} className={cn("scroll-mt-20", mine && "flex justify-end")}>
            <div className={cn(mine && "max-w-[85%] rounded-2xl bg-muted px-4 py-3")}>
                {turn.note ? (
                    <p className="mb-2 text-xs text-muted-foreground/80">{turn.note}</p>
                ) : null}
                <div className="prose" dangerouslySetInnerHTML={{ __html: turn.html }} />
            </div>
        </div>
    )
}
