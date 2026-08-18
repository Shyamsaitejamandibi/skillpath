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
| `components/Turn.tsx` | one turn; async server component |
| `components/CopyCode.tsx` | delegated copy-button listener (the only client component) |
| `app/globals.css` | all styling, including the `.prose` rules for rendered Markdown |
