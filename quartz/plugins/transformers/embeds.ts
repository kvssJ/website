import { Root, Element, ElementContent } from "hast"
import { visit } from "unist-util-visit"
import { QuartzTransformerPlugin } from "../types"

// Presentation-only wrappers for embedded media:
//  - YouTube iframes become responsive 16:9 players
//  - PDF iframes get a small toolbar (name, open in new tab, download)
// Text content is never modified.

function el(
  tagName: string,
  properties: Element["properties"],
  children: ElementContent[] = [],
): Element {
  return { type: "element", tagName, properties, children }
}
const txt = (value: string): ElementContent => ({ type: "text", value })

function pdfName(src: string): string {
  const file = decodeURIComponent(src.split("/").pop() ?? src)
  return file
    .replace(/\.pdf$/i, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

const pdfIcon = el(
  "svg",
  {
    viewBox: "0 0 24 24",
    width: 18,
    height: 18,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ariaHidden: "true",
  },
  [
    el("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
    el("polyline", { points: "14 2 14 8 20 8" }),
  ],
)

export const Embeds: QuartzTransformerPlugin = () => ({
  name: "Embeds",
  htmlPlugins() {
    return [
      () => (tree: Root) => {
        visit(tree, "element", (node, index, parent) => {
          if (!parent || index === undefined || node.tagName !== "iframe") return
          const cls = ([] as string[]).concat((node.properties.className as string[]) ?? [])
          const src = String(node.properties.src ?? "")

          if (cls.includes("youtube")) {
            node.properties = {
              ...node.properties,
              width: undefined,
              loading: "lazy",
              allow:
                "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
              allowFullScreen: true,
              title: "YouTube video",
            }
            parent.children[index] = el("div", { className: ["video-embed"] }, [node])
            return "skip"
          }

          if (cls.includes("pdf") && src) {
            node.properties = { ...node.properties, loading: "lazy", title: pdfName(src) }
            const toolbar = el("div", { className: ["pdf-toolbar"] }, [
              el("span", { className: ["pdf-name"] }, [pdfIcon, txt(pdfName(src))]),
              el("span", { className: ["pdf-actions"] }, [
                el(
                  "a",
                  {
                    href: src,
                    target: "_blank",
                    rel: "noopener",
                    className: ["pdf-btn", "external"],
                  },
                  [txt("Open")],
                ),
                el(
                  "a",
                  { href: src, download: "", className: ["pdf-btn", "primary", "external"] },
                  [txt("Download")],
                ),
              ]),
            ])
            parent.children[index] = el("figure", { className: ["pdf-embed"] }, [toolbar, node])
            return "skip"
          }
        })
      },
    ]
  },
})
