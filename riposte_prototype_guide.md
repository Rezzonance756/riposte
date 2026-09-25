# Riposte Browser Prototype — Project Guide

## Purpose of this file

This is the build brief for the first playable prototype of **Riposte**. It is meant to be placed in a new project folder and given to Codex as the source of truth for the prototype.

The goal is not to build the complete game. The goal is to create a small browser-based combat toy that answers one question:

> Is it satisfying to read an opponent's directional attack, respond through controls positioned around the player character, change stance, wear down stamina, and complete a short combo after a break?

Codex should make reasonable implementation decisions without repeatedly stopping for minor questions. Any values labeled **starting value** are deliberately provisional and should be easy to change in one configuration file.

## Working title and project summary

**Working title:** Riposte

Riposte is a mobile-first action-combat game presented like a classic monster-battling encounter. The player character is seen mostly from behind in the lower-left portion of the battlefield. The opponent faces the player from the upper-right. Combat is real-time and reactive rather than turn-based.

The player responds to attacks through four spatial inputs positioned around the player sprite: high, low, left, and right. A center input changes stance and can become a fifth attack input during special combos. An attached item indicator opens a paused or heavily slowed item-selection state.

The prototype should run comfortably in a desktop browser so keyboard and mouse can be used during development. Its layout and interaction must remain designed for a portrait phone screen.

## Design status

### Decisions to treat as established

- The game is mobile-first and uses a portrait presentation.
- The battle composition resembles a classic Pokémon-style encounter:
  - player character in the lower-left, facing away and toward the opponent;
  - opponent in the upper-right, facing the player;
  - health and stamina information near each combatant;
  - no free movement around the battlefield.
- Combat is real-time, reactive, and based on reading opponent actions.
- Four primary response locations surround the player character:
  - high;
  - low;
  - left;
  - right.
- These are screen-space inputs. Left always means the left side of the screen, not a combatant's anatomical left.
- The input locations should appear just outside the player's silhouette whenever possible.
- The center input sits on or behind the player's torso and normally changes stance.
- During an ability-driven combo, the center input may become a fifth attack input.
- A smaller item indicator is attached to or visually associated with the center input.
- Tapping the item indicator immediately enters an item-selection pause or slowdown. It is not a hold interaction.
- Mouse input must work in addition to keyboard input.
- The visual presentation can rely on static poses, flashes, short slides, impact effects, and screen shake. Fluid animation is not required.
- Player and opponent combat rules should ultimately be symmetric: both use stances, stamina, breaks, and combos.

### Starting assumptions for the first build

These choices are defaults for testing, not permanent design decisions:

- The first prototype is single-player against a simple scripted opponent.
- The first item menu contains only one healing item.
- Item selection fully pauses combat in the first version. A heavy slowdown can be tested later.
- The opponent initiates ordinary attacks so the core reaction loop can be tested before offensive initiation is solved.
- The prototype uses simple code-drawn stick fighters instead of generated or finished artwork.
- No server, account, save system, or network connection is required.

### Intentionally deferred

- Classes, theme, story, equipment, and progression.
- Final character art and an automated sprite-generation pipeline.
- PvP or online multiplayer.
- Final enemy artificial intelligence.
- Final item list and inventory rules.
- The definitive anti-turtling or offensive-initiation mechanic.
- Final rules for healing costs and diminishing returns.
- Monetization, shops, unlocks, and long-term game structure.

## Technical shape

Build this as a small static web project that can run locally in a browser and can later be published through GitHub Pages without a server.

Prefer a deliberately simple structure:

```text
index.html
styles.css
src/
  game.js
  config.js
  input.js
  combat.js
  renderer.js
README.md
```

Using a lightweight tool such as Vite is acceptable if it makes development easier, but avoid adding a large game engine for this first prototype. Ordinary HTML, CSS, JavaScript, and inline SVG are sufficient.

Keep combat rules separate from drawing and input handling. The same abstract actions must be produced whether the player presses a key, clicks with the mouse, or eventually taps a phone screen:

