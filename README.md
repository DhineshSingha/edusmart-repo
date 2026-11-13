# EduSmart — teacher experience redesign

A working prototype of a redesigned teacher experience for EduSmart, a Texas
Grade 5 Science curriculum platform used by around 500,000 people.

This is a design argument built as software rather than drawn. There is no
backend, no authentication and no real data: every student, class and score in
it is generated, and the data file audits itself on load so no number appears
that the model cannot justify.

## Running it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
npm run preview  # serve the production build locally
```

Node 20 or newer. The stack is Vite 7, React 19, React Router 7 and Tailwind
CSS v4.

## How the code is organised

```
src/
  components/   the design system (ui.jsx) and the app frame
  screens/      one file per destination: Today, Teach, Classes, Insights …
  flows/        dialogs and sheets that open over a screen
  data/         mock.js — all generated data, plus its own audit
  index.css     every design token, in one file
  store.jsx     prototype-wide settings and the A/B switches
```

Two things are worth knowing before reading any of it.

**The code is commented for a designer, not an engineer.** Most comment blocks
explain a decision and, more often, a reversal — what was tried, why it failed
and what replaced it. They are the project's design record, so they are long on
purpose.

**`src/index.css` is the single point of change for a re-skin.** Colour,
radius, shadow and type tokens all live there. The rule the palette rests on:
brand colour marks what you can act on and what you have currently chosen;
status colour is reserved for statements about students.

## The Prototype menu

The header carries a **Prototype** control. It is not part of the product — it
switches between design variants that were built so the organisation could
judge them side by side rather than from a description: information
architecture, Library browse style, card richness, page surface and shadow
colour.

## Deploying

The repository carries a `netlify.toml`, so connecting it to Netlify needs no
dashboard configuration: build command, publish directory, Node version,
caching and the SPA redirect are all in that file.

For a one-off deploy with no repository, run `npm run build` and drop the
resulting `dist` folder onto <https://app.netlify.com/drop>.
