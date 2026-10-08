import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  ChartNoAxesCombined,
  Play,
  X,
} from "lucide-react";
import { ArtworkFilters, SectionArt } from "./SectionArt";
import type { Story } from "../lib/content";
import "./guide.css";
const sections = [
  {
    label: "Read",
    icon: BookOpen,
    art: "news",
    title: "Follow the story to its source.",
    copy: "Catch up with publisher headlines in the News desk, or explore our short, source-linked story summaries. Search and topics help you find your next rabbit hole.",
    note: "Publisher feeds refresh daily. Each source shows its last successful check; curated summaries have their own dates.",
    path: "news/",
    action: "Open the news desk",
  },
  {
    label: "Watch",
    icon: Play,
    art: "watch",
    title: "Find something worth watching.",
    copy: "Explore recent tech videos by AI, coding, gadgets or computer science. Switch between newest and most viewed within your selection.",
    note: "Four selected channels, not YouTube’s global trending chart. Videos open on YouTube; no player loads here.",
    path: "watch/",
    action: "Find a video",
  },
  {
    label: "Compare",
    icon: ChartNoAxesCombined,
    art: "models",
    title: "Get to know the models.",
    copy: "Compare capability, speed and cost in Model Lab. Filter the benchmark table, shortlist three models, explore the charts or estimate token costs in the API catalogue.",
    note: "Scores are sourced, dated measurements—not popularity or a guarantee of results. Missing measurements stay unknown.",
    path: "models/",
    action: "Explore Model Lab",
  },
  {
    label: "Save",
    icon: Bookmark,
    art: "jar-full",
    title: "Keep a good read for later.",
    copy: "Tap a story’s bookmark to put it in your Cookie Jar. Try it below with a real story, then find it again using Saved in the header.",
    note: "Saved stories stay in this browser. No account, syncing or tracking cookies. You can remove a story or clear the jar anytime.",
    path: "saved/",
    action: "Open your Cookie Jar",
  },
] as const;
export function SiteGuide({
  story,
  saved,
  toggle,
}: {
  story: Story;
  saved: boolean;
  toggle: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const [step, setStep] = useState(0);
  const [invitation, setInvitation] = useState(() => {
    try {
      return localStorage.getItem("latest-cookie:guide-seen") !== "yes";
    } catch {
      return true;
    }
  });
  const section = sections[step];
  function dismissInvitation() {
    setInvitation(false);
    try {
      localStorage.setItem("latest-cookie:guide-seen", "yes");
    } catch {
      /* Works for this visit. */
    }
  }
  function open() {
    dismissInvitation();
    dialog.current?.showModal();
  }
  function close() {
    dialog.current?.close();
  }
  useEffect(() => {
    const element = dialog.current;
    const restore = () => opener.current?.focus();
    element?.addEventListener("close", restore);
    return () => element?.removeEventListener("close", restore);
  }, []);
  return (
    <>
      <div className="guide-entry" role="region" aria-label="Site introduction">
        <button ref={opener} className="text-button" onClick={open}>
          <BookOpen size={16} /> Site guide
        </button>
        {invitation && (
          <div className="guide-invitation">
            <span>New here? Find your first good read.</span>
            <button className="text-button" onClick={open}>
              Take a look <ArrowRight size={16} />
            </button>
            <button
              className="icon-button"
              aria-label="Dismiss guide invitation"
              onClick={dismissInvitation}
            >
              <X size={17} />
            </button>
          </div>
        )}
      </div>
      <dialog
        ref={dialog}
        className="site-guide"
        aria-labelledby="guide-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <ArtworkFilters prefix="guide-artwork" />
        <div className="guide-inner">
          <header className="guide-header">
            <h2 id="guide-title">
              A LITTLE TASTE OF
              <br />
              LATEST COOKIE<span className="title-dot">.</span>
            </h2>
            <button
              className="icon-button"
              aria-label="Close site guide"
              onClick={close}
              autoFocus
            >
              <X />
            </button>
          </header>
          <p className="guide-intro">
            A free gathering place for curious tech people.
            <br />
            Read something useful. Follow the source. Keep the good bits.
          </p>
          <div
            className="guide-choices"
            role="group"
            aria-label="Explore site features"
          >
            {sections.map((s, i) => (
              <button
                key={s.label}
                aria-pressed={step === i}
                onClick={() => setStep(i)}
              >
                <s.icon size={18} /> {s.label}
              </button>
            ))}
          </div>
          <div className="guide-content" aria-live="polite">
            <div>
              <h3>{section.title}</h3>
              <p>{section.copy}</p>
            </div>
            <SectionArt kind={section.art} />
          </div>
          {step === 3 && (
            <div className="guide-save-example">
              <span>{story.title}</span>
              <button
                className={`button save-button ${saved ? "is-saved" : ""}`}
                aria-pressed={saved}
                onClick={toggle}
              >
                <Bookmark size={19} fill="none" />
                {saved ? "Saved · undo" : "Save this story"}
              </button>
            </div>
          )}
          <p className="guide-note">{section.note}</p>
          <footer className="guide-actions">
            <a
              className="button primary"
              href={import.meta.env.BASE_URL + section.path}
            >
              {section.action}
              <ArrowRight size={18} />
            </a>
            <button className="text-button" onClick={close}>
              I’ll explore on my own
            </button>
          </footer>
          <p className="guide-credit">
            Made by Sayam Ajmal. Reopen this guide anytime above the page.
          </p>
        </div>
      </dialog>
    </>
  );
}
