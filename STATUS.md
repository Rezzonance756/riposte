# Riposte status

Current milestone: all five complete; definition-of-done audit passed for desktop and narrow portrait browser views.

## Completed and verified

- Inspected actual project, specification, all existing source files and README. No Git repository, PLAN or STATUS existed.
- Reused the existing offline static web foundation and SVG fighters.
- Unchanged browser baseline: keyboard press/release, repeat suppression, Space stance, mouse direction, E item open/cancel passed.
- Milestone 2 running-browser checks passed at 1100×1000 and 360×800: perfect offense (20 stamina damage), early hit (18 stamina/8 health loss), defensive perfect recovery (18), mouse late success, wrong direction, missed attack, exact diagnostics, zero browser exceptions. Both screenshots inspected; moved cue away from controls after desktop review.
- Milestone 3 passed at both sizes: five natural perfect parries break opponent; wrong prompt, center success, timeout, mouse success continue through all four prompts for 16 damage and 60 restored stamina. Six natural misses break player; keyboard/mouse defensive combo prevents 32 of 40 damage, restores 60 stamina. Both combo screenshots inspected. Ordinary combat regression still passes without browser exceptions.
- Milestone 4 passed in both browser sizes: frozen simulation while menu open, E/both Shift keys/Escape/cancel/outside click, mouse and Space confirmation, no item spent on cancellation, attack damage during 450ms use, delayed capped healing, empty inventory disabled, focus handler clears held keys and pauses. Both menu screenshots inspected. All previous runtime checks pass; no browser exceptions. Direct rule tests pass all inclusive timing boundaries.
- Final gameplay audit passed all twelve directional mappings, all four attack patterns, complete victories/defeats/restarts, Space and mouse center combos, combo/item/focus restoration, and all previous checks in both sizes. Saved in verification/results.json with zero browser exceptions.
- Final visual audit verified four distinct windup poses at both sizes, inspected perfect/hit/healing/menu/combo/clean views, checked touch events, no overlapping control areas, diagnostic/key-label toggles, and actual browser-tab focus switching. Saved in verification/visual-results.json; natural focus change produced FOCUS_PAUSE in both views.
- Replaced the separate filling timing bar with directional markers around the opponent. High, low, left and right cues now approach from their matching sides and close toward impact; dual threats remain inside the phone battlefield and dim the decoy on reveal. Ordinary attacks no longer flash the player controls, combo prompts use a local closing ring, and diagnostics are hidden by default to reduce visual clutter. Full desktop and 360×800 checks pass after the redesign.
- README now explains opening, playing, combos, item vulnerability, diagnostics, patterns and troubleshooting. PLAN contains the complete requirement-by-requirement evidence map. VERIFY describes repeatable checks and prerequisites.

## Decisions

- Keep file-double-click startup with no dependencies or build requirement.
- Implement timings in a simulation clock that pauses for items/focus loss.
- Starting values remain in src/config.js. Additional provisional choices will be recorded here.

## Decisions and known limitations

- No known failed requirement remains within the tested browser scope. Source syntax and combat boundary tests pass, including no more than two repeated ordinary directions.
- Incoming combo base damage provisionally 10 per prompt; successful defense prevents 8. Each prompt keeps its full 450ms window; wrong/missing inputs consume only that prompt. Lead-in 450ms and inter-prompt gap 110ms are configurable.
- Healing consumes a tonic when confirmed, prevents responses for 450ms, keeps enemy/combo time running, then restores up to 25 health. No revival after defeat. Item choice fully pauses simulation. Further item costs/diminishing returns/opponent inventory remain deferred.
- Feint/dual reveal the final direction 320ms before impact. Dual success still takes 2 health/4 stamina chip; ordinary miss values unchanged. Fast changes only telegraph duration to 540ms. Pattern selection applies to the next attack. All values configurable.
- Tested with installed Chrome/Chromium on Windows and true 360×800 phone emulation; not on physical phone hardware or every browser engine. Human reaction feel and thumb comfort still need playtesting. All art and impact effects are intentionally placeholders.
- The project is now a Git repository connected to `https://github.com/Rezzonance756/riposte`. GitHub Pages publishes the public game at `https://rezzonance756.github.io/riposte/`. The original specification and useful static-project foundation were preserved.

## Recommended next step

Open `https://rezzonance756.github.io/riposte/` on a physical phone, choose Begin duel, and play several normal-pattern duels. Note whether 800ms windups, the center stance disc, and the item position feel comfortable before tuning config.js. Deferred progression, art, enemy stance AI and offensive-initiation systems remain outside the prototype.
