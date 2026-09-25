# Verification and repeatable checks

The playable prototype requires only a browser. These extra checks are for someone continuing development.

## Evidence

The `verification` folder contains generated screenshots and two result files. `results.json` records gameplay checks at desktop 1100×1000 and portrait 360×800. `visual-results.json` records all four windup poses, touch input, natural browser-tab focus loss, diagnostic/key-label toggles, and control geometry. Screenshots were also inspected visually; passing numbers alone were not used as proof of layout quality.

The browser scripts use the real page, real keyboard events and coordinate mouse/touch input. They read `Riposte.snapshot()` for diagnostics but never set combat state or bypass natural stamina breaks. Focus-handler edge cases also use a synthetic blur event; the separate visual script additionally opens and activates a real second browser tab and verifies the original game pauses.

## Repeat the checks on this Windows computer

Prerequisites: Node.js 24 or newer and Google Chrome. Both were already installed on the development computer. Do not install anything to play the game.

In a PowerShell window on this computer, paste the following command to open a hidden, separate test browser. This uses a temporary browser profile, so it does not share your regular Chrome tabs or sign-ins.

```powershell
& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --disable-gpu --disable-extensions --no-first-run --remote-debugging-port=9223 --user-data-dir="$env:TEMP\Riposte-verification-browser" about:blank
```

The command may return to the prompt without opening a visible window. In the same PowerShell window, paste:

```powershell
node 'E:\Riposte\combat.test.cjs'
node 'E:\Riposte\browser-check.mjs'
node 'E:\Riposte\browser-visual-check.mjs'
```

The first check should print PASS for timing boundaries and item/pause rules. The gameplay check prints PASS entries for both desktop and phone and may take several minutes because it plays real duels. The visual check prints the four directions, PASS for touch on the phone view, and FOCUS_PAUSE for natural tab focus loss. Screenshots and results are replaced in the verification folder.

If a command reports an assertion, timeout, connection error, or missing program, the check has not passed. Keep that error text, inspect the relevant running state, and repair or restore the required tool before claiming verification. A connection error usually means the separate test browser is not listening on port 9223 (its local testing connection).

After reviewing the saved images, in the same PowerShell window on this computer, paste:

```powershell
node 'E:\Riposte\close-test-browser.mjs'
```

It should print that the separate verification browser was closed or was already closed. This addresses only the separate browser using testing port 9223. If it prints an error, keep the error text for investigation; do not close unrelated Chrome processes.

## Scope and limitations

- Tested in installed Chromium/Chrome on Windows, including actual file-URL loading, desktop sizing, device emulation, browser tab activation, and touch events.
- Not a physical phone test, thumb-comfort study, or a Safari/Firefox compatibility certification.
- Placeholder poses and effects are intentional. No sound or final art is needed by this specification.
- Timing/health values are provisional; higher-level balance and the guide's deferred systems remain for later playtesting.
- The project began without Git history. It is now published from `https://github.com/Rezzonance756/riposte` through GitHub Pages at `https://rezzonance756.github.io/riposte/`.
