(function () {
  "use strict";
  window.Riposte = window.Riposte || {};

  function createInitialState(config) {
    return {
      mode: "READY",
      stance: "OFFENSIVE",
      clock: 0, pause: null, attack: null, nextAttackAt: 0,
      combo: null, ability: false,
      pattern: 'normal',
      itemUseEndsAt: null,
      lastDirection: null, directionRun: 0,
      effect: null, freezeMs: 0, message: "Watch the opponent. Respond when the directional marker reaches them.",
      player: { health: config.playerHealth, stamina: config.playerStamina, broken: false },
      opponent: { health: config.opponentHealth, stamina: config.opponentStamina, broken: false, stance: "OFFENSIVE" },
      itemCount: config.healingItemCount,
      expectedDirection: null,
      heldKeys: new Set(),
      history: []
    };
  }

  function toggleStance(state) {
    state.stance = state.stance === "OFFENSIVE" ? "DEFENSIVE" : "OFFENSIVE";
  }

  function addHistory(state, entry, limit) {
    state.history.unshift(entry);
    state.history.length = Math.min(state.history.length, limit);
  }

  const directions = ["HIGH", "LOW", "LEFT", "RIGHT"];
  function createEngine(config, random = Math.random) {
    const state = createInitialState(config);
    function record(action, source, result, expected = state.expectedDirection, delta = null) {
      addHistory(state, { action, source, result, expected, delta }, config.inputHistoryLength);
    }
    function feedback(kind, text) {
      state.effect = { kind, until: state.clock + config.effectDurationMs };
      state.message = text;
      if (kind === "perfect") state.freezeMs = config.perfectFreezeMs;
    }
    function start() {
      const ability = state.ability;
      const pattern = state.pattern;
      Object.assign(state, createInitialState(config));
      state.ability = ability;
      state.pattern = pattern;
      state.mode = "WAIT";
      state.nextAttackAt = config.attackIntervalMs;
    }
    function chooseDirection() {
      const pool = directions.filter(d => state.directionRun < 2 || d !== state.lastDirection);
      const direction = pool[Math.floor(random() * pool.length)];
      state.directionRun = direction === state.lastDirection ? state.directionRun + 1 : 1;
      state.lastDirection = direction;
      return direction;
    }
    function beginAttack() {
      const direction = chooseDirection();
      const pattern = state.pattern;
      const duration = pattern === 'fast' ? config.fastTelegraphDurationMs : config.telegraphDurationMs;
      const other = directions.filter(d => d !== direction);
      const decoy = other[Math.floor(random() * other.length)];
      state.attack = { direction, decoy, pattern, revealed: !['feint','dual'].includes(pattern), start: state.clock, impact: state.clock + duration, response: null };
      state.expectedDirection = pattern === 'feint' ? decoy : direction;
      state.mode = "ATTACK";
      state.message = pattern === 'dual' ? 'Two threats. Watch which marker remains strong.' : `Incoming ${state.expectedDirection.toLowerCase()}`;
    }
    function finishAttack(result) {
      const good = result === "perfect" || result === "success";
      const responseStance = state.attack?.response?.stance || state.stance;
      if (good && responseStance === "OFFENSIVE") {
        state.opponent.stamina = Math.max(0, state.opponent.stamina - (result === "perfect" ? config.perfectOffensiveStaminaDamage : config.offensiveStaminaDamage));
      } else if (good) {
        state.player.stamina = Math.min(config.playerStamina, state.player.stamina + (result === "perfect" ? config.perfectDefensiveStaminaRestore : config.defensiveStaminaRestore));
      } else {
        state.player.stamina = Math.max(0, state.player.stamina - config.playerStaminaLossOnMiss);
        state.player.health = Math.max(0, state.player.health - config.playerHealthLossOnMiss);
      }
      if (good && state.attack?.pattern === 'dual') {
        state.player.health = Math.max(0, state.player.health - config.dualChipHealth);
        state.player.stamina = Math.max(0, state.player.stamina - config.dualChipStamina);
      }
      feedback(good ? result : "hit", good ? `${result.toUpperCase()} ${responseStance === "OFFENSIVE" ? "PARRY" : "BLOCK"}` : `${result.toUpperCase()} — hit taken`);
      state.attack = null;
      state.expectedDirection = null;
      state.mode = state.player.health <= 0 ? "OVER" : "WAIT";
      state.nextAttackAt = state.clock + config.attackIntervalMs;
      if (state.mode === "OVER") state.message = "Defeated — try again";
      else if (state.opponent.stamina <= 0) beginCombo('opponent');
      else if (state.player.stamina <= 0) beginCombo('player');
    }
    function beginCombo(broken) {
      state[broken].broken = true;
      const prompts = Array.from({length: config.comboLength}, () => directions[Math.floor(random() * directions.length)]);
      if (broken === 'opponent' && state.ability) prompts[1] = 'CENTER';
      const start = state.clock + config.comboLeadInMs;
      state.combo = { broken, prompts, index: 0, start, deadline: start + config.comboPromptDurationMs, results: [], response: null };
      state.mode = 'COMBO';
      state.message = broken === 'opponent' ? 'RIVAL BROKEN — follow the prompts!' : 'GUARD BROKEN — defend each prompt!';
    }
    function resolveComboPrompt() {
      const combo = state.combo;
      const correct = combo.response === true;
      if (combo.response === null) record('—', 'clock', 'missed', combo.prompts[combo.index], config.comboPromptDurationMs);
      combo.results.push(correct ? 'success' : 'missed');
      if (combo.broken === 'opponent') {
        if (correct) state.opponent.health = Math.max(0, state.opponent.health - config.comboDamagePerSuccess);
      } else {
        state.player.health = Math.max(0, state.player.health - Math.max(0, config.incomingComboDamage - (correct ? config.defensiveComboPreventionPerSuccess : 0)));
      }
      feedback(correct ? 'combo' : combo.broken === 'player' ? 'hit' : 'missed', correct ? 'COMBO SUCCESS' : 'PROMPT MISSED — keep going');
      combo.index++;
      combo.response = null;
      state.expectedDirection = null;
      if (combo.index >= combo.prompts.length) {
        state[combo.broken].broken = false;
        state[combo.broken].stamina = config.staminaAfterBreak;
        state.combo = null;
        state.mode = state.player.health <= 0 || state.opponent.health <= 0 ? 'OVER' : 'WAIT';
        state.nextAttackAt = state.clock + config.attackIntervalMs;
        state.message = state.opponent.health <= 0 ? 'VICTORY — duel complete' : state.player.health <= 0 ? 'Defeated — try again' : 'Combo complete — stamina restored';
      } else {
        combo.start = state.clock + config.comboGapMs;
        combo.deadline = combo.start + config.comboPromptDurationMs;
      }
    }
    function action(action, source) {
      if (state.pause || state.mode === "READY" || state.mode === "OVER") return;
      if (state.itemUseEndsAt !== null) { record(action, source, 'using item'); return; }
      if (state.combo) {
        const combo = state.combo;
        if (![...directions, 'CENTER'].includes(action)) return;
        if (state.clock < combo.start) { record(action, source, 'early', combo.prompts[combo.index], state.clock - combo.start); return; }
        if (combo.response !== null) return;
        combo.response = action === combo.prompts[combo.index];
        record(action, source, combo.response ? 'success' : 'wrong', combo.prompts[combo.index], state.clock - combo.deadline);
        return;
      }
      if (action === "CENTER") {
        toggleStance(state); record(action, source, state.stance.toLowerCase()); return;
      }
      if (!directions.includes(action)) return;
      const attack = state.attack;
      if (!attack || attack.response) { record(action, source, "late"); return; }
      const delta = state.clock - attack.impact;
      const result = delta < -config.responseToleranceMs ? "early" : delta > config.responseToleranceMs ? "late" : action !== attack.direction ? "wrong" : Math.abs(delta) <= config.perfectToleranceMs ? "perfect" : "success";
      attack.response = { result, delta, source, action, stance: state.stance };
      record(action, source, result, attack.direction, delta);
      if (delta >= 0) finishAttack(result);
    }
    function tick(dt) {
      if (state.pause || state.mode === "READY" || state.mode === "OVER") return;
      if (state.freezeMs > 0) { const frozen = Math.min(dt, state.freezeMs); state.freezeMs -= frozen; dt -= frozen; }
      state.clock += dt;
      if (state.itemUseEndsAt !== null && state.clock >= state.itemUseEndsAt) {
        state.player.health = Math.min(config.playerHealth, state.player.health + config.healingAmount);
        state.itemUseEndsAt = null;
        feedback('heal', `HEALED +${config.healingAmount}`);
      }
      if (state.effect && state.clock >= state.effect.until) state.effect = null;
      if (state.combo) {
        if (state.clock >= state.combo.start) state.expectedDirection = state.combo.prompts[state.combo.index];
        if (state.clock >= state.combo.deadline) resolveComboPrompt();
        return;
      }
      if (state.mode === "WAIT" && state.clock >= state.nextAttackAt) beginAttack();
      const attack = state.attack;
      if (!attack) return;
      if (!attack.revealed && state.clock >= attack.impact - config.patternRevealBeforeMs) {
        attack.revealed = true; state.expectedDirection = attack.direction;
        state.message = `${attack.pattern === 'feint' ? 'FEINT → ' : 'PRIMARY → '}${attack.direction}`;
      }
      if (attack.response && state.clock >= attack.impact) finishAttack(attack.response.result);
      else if (state.clock > attack.impact + config.responseToleranceMs) {
        record("—", "clock", "missed", attack.direction, state.clock - attack.impact);
        finishAttack("missed");
      }
    }
    function openItems(source) {
      if (state.pause || state.itemCount <= 0 || state.itemUseEndsAt !== null || ['READY', 'OVER'].includes(state.mode)) return false;
      state.pause = 'ITEM_PAUSE'; record('ITEM', source, 'paused'); return true;
    }
    function cancelItems(source) {
      if (state.pause !== 'ITEM_PAUSE') return;
      state.pause = null; record('CANCEL', source, 'canceled');
    }
    function useItem(source) {
      if (state.pause !== 'ITEM_PAUSE' || state.itemCount <= 0) return;
      state.pause = null; state.itemCount--;
      state.itemUseEndsAt = state.clock + config.itemUseVulnerabilityMs;
      state.message = 'USING TONIC — exposed until healing completes';
      record('ITEM', source, 'using tonic');
    }
    return { state, start, action, tick, record, openItems, cancelItems, useItem };
  }
  window.Riposte.combat = { createInitialState, toggleStance, addHistory, createEngine, directions };
})();
