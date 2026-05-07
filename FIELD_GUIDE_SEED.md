# Field Guide — Sanity seed (Coffee Thoughts)

Do this in **Sanity Studio** after deploying the schema changes (`concept`, `conceptsDiscussed`, `conceptsDemonstrated`).

## 1. Create the concept

1. Add a **Field Guide entry** (`concept`).
2. **Title:** Coffee Thoughts  
3. **Slug:** `coffee-thoughts` (site URL: `/field-guide/coffee-thoughts`).
4. **Summary:** e.g.  
   `Some thoughts only emerge when the body is occupied and the mind is given enough space to wander.`
5. Optionally set **Type**, **Body**, **Signals**, **Tensions**, **Related concepts**, **Aliases**.
6. Set **Published At** to a datetime ≤ now — drafts without this date do not appear on the site.

## 2. Link “Stop to Think”

1. Open the post whose slug is **`stop-to-think`** (URL `/journal/stop-to-think`).
2. In **Field Guide concepts**, reference **Coffee Thoughts**.
3. Publish the post.

The journal template will show a **Field guide** block under the article with a link to the entry.

## 3. Optional in-body link

To mirror the essay narrative, add a normal link in the post body to:

`/field-guide/coffee-thoughts`

(absolute URL `https://danielshires.com/field-guide/coffee-thoughts` also works).

## 4. Projects

For any case study, use **Concepts demonstrated** to reference Field Guide entries; the project page shows the same quiet module.

---

## Troubleshooting: “Field guide” block missing under an article

### A. Static site (most common)

Journal posts are **pre-rendered at build time**. Editing Sanity does **not** update production until the site rebuilds.

- **Netlify:** trigger **Deploy site** (production or your branch) after content changes, or add a [deploy webhook](https://docs.netlify.com/configure-builds/build-hooks/) from Sanity when documents publish.

### B. Wrong link field on the post

The block reads **`Field Guide concepts`** on the **post** (`conceptsDiscussed`).  
Linking on the concept under **Related concepts** does **not** drive the journal module — that only connects entries to each other.

### C. Concept filtered out by `Published At`

Queries require **`Published At` set** on the concept **and** `publishedAt ≤ now`. If that field was empty or you picked a future date, the link resolves to nothing on the site.

### D. Post not republished

After adding **Field Guide concepts** on the post, **publish the post** again so the reference exists on the published API dataset.
