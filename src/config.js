(function () {
  "use strict";
  window.Riposte = window.Riposte || {};
  window.Riposte.config = Object.freeze({
    playerHealth: 100, opponentHealth: 100,
    playerStamina: 100, opponentStamina: 100,
    telegraphDurationMs: 800, attackIntervalMs: 650,
    responseToleranceMs: 260, perfectToleranceMs: 90,
    playerStaminaLossOnMiss: 18, playerHealthLossOnMiss: 8,
    offensiveStaminaDamage: 12, perfectOffensiveStaminaDamage: 20,
    defensiveStaminaRestore: 10, perfectDefensiveStaminaRestore: 18,
    comboLength: 4, comboPromptDurationMs: 450,
    comboDamagePerSuccess: 8, defensiveComboPreventionPerSuccess: 8,
    staminaAfterBreak: 60,
    healingItemCount: 2, healingAmount: 25, itemUseVulnerabilityMs: 450,
    inputHistoryLength: 6,
    // Additional provisional presentation/test values, not final balance.
    effectDurationMs: 240, perfectFreezeMs: 55,
    comboLeadInMs: 450, comboGapMs: 110,
    incomingComboDamage: 10,
    fastTelegraphDurationMs: 540, patternRevealBeforeMs: 320,
    dualChipHealth: 2, dualChipStamina: 4
  });
})();
