// Builds the "book" structure of the site (chapters → sections → lessons) from all
// content files, using the same ordering rules as the Explorer sidebar
// (folderOrder / noteOrder frontmatter, then alphabetical).
import { QuartzPluginData } from "../plugins/vfile"
import { FullSlug } from "./path"

export interface BookNode {
  name: string // display name
  slug: FullSlug // page slug (folder nodes point at "<folder>/index")
  isFolder: boolean
  order?: number
  children: BookNode[]
  number?: string // "3", "3.2", "3.2.1"
  parent?: BookNode
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === "number") return v
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v)
  return undefined
}

function compare(a: BookNode, b: BookNode) {
  if (a.order !== undefined && b.order !== undefined) return a.order - b.order
  if (a.order !== undefined) return -1
  if (b.order !== undefined) return 1
  return a.name.localeCompare(b.name)
}

const cache = new WeakMap<QuartzPluginData[], BookNode>()

export function buildBook(allFiles: QuartzPluginData[]): BookNode {
  const cached = cache.get(allFiles)
  if (cached) return cached

  const root: BookNode = { name: "", slug: "index" as FullSlug, isFolder: true, children: [] }
  const folders = new Map<string, BookNode>([["", root]])

  const getFolder = (slugSegs: string[], nameSegs: string[]): BookNode => {
    const key = slugSegs.join("/")
    let node = folders.get(key)
    if (!node) {
      const parent = getFolder(slugSegs.slice(0, -1), nameSegs.slice(0, -1))
      node = {
        name: nameSegs[nameSegs.length - 1] ?? slugSegs[slugSegs.length - 1],
        slug: `${key}/index` as FullSlug,
        isFolder: true,
        children: [],
        parent,
      }
      parent.children.push(node)
      folders.set(key, node)
    }
    return node
  }

  for (const file of allFiles) {
    const slug = file.slug
    if (!slug || slug.startsWith("tags/") || slug === "tags/index") continue
    const slugSegs = slug.split("/")
    const rel = (file.relativePath ?? "").replace(/\.md$/, "")
    const nameSegs = rel.split("/")
    const folderSlugSegs = slugSegs.slice(0, -1)
    const folderNameSegs = nameSegs.slice(0, -1)
    const fm = (file.frontmatter ?? {}) as Record<string, unknown>

    if (slugSegs[slugSegs.length - 1] === "index") {
      if (folderSlugSegs.length === 0) continue // site home page
      const folder = getFolder(folderSlugSegs, folderNameSegs)
      folder.order = toNumber(fm.folderOrder) ?? toNumber(fm.noteOrder)
      const title = typeof fm.title === "string" ? fm.title.trim() : ""
      if (title && title !== "index") folder.name = title
      continue
    }

    const parent = getFolder(folderSlugSegs, folderNameSegs)
    const title = typeof fm.title === "string" && fm.title.trim() ? fm.title.trim() : ""
    parent.children.push({
      name: title || nameSegs[nameSegs.length - 1] || slugSegs[slugSegs.length - 1],
      slug: slug as FullSlug,
      isFolder: false,
      order: toNumber(fm.noteOrder),
      children: [],
      parent,
    })
  }

  const sortAndNumber = (node: BookNode, prefix: string) => {
    node.children.sort(compare)
    node.children.forEach((child, i) => {
      child.number = prefix ? `${prefix}.${i + 1}` : `${i + 1}`
      if (child.isFolder) sortAndNumber(child, child.number)
    })
  }
  sortAndNumber(root, "")

  cache.set(allFiles, root)
  return root
}

/** All lesson pages (not folder pages) in reading order, starting with the home page. */
export function readingOrder(allFiles: QuartzPluginData[]): BookNode[] {
  const root = buildBook(allFiles)
  const out: BookNode[] = [
    { name: "Home", slug: "index" as FullSlug, isFolder: false, children: [] },
  ]
  const walk = (n: BookNode) => {
    for (const c of n.children) {
      if (c.isFolder) walk(c)
      else out.push(c)
    }
  }
  walk(root)
  return out
}

export function findFolder(allFiles: QuartzPluginData[], folderSlug: string): BookNode | undefined {
  const root = buildBook(allFiles)
  const key = folderSlug.replace(/\/?index$/, "")
  if (key === "") return root
  const segs = key.split("/")
  let node: BookNode | undefined = root
  for (let i = 0; i < segs.length && node; i++) {
    const want = segs.slice(0, i + 1).join("/") + "/index"
    node = node.children.find((c) => c.isFolder && c.slug === want)
  }
  return node
}

/** Top-level chapter a page belongs to. */
export function chapterOf(node: BookNode | undefined): BookNode | undefined {
  let n = node
  while (n?.parent && n.parent.parent) n = n.parent
  return n?.parent ? n : undefined
}

export function countLessons(node: BookNode): number {
  return node.children.reduce((s, c) => s + (c.isFolder ? countLessons(c) : 1), 0)
}
