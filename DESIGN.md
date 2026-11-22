---
name: RentRoll
description: A calm rent dashboard that shows who owes what before anything else.
colors:
  green: "#005536"
  green-2: "#027246"
  green-3: "#1d7a5b"
  side: "#083d36"
  side-2: "#002b23"
  side-text: "#e4f3eb"
  mint: "#dff3e7"
  mint-2: "#eef8f2"
  mint-disc: "#a6e3bf"
  chart-green: "#34b36f"
  amber: "#e9a820"
  amber-ink: "#7d5200"
  amber-bg: "#fff5de"
  amber-icon: "#ffe9b8"
  chart-amber: "#f4c542"
  red: "#c4302b"
  red-ink: "#9f2622"
  red-bg: "#fdecea"
  ground: "#f4f8f6"
  white: "#ffffff"
  ink: "#10231e"
  ink-2: "#4a5f58"
  line: "#dde7e2"
  edge: "#76948a"
  slate-bg: "#eef1f3"
  slate-ink: "#36474f"
typography:
  display:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 11vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 6vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.03em"
  page-title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  figure:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  tile-figure:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  title:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-small:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  action:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.5
  action-small:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.5
  caption:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.5
  micro:
    fontFamily: "Figtree, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.5
rounded:
  tag: "6px"
  tab: "8px"
  control: "10px"
  card: "14px"
  showcase: "18px"
  pill: "20px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  tile-gap: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
  section: "52px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green-2}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.mint-2}"
  button-destructive:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "8px 20px"
    height: "48px"
  button-destructive-hover:
    backgroundColor: "{colors.slate-bg}"
  button-small:
    typography: "{typography.action-small}"
    padding: "4px 14px"
    height: "44px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
    height: "48px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px"
  tile-collected:
    backgroundColor: "{colors.mint-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  tile-due:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  tile-overdue:
    backgroundColor: "{colors.red-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  tile-expected:
    backgroundColor: "{colors.slate-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  room-card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "12px"
  room-card-overdue:
    backgroundColor: "{colors.red-bg}"
    textColor: "{colors.ink}"
  room-card-today:
    backgroundColor: "{colors.amber-bg}"
    textColor: "{colors.ink}"
  room-card-paid:
    backgroundColor: "{colors.mint-2}"
    textColor: "{colors.ink}"
  room-number:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.green}"
    typography: "{typography.label}"
    rounded: "{rounded.tag}"
    padding: "1px 8px"
  room-number-overdue:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
  property-chip:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body-small}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  property-chip-active:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
  due-tab:
    backgroundColor: "{colors.slate-bg}"
    textColor: "{colors.ink-2}"
    typography: "{typography.caption}"
    rounded: "{rounded.tab}"
    height: "44px"
  due-tab-active:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.green}"
  due-tab-overdue-active:
    backgroundColor: "{colors.red-bg}"
    textColor: "{colors.red-ink}"
  notice-ok:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
  notice-error:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 14px"
---

# Design System: RentRoll

## Overview

**Creative North Star: "The Morning Rent Ledger"**

RentRoll is the calm first look at the day's money. A deep green frame holds white cards on a pale mint ground, and the first thing on any rent screen is who has paid, who is due and who is late. The tone is trustworthy and unhurried, so a landlord can read it between other tasks on a mid-range phone in daylight.

Density stays moderate. Tinted summary tiles give the headline numbers, a single list names the people to act on, and room cards hold the full picture below. Soft shadows and rounded corners make the product feel approachable, while strict status color keeps it serious about money.

The public landing page speaks in the same materials at a larger scale. It may use a tilted sample phone and a large mint disc to persuade. The logged-in app stays square to the grid and spends its emphasis on rent status.

**Key Characteristics:**
- Deep green sidebar and primary actions on a pale mint ground.
- White cards with soft green-tinted shadows and 14px corners.
- Mint, amber, red and slate summary tiles.
- Figtree at every level, with tabular rupee figures.
- Status always stated in words, with red kept for overdue money.
- Bottom tabs on phones, a green sidebar from 900px.

