import createMarkdownIt, { type MarkdownIt } from "markdown-it"
import { createHighlighter, type Highlighter } from "shiki"

const THEME = "github-dark-default"

// Every language a fence might be tagged with. Shiki loads grammars eagerly,
// so this list is the cost — keep it to what the transcript actually uses.
const LANGS = [
    "tsx", "typescript", "javascript", "jsx", "json", "css", "html",
    "bash", "shell", "diff", "markdown", "python", "sql", "yaml",
]

/**
 * markdown-it and the Shiki highlighter are both expensive to construct and
 * completely stateless once built, so they are memoised per process. Building
 * happens at render time on the server; nothing here ships to the browser.
 */
let renderer: Promise<MarkdownIt> | null = null

function build(): Promise<MarkdownIt> {
    return createHighlighter({ themes: [THEME], langs: LANGS }).then(
        (hl: Highlighter) => {
            const loaded = new Set(hl.getLoadedLanguages())
            const md = createMarkdownIt({ html: false, linkify: true, typographer: true })
            const esc = md.utils.escapeHtml

            // The default fence rule insists its highlight() output start with
            // `<pre`, which rules out a wrapper. Replacing the rule outright
            // buys the language label and the copy button.
            md.renderer.rules.fence = (tokens, idx) => {
                const token = tokens[idx]
                const lang = (token.info || "").trim().split(/\s+/)[0]
                const code = token.content

                const highlighted = loaded.has(lang)
                    ? hl.codeToHtml(code, { lang, theme: THEME })
                    : `<pre class="shiki"><code>${esc(code)}</code></pre>`

                return [
                    `<div class="code">`,
                    `<div class="code-bar">`,
                    `<span class="code-lang">${esc(lang || "text")}</span>`,
                    `<button class="code-copy" type="button" data-code="${esc(code)}">Copy</button>`,
                    `</div>`,
                    highlighted,
                    `</div>`,
                ].join("")
            }

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
