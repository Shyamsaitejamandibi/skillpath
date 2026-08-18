import Turn from "@/components/Turn"
import CopyCode from "@/components/CopyCode"
import { conversation, meta } from "@/data/conversation"

export default function Page() {
    const mine = conversation.filter((t) => t.speaker === "me").length
    const theirs = conversation.length - mine

    return (
        <main className="page">
            <CopyCode />

            <header className="masthead">
                <p className="eyebrow">Transcript · {meta.date}</p>
                <h1 className="title">{meta.title}</h1>
                <p className="subtitle">{meta.subtitle}</p>
                <dl className="stats">
                    <div>
                        <dt>Turns</dt>
                        <dd>{conversation.length}</dd>
                    </div>
                    <div>
                        <dt>Mine</dt>
                        <dd>{mine}</dd>
                    </div>
                    <div>
                        <dt>Claude</dt>
                        <dd>{theirs}</dd>
                    </div>
                </dl>
            </header>

            <div className="thread">
                {conversation.map((turn, i) => (
                    <Turn key={i} turn={turn} index={i} />
                ))}
            </div>

            <footer className="footer">
                <p>Verbatim, in order. Nothing edited out.</p>
            </footer>
        </main>
    )
}
