---
name: RentRoll
description: A painted resident board, made live, that shows which rooms have paid.
colors:
  green: "#123d33"
  green-2: "#1c5245"
  green-3: "#2b5a4e"
  brass: "#e2b13c"
  red: "#b92b19"
  enamel: "#f3f7f3"
  ground: "#eef3ef"
  white: "#ffffff"
  ink: "#10231e"
  ink-2: "#3f5850"
  line: "#c3d3ca"
  ok-bg: "#dfeee6"
  muted-plate: "#dce8e1"
  muted-edge: "#76948a"
  paid-tag: "#547166"
typography:
  display:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "2.625rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  figure:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.1
    fontFeature: "tnum"
  headline:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.45
  action:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.45
  action-small:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.45
  number:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.45
    fontFeature: "tnum"
  status:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.45
  caption:
    fontFamily: "Hind, Noto Sans Devanagari, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.45
rounded:
  tag: "3px"
  bar: "4px"
  plate: "6px"
  pill: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  plate-gap: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  2xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.enamel}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "8px 18px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green-2}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.green}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "8px 18px"
    height: "48px"
  button-secondary-hover:
    backgroundColor: "{colors.ok-bg}"
  button-danger:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.plate}"
    padding: "8px 18px"
    height: "48px"
  button-danger-hover:
    backgroundColor: "{colors.muted-plate}"
  button-small:
    typography: "{typography.action-small}"
    padding: "4px 12px"
    height: "40px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.plate}"
    padding: "8px 12px"
    height: "48px"
  plate:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "10px 11px"
    height: "132px"
  plate-overdue:
    backgroundColor: "{colors.red}"
    textColor: "{colors.white}"
  plate-today:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    padding: "8px 9px"
  plate-paid:
    backgroundColor: "{colors.muted-plate}"
    textColor: "{colors.ink}"
  number-tag:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    typography: "{typography.number}"
    rounded: "{rounded.tag}"
    padding: "0 7px"
  number-tag-overdue:
    backgroundColor: "{colors.white}"
    textColor: "{colors.red}"
  number-tag-paid:
    backgroundColor: "{colors.paid-tag}"
    textColor: "{colors.white}"
  property-tab:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  property-tab-active:
    backgroundColor: "{colors.green}"
    textColor: "{colors.enamel}"
  notice-ok:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.green}"
    rounded: "{rounded.plate}"
    padding: "10px 12px"
  panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "16px"
---

# Design System: RentRoll

## Overview

**Creative North Star: "The Society Name Board"**

RentRoll is the painted resident board from a building's entrance, made live. A bottle-green enamel shell holds white plates, each with a brass room number, and the board reads at a glance because every plate's form says where that room's rent stands.

The system is dense but calm, built for a phone held in one hand in bright daylight. One typeface carries everything, money figures are the loudest type, and color stays scarce enough that a red plate means something the moment it appears. Plates sit flat like painted metal and only respond when touched.

**Key Characteristics:**
- Bottle-green shell, enamel-white plates, brass number tags.
- Status told by plate form and words, with color as reinforcement.
- Hind at every level, with tabular rupee figures.
- Flat at rest, with depth reserved for touch and floating confirmation.
- Bottom tabs on phones, a green side rail from 900px.

## Colors

A deep green and painted-metal palette with one warm metal accent and one alarm color.

