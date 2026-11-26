import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { buildBook, findFolder, countLessons, BookNode } from "../util/bookOrder"
import { resolveRelative, FullSlug } from "../util/path"

interface Options {
  mode: "home" | "folder"
}

export default ((opts?: Options) => {
  const mode = opts?.mode ?? "home"
  const ChapterIndex: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
    const slug = fileData.slug! as FullSlug
    if (mode === "home" && slug !== "index") return null
    if (mode === "folder" && (slug === "index" || !slug.endsWith("/index"))) return null
    const href = (n: BookNode) => resolveRelative(slug, n.slug)

    const lessonList = (node: BookNode, depth: number) => (
      <ol class={`toc-list depth-${depth}`}>
        {node.children.map((c) => (
          <li class={c.isFolder ? "toc-folder" : "toc-page"}>
            <a href={href(c)} class="toc-link">
              <span class="toc-num">{c.number}</span>
              <span class="toc-name">{c.name}</span>
            </a>
            {c.isFolder && c.children.length > 0 && lessonList(c, depth + 1)}
          </li>
        ))}
      </ol>
    )

    // Home page: one card per chapter
    if (mode === "home") {
      const root = buildBook(allFiles)
      return (
        <section class="chapter-index">
          <h2 class="chapter-index-heading">Contents</h2>
          <div class="chapter-grid">
            {root.children
              .filter((c) => c.isFolder)
              .map((ch) => (
                <details class="chapter-card">
                  <summary>
                    <span class="chapter-num">{ch.number}</span>
                    <span class="chapter-title">
                      <a href={href(ch)}>{ch.name}</a>
                      <span class="chapter-count">
                        {countLessons(ch)} {countLessons(ch) === 1 ? "page" : "pages"}
                      </span>
                    </span>
                    <span class="chapter-chevron" aria-hidden="true"></span>
                  </summary>
                  {lessonList(ch, 0)}
                </details>
              ))}
          </div>
        </section>
      )
    }

    // Folder page: the folder's contents in book order
    const folder = findFolder(allFiles, slug)
    if (!folder || folder.children.length === 0) return null
    return <section class="chapter-index folder-index">{lessonList(folder, 0)}</section>
  }

  ChapterIndex.css = `
.chapter-index-heading {
  margin-top: 2.5rem;
  margin-bottom: 1rem;
}
.chapter-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.chapter-card {
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  background: var(--light);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.chapter-card:hover, .chapter-card[open] {
  border-color: color-mix(in srgb, var(--secondary) 45%, var(--lightgray));
}
.chapter-card[open] { box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
.chapter-card > summary {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  cursor: pointer;
  user-select: none;
}
.chapter-card > summary::-webkit-details-marker { display: none; }
.chapter-num {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 8px;
  background: var(--highlight);
  color: var(--secondary);
  font-family: var(--headerFont);
  font-weight: 700;
}
.chapter-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}
.chapter-title a {
  font-family: var(--headerFont);
  font-weight: 600;
  font-size: 1.08rem;
  color: var(--dark);
  background: none !important;
}
.chapter-title a:hover { color: var(--secondary); }
.chapter-count { font-size: 0.82rem; color: var(--gray); }
.chapter-chevron {
  width: 0.55rem;
  height: 0.55rem;
  border-right: 2px solid var(--gray);
  border-bottom: 2px solid var(--gray);
  transform: rotate(-45deg);
  transition: transform 0.2s ease;
  margin-right: 0.3rem;
}
.chapter-card[open] .chapter-chevron { transform: rotate(45deg); }
.chapter-card > .toc-list {
  padding: 0.2rem 1.1rem 1rem 4.3rem;
}

.toc-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.toc-list li { margin: 0; }
.toc-link {
  display: flex;
  gap: 0.7rem;
  padding: 0.28rem 0.5rem;
  margin: 0 -0.5rem;
  border-radius: 6px;
  color: var(--darkgray) !important;
  background: none !important;
  font-weight: 400;
}
.toc-link:hover { background: var(--highlight) !important; color: var(--secondary) !important; }
.toc-num {
  flex: 0 0 auto;
  min-width: 2.6rem;
  color: var(--gray);
  font-variant-numeric: tabular-nums;
  font-size: 0.92em;
}
.toc-folder > .toc-link .toc-name { font-weight: 600; color: var(--dark); }
.toc-list.depth-1, .toc-list.depth-2 {
  margin-left: 1.15rem;
  padding-left: 0.9rem;
  border-left: 1px solid var(--lightgray);
}
.toc-list.depth-1 .toc-link, .toc-list.depth-2 .toc-link { font-size: 0.94rem; }

.folder-index {
  margin-top: 0.5rem;
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  padding: 1rem 1.4rem;
  background: var(--light);
}
`

  return ChapterIndex
}) satisfies QuartzComponentConstructor<Options | undefined>
