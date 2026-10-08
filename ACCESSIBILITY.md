# Accessibility

Latest Cookie targets WCAG 2.2 AA. This is not a claim of full conformance.

## Tested on 8 October 2026

- Playwright Chromium at 1440×1000 and 390×844.
- Axe automated scans: homepage in light and dark themes; briefing, community, editorial/privacy and saved routes. No violations in these scans.
- Search, topic filters, explicit empty states, bookmarking and persistence, theme persistence and direct story routes.
- Skip-link keyboard focus and semantic landmark labels.
- No horizontal overflow in checked desktop/mobile routes.
- Failed collection refresh preserves existing stories and announces feedback.

## Remaining manual coverage

Real screen-reader testing (VoiceOver, NVDA), 200% zoom, Safari/Firefox and user testing remain to be completed. Automated scans do not prove full accessibility. Reduced-motion styling disables the only authored animations. Local storage failures fall back to session-only state with a visible message.

Report accessibility issues through GitHub Issues with the affected page, browser, assistive technology and expected behaviour. Do not include private information.

Daily discovery additions: news search/outlet/window filters, video topics/order, expanded model source filters, tiered-price exclusions, incremental catalogue loading and stale-fetch preservation are included in the Chromium checks. Source tables/lists and video cards preserve semantic headings and links.