## Colors

A green and mint palette with two working status colors, amber for due now and red for overdue.

### Primary
- **Deep Ledger Green** (#005536): Primary buttons, selected property chips, selected choices, logo text, links and active labels on light surfaces.
- **Lifted Green** (#027246): Primary hover, the active sidebar item, secondary button outlines and icons on mint.
- **Focus Green** (#1d7a5b): The global focus ring, field hover and focus strokes, small checks and arrows.
- **Sidebar Pine** (#083d36) into **Night Pine** (#002b23): The vertical gradient on the desktop sidebar and login brand panel, and the horizontal band of the landing's closing call to action.
- **Sidebar Text** (#e4f3eb): Resting navigation labels on pine.

### Secondary
- **Soft Mint** (#dff3e7): Selection, room number tags, icon circles, success notices, the active due tab and the field focus halo.
- **Mint Wash** (#eef8f2): Collected tiles, paid room cards, feature cards and quiet green hover.
- **Mint Disc** (#a6e3bf): The large circle behind the landing's sample phone. Landing only.
- **Chart Green** (#34b36f): The collected portion of the chart, its legend dot, the headline underline and the payment settle ring.

### Tertiary
- **Due Amber** (#e9a820): The due-today room card edge and focus rings on dark green surfaces. Never text.
- **Amber Ink** (#7d5200): Text and icons on amber tints.
- **Amber Wash** (#fff5de): Due-today tiles and room cards.
- **Amber Circle** (#ffe9b8): Icon circles and number tags on amber tints.
- **Chart Amber** (#f4c542): The pending chart segment and legend dot.
- **Overdue Red** (#c4302b): Overdue figures, tags, card edges, chart segment and the overdue tenant card.
- **Overdue Ink** (#9f2622): Overdue words on the red tint.
- **Overdue Wash** (#fdecea): Overdue tiles, room cards and the active overdue tab.

### Neutral
- **Pale Mint Ground** (#f4f8f6): The app background and tinted landing sections.
- **Card White** (#ffffff): Cards, fields, lists, the landing page and text on green or red.
- **Ledger Ink** (#10231e): Primary text, and the frame of errors and destructive actions.
- **Quiet Ink** (#4a5f58): Secondary text, hints, inactive tabs and resting bottom navigation.
- **Hairline** (#dde7e2): Decorative dividers and card outlines only.
- **Control Edge** (#76948a): Resting field strokes, choice tiles, and dashed part-paid and vacant room edges.
- **Slate Wash** (#eef1f3): The Total Expected tile, inactive due tabs, avatars and the chart track.
- **Slate Ink** (#36474f): Text and icons on slate.

### Named Rules
**The Red Means Overdue Rule.** Red marks overdue money and nothing else. Errors and destructive actions use Ledger Ink with a heavy edge, so red never loses its meaning.

**The Amber Is Not Text Rule.** Due Amber draws edges and focus rings. Words on an amber tint use Amber Ink.

## Typography

**Display Font:** Figtree (with system-ui, sans-serif)
**Body Font:** Figtree
**Label/Mono Font:** Figtree, with tabular numerals for money and room numbers

**Character:** A friendly geometric sans that stays clear at small sizes. Heavy weights and tight tracking give headlines confidence, while sentence-level copy stays plain for non-technical readers.

### Hierarchy
- **Display** (800, clamp(2.5rem, 11vw, 3.75rem), 1.04, -0.035em): The landing headline only.
- **Headline** (800, clamp(1.75rem, 6vw, 2.5rem), 1.1, -0.03em): Landing section headings, balanced on wrap.
- **Page Title** (800, 1.625rem rising to 1.75rem from 900px, 1.15, -0.02em): Logged-in page titles.
- **Figure** (800, 2rem, 1.1, tabular): The balance on a tenant card.
- **Tile Figure** (800, 1.0625rem rising to 1.25rem from 720px, 1.2, tabular): Summary tile amounts.
- **Title** (700, 1.125rem, 1.25, -0.01em): Card and section headings.
- **Body** (400, 1rem, 1.5): Default text and field values. Long answers cap at 65ch.
- **Body Small** (400, 0.9375rem, 1.5): Supporting lines and notices.
- **Action** (700, 1rem; 0.875rem when small): Button text.
- **Label** (700, 0.875rem): Field labels and room numbers.
- **Caption** (600, 0.8125rem): Tile labels, row details and room status.
- **Micro** (600, 0.75rem): Phone tab labels and property names on room cards. The smallest live app text.

### Named Rules
**The Tabular Money Rule.** Every live rupee figure and room number uses tabular numerals so amounts compare cleanly down a column.

**The One Family Rule.** Figtree carries all interface type. Email alone uses Arial, deliberately, because mail clients cannot rely on web fonts.

## Layout

The app is phone first. Content is capped at 1180px with 16px gutters, widening to 28px from 900px. Focused forms narrow to 600px.

The dashboard reads top to bottom: greeting, summary tiles, Rent Due List, Collection Summary, then all rooms. Tiles run two across on phones and four across from 720px. The list and summary sit side by side from 1040px at roughly 1.55 to 1. Room cards run two across on phones and auto-fill at a 180px minimum from 560px.

Navigation is a fixed four-item bottom bar on phones, respecting the safe area, and becomes a 232px sidebar at 900px. Login screens stack a compact pine brand band over the form on phones and become a 42% brand panel beside the form on desktop.

The landing page uses the same 1180px container with 20px gutters. Its hero is one column on phones and two columns from 960px, with 52px section padding.

Spacing follows a 4, 8, 10, 12, 16, 20 and 24px rhythm. Main actions and fields are 48px, row actions and due tabs are 44px, and property chips are 40px.

## Elevation & Depth

The system uses soft, green-tinted ambient shadows with tonal layering. White cards lift gently from the pale ground, and tinted tiles carry the same soft lift. Stronger shadows are reserved for hover, floating confirmation and landing showcase objects.

### Shadow Vocabulary
- **Card Rest** (`box-shadow: 0 1px 2px rgb(13 74 56 / .05), 0 6px 18px rgb(13 74 56 / .06)`): Cards, tiles, lists, panels and room cards.
- **Room Hover** (`box-shadow: 0 8px 22px rgb(13 74 56 / .13)`): Hover on a tappable room card.
- **Floating Notice** (`box-shadow: 0 6px 20px rgb(13 74 56 / .25)`): The payment confirmation with Undo.
- **Showcase** (`box-shadow: 0 16px 40px rgb(0 43 35 / .1)`): Landing product and email previews.
- **Sample Phone** (`box-shadow: 0 24px 50px rgb(0 43 35 / .32)`): The landing hero phone only.
- **Settle Ring** (`box-shadow: 0 0 0 7px rgb(52 179 111 / .55)`, fading to none over 700ms): The room card that just received a payment. Removed under reduced motion.

### Named Rules
**The Soft Light Rule.** Shadows stay diffuse and green-tinted. Emphasis on a live rent surface comes from status color and words before a bigger shadow.

## Shapes

Corners are friendly and consistent: 14px on cards and tiles, 10px on buttons, fields and notices, 8px on due tabs, 6px on number tags, 18px on landing showcase frames, 20px on chips, and full circles for icon wells and avatars.

Edges carry meaning on room cards. Overdue and due today use a solid colored edge, and both part-paid and vacant rooms use a dashed edge. Part paid keeps a white fill and states the balance left. Vacant is transparent with no shadow and says Vacant.

### Named Rules
**The Status In Words Rule.** Every rent state is written out on the card or row. Color and edge reinforce the words and never replace them.

## Components

### Buttons
Solid, friendly and easy to hit.
- **Shape:** Gently rounded (10px), 48px tall, weight 700.
- **Primary:** Deep Ledger Green with white text (8px 20px).
- **Hover / Focus:** Primary lifts to Lifted Green. Focus uses a 3px Focus Green outline offset by 2px, or amber on dark green. Press moves down 1px, and pending buttons fade to 60%.
- **Secondary:** White with a 1.5px Lifted Green outline and green text, washing to mint on hover. Mark Paid uses this style.
- **Destructive:** White with a 1.5px ink outline and ink text. Never red.
- **Small:** 44px tall for row and page-header actions.
- **Text:** Bold underlined green, or ink for destructive actions, at a 44px target.

### Chips
- **Style:** Property chips are white 40px pills with a hairline outline, scrolling sideways on phones.
- **State:** The selected chip fills with Deep Ledger Green and takes white text.

### Cards / Containers
- **Corner Style:** Softly rounded (14px).
- **Background:** Card White on Pale Mint Ground.
- **Shadow Strategy:** Card Rest.
- **Border:** 1px Hairline.
- **Internal Padding:** 16px on cards and panels, 13px 16px on list rows.
- **Tenant Card:** A full green card, or red when overdue, carrying the room number, name and balance at Figure size.

### Inputs / Fields
- **Style:** White, 1px Control Edge stroke, 10px corners, 48px tall, with the label above and hint below.
- **Focus:** The stroke turns Focus Green with a 3px Soft Mint halo.
- **Choice:** Paired options are 52px tiles with a 1.5px edge. The selected tile fills green.
- **Error:** A white notice with a 1.5px ink edge and an alert icon, stated in words.

### Navigation
- **Phone:** A white bottom bar of four icon-over-label tabs, 64px tall. The active tab turns green and bold with a 3px bar along its top edge.
- **Desktop:** A 232px pine gradient sidebar with the light logo. Items are 44px rows, and the active item fills with Lifted Green.

### Summary Tile
A tinted card with a circular icon, a tabular amount, a label and, from 720px, a supporting count. Collected is mint, Due Today amber, Overdue red and Total Expected slate.

### Rent Due List
The daily work surface. Three tabs show Due Today, Overdue and Upcoming with counts. Each row has an initials avatar, the person and room, the balance, the status in words and, for people with Full access, a Mark Paid action. On phones the action spans the full row width.

### Collection Summary
A 124px donut with the percent collected in its center, paired with a legend that states Collected, Pending and Overdue as exact amounts.

### Room Card
A tappable card, at least 136px tall, stacks the room number, optional property, tenant name, amount and a status line pinned to the bottom. Pressing scales it to 98%. After a payment it settles with a green ring.

### Reminder Email
A deliberately plain message: white background, Arial, a 520px column, thin dividers and underlined text links, with no color blocks or large buttons so it does not resemble scam mail. Each row names the tenant, room, balance and status in words. Mark paid links open a confirmation page.

## Do's and Don'ts

### Do:
- **Do** put who owes what first on every screen that deals with rent.
- **Do** write every rent state in words as well as color.
- **Do** use tabular numerals for live rupee figures and room numbers.
- **Do** keep main actions and fields at 48px and row actions at 44px.
- **Do** give control boundaries at least 3:1 contrast against their surface.
- **Do** use amber focus rings on dark green surfaces.
- **Do** keep reminder emails in Arial with a plain, link-based layout.
- **Do** honor reduced motion by removing the settle ring and transitions.

### Don't:
- **Don't** use red for errors, destructive actions or anything except overdue money.
- **Don't** set words in Due Amber.
- **Don't** introduce a second typeface into the interface.
- **Don't** use dashed room edges for anything except part-paid and vacant states.
- **Don't** carry the landing's tilted phone or Mint Disc into the logged-in app.
- **Don't** add label lines above headings. The landing's audience pill is a single owner-pinned exception, not a reusable pattern.
- **Don't** show invented customers, testimonials or usage figures. Product previews must be labeled as sample data.
