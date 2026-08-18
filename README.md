# Skillpath — transcript

A Next.js app that renders the Skillpath build conversation as a readable, linkable
transcript. Fully static: the whole page prerenders at build time, and the only
client-side JavaScript is the copy button on code blocks.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # prerenders to static HTML
```

## Adding turns

Everything lives in **`data/conversation.ts`**. Append to the `conversation` array,
in order:

```ts
{
    speaker: "me",          // "me" | "claude"
    body: `What I typed.`,
    note: "optional caption under the name",
}
```

`body` is Markdown — headings, lists, tables, links, blockquotes, inline `code`,
and fenced blocks. Tag fences with a language to get highlighting:

    ```tsx
    export function Component() {}
    ```

Supported languages are listed in `lib/markdown.ts` (`LANGS`); add to that array
if you need one that isn't there. An untagged or unknown fence still renders,
just unhighlighted.

**Two gotchas when pasting.** A body inside a backtick template needs its own
backticks escaped (`` \` ``) and its `${` escaped (`\${`). To skip both, use
`String.raw` with a different delimiter, or paste the text into a `.md` file and
import it.

## Layout

| Path | |
|---|---|
| `data/conversation.ts` | the transcript — the only file you edit routinely |
| `lib/markdown.ts` | markdown-it + Shiki, memoised per process, server-only |
| `app/page.tsx` | renders the Markdown and lays out the thread (server) |
| `components/message.tsx` | one turn: my bubble, or Claude's plain text |
| `components/copy-code.tsx` | delegated copy-button listener |
| `components/theme-toggle.tsx` | light/dark, via next-themes |
| `app/globals.css` | tokens plus the `.prose` rules that style rendered Markdown |

Only `copy-code` and `theme-toggle` are client components. Shiki emits both
palettes as CSS variables per token, so switching theme re-colours the code with
no re-render and no second copy of the markup.

UI primitives come from shadcn/ui (`components/ui`), on Tailwind v4.
