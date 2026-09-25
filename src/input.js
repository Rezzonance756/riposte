(function () {
  "use strict";
  window.Riposte = window.Riposte || {};

  const KEY_ACTIONS = new Map([
    ["w", "HIGH"], ["arrowup", "HIGH"],
    ["a", "LEFT"], ["arrowleft", "LEFT"],
    ["s", "LOW"], ["arrowdown", "LOW"],
    ["d", "RIGHT"], ["arrowright", "RIGHT"],
    [" ", "CENTER"],
    ["shift", "ITEM"], ["e", "ITEM"],
    ["escape", "CANCEL"]
  ]);

  function createInputController(options) {
    const { battlefield, state, onAction, onHeldKeysChanged } = options;

    function normalizeKey(event) {
      return event.key.toLowerCase();
    }

    function onKeyDown(event) {
      const key = normalizeKey(event);
      const action = KEY_ACTIONS.get(key);
      if (!action) return;
      if (event.target.matches('select, input') && (key.startsWith('arrow') || key === ' ')) return;
      event.preventDefault();
      const heldKey = event.code || key;
      if (state.heldKeys.has(heldKey) || event.repeat) return;
      state.heldKeys.add(heldKey);
      onHeldKeysChanged();
      onAction(action, "keyboard");
    }

    function onKeyUp(event) {
      const key = normalizeKey(event);
      if (!KEY_ACTIONS.has(key)) return;
      state.heldKeys.delete(event.code || key);
      onHeldKeysChanged();
    }

    function onClick(event) {
      const control = event.target.closest("[data-action]");
      if (!control || control.disabled) return;
      onAction(control.dataset.action, "mouse");
    }

    function clearHeldKeys() {
      state.heldKeys.clear();
      onHeldKeysChanged();
    }

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp);
    battlefield.addEventListener("click", onClick);
    return { clearHeldKeys };
  }

  window.Riposte.input = { createInputController };
})();