```text
HIGH
LOW
LEFT
RIGHT
CENTER
ITEM
CANCEL
```

This separation is important. Do not make the combat code depend directly on particular keyboard keys or screen coordinates.

## Screen and battlefield layout

### Overall viewport

- Use a portrait game area with a starting aspect ratio of 9:16.
- On a desktop monitor, center this portrait game area on the page instead of stretching the battlefield across the entire browser window.
- Fill unused side space with a subdued background.
- Scale the game area down cleanly for smaller windows.
- Respect phone safe areas so controls are not trapped under rounded corners or operating-system bars.

### Combatant placement

- Place the opponent in the upper-right region.
- Place the player in the lower-left region, but move the player far enough inward that the left and low input zones have comfortable room.
- Keep the player and opponent inside the battlefield portion rather than placing the player inside a separate menu panel.
- Leave open space between the fighters for attack flashes, trails, and impact effects.

Suggested composition:

```text
┌──────────────────────────┐
│ Opponent status          │
│                   ENEMY  │
│                     ↙    │
│                          │
│       effects area       │
│                          │
│       ↗                  │
│    PLAYER                │
│ Player status            │
└──────────────────────────┘
```

## Placeholder fighters

Do not wait for generated artwork. Create simple stick-person combatants using inline SVG or similarly simple code-drawn shapes.

Each fighter should be assembled from basic parts such as:

- circular head;
- short torso line or rounded body shape;
- two arm segments;
- two leg segments;
- a small weapon line or effect marker if useful.

Make the player and opponent immediately distinguishable:

- player: cool color such as dark blue with a cyan accent;
- opponent: warm color such as dark red with an orange accent;
- opponent may have simple face marks because it faces the viewer;
- player should have a clear back-facing marker or no visible face.

The figures do not need traditional frame-by-frame animation. Change the positions or rotations of their SVG limbs to create simple static poses. At minimum, support:

- neutral defensive pose;
- neutral offensive pose;
- high attack windup;
- low attack windup;
- left attack windup;
- right attack windup;
- block;
- perfect parry;
- hit reaction;
- stamina-broken pose;
- healing/item-use pose;
- combo strike pose.

It is acceptable for several states to reuse a pose during the earliest milestone. The code should refer to named pose states so finished sprites can replace the stick figures later without changing combat logic.

## Player input halo

The controls should feel attached to the player character rather than placed in a detached control panel.

### Four directional zones

Arrange four visible markers around the player:

- **High:** just above the head.
- **Left:** just outside the left flank or arm.
- **Right:** just outside the right flank or arm.
- **Low:** below the legs or lower body.

Although the visible markers may be compact, their actual clickable and tappable areas should be generous. The hit areas may extend behind or toward the player sprite, but they must not overlap enough to produce ambiguous inputs.

Do not move the input zones when the stick figure changes pose. They belong to stable screen locations around the character, not to the exact positions of moving limbs.

### Center input

Place the center input behind or over the torso as a faint central disc or glow. It is a context input rather than an ordinary defense location.

Its default function is stance switching:

- tap once to switch between offensive and defensive stance;
- change its icon, color, or outline to show the current stance;
- switching should be immediate and should not require holding.

During an ability-enabled combo, the center becomes a fifth attack input. When this happens, make the transformation visually obvious by brightening or expanding the central disc and replacing the stance icon with an attack symbol.

### Item indicator

Attach a smaller item indicator to the edge of the center disc, preferably on the side facing open screen space rather than the nearest device edge.

- Display the equipped item icon and remaining count.
- Clicking or tapping it immediately pauses combat and opens the item-selection state.
- This is a tap interaction, not a hold interaction.
- The item indicator must have its own touch area and must not accidentally trigger a stance change.
- When no items remain, show the indicator disabled rather than accepting a meaningless input.

## Browser controls

Support these controls simultaneously:

