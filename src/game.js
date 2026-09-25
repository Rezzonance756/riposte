(function () {
  "use strict";
  const { config, combat, renderer, input } = window.Riposte;
  const ids = {
    game: "game", battlefield: "battlefield", playerFighter: "player-fighter",
    centerControl: "center-control", itemControl: "item-control", stanceIcon: "stance-icon",
    stanceLabel: "stance-label", stanceShort: "stance-short", itemCount: "item-count",
    panelItemCount: "panel-item-count", itemPanel: "item-panel", itemCancel: "item-cancel",
    itemBackdrop: "item-backdrop", focusPause: "focus-pause", debugPanel: "debug-panel",
    debugToggle: "debug-toggle", debugState: "debug-state", debugStance: "debug-stance",
    debugHeld: "debug-held", inputHistory: "input-history"
  };
  const elements = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, document.getElementById(id)]));
  const engine = combat.createEngine(config);
  const state = engine.state;
  const view = renderer.createRenderer(elements);
  let historySignature = "";
  const itemChoices = Array.from(document.querySelectorAll('.item-choice'));
  let itemSelection = 0;
  function render() {
    view.renderState(state);
    const signature = JSON.stringify(state.history);
    if (signature !== historySignature) { view.renderHistory(state.history); historySignature = signature; }
  }
  function closeItems(source) {
    engine.cancelItems(source);
    view.closeItems();
    render();
  }
  function handleAction(action, source) {
    if (state.pause === "FOCUS_PAUSE") return;
    if (state.pause === "ITEM_PAUSE") {
      if (action === "ITEM" || action === "CANCEL") closeItems(source);
      else if (action === 'CENTER') confirmItem(source);
      else if (['HIGH', 'LEFT', 'LOW', 'RIGHT'].includes(action)) {
        itemSelection = (itemSelection + (['HIGH', 'LEFT'].includes(action) ? -1 : 1) + itemChoices.length) % itemChoices.length;
        itemChoices[itemSelection].focus();
      }
      return;
    }
    if (action === "ITEM") {
      if (engine.openItems(source)) { itemSelection = 0; view.openItems(); itemChoices[0].focus(); }
    } else {
      engine.action(action, source);
      view.flashAction(action);
    }
    render();
  }
  function confirmItem(source) {
    engine.useItem(source);
    view.closeItems(); render();
  }
  itemChoices.forEach((choice, index) => choice.addEventListener('click', () => { itemSelection = index; confirmItem('mouse'); }));
  const controls = input.createInputController({
    battlefield: elements.battlefield, state, onAction: handleAction,
    onHeldKeysChanged: render
  });
  document.getElementById("start-game").addEventListener("click", () => {
    engine.start(); controls.clearHeldKeys(); render(); elements.battlefield.focus({ preventScroll: true });
  });
  elements.itemCancel.addEventListener("click", () => closeItems("mouse"));
  elements.itemBackdrop.addEventListener("click", () => closeItems("mouse"));
  elements.debugToggle.addEventListener("click", () => {
    elements.debugPanel.hidden = !elements.debugPanel.hidden;
    elements.debugToggle.textContent = elements.debugPanel.hidden ? "Show diagnostics" : "Hide diagnostics";
    elements.debugToggle.setAttribute("aria-pressed", String(!elements.debugPanel.hidden));
  });
  document.getElementById("keyboard-help").addEventListener("change", event => elements.game.classList.toggle("no-key-help", !event.target.checked));
  document.getElementById("ability-test").addEventListener("change", event => { state.ability = event.target.checked; elements.battlefield.focus({preventScroll:true}); });
  document.getElementById('attack-pattern').addEventListener('change', event => { state.pattern = event.target.value; elements.battlefield.focus({preventScroll:true}); });
  let previousPause = null;
  function pauseFocus() {
    controls.clearHeldKeys();
    if (state.pause !== "FOCUS_PAUSE") previousPause = state.pause;
    state.pause = "FOCUS_PAUSE";
    render();
  }
  window.addEventListener("blur", pauseFocus);
  document.addEventListener("visibilitychange", () => { if (document.hidden) pauseFocus(); });
  elements.focusPause.addEventListener("click", () => {
    state.pause = previousPause;
    if (state.pause === "ITEM_PAUSE") view.openItems();
    else elements.battlefield.focus({ preventScroll: true });
    render();
  });
  let lastFrame = performance.now();
  function frame(now) {
    engine.tick(Math.min(100, now - lastFrame));
    lastFrame = now; render(); requestAnimationFrame(frame);
  }
  // Read-only diagnostics for reproducible browser verification.
  window.Riposte.snapshot = () => JSON.parse(JSON.stringify(state, (key, value) => value instanceof Set ? [...value] : value));
  render(); requestAnimationFrame(frame);
})();
