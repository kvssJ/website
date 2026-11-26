import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { readingOrder, BookNode } from "../util/bookOrder"
import { resolveRelative } from "../util/path"

function context(node: BookNode): string {
  const parts: string[] = []
  let p = node.parent
  while (p && p.parent) {
    parts.unshift(p.name)
    p = p.parent
  }
  return parts.join(" › ")
}

const BookNav: QuartzComponent = ({ fileData, allFiles }: QuartzComponentProps) => {
  const slug = fileData.slug!
  const order = readingOrder(allFiles)
  const idx = order.findIndex((n) => n.slug === slug)
  if (idx === -1) return null
  const prev = idx > 0 ? order[idx - 1] : undefined
  const next = idx < order.length - 1 ? order[idx + 1] : undefined

  const card = (node: BookNode, dir: "prev" | "next") => (
    <a class={`book-nav-card ${dir}`} href={resolveRelative(slug, node.slug)}>
      <span class="book-nav-dir">{dir === "prev" ? "← Previous" : "Next →"}</span>
      <span class="book-nav-title">
        {node.number && <span class="book-nav-num">{node.number}</span>}
        {node.name}
      </span>
      {context(node) && <span class="book-nav-ctx">{context(node)}</span>}
    </a>
  )

  return (
    <nav class="book-nav" aria-label="Lesson navigation">
      {prev ? card(prev, "prev") : <span />}
      {next ? card(next, "next") : <span />}
    </nav>
  )
}

BookNav.css = `
.book-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 2.5rem 0 1rem;
}
.book-nav-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.9rem 1.1rem;
  border: 1px solid var(--lightgray);
  border-radius: 10px;
  background: var(--light);
  text-decoration: none !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, transform 0.15s ease;
  min-width: 0;
}
.book-nav-card:hover {
  border-color: var(--secondary);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}
.book-nav-card.next { text-align: right; align-items: flex-end; }
.book-nav-dir {
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--gray);
}
.book-nav-title {
  font-family: var(--headerFont);
  font-weight: 600;
  color: var(--secondary);
  font-size: 1.02rem;
}
.book-nav-num {
  color: var(--gray);
  font-weight: 500;
  margin-right: 0.45em;
}
.book-nav-ctx {
  font-size: 0.8rem;
  color: var(--gray);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
@media (max-width: 600px) {
  .book-nav { grid-template-columns: 1fr; }
  .book-nav-card.next { text-align: left; align-items: flex-start; }
}
`

export default (() => BookNav) satisfies QuartzComponentConstructor