| Game action | Keyboard | Mouse |
|---|---|---|
| High | `W` or Up Arrow | Click high zone |
| Left | `A` or Left Arrow | Click left zone |
| Low | `S` or Down Arrow | Click low zone |
| Right | `D` or Right Arrow | Click right zone |
| Center / stance | Spacebar | Click center disc |
| Open items | Either Shift key | Click item indicator |
| Item fallback | `E` | Click item indicator |
| Cancel | Escape | Click cancel or outside the item choices |

Important behavior:

- Count the moment a key is initially pressed. Holding a key must not produce repeated combat inputs.
- Opening the item menu with Shift is a tap action. Releasing Shift must not close the menu.
- Support `E` as an alternate item key because operating systems may react to repeated Shift presses.
- While the game has focus, the arrow keys and Spacebar must control the game rather than scroll the webpage.
- If the browser tab or window loses focus, pause the game and clear all held-input state.
- Clicking a combat zone must behave exactly like pressing its corresponding key.
- Show keyboard labels beside the zones when keyboard help is enabled.
- A later version may support remapping, but a remapping screen is not required now.

### Item selection controls

When the item menu is open:

- combat is paused in the first implementation;
- WASD or the arrow keys move between choices if multiple choices exist;
- Spacebar confirms the highlighted choice;
- the mouse can select an item directly;
- Shift, `E`, Escape, or an on-screen cancel control closes the menu without using an item.

The first implementation only needs one healing item, but structure the menu so more choices can be added later.

## Core combat loop

Both combatants have:

- health;
- stamina;
- offensive or defensive stance;
- a broken/not-broken state.

The opponent repeatedly prepares a directional attack. The player reads the windup and responds with the matching spatial input near the time of impact.

The result depends on both timing and stance:

### Offensive stance

- A correct response represents a deflect, counter, or aggressive parry.
- Success reduces the opponent's stamina.
- A perfect response reduces more opponent stamina and should receive the strongest visual feedback.
- The player's stamina does not passively recover while in offensive stance.

### Defensive stance

- A correct response represents a block.
- Success restores some player stamina.
- A perfect response restores more stamina or prevents all chip damage.
- Defensive stance is the recovery mode and should look broader and more guarded.

### Wrong or missed response

- Reduce player stamina.
- Deal a smaller amount of health damage.
- Show a hit pose, flash, and short shake.
- Do not make one mistake immediately fatal.

### Stamina break

When a combatant reaches zero stamina, that combatant becomes broken and the opponent receives a combo opportunity.

If the opponent is broken:

- generate a short sequence of directional prompts;
- show the sequence through the player's existing input halo;
- the player enters each prompt quickly;
- each correct entry adds damage;
- a wrong or missing entry does not end the combo—it only loses that portion of the possible damage;
- an ability combo may include the center input as a fifth symbol.

If the player is broken:

- run an incoming enemy combo;
- show a short sequence of defensive prompts;
- correct responses reduce the damage taken;
- missing responses increases damage but does not end the sequence early.

After a combo, restore the broken combatant to a configurable portion of stamina and return both fighters to neutral poses.

## Starting combat values

Put these in one clearly labeled configuration file. They are intended to make the prototype immediately playable, not to define final balance.

| Setting | Starting value |
|---|---:|
| Player health | 100 |
| Opponent health | 100 |
| Player stamina | 100 |
| Opponent stamina | 100 |
| Telegraph duration | 800 ms |
| Time between ordinary attacks | 650 ms |
| Correct-response timing tolerance | 260 ms from impact |
| Perfect-response tolerance | 90 ms from impact |
| Player stamina lost on a miss | 18 |
| Player health lost on a miss | 8 |
| Opponent stamina damage from offensive success | 12 |
| Opponent stamina damage from perfect offensive success | 20 |
| Player stamina restored by defensive success | 10 |
| Player stamina restored by perfect defensive success | 18 |
| Starting combo length | 4 prompts |
| Time allowed per combo prompt | 450 ms |
| Damage per successful player combo input | 8 |
| Damage prevented per successful defensive combo input | 8 |
| Stamina restored after a break sequence | 60 |
| Starting healing-item count | 2 |
| Health restored by healing item | 25 |
| Real-time item-use vulnerability | 450 ms |

