# Riposte completion plan

Source of truth: `riposte_prototype_guide.md`. Preserve the static HTML/CSS/JavaScript structure and existing SVG fighters. The project is published from the `main` branch at `https://github.com/Rezzonance756/riposte`; preserve the original guide and useful code.

| Milestone | Current evidence | Remaining work and verification |
| --- | --- | --- |
| 1 Layout/input | Complete. Unchanged baseline preserved; final mouse/keyboard/touch, focus, labels and diagnostics checks pass. | Item/right overlap repaired. Both viewport screenshots inspected; all controls at least 50px on 360px view, inside battlefield, no overlaps. |
| 2 Reaction loop | Complete. Desktop/phone runtime tests pass both stances, perfect/early/late-success/wrong/missed, numeric health/stamina and all 12 direction mappings. | Four windup poses and perfect/hit effects inspected at both sizes; zero browser exceptions. Exact timing boundaries and maximum repeat count pass direct rule tests. |
| 3 Breaks/combos | Complete. Natural breaks, both combos, wrong/timeout continuation, center via Space and mouse, correct damage and restored stamina verified at both sizes. | Full victory, defeat and reset pass. Combo pause/focus/menu return passes. |
| 4 Items | Complete. Desktop/phone tests pass full pause, both Shift keys, E/Escape/cancel/outside, mouse/Space confirm, exposure, delayed healing and depleted count. | Natural browser-tab pause and focused-menu restoration verified; healing/menu screenshots inspected. |
| 5 Patterns/mobile | Complete. Separate normal/feint/dual/fast patterns tested through the visible selector. | Reveal switch/emphasis, mitigation chip and fast-only timing change pass at both sizes. Responsive/touch/label/diagnostic checks pass. |

## Definition-of-done audit

All entries pass in desktop 1100×1000 and portrait 360×800 Chromium views. Evidence is in `verification/results.json`, `verification/visual-results.json`, the named screenshots, and the repeatable browser scripts. README was updated for the completed prototype.

| Specification requirement | Running evidence |
| --- | --- |
| Open locally using README | Actual file-URL load, Begin duel button, no build or dependencies for play |
| Player lower-left / opponent upper-right | `m5-desktop.png`, `m5-phone.png`, clean views |
| Fighters facing each other | Back marker/no face on player, visible enemy face, diagonal composition in inspected screenshots |
| Four directions via WASD, arrows, mouse | `allTwelveMappings: PASS` in each viewport |
| Stance via Space and center | Both inputs tested; stance label and pose change |
| Different stance outcomes | Offensive stamina damage / defensive recovery numerically asserted |
| Opponent break and combo | Five natural perfect parries; partial and full combos, restored stamina |
| Player break and incoming combo | Six natural misses; all defensive prompts, reduced health loss, restored stamina |
| Center as fifth symbol | Ability option; Space and coordinate center click both succeed |
| Small item indicator pauses immediately | Coordinate click/touch, unchanged clock and health during pause |
| Confirm/cancel with keyboard/mouse | Both Shift keys, E, Escape, Space, item, cancel and backdrop tested |
| Timing diagnostics | Expected/action/source/signed timing/result, exact resources, state/stance/held keys inspected |
| Phone-like resize | True 360px device metrics, no horizontal overflow, bounded non-overlapping controls, touch success |

Remaining required implementation: none. Recommended next work is human playtesting and tuning the provisional values; physical phone comfort and other browser engines were not certified by this audit.