### Primary
- **Bottle Green Enamel** (#123d33): The shell. Board header, desktop rail, login ground, primary buttons, selected tabs, default plate edges and the global focus ring.
- **Lifted Enamel Green** (#1c5245): Hover on green surfaces.
- **Progress Track Green** (#2b5a4e): The unfilled track of the collection bar on the green header.

### Secondary
- **Number-Plate Brass** (#e2b13c): Room number tags, the collected portion of the progress bar, the month, the due-today edge, focus on green surfaces and the settle flash after a payment.

### Tertiary
- **Signal Red** (#b92b19): Overdue only. The overdue plate, the overdue tenant card and the overdue reminder in email.

### Neutral
- **Enamel White** (#f3f7f3): Text on green.
- **Board Ground** (#eef3ef): The page behind the plates.
- **Plate White** (#ffffff): Plates, panels, lists, fields and text on red.
- **Board Ink** (#10231e): Primary text, and the text on brass.
- **Weathered Ink** (#3f5850): Secondary text, hints and inactive tab labels.
- **Hairline Sage** (#c3d3ca): Dividers and panel, list and tab outlines. Decorative separation only.
- **Settled Green Wash** (#dfeee6): Success notices and secondary button hover.
- **Paid Plate Sage** (#dce8e1): The settled plate and quiet button hover.
- **Muted Edge Sage** (#76948a): Paid and vacant plate edges, and the resting stroke on fields.
- **Paid Tag Slate** (#547166): The number tag on a paid plate, dark enough to hold white text.

### Named Rules
**The Red Means Late Rule.** Signal Red marks overdue rent and nothing else. Errors and destructive actions use Board Ink with a heavy edge, so red never loses its meaning.

**The Brass Is Never Text On White Rule.** Brass carries ink on top of it, or sits on green. It never sets words on a light surface.

## Typography

**Display Font:** Hind (with Noto Sans Devanagari, system-ui, sans-serif)
**Body Font:** Hind
**Label/Mono Font:** Hind, with tabular numerals for money and room numbers

**Character:** A plain, sturdy humanist sans with Latin and Devanagari coverage. Hierarchy comes from size and weight alone, and sentence case stays friendly to non-technical readers.

### Hierarchy
- **Display** (700, 2.625rem, 1.05, -0.01em, tabular): The amount still to collect. One per screen.
- **Figure** (700, 2rem, 1.1, tabular): The balance on a tenant card.
- **Headline** (700, 1.5rem, 1.15): Page titles, balanced on wrap.
- **Title** (700, 1.125rem, 1.2): Section headings and tenant names on plates, clamped to two lines.
- **Body** (400, 1rem, 1.45): Default text and field values.
- **Label** (600, 0.9375rem): Field labels, property tabs and supporting header lines.
- **Action** (700, 1rem; 0.9375rem when small): Button text.
- **Number** (700, 0.9375rem, tabular): Room numbers on brass tags.
- **Status** (700, 0.875rem): The plate's status line.
- **Caption** (600, 0.8125rem): Phone tab labels and the property name on a plate. The smallest size in the app.

### Named Rules
**The Tabular Money Rule.** Every rupee figure and room number uses tabular numerals so amounts compare cleanly down a column.

**The One Family Rule.** Hind carries all interface type. Email alone falls back to Arial, because mail clients cannot load it.

## Layout

The board is a responsive grid of plates under a full-width green header. Phones show two columns with a 10px gap. From 560px, columns auto-fill at a 170px minimum. Content is capped at 1120px with 16px gutters, widening to 24px on desktop. Forms and focused tasks narrow to 560px.

Navigation is a fixed four-item bottom bar on phones, respecting the safe area, and becomes a 208px green side rail at 900px. Plates sort by urgency: overdue, due today, then upcoming and part paid, with paid last.

Spacing follows a tight 4, 8, 10, 12, 16, 20 and 24px rhythm. Main actions and fields are 48px, with compact buttons and property tabs at 40px.

## Elevation & Depth

The system is flat at rest. Depth comes from the tonal step between ground, plate and shell, and from heavy plate edges. Shadows are a response to touch, or mark the one element that truly floats.

### Shadow Vocabulary
- **Plate Lift** (`box-shadow: 0 3px 10px rgb(18 61 51 / .2)`): Hover on a tappable plate.
- **Floating Notice** (`box-shadow: 0 4px 14px rgb(18 61 51 / .28)`): The payment confirmation above the tab bar.
- **Settle Flash** (`box-shadow: 0 0 0 7px #e2b13c`, fading to none over 700ms): The plate that just changed after a payment.

### Named Rules
**The Painted Metal Rule.** Plates carry no shadow at rest. If a plate needs more emphasis, change its form.

## Shapes

Corners are slightly softened, like cut enamel signs (6px) on plates, buttons, fields, panels and notices. Number tags are tighter (3px), the progress bar is gently rounded (4px), and only property tabs are full pills (20px).

Edge style is the system's signature. Solid, heavy brass, dashed and dotted strokes each carry a meaning, so they are never decoration.

### Named Rules
**The Plate Form Rule.** Overdue is a solid red plate. Due today is a 4px brass edge. Part paid is a dashed edge. Paid is a muted plate with a check. Vacant is a transparent plate with a dotted edge. Each state must stay identifiable without color, and always carries its status in words.

## Components

### Buttons
Sturdy and plain, with a confident 2px frame.
- **Shape:** Softened corners (6px), 48px tall, 700 weight.
- **Primary:** Bottle Green with Enamel White text (8px 18px).
- **Hover / Focus:** Lifts to the lighter green, with a 3px green outline offset by 2px on focus. Pending buttons fade to 60% and name the action in progress.
- **Secondary:** Plate White with a 2px green frame and green text, washing to Settled Green on hover.
- **Destructive:** Plate White with a 2px ink frame and ink text. Never red.
- **Small:** 40px tall for actions within a row or section heading.
- **Text:** Bold underlined green, or ink for destructive actions, at a 40px target.

### Chips
- **Style:** Property tabs are white pills with a hairline outline, 40px tall, scrolling sideways on phones.
- **State:** The selected tab fills with Bottle Green and takes Enamel White text.

### Cards / Containers
- **Corner Style:** Softened (6px).
- **Background:** Plate White on Board Ground.
- **Shadow Strategy:** None at rest, per the Painted Metal Rule.
- **Border:** 1px Hairline Sage. Lists divide rows with the same line.
- **Internal Padding:** 16px on panels, 12px 14px on list rows.
- **Tenant Card:** A full green plate, or red when overdue, carrying the number tag, name and balance at Figure size.

### Inputs / Fields
- **Style:** Plate White, 1px stroke, 6px corners, 48px tall, with the label above and hint below.
- **Focus:** The stroke turns Bottle Green, which carries the focus state, with a supplementary 2px brass halo.
- **Choice:** Paired options use large 52px segmented tiles with a 2px edge. The selected tile fills green.
- **Error:** A white notice with a 2px ink edge and an alert icon, stated in words.

### Navigation
- **Phone:** A white bottom bar of four icon-over-label tabs, 62px tall. The active tab turns green with a 3px bar along its top edge.
- **Desktop:** A green rail with the brass wordmark. Items are 44px rows, and the active item becomes an enamel plate with green text.

### Room Plate
The signature component and the primary action. A tappable plate, at least 132px tall, stacks a brass number tag, optional property, tenant name, amount and a status line pinned to the bottom. Pressing scales it to 98%. After a payment it settles with a brass flash over 700ms, and the flash is removed under reduced motion.

### Board Header
Bottle Green, full width. It holds the wordmark, the brass month, the amount still to collect at Display size, the collected sentence and an 8px brass progress bar.

### Reminder Email
The email carries the plate language in table markup: same colors, 6px corners, heavy today edge and dashed part-paid edge. Each card states room, tenant, balance and status in words, and people with Full access get a single Mark paid action that opens a confirmation page.

## Do's and Don'ts

### Do:
- **Do** show every rent state through plate form and words as well as color.
- **Do** sort rent views by urgency, with overdue first.
- **Do** use tabular numerals for every rupee figure and room number.
- **Do** set text on brass in Board Ink.
- **Do** keep main actions and fields at 48px and give new tap targets at least 40px.
- **Do** give any new control boundary at least 3:1 contrast against its surface, for daylight legibility.
- **Do** honor reduced motion by removing the settle flash and transitions.

### Don't:
- **Don't** use Signal Red for errors, destructive actions, or anything except overdue rent.
- **Don't** set words in brass on white or Board Ground.
- **Don't** add shadows to plates at rest.
- **Don't** reuse dashed or dotted edges decoratively, because they mean part paid and vacant.
- **Don't** lead the rent board with summary cards over a table.
- **Don't** introduce a second typeface into the interface.