Grade timing by distance from the intended impact moment. A response inside the perfect tolerance is perfect; a response inside the broader tolerance is successful; anything else is early, late, wrong, or missed.

## Enemy behavior for the prototype

The first enemy does not need sophisticated decision-making.

Use a scripted or lightly randomized loop:

1. Wait briefly.
2. Choose high, low, left, or right.
3. Change to the matching windup pose.
4. Highlight the threatened player zone in a way that is readable but not instantaneous.
5. Resolve the attack at the impact time.
6. Show the outcome.
7. Return to idle and repeat.

Avoid choosing the same direction more than twice consecutively.

Once ordinary attacks work, add these as separate test patterns rather than mixing them in immediately:

- **Feint:** begin with one direction and switch once before impact.
- **Dual threat:** show two threatened zones, then emphasize one shortly before impact. The player is expected to mitigate damage rather than avoid all damage.
- **Faster opponent:** shorten only the telegraph duration while leaving other rules unchanged.

The opponent's own stance logic and the player's turtle-breaking initiation move should be a later milestone. Do not let those unresolved systems delay testing the basic reaction loop.

## Items and tactical pause

For the first prototype, the item indicator contains a healing item with a visible count.

The interaction should be:

1. Player taps the item indicator or presses Shift/`E`.
2. Combat immediately pauses.
3. The battlefield dims slightly and the item choice appears near the player.
4. Player confirms the item or cancels.
5. Combat resumes.
6. If confirmed, the player performs a short item-use pose in real time.
7. Healing occurs at the end of the item-use delay.

The pause makes choosing comfortable; it does not make using the item safe. The real-time use delay leaves the player exposed.

Keep the following healing ideas configurable or documented for later testing rather than treating them as final:

- healing may cost stamina;
- repeated healing may have diminishing returns;
- healing may only be available in defensive stance;
- the opponent may have a visible, preset number of healing items;
- an offensive initiation move may punish an opponent attempting to heal defensively.

## Static-pose presentation and effects

The prototype should create a sense of impact without relying on fluid animation.

Use combinations of:

- instant pose changes;
- short lunges created by moving the entire fighter slightly toward the center;
- white or stance-colored sprite flashes;
- directional slash lines;
- small impact bursts;
- brief screen or fighter shake;
- a very short freeze at the moment of a perfect parry or heavy hit;
- afterimages during a combo;
- dimming or desaturation for a broken fighter;
- clear offensive and defensive stance colors.

A typical attack can be:

```text
idle → windup pose → brief lunge/flash → target reaction → idle
```

Keep effects short enough that the next telegraph remains readable.

## Visual communication rules

- Never rely on color alone. Combine color with position, shape, pulse, or icon changes.
- A high attack must be recognizable from its silhouette and highlighted high zone.
- A low attack must remain readable even when a thumb is near the bottom of the screen.
- Distinguish a perfect response from an ordinary success through sound-ready visual timing, a sharper flash, and a short freeze.
- Distinguish offensive and defensive stances through both the fighter pose and the center/halo appearance.
- Keep the input zones visible enough to learn but avoid obscuring the character.
- Make threatened zones pulse; do not make the player hunt for small text.

## Input and timing diagnostics

Include a developer display that can be toggled on and off. It should show:

- last several abstract inputs;
- input source: keyboard or mouse;
- expected direction;
- milliseconds early or late;
- result: perfect, success, wrong, early, late, or missed;
- current combat state;
- current stance;
- player and opponent health/stamina as exact numbers;
- whether the game believes any key is still held.

This display exists to tune the game and diagnose bad input behavior. It does not need finished styling.

## Build milestones

### Milestone 1 — Layout and input toy

