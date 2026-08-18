/**
 * The transcript.
 *
 * Add one entry per turn, in order. `body` is Markdown — headings, lists,
 * links, tables and fenced code blocks all render. Fences are syntax
 * highlighted, so tag them with a language:
 *
 *     ```tsx
 *     const x = 1
 *     ```
 *
 * Use a String.raw`...` template for bodies containing backslashes or `${`,
 * so nothing has to be escaped by hand.
 */

export type Speaker = "me" | "claude"

export type Turn = {
    speaker: Speaker
    /** Markdown. */
    body: string
    /** Optional caption under the name, e.g. "after the third failed fetch". */
    note?: string
}

export const meta = {
    title: "Skillpath",
    subtitle: "Building a Framer code component against a deliberately flaky API — the full exchange.",
    /** Shown as-is. Any format you like. */
    date: "August 2026",
}

/* ---------------------------------------------------------------------------
   Replace everything below with the real turns. The four here exist only to
   show the shape and to prove the styling works; delete them.
--------------------------------------------------------------------------- */

export const conversation: Turn[] = [
    {
        speaker: "me",
        body: `Fetch the course list from the assignment endpoint and render it as a grid. Region-aware pricing — rupees in India, dollars everywhere else.`,
    },
    {
        speaker: "claude",
        body: `Two endpoints, two independent failure modes. The important detail is that the *failure* body is valid JSON, so \`res.json()\` resolves on a 500:

\`\`\`ts
const res = await fetch(COURSES_URL, { signal: controller.signal })

// res.ok BEFORE the body is ever touched. A 500 here returns
// {"detail":"maybe turn it on and off?"} — which parses perfectly.
if (!res.ok) throw new Error(\`HTTP \${res.status}\`)

const data = await res.json()
\`\`\`

Check \`res.ok\` first and the phantom "empty catalogue" state disappears.`,
        note: "the bug that cost the most time",
    },
    {
        speaker: "me",
        body: `It keeps showing an error even when the API is fine. Skeletons flash, then the panel appears.`,
    },
    {
        speaker: "claude",
        body: `That's the timeout, not the API. The host is Render's free tier — a cold start takes 20–60s, and a 5s abort manufactures an error the server never sent.

- Timeout raised to **60s**
- A "server is waking up" hint at **8s**, so the skeletons don't look stuck
- \`country-code\` retries itself (no button for it); \`course-data\` doesn't (it has a Retry button)`,
    },
]
