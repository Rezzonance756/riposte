# Riposte browser prototype

## Play online

Open **https://rezzonance756.github.io/riposte/** in a phone or computer browser and choose **Begin duel**. The hosted prototype is public and requires no installation.

## Open and start playing

On this Windows computer, open the Riposte folder on the E: drive and double-click **index.html**. Choose Chrome, Edge, or Firefox if Windows asks which app to use. No installation, internet connection, account, or local server is needed.

In the browser, click **Begin duel**. You should see a blue fighter from behind in the lower-left, a red opponent in the upper-right, and direction controls around your fighter. The opponent begins winding up attacks. The page stays portrait-shaped on a wide monitor.

## Read an attack and respond

Watch the opponent's pose and the directional marker around them. A high attack appears above the opponent, a low attack below, and left or right attacks on the matching side. The marker closes in on the opponent as the strike approaches; press or tap the matching direction when it arrives. You have 260 milliseconds either side of impact; within 90 milliseconds is a perfect response. A direction pressed too early or incorrectly commits that attempt, so tapping repeatedly will not repair it.

| Action | Keyboard | Mouse or touch |
| --- | --- | --- |
| High | W or Up Arrow | Upper arrow |
| Left | A or Left Arrow | Left arrow |
| Low | S or Down Arrow | Lower arrow |
| Right | D or Right Arrow | Right arrow |
| Change stance | Spacebar | Center disc |
| Open items | Either Shift key or E | Small green + button |
| Cancel item selection | Shift, E, or Escape | Cancel button or dim area outside the card |

Holding a key counts only once. Left and right always mean screen left and screen right.

The center disc shows your current stance. **Offense** drains the opponent's stamina when you respond correctly: 12 for a success or 20 for a perfect parry. **Defense** restores your stamina: 10 for a success or 18 for a perfect block. Stamina does not recover just by waiting. A missed or wrong response costs 18 stamina and 8 health.

HP means health; reaching zero ends the duel. ST means stamina; reaching zero creates a combo opportunity. Both values appear by each fighter and as exact numbers in diagnostics.

## Finish a combo

When the opponent's stamina breaks, a four-symbol sequence appears. After the short preparation beat, follow the highlighted halo control. Each prompt gives you 450 milliseconds, and a ring closes around the highlighted control as its deadline approaches. A correct prompt deals 8 health damage. A wrong or missing response loses only that prompt; keep going.

When your own stamina breaks, follow the defensive prompts. Each correct response prevents 8 of that prompt's 10 damage. After either sequence, the broken fighter regains 60 stamina.

To try the fifth input, enable **Center ability combo** in diagnostics. The next combo against a broken opponent includes a star. The center disc changes to **STRIKE**; press Space or click it when that star is highlighted. Stance switching is unavailable during combos.

## Heal without losing track of the fight

In the browser, tap the green + button, press Shift once, or press E. Combat pauses immediately while the item card is open. Releasing Shift leaves the menu open.

Press Space or click **Field Tonic** to use it. Arrow keys or WASD select among menu choices; this prototype has one choice. To spend nothing, press Escape, Shift, or E, click Cancel, or click the dim area outside the card.

Confirming spends one of your two tonics and resumes combat. Your fighter cannot respond while using the tonic for 450 milliseconds. Enemy attacks and combo prompts continue during that time. The tonic then restores up to 25 health, capped at 100. It cannot revive a defeated fighter. The green button is disabled while using an item and when none remain.

## Pause, restart, and try other attacks

Leaving the browser window or tab pauses combat and clears held keys. When you return, click the paused battlefield. If you left while choosing an item, that menu returns first.

After victory, defeat, or any practice attempt, click **Restart duel** to restore both fighters and your two tonics. The selected test pattern and center ability option stay selected.

In the diagnostics panel, **Attack pattern** applies to the next attack:

- **Normal:** one direction, 800-millisecond windup.
- **Feint:** begins in one direction, then changes once 320 milliseconds before impact.
- **Dual threat:** two directional markers appear around the opponent; the decoy dims 320 milliseconds before impact. Correct timing mitigates the attack but still costs 2 health and 4 stamina.
- **Faster opponent:** a 540-millisecond windup, with the other ordinary rules unchanged.

**Show diagnostics** reveals the testing information when you need it; diagnostics stay closed during normal play. **Key labels** hides or shows the keyboard hints. Diagnostics show recent actions and input sources, expected direction, timing and result, combat state, stance, exact health/stamina, and any keys still held. Negative timing means early; positive means late. Combo timing is measured relative to its deadline.

## If something looks wrong

On this computer, if double-clicking index.html shows text, right-click it in the Riposte folder, choose **Open with**, and select a browser.

In the browser, if the game looks out of date after an update, press Ctrl+F5. Keep index.html, styles.css, and the src folder together. A blank or unresponsive page usually means one of these files was moved; reopen index.html from the complete project folder.

If keys do not respond, click the battlefield, dismiss the PAUSED screen if present, and check that the duel has started. A focused pattern selector uses arrow keys for selection; choose the pattern and then click the battlefield to return to combat.

On small windows, diagnostics can be scrolled or hidden. The combat controls remain on the portrait battlefield. Narrow browser emulation has been checked; actual phone thumb comfort still needs hands-on playtesting.

## Project and verification

The original specification is riposte_prototype_guide.md. PLAN.md tracks the milestones; STATUS.md records the current results and decisions. All provisional combat values are together in src/config.js. The opponent initiates attacks; autonomous enemy stance switching, offensive initiation, progression, final artwork, and other deferred systems are outside this prototype.

The public source is at **https://github.com/Rezzonance756/riposte**. GitHub Pages publishes the `main` branch from the project root.

Developer checks are documented in VERIFY.md. Playing does not require those tools.
