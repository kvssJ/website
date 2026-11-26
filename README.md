# Java tutorials

Video lessons, text explanations and practice questions for learning Java (ICSE curriculum), published as a website with [Quartz](https://quartz.jzhao.xyz/) and GitHub Pages.

- Lessons live in `content/` as Markdown, one folder per chapter.
- Practice-question PDFs and images live in `content/Attachments/`.
- Chapter and lesson order come from `folderOrder` (in a folder's `index.md`) and `noteOrder` (in each lesson) frontmatter.

## Building locally

Requires Node.js 22 or newer.

```bash
npm ci
npx quartz build --serve   # preview at http://localhost:8080
```

Pushing to the `v4` branch deploys the site through `.github/workflows/deploy.yml`.

## Redesign changes (`redesign` branch)

The redesign only changes how the site looks and is navigated. **No files in `content/` were changed**, so all lesson text, videos and PDFs are exactly as they were.

### New

- **Top bar**: a full-width bar with the site title and logo, search, and the dark-mode toggle.
- **Numbered contents sidebar**: chapters are numbered 1–9, the current page is highlighted, and the sidebar has its own background.
- **Home page contents**: under the welcome text, each chapter gets a card that opens to show its numbered lessons (1.1, 1.2, …).
- **Folder pages**: each chapter or section page lists its lessons in book order, replacing the date-sorted list.
- **Previous / Next buttons** at the bottom of every lesson, following the same order as the sidebar.
- **Videos**: YouTube embeds resize to fit the screen (16:9) and load lazily.
- **PDFs**: embedded PDFs sit in a frame with **Open** and **Download** buttons. This matters on phones, which often can't show a PDF inside a page.
- **Styling**: new fonts (Lexend for headings, Inter for text, JetBrains Mono for code), a blue colour scheme with a matching dark mode, and restyled code blocks, links, headings and the footer. Layouts work on phone, tablet and desktop.

### Removed or changed

- The third-party theme stylesheet (`quartz/styles/themes`, "Tokyo Night") is **no longer imported**. Its files are still in the repo, so to bring it back, add `@use "./themes";` to `quartz/styles/custom.scss`.
- Removed the graph view, backlinks, the reader-mode button, page dates (reading time is kept), and the footer links to Quartz's GitHub and Discord.
- A folder page without a `title` is now named after its folder rather than "index".
- `baseUrl` in `quartz.config.ts` is set to `kvssj.github.io/website`. Change it if the site is published somewhere else.

### Files

| File | What it does |
| --- | --- |
| `quartz/util/bookOrder.ts` | Works out the chapter/lesson order and numbering, shared by the parts below |
| `quartz/components/ChapterIndex.tsx` | Contents cards on the home page and lesson lists on folder pages |
| `quartz/components/BookNav.tsx` | Previous / Next lesson buttons |
| `quartz/plugins/transformers/embeds.ts` | Responsive YouTube player and the PDF toolbar |
| `quartz/styles/custom.scss` | The site's styling |
| `quartz.layout.ts`, `quartz.config.ts` | Which components appear where; colours, fonts, plugins |
| `quartz/components/renderPage.tsx` | Moves the header into the full-width top bar |
| `quartz/components/PageTitle.tsx`, `Footer.tsx`, `ContentMeta.tsx` | Logo in the title, no empty footer links, option to hide dates |
| `quartz/plugins/transformers/frontmatter.ts` | Folder pages default to the folder's name |

### Planned

- On-site quizzes built from the practice-question PDFs.
- An in-browser Java editor to run code and check answers.

---

Built with [Quartz v4](https://quartz.jzhao.xyz/).
