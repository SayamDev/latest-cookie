import { Children, type ReactNode } from "react";
export type ArtKind =
  | "news"
  | "watch"
  | "models"
  | "weekly"
  | "about"
  | "community"
  | "jar"
  | "footer";
const kinds: ArtKind[] = [
  "news",
  "watch",
  "models",
  "weekly",
  "about",
  "community",
  "jar",
  "footer",
];
export function SectionArt({
  kind,
  className = "",
}: {
  kind: ArtKind;
  className?: string;
}) {
  const index = kinds.indexOf(kind);
  return (
    <span
      aria-hidden="true"
      className={`section-art ${className}`}
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}art/section-artwork.jpg)`,
        backgroundPosition: `${((index % 4) * 100) / 3}% ${index < 4 ? 0 : 100}%`,
      }}
    />
  );
}
export function ArtHeading({
  kind,
  children,
  id,
}: {
  kind: ArtKind;
  children: ReactNode;
  id?: string;
}) {
  return (
    <div className="art-heading">
      <h1 id={id}>
        {Children.map(children, (child) =>
          typeof child === "string"
            ? child.split(/(\.)/).map((part, i) =>
                part === "." ? (
                  <span className="title-dot" key={i}>
                    .
                  </span>
                ) : (
                  part
                ),
              )
            : child,
        )}
      </h1>
      <SectionArt kind={kind} />
    </div>
  );
}