- Portrait battlefield centered in a desktop browser.
- Two code-drawn stick fighters in the correct diagonal positions.
- Player input halo positioned around the player.
- Keyboard and mouse controls light up the same zones.
- Center changes stance.
- Item indicator can be clicked or activated with Shift/`E` and opens a placeholder paused panel.
- Debug input history works.

Stop and verify the spatial controls feel comfortable before adding combat rules.

### Milestone 2 — Ordinary reaction loop

- Enemy performs four readable directional windups.
- Timed player responses resolve as perfect, success, or miss.
- Offensive and defensive stance outcomes differ.
- Health and stamina displays update.
- Static poses and simple impact effects communicate results.

### Milestone 3 — Breaks and combos

- Opponent can be stamina-broken.
- Player can be stamina-broken.
- Player combo sequence works without ending on a missed input.
- Defensive response sequence during an enemy combo works.
- Add an ability test that permits center as a fifth combo input.

### Milestone 4 — Item flow

- Healing-item count is visible.
- Item menu pauses immediately on a tap or key press.
- Mouse and keyboard selection both work.
- Canceling consumes nothing.
- Confirming resumes time and plays the vulnerable item-use action before healing.

### Milestone 5 — Additional attack tests and mobile check

- Add feint and dual-threat test patterns behind debug toggles.
- Test a narrow phone-sized browser viewport.
- Confirm that all visible controls have forgiving hit areas.
- Confirm that the left and low zones are not pinned against screen edges.
- Confirm that the browser version still looks and behaves like the mobile design rather than becoming a separate desktop layout.

## Definition of done for the first prototype

The first prototype is complete when a person can:

- open it in a desktop browser using clear instructions in the README;
- see the player lower-left and opponent upper-right;
- understand that the stick fighters are facing one another;
- respond to high, low, left, and right attacks with WASD, arrow keys, or mouse clicks;
- switch stance with Spacebar or the center control;
- observe meaningfully different offensive and defensive outcomes;
- break the opponent's stamina and perform a short combo;
- suffer an incoming combo after their own stamina breaks;
- use the center input as a fifth symbol in an ability combo test;
- tap or click the smaller item indicator and receive an immediate tactical pause;
- confirm or cancel a healing item with keyboard or mouse;
- see enough diagnostic information to tune timing windows;
- resize the browser to a phone-like portrait shape without breaking the layout.

## Instructions for Codex while building

- Build the smallest playable version of each milestone before polishing it.
- Use placeholder stick fighters; do not wait for generated art.
- Do not invent classes, progression, equipment, shops, lore, or multiplayer.
- Keep all timing and balance values together and easy to edit.
- Keep input, combat rules, and presentation separated so mobile touch controls and finished sprites can be added later.
- Do not hide unresolved decisions inside hard-coded behavior. Use the starting defaults and identify them clearly.
- Keep the README written for someone who is not technical. State exactly what to open or click, what should appear when it works, and how to recover from common problems.
- After each milestone, verify the result in both a desktop-sized browser window and a narrow portrait window.
- Prefer visible, testable behavior over architectural complexity.

## Questions to revisit after the prototype is playable

These questions should be answered by playtesting rather than speculation:

1. Is full pause or heavy slowdown better for item selection?
2. Is the center stance control comfortable when placed over the torso?
3. Does the attached item indicator cause accidental stance changes?
4. Are four defensive directions sufficient, with center reserved for context?
5. Does adding center to special combos feel exciting or merely harder?
6. Is one-thumb play important, or can advanced attacks expect two thumbs?
7. How much warning is required for a feint to feel fair?
8. Should near-simultaneous two-direction inputs use a grace period or a sliding gesture on mobile?
9. What forces an opponent out of defensive stance and prevents indefinite turtling?
10. Should healing cost stamina, become less effective when repeated, or expose the user long enough on its own?
11. How should a player earn occasional offensive openings when neither fighter is broken?
12. Which placeholder poses actually improve readability, and which can be removed?

