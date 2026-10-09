<div align="center">

# guibar

### Barcode sheets, made simple.

Create, customize, and print barcode sheets right in your browser.

[Open Guibar](https://rapkumit.github.io/guibar/)

</div>

---

## What you can do

- Generate a numbered sequence with a custom prefix, suffix, and increment.
- Print multiple copies of each barcode ID.
- Customize paper size, page margins, tag dimensions, spacing, and padding.
- Add text—such as prices—to individual IDs or groups of comma-separated IDs.
- Save named presets in your browser for settings you use often.
- Preview a sheet responsively before printing.

> **Your presets stay on your device.** Guibar stores them in this browser; they are not uploaded or synced to other devices.

## Get started

You’ll need [Node.js](https://nodejs.org/) and npm.

```bash
git clone https://github.com/rapkumit/guibar.git
cd guibar
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app locally.

## Available commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Check the code with ESLint |
| `npm run build` | Build the production static export |

## Deploy

Guibar is configured to publish to GitHub Pages from the `main` branch. Push a change to `main` to start the [Pages deployment workflow](https://github.com/rapkumit/guibar/actions/workflows/deploy.yml).

The published site is available at [rapkumit.github.io/guibar](https://rapkumit.github.io/guibar/).

## Built with

[Next.js](https://nextjs.org/) · [React](https://react.dev/) · [Tailwind CSS](https://tailwindcss.com/) · [JsBarcode](https://github.com/lindell/JsBarcode)
