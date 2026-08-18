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
]
