import createMarkdownIt, { type MarkdownIt } from "markdown-it"
import { createHighlighter, type Highlighter } from "shiki"

// Both themes are emitted as CSS variables on every token, so switching the
// colour scheme costs no re-render and no second copy of the markup.
const THEMES = { light: "github-light", dark: "github-dark-default" } as const

// Every language a fence might be tagged with. Shiki loads grammars eagerly,
// so this list is the cost — keep it to what the transcript actually uses.
const LANGS = [
    "tsx", "typescript", "javascript", "js", "jsx", "json", "css", "html",
    "bash", "shell", "diff", "markdown", "python", "sql", "yaml",
]

/**
 * markdown-it and the Shiki highlighter are both expensive to construct and
 * completely stateless once built, so they are memoised per process. Building
 * happens at render time on the server; nothing here ships to the browser.
 */
let renderer: Promise<MarkdownIt> | null = null

function build(): Promise<MarkdownIt> {
    return createHighlighter({ themes: Object.values(THEMES), langs: LANGS }).then(
        (hl: Highlighter) => {
            const loaded = new Set(hl.getLoadedLanguages())
            const md = createMarkdownIt({ html: false, linkify: true, typographer: true })
            const esc = md.utils.escapeHtml

            // The default fence rule requires its highlight() output to start
            // with `<pre`, which rules out a wrapper. Replacing the rule
            // outright buys the language label and the copy button.
            md.renderer.rules.fence = (tokens, idx) => {
                const token = tokens[idx]
                const lang = (token.info || "").trim().split(/\s+/)[0]
                const code = token.content

                const highlighted = loaded.has(lang)
                    ? hl.codeToHtml(code, { lang, themes: THEMES, defaultColor: false })
                    : `<pre class="shiki"><code>${esc(code)}</code></pre>`

                return [
                    `<figure class="code">`,
                    `<figcaption class="code-bar">`,
                    `<span class="code-lang">${esc(lang)}</span>`,
                    `<button class="code-copy" type="button" data-code="${esc(code)}" aria-label="Copy code">Copy</button>`,
                    `</figcaption>`,
                    highlighted,
                    `</figure>`,
                ].join("")
            }

            // A wide table should scroll in its own box, not widen the page.
            md.renderer.rules.table_open = () => `<div class="table-scroll"><table>`
            md.renderer.rules.table_close = () => `</table></div>`

            // Links out of a transcript are always external.
            md.renderer.rules.link_open = (tokens, idx, options, _env, self) => {
                tokens[idx].attrSet("target", "_blank")
                tokens[idx].attrSet("rel", "noreferrer noopener")
                return self.renderToken(tokens, idx, options)
            }

            return md
        }
    )
}

export async function renderMarkdown(source: string): Promise<string> {
    if (!renderer) renderer = build()
    const md = await renderer
    return md.render(source)
}

/**
 * A one-line plain-text summary for the thread navigator. Deliberately crude:
 * it only has to survive being truncated to a couple of dozen characters.
 */
export function preview(source: string, max = 72): string {
    const firstProse = source
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .find((block) => block && !block.startsWith("```") && !block.startsWith("|"))

    const flat = (firstProse ?? source)
        .replace(/`{1,3}/g, "")
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
        .replace(/^[>#\-*\d.]+\s*/gm, "")
        .replace(/[*_]{1,2}/g, "")
        .replace(/\s+/g, " ")
        .trim()

    return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat
}
