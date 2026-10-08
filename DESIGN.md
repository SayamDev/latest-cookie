---
name: Latest Cookie
description: A compact computing journal on warm paper, with sharp ink and orange signals.
colors:
  paper: "#f2f0e9"
  ink: "#171a17"
  muted: "#5d6059"
  rule: "#c4c5bb"
  strong-rule: "#96998e"
  accent: "#ff6029"
  accent-hover: "#f37a4e"
  panel: "#e9e7de"
  reading-list: "#1b1e1a"
  dark-muted: "#b9bcb1"
  dark-rule: "#41463d"
  dark-strong-rule: "#727769"
  dark-panel: "#232720"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(48px, 5vw, 78px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(44px, 4.35vw, 68px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Georgia, serif"
    fontSize: "23px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    lineHeight: 1.55
  reading:
    fontFamily: "Georgia, serif"
    fontSize: "18px"
    lineHeight: 1.75
  label:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "10px"
    fontWeight: 700
    letterSpacing: "0.055em"
rounded:
  square: "0px"
spacing:
  compact: "8px"
  control: "12px"
  comfortable: "20px"
  section: "25px"
  gutter: "30px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.square}"
    padding: "10px 16px"
  topic-selected:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.ink}"
    padding: "10px 12px"
  source-note:
    backgroundColor: "{colors.panel}"
    padding: "25px"
---

# Design System: Latest Cookie

## Overview

**Creative North Star: "The Computing Journal"**

A compact, legible publication with the confidence of a printed computing journal. Warm paper, condensed display type and ruled columns establish an editorial rhythm; geometric engineering artwork and a bitten-cookie mark make it recognisable. Utility controls stay quiet while headlines and reading remain prominent.

**Key Characteristics:**
- Condensed masthead and feature headlines paired with serif reading.
- Flat, square surfaces divided by fine rules.
- Saturated orange for selection and prominent actions.
- Visible sources and honest empty states.

## Colors

Orange is the primary accent. Paper, ink, muted text and two rule strengths form the neutral structure; panel fills separate supporting information. The reading-list rail retains a deep neutral fill and pale text.

Dark mode swaps paper and ink, and replaces muted, rule, strong-rule and panel with their dark counterparts. Orange remains constant; text on orange stays dark. The primary-button text therefore uses fixed dark ink rather than the inverted dark-mode text token.

**The Signal Rule.** Use orange to identify actions and selected states; preserve neutral space for reading.

## Typography

Barlow Condensed supplies the uppercase masthead and major headings. DM Sans Variable handles controls, summaries and metadata. Georgia carries card titles, feature decks and article reading. The frontmatter records the principal desktop roles; responsive sizes are deliberate overrides, not a uniform scaling ratio.

Feature decks use Georgia (19px, 1.4 line height), while article headings use Barlow Condensed (800, clamp(48px, 6vw, 88px)). Article text is constrained to 730px; list summaries to 70ch. Mobile reading uses Georgia (17px, 1.7 line height). Compact uppercase topic labels provide orientation without competing with titles.

## Layout

The page is centred within 1600px, with desktop side gutters of 30px. The home surface pairs a 190px topic rail with a flexible editorial area; its feature combines copy and artwork beside a 258px reading-list rail. Feed cards form four ruled columns. At 1400px and above, the reading-list rail grows to 285px.

At 1200px and below, rail and type sizes tighten. At 980px and below, search moves to its own header row, the reading-list rail disappears and feed cards become two columns. At 650px and below, side gutters become 16px, topics wrap as bordered controls, header actions use icons, cards stack, and footer sections stack. The feature retains copy beside cropped artwork; at 360px and below its artwork is hidden and copy takes the full width. Saved stories remain reachable from the header.

Reading pages use a broad heading area and a narrower centred body. Community links use two columns, collapsing to one on mobile. Follow the actual cascade in `src/baseline.css` then `src/style.css`; the latter is the current visual authority.

## Elevation & Depth

There are no decorative shadows. Borders, paper/panel contrast and the dark reading-list block establish depth. The status message is a fixed contrasting strip with a fine border, rather than a floating rounded card.

## Shapes

Square buttons and rectangular content regions continue the journal's ruled geometry. Fine one-pixel borders organise content; generous circular geometry belongs to the cookie mark and engineering artwork. Icons use simple outlined strokes. Avoid introducing rounded cards into this system.

## Components

- **Buttons:** square, compact and at least 44px tall for the principal button style. Primary actions use orange with dark text; secondary actions use a transparent fill and a strong rule. Hover changes the fill. Icon buttons generally occupy 44px squares; compact mobile header controls use smaller widths.
- **Focus:** links, buttons and fields use an ink-coloured 3px outline offset by 4px. Preserve the visible skip link on focus.
- **Topics and navigation:** orange marks the selected topic, panel fill marks hover, and the current edition link has an orange underline. Mobile topic controls wrap without horizontal scrolling.
- **Search:** transparent field with a bottom rule, outlined search icon and orange caret. Its keyboard hint disappears on mobile. Keep it distinct from the main reading hierarchy.
- **Story cards:** flat ruled columns, serif title, sans-serif summary and a source/date line. Save controls sit beside the topic label. Mobile cards use horizontal separators.
- **Reading list:** a dark, pale-text rail with a direct empty-state explanation. Saving updates the list immediately; saved bookmark outlines use a deeper orange on paper for contrast and bright orange in dark mode; the guide keeps button text in ink. The full saved page supports empty and populated states.
- **Source notes:** neutral panel fill and sans-serif explanatory text inside serif reading pages. Source links remain visibly identifiable.
- **Feedback:** status messages use contrasting text at the viewport bottom. Disabled controls dim to 60% opacity with a waiting cursor. Empty results present an explicit explanation and recovery action.

Small fill transitions last 150ms. Save icons briefly scale and refresh icons spin only when reduced motion is not requested; reduced-motion users receive static icon states. No motion should obscure a reading or save outcome.

## Do's and Don'ts

- **Do** preserve clear type roles, visible focus and source attribution.
- **Do** use the actual light and dark tokens and test both modes.
- **Do** adapt the grid to real headline lengths and narrow viewports.
- **Don't** add decorative shadows, rounded card chrome or unrelated accent colours.
- **Don't** substitute invented activity or populated states for truthful empty states.
- **Don't** treat technical artwork as reporting evidence or hide original-source access.

## Site guide and artwork themes

The Site guide is a user-opened native dialog with Read, Watch, Compare and Save choices. A dismissible first-visit invitation offers discovery without blocking reading. The guide includes a real bookmark action, source/freshness explanations and direct route links. Dismissal is browser-local; Escape closes and returns focus to the opener. On mobile, choices form a two-column grid.

The daily news preview has a 30px desktop inner gutter and 28px vertical padding to separate it from Explore topics. Mobile uses the page gutter.

Dark artwork separates neutral ink from warm colours: neutral linework becomes pale while orange chips retain their hue. It does not invert the whole illustration. Guide SVG filter definitions live inside the dialog so artwork remains visible in the top layer.

The photographic home cookie keeps its original warm shading in both themes; only its paper background is removed. Saved outlines use #c44314 on light paper for contrast. The guide backdrop uses black at 72% opacity, and its 11–13px supporting type follows the existing compact metadata roles.
