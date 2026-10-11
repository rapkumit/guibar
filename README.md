<div align="center">

# guibar

### Barcode sheets, made simple.

Create, customize, and print barcode sheets right in your browser.

[Open Guibar](https://rapkumit.github.io/guibar/)

</div>

---

## Features

- Generate a numbered sequence with a custom prefix, suffix, and increment.
- Print multiple copies of each barcode ID.
- Customize paper size, page margins, tag dimensions, spacing, and padding.
- Add text, such as prices — to individual IDs or groups of comma-separated IDs.
- Save named presets in your browser for settings you use often.
- Preview a sheet responsively before printing.

> **Your presets stay on your device.** Guibar stores them in this browser; they are not uploaded or synced to other devices.

## Roadmap
- [x] MVP
- [ ] Support multiple standards of barcodes.
- [ ] Import/Export presets from a file.

## Development

If you're a regular user, just use the [github page](https://rapkumit.github.io/guibar/)

### Build 

You’ll need [Node.js](https://nodejs.org/) and npm.

```bash
git clone https://github.com/rapkumit/guibar.git
cd guibar
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app locally.

### Deploy

For this repository, Guibar is configured to publish to GitHub Pages from the `main` branch.

The published site is available at [rapkumit.github.io/guibar](https://rapkumit.github.io/guibar/).

## Q&A

### **Did you use AI?**

- **Essentially, yes I did.** I mainly used GPT-6 Luna for refactoring and filling up the areas, notably the functions, where I have no idea where I would start (yet).
- All of the features were asked by my client – woaw "client" oa hahaha. Essentially, all of the features that were implement are from my beloved and me.
- Rest assured, all of the generated code is reviewed then altered by yours truly. AI should only used as a tool, not a replacement, especially on cognitive and creative thinking.

## Built with

[Next.js](https://nextjs.org/) · [React](https://react.dev/) · [Tailwind CSS](https://tailwindcss.com/) · [JsBarcode](https://github.com/lindell/JsBarcode) · [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna)