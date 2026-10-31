# Sync design tokens between Figma and the site

Keep the Figma variables in **Portfolio 2025** and the site's Tailwind/CSS tokens identical.

- Figma file key: `JPy5Wqcv7Y2fKRhyg8U7M2` (page: **Design Tokens**)
- Code: `src/styles/global.css` (`:root` / `.dark`) and `tailwind.config.mjs`

Ask which direction to sync if the request doesn't say:

- **Figma → code** (default when a designer changed Figma): read the variables, update code, open a PR.
- **Code → Figma** (when code changed first): read code, update the Figma variables in place.

## Mapping

| Figma collection | Figma variable | Code location |
|---|---|---|
| Primitives | `zinc/50` … `zinc/950` | `--zinc-*` RGB triplets in `:root` of `global.css` (e.g. `#09090b` → `9 9 11`) |
| Color (Light / Dark) | `background` | `--background-color` in `:root` / `.dark` |
| Color | `text` | `--text-color` in `:root` / `.dark` |
| Color | `primary`, `on-primary` | `colors.primary.DEFAULT` / `colors.primary.light` in `tailwind.config.mjs` |
| Color | `border` | `colors.border.light` / `colors.border.dark` |
| Color | `focus` | `colors.focus` and the `:focus-visible` outlines in `global.css` |
| Color | `prose/*` | `typography.DEFAULT` (Light) and `typography.invert` (Dark) colours in `tailwind.config.mjs` |
| Color | `text-default`, `text-muted`, `text-inverted` | `colorStyles` in `src/components/ui/text/styles.ts` |
| Color | `text-label` | `sectionLabelTypographyClass` in `styles.ts` |
| Typography | `font/sans`, `font/mono` | `fontFamily.sans`, `fontFamily.mono` |
| Typography | `size/base` | `fontSize.base` (other sizes are Tailwind defaults) |
| Type Scale (Mobile / Tablet / Desktop) | `<variant>/font-size`, `<variant>/line-height` | `variantStyles` in `styles.ts` (Display: `heroDisplayIntroClass`). Mobile = unprefixed classes, Tablet = `md:`, Desktop = `lg:`. Line height is px: size × Tailwind leading (`tight` 1.25, `snug` 1.375, `relaxed` 1.625). |
| Text styles | `Text/*` | One per `TextVariant` in `styles.ts`, plus `Display` and `Body Strong` (`linkListStrongTitleClass`) |
| Text styles | `Prose/*` | `typography.DEFAULT` heading/body/caption/overline rules |
| Spacing, Radius | `spacing/*`, `radius/*` | Tailwind defaults; a change here means adding an override under `theme.extend` |

Semantic colours alias primitives. When syncing, compare the **alias target** (e.g. `zinc/900`), not just the resolved hex, so a re-pointed alias becomes a different Tailwind shade in code.

## Figma → code

1. Load the `figma-use` skill, `create_session` for the file key, then run a read-only `use_figma` script that returns every local variable with its collection, per-mode value or alias target name, and every local text style.
2. Diff against the mapping above and edit only the values that changed.
3. Run `npm run build` to confirm the site still compiles.
4. Commit with a plain-language message describing the visual change, push, and open a PR. List each changed token (old → new) in the PR body.

## Code → Figma

1. Read the current values from the code locations above.
2. Load the `figma-use` skill, `create_session`, then update existing variables **by name** with `setValueForMode` (aliases via `createVariableAlias`). Never delete and recreate variables: that breaks every bound layer in the file.
3. Create a variable only for a genuinely new token, with scopes and WEB code syntax matching its siblings.
4. Screenshot both boards on the **Design Tokens** page (`Tokens — Light`, `Tokens — Dark`) to confirm the change rendered.
