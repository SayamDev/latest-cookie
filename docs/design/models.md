# Model Lab

Mode: Operate. Extension of the Computing Journal, code-led.

## Intent
Help developers compare documented API prices and token limits, shortlist up to three models and estimate a text workload. Six source-checked entries launch the catalogue; completeness and performance rankings are not claimed.

## Direction
Inherit DESIGN.md. A compact instrument page: broad condensed heading, ruled data table, orange selection, quiet source notes. No new assets or invented scores.

## First viewport
Title and source date followed immediately by search/provider/input controls, a price chart beside a workload calculator. The catalogue follows without a marketing hero. The signature interaction changes the calculator's bars instantly when token volumes change.

## Behaviour
Filters narrow both table and chart; selections survive filtering. Compare up to three in a separate semantic table. A share URL reproduces filters, selection and workload. Invalid input shows an error instead of a fabricated estimate.

## Constraints
Mobile charts stack above calculator, tables scroll in named keyboard-focusable regions without overflowing the page. Light/dark themes, keyboard access, tabular numerals. All data source links remain accessible.

## Proof
Domain tests for math/filtering/validation; desktop/mobile Playwright flows and axe; screenshots of default and comparison states. No unresolved design choices.
