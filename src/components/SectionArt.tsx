import { Children, type ReactNode } from "react";
export type ArtKind =
  | "news"
  | "watch"
  | "models"
  | "weekly"
  | "about"
  | "community"
  | "jar-full"
  | "jar"
  | "footer";
// Exact approved board crops, plus the requested full-jar illustration.
const crops: Record<
  ArtKind,
  [string, number, number, number, number, number, number]
> = {
  "jar-full": ["full-cookie-jar.jpg", 900, 720, 0, 0, 900, 720],
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
// Remove the light paper pixels at render time, keeping the approved source intact.
export function ArtworkFilters({ prefix = "artwork" }: { prefix?: string }) {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      style={{ position: "absolute" }}
    >
      <defs>
        <filter id={`${prefix}-dark-key`} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -3 -3 -3 0 7.5"
          />
          <feComposite in2="SourceGraphic" operator="in" result="cutout" />
          <feColorMatrix
            in="cutout"
            type="matrix"
            values="-.8 0 0 0 .9  0 -.8 0 0 .88  0 0 -.8 0 .82  0 0 0 1 0"
            result="lightInk"
          />
          <feColorMatrix
            in="cutout"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  4 -4 0 0 0"
            result="orangeMask"
          />
          <feComposite
            in="cutout"
            in2="orangeMask"
            operator="in"
            result="warmColour"
          />
          <feMerge>
            <feMergeNode in="lightInk" />
            <feMergeNode in="warmColour" />
          </feMerge>
        </filter>
        <filter id={`${prefix}-paper-key`} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  -3 -3 -3 0 7.5"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}
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
      data-art={kind}
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}art/${file})`,
        backgroundSize: `${(width / cropWidth) * 100}% ${(height / cropHeight) * 100}%`,
        backgroundPosition: `${width === cropWidth ? 0 : (x / (width - cropWidth)) * 100}% ${height === cropHeight ? 0 : (y / (height - cropHeight)) * 100}%`,
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
