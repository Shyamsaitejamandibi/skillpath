import { cn } from "@/lib/utils"
import type { Speaker } from "@/data/conversation"

export type RenderedTurn = {
    speaker: Speaker
    note?: string
    /** Finished HTML from the server. */
    html: string
    /**
     * True when one of my turns is a structured document rather than a line of
     * chat. A right-aligned bubble is right for a question and wrong for a
     * brief with headings and code in it.
     */
    wide: boolean
}

export function Message({ turn, index }: { turn: RenderedTurn; index: number }) {
    const mine = turn.speaker === "me"
    const bubble = mine && !turn.wide
    const panel = mine && turn.wide

    return (
        <div id={`turn-${index + 1}`} className={cn("scroll-mt-20", bubble && "flex justify-end")}>
            <div
                className={cn(
                    bubble && "max-w-[85%] rounded-2xl bg-muted px-4 py-3",
                    panel && "rounded-2xl bg-muted px-5 py-4 sm:px-6 sm:py-5"
                )}
            >
                {turn.note ? (
                    <p className={cn("text-xs text-muted-foreground/80", panel ? "mb-4" : "mb-2")}>
                        {turn.note}
                    </p>
                ) : null}
                <div className="prose" dangerouslySetInnerHTML={{ __html: turn.html }} />
            </div>
        </div>
    )
}
