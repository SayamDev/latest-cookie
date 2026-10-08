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
// Display the exact approved boards through bounded CSS windows; no regenerated art.
const crops: Record<
  ArtKind,
  [string, number, number, number, number, number, number]
> = {
  news: ["approved-news-watch-models.jpg", 1536, 1024, 830, 55, 670, 295],
  watch: ["approved-news-watch-models.jpg", 1536, 1024, 817, 378, 690, 295],
  models: ["approved-news-watch-models.jpg", 1536, 1024, 825, 697, 670, 310],
  weekly: ["approved-weekly-community-jar.jpg", 1024, 1536, 520, 60, 465, 343],
  about: ["approved-weekly-community-jar.jpg", 1024, 1536, 512, 427, 475, 320],
  community: [
    "approved-weekly-community-jar.jpg",
    1024,
    1536,
    510,
    769,
    478,
    299,
  ],
  jar: ["approved-weekly-community-jar.jpg", 1024, 1536, 496, 1086, 488, 401],
  footer: ["approved-home-footer.jpg", 1536, 1024, 397, 885, 788, 113],
};
export function SectionArt({
  kind,
  className = "",
}: {
  kind: ArtKind;
  className?: string;
}) {
  const [file, width, height, x, y, cropWidth, cropHeight] = crops[kind];
  return (
    <span
      aria-hidden="true"
      className={`section-art ${className}`}
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}art/${file})`,
        backgroundSize: `${(width / cropWidth) * 100}% ${(height / cropHeight) * 100}%`,
        backgroundPosition: `${(x / (width - cropWidth)) * 100}% ${(y / (height - cropHeight)) * 100}%`,
        aspectRatio: `${cropWidth} / ${cropHeight}`,
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
