import { renderMarkdown } from "@/lib/markdown"
import type { Turn as TurnData } from "@/data/conversation"

const NAMES: Record<TurnData["speaker"], string> = {
    me: "Me",
    claude: "Claude",
}

export default async function Turn({ turn, index }: { turn: TurnData; index: number }) {
    const html = await renderMarkdown(turn.body)

    return (
        <article className="turn" data-speaker={turn.speaker} id={`t${index + 1}`}>
            <header className="turn-head">
                <span className="turn-avatar" aria-hidden="true">
                    {turn.speaker === "me" ? "S" : "C"}
                </span>
                <div className="turn-id">
                    <h2 className="turn-name">{NAMES[turn.speaker]}</h2>
                    {turn.note ? <p className="turn-note">{turn.note}</p> : null}
                </div>
                <a className="turn-anchor" href={`#t${index + 1}`} aria-label={`Link to turn ${index + 1}`}>
                    {index + 1}
                </a>
            </header>
            <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
        </article>
    )
}
