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
    /**
     * Why this is a page and not a claude.ai link. Shown once, above the
     * transcript. Set to an empty string to drop it.
     */
    provenance:
        "This was a Claude session. Team-plan chats can't be shared by link, so instead of a share URL the turns below are the session copy-pasted verbatim — my prompts and Claude's replies, in order, nothing edited out.",
}

export const conversation: Turn[] = [
    {
        speaker: "me",
        note: "the brief, plus the facts I'd already checked with curl",
        body: `## What to build

A landing page in Framer for a fake learning platform. Call it Skillpath.

One section of that page pulls live data from an API. That section is what we're actually looking at. The rest is just the stuff around it.

The page needs three things.

- **A hero.** Headline, one line under it, one button. Design it however you want.
- **A courses section.** This is the real test. More on it below.
- **A footer.** Three links and a copyright line. Don't overthink it.

## The courses section

Base URL:

\`\`\`
https://syncsphere-hiv6.onrender.com
\`\`\`

Two endpoints. Both GET. No auth.

**1. \`/assignment/course-data\`**

Returns an array of 5 to 10 courses. The count changes between calls, so don't build for exactly 8 cards. Each course looks like this:

\`\`\`json
{
  "courseName": "How To YouTube",
  "courseCode": "how-to-youtube",
  "description": "From concept to creation, learn how to build, grow, and monetize a YouTube channel using practical systems and real-world execution.",
  "mainCategory": "Content Creation",
  "shortCourse": "YouTube",
  "courseType": "Original",
  "pricePaise": 199900,
  "priceUsdCents": 3999,
  "mangoId": "a1b2c3d4e5f6789012345678",
  "refundable": true
}
\`\`\`

**2. \`/assignment/country-code\`**

Returns \`{"country_code": "IN"}\` or \`{"country_code": "US"}\`. It flips between the two.

This decides the price you show. IN means show rupees from \`pricePaise\`. US means show dollars from \`priceUsdCents\`. Notice the units. 199900 paise is not ₹1,99,900. If a card says that, we stop reading.

Each card shows:

- Course name
- Description, cut off at two lines, cleanly
- Price, in the right currency with the right formatting
- One more field from the data. You pick. Pick the one a real learner would want to see.

## The rules

**Build it as a code component.** Not with Framer's Fetch. Fetch can't loop through arrays, so you can't build a grid with it. Write a React code component and do the fetching inside it.

**Handle what happens when things go wrong.** We're telling you upfront: this API fails on purpose. Roughly 1 in 3 requests returns a 404 or 500. Both endpoints. That's not a bug, that's the test.

Four situations. Loading. Error. Zero results. Working.

If your page goes blank or dumps a raw error on screen, you lose this section. And think about what happens when the country call fails but the course call works. What do you show? There's no single right answer. There are wrong ones.

**Only GET works.** Every other method returns a 405. If your component is sending anything else, ask yourself why.

**Give us two property controls.** Someone who can't code should be able to change something from the Framer panel without touching your code. You pick which two. Pick the ones a designer would actually ask for.

**Make it work on phones.** 3 columns on desktop. 2 on tablet. 1 on mobile. Nothing should break in between. Remember the card count varies, so the grid can't assume a nice round number.

**Don't hardcode the data.** Obvious, we know. Saying it anyway.

## If you finish early

Only if. Skipping all of this costs you nothing.

- A search box that filters the courses
- Sort by price
- Skeleton loaders instead of a spinner
- A retry button when it fails
- A "refundable" badge that only shows when it's true

---

Before you write code, here are facts I verified myself with curl, use these over assumptions:

- CORS is \`Access-Control-Allow-Origin: *\` on both endpoints, so a direct browser fetch from Framer works. Don't build a proxy.
- ~1/3 of requests fail with 404 or 500. The failure body is **valid JSON**: \`{"detail":"maybe turn it on and off?"}\`. So \`res.json()\` will succeed on an error. Any code that trusts the parsed body without checking \`res.ok\` is broken.
- Course array length varies (I saw 5, 7, 9, 10).
- Host is Render free tier, cold start can take 20–60s, so a short fetch timeout will create fake errors.
- \`199900\` pricePaise = ₹1,999. \`3999\` priceUsdCents = $39.99. Both /100.

Give me a plan for a single-file Framer code component: the state model, what happens for each of loading / error / empty / success, and how the two fetches relate to each other. Specifically: what do we render when country-code fails but course-data succeeds? Retry country-code a couple of times; if it still fails, fall back to USD as an explicit documented default, render the grid anyway, and show one quiet line of copy like "Showing prices in USD — couldn't confirm your region." Never block the cards on the country call.`,
    },
    {
        speaker: "claude",
        note: "the plan, before a line of component code",
        body: `## The shape of it

Two fetches, fired in parallel on mount, with asymmetric authority: **course-data is blocking, country-code is advisory.** Courses gate the grid; the country call only decides which of two numbers already in hand gets formatted. So it never gets to hold the page hostage.

## State model

Two independent slices, not one merged \`status\`. Merging them is what produces the blank page when one of two calls fails.

\`\`\`js
// blocking slice
courses:       Course[] | null
coursesPhase:  "loading" | "error" | "empty" | "success"
coursesError:  { status?: number } | null   // never the API's own message

// advisory slice — terminal once resolved
currencyPhase: "resolving" | "resolved"
currency:      "INR" | "USD"      // USD is the documented default
confirmed:     boolean            // false = we fell back

// UI-only
query, sort, reloadKey
\`\`\`

Plus refs: \`abortRef\` (per attempt), \`runIdRef\` (discard stale responses after a retry or prop change), \`currencyResolvedRef\` (so a late country response can't flip a committed decision).

## How the two fetches relate

\`currencyPhase\` resolves in one of three ways, and it's **terminal** — no post-hoc price swapping, because a card that shows $39.99 and then flips to ₹1,999 looks broken in a way that a fallback line doesn't.

1. **Country succeeds** (up to 3 attempts, 400ms/1200ms backoff, retried on failure, not on a clock) → resolved, \`confirmed: true\`.
2. **All 3 attempts fail** → resolved as USD, \`confirmed: false\`.
3. **Courses land first, country still in flight** → start a 2500ms warm window; on expiry, abort country and commit USD fallback.

That warm window is short on purpose. Both endpoints share the host, so once courses have arrived the Render instance is demonstrably awake — the cold-start excuse no longer applies to the country call, and anything still pending after 2.5s on a warm host is failing rather than booting. The generous 60s timeout only applies before that point.

Cards render as soon as courses land. While \`currencyPhase === "resolving"\`, the card's price slot alone shows a small shimmer — name, category, description are all live. So nothing is ever blocked on the country call, and the fallback line can only appear after the decision is final, never mid-flight.

## The 404/500 trap

Every fetch goes through one helper, in this order:

\`\`\`js
const res = await fetch(url, { signal })      // no method, no headers
if (!res.ok) throw new HttpError(res.status)  // BEFORE touching the body
const data = await res.json()
\`\`\`

\`{"detail":"maybe turn it on and off?"}\` parses cleanly, so \`res.ok\` is the only thing standing between that and a \`.map()\` over a string. Then shape validation on top, because a 200 doesn't guarantee the payload: courses must be \`Array.isArray\`, country must be exactly \`"IN"\` or \`"US"\` — anything else is treated as a failed attempt, not as data.

No \`method\`, no \`Content-Type\`. Adding that header makes the request non-simple, triggers an \`OPTIONS\` preflight, and earns a 405 — which is probably the trap behind that rule.

**Auto-retry courses twice** before surfacing an error. At a 1/3 base failure rate that takes visible failure from ~33% to ~3.7%. It's the single highest-leverage thing in the whole component.

## The four states

**Loading** — skeleton cards in the real grid, not a spinner, so there's no layout jump. After 8s, a quiet line: "Still waking up the server." Cold starts otherwise read as dead.

**Error** — a card-shaped panel with our own copy plus the status code in small muted text, and a Retry button that bumps \`reloadKey\`. The API's \`detail\` string never reaches the screen; it would look like a crash.

**Empty** — \`Array.isArray(data) && validItems.length === 0\`. Distinct from error, distinct copy, Refresh button. Items are normalized first and ones missing \`courseName\` are dropped, so a partially garbage payload degrades to fewer cards rather than a broken one.

**Success** — the grid, plus the fallback line above it when \`!confirmed\`.

There's a third zero-state worth separating: search filters everything out while courses exist. That's "No matches for *react*" + Clear, not "No courses available."

## Cards

Extra field: **\`mainCategory\`**, as a small pill above the title. It's the only field a learner scans a grid with — \`mangoId\` and \`courseCode\` are internal plumbing, \`courseType: "Original"\` is platform jargon, and \`shortCourse\` is a truncation of a name they already have. \`refundable\` earns its own conditional badge (bonus), shown only when true.

Price: divide by 100, always. \`Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })\` with zero fraction digits when the amount is whole → ₹1,999. \`en-US\`/USD keeps two → $39.99. Non-numeric or missing price renders "Price unavailable" and keeps the card; 0 renders "Free". Nothing raw ever hits the DOM.

Description gets a 2-line \`-webkit-line-clamp\`, and the price row is pinned with \`marginTop: auto\` in a flex column so short descriptions don't leave prices at different heights.

## Grid

**ResizeObserver on the component's own container**, not viewport media queries — Framer renders this at arbitrary canvas widths, and container-driven columns behave correctly in all of them. \`<560px → 1\`, \`560–899 → 2\`, \`≥900 → 3\`. \`justify-content: start\` with \`height: 100%\` cards so a trailing row of 1 or 2 doesn't stretch or center oddly. Nothing in the layout knows how many cards there are.

## Property controls

- **\`accentColor\`** (\`ControlType.Color\`) — drives the pill, price, badge, retry button. The first thing a designer asks for.
- **\`defaultSort\`** (\`ControlType.Enum\`: Featured / Price: Low to High / Price: High to Low) — changes what a visitor sees first, and there's no other way to reach it from the canvas.

Both are cheap to extend later (\`sectionTitle\`, \`showSearch\`, \`cardRadius\`), but those two are the ones that are actually load-bearing.

---

Want me to write it? I'd build it in one pass with the bonuses included — search, sort, skeletons, retry, and the refundable badge all fall out of this structure at near-zero extra cost.`,
    },
    {
        speaker: "me",
        note: "five corrections to the plan",
        body: `Go ahead, but make these adjustments before writing the code:

1. Remove the 2.5s country-code cutoff. Let the country request complete through its retry attempts; never block the course grid on it. If all attempts fail, commit to the documented USD fallback.
2. Keep course-data failure visible rather than silently retrying indefinitely. Show the error state with a Retry button.
3. Keep the implementation focused on the assignment requirements. Don't over-engineer hypothetical malformed API responses.
4. Implement the core requirements first and then add search, sorting, skeleton loaders, retry, and the conditional refundable badge only if they don't compromise the core UX.
5. Keep everything in a single Framer React code component as requested.

Before finalizing, verify every requirement from my original prompt against the implementation, especially \`res.ok\`, GET-only requests, 20–60s Render cold starts, variable course counts, currency fallback behavior, responsive 3/2/1 layout, and exactly two Framer property controls.`,
    },
]
