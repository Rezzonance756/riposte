(function () {
  "use strict";
  window.Riposte = window.Riposte || {};

  function createRenderer(elements) {
    const config = window.Riposte.config;
    const poses = {
      offensive: ["M59 62 L31 76 L18 58", "M60 62 L87 72 L103 51"],
      defensive: ["M59 62 L38 51 L23 69", "M60 62 L81 49 L99 66"],
      high: ["M59 62 L32 35 L47 8", "M60 62 L82 32 L71 8"],
      low: ["M59 62 L33 93 L21 118", "M60 62 L83 92 L106 111"],
      left: ["M59 62 L26 47 L5 61", "M60 62 L33 66 L9 80"],
      right: ["M59 62 L90 43 L117 54", "M60 62 L87 71 L116 81"],
      block: ["M59 62 L31 44 L42 24", "M60 62 L88 44 L78 24"],
      perfect: ["M59 62 L26 36 L13 14", "M60 62 L92 35 L113 16"],
      hit: ["M59 62 L27 78 L9 94", "M60 62 L94 65 L113 48"],
      broken: ["M59 62 L40 98 L31 118", "M60 62 L76 98 L85 118"],
      healing: ["M59 62 L34 49 L51 33", "M60 62 L85 79 L94 57"],
      combo: ["M59 62 L86 47 L117 31", "M60 62 L86 62 L117 54"]
    };
    function pose(fighter, name) {
      fighter.dataset.pose = name;
      const arms = poses[name] || poses.offensive;
      fighter.querySelector('.arm-left').setAttribute('d', arms[0]);
      fighter.querySelector('.arm-right').setAttribute('d', arms[1]);
      fighter.querySelector('.weapon').style.opacity = ['healing', 'broken'].includes(name) ? '0' : '1';
    }
    function flashAction(action) {
      const control = elements.battlefield.querySelector(`[data-action="${action}"]`);
      if (!control) return;
      control.classList.add("active");
      window.setTimeout(() => control.classList.remove("active"), 130);
    }

    function renderState(state) {
      const defensive = state.stance === "DEFENSIVE";
      elements.game.classList.toggle("defensive", defensive);
      elements.stanceIcon.textContent = defensive ? "◆" : "⚔";
      elements.stanceLabel.textContent = defensive ? "DEFENSE" : "OFFENSE";
      elements.stanceShort.textContent = defensive ? "DEF" : "ATK";
      document.querySelector('.opponent-status .status-heading span:last-child').textContent = state.opponent.stance === 'OFFENSIVE' ? 'ATK' : 'DEF';
      elements.debugStance.textContent = state.stance;
      elements.debugState.textContent = state.pause || state.mode;
      elements.debugHeld.textContent = state.heldKeys.size ? Array.from(state.heldKeys).join(", ") : "NONE";
      elements.itemCount.textContent = state.itemCount;
      elements.panelItemCount.textContent = state.itemCount;
      elements.itemControl.disabled = state.itemCount <= 0 || state.itemUseEndsAt !== null || ['READY', 'OVER'].includes(state.mode);
      elements.playerFighter.dataset.pose = defensive ? "defensive" : "offensive";
      elements.centerControl.setAttribute("aria-label", `Change stance. Current stance: ${state.stance}. Spacebar.`);
      elements.itemPanel.hidden = state.pause !== 'ITEM_PAUSE';
      elements.focusPause.hidden = state.pause !== 'FOCUS_PAUSE';
      document.getElementById('combat-message').textContent = state.message;
      document.getElementById('debug-numbers').textContent = `You HP ${state.player.health} / ST ${state.player.stamina} · Rival HP ${state.opponent.health} / ST ${state.opponent.stamina}`;
      document.getElementById('debug-expected').textContent = `Expected: ${state.expectedDirection || '—'}`;
      for (const side of ['player', 'opponent']) {
        const card = document.querySelector(`.${side}-status`);
        card.querySelector('.health-fill').style.transform = `scaleX(${state[side].health / config[side + 'Health']})`;
        card.querySelector('.stamina-fill').style.transform = `scaleX(${state[side].stamina / config[side + 'Stamina']})`;
        card.setAttribute('aria-label', `${side} health ${state[side].health}, stamina ${state[side].stamina}`);
        let values = card.querySelector('.resource-values');
        if (!values) { values = document.createElement('div'); values.className = 'resource-values'; card.append(values); }
        values.textContent = `HP ${state[side].health} · ST ${state[side].stamina}`;
      }
      const attack = state.attack;
      const combo = state.combo;
      const attackProgress = attack ? Math.max(0, Math.min(1, (state.clock - attack.start) / (attack.impact - attack.start))) : 0;
      const comboProgress = combo ? Math.max(0, Math.min(1, (state.clock - combo.start) / config.comboPromptDurationMs)) : 0;
      const telegraph = document.getElementById('attack-telegraph');
      const primaryThreat = document.getElementById('primary-threat');
      const secondaryThreat = document.getElementById('secondary-threat');
      const threatSymbols = {HIGH:'\u2191', LOW:'\u2193', LEFT:'\u2190', RIGHT:'\u2192'};
      function renderThreat(marker, direction, visible, decoy = false) {
        marker.classList.toggle('visible', visible);
        marker.classList.toggle('decoy', decoy);
        if (!visible || !direction) return;
        marker.dataset.direction = direction;
        marker.textContent = threatSymbols[direction];
        const travel = ['LEFT', 'RIGHT'].includes(direction) ? 18 : 32;
        const approach = Math.round((1 - attackProgress) * travel);
        marker.style.setProperty('--approach', `${approach}px`);
        marker.style.setProperty('--approach-negative', `${-approach}px`);
        marker.style.setProperty('--marker-scale', String(.82 + attackProgress * .18));
        marker.style.setProperty('--marker-opacity', String(decoy ? .38 : .72 + attackProgress * .28));
      }
      telegraph.classList.toggle('active', !!attack);
      telegraph.setAttribute('aria-hidden', String(!attack));
      document.getElementById('combat-cue').classList.toggle('attack-active', !!attack && !combo);
      if (attack?.pattern === 'dual') {
        renderThreat(primaryThreat, attack.direction, true, false);
        renderThreat(secondaryThreat, attack.decoy, true, attack.revealed);
      } else {
        renderThreat(primaryThreat, attack ? state.expectedDirection : null, !!attack, false);
        renderThreat(secondaryThreat, null, false);
      }
      for (const control of elements.battlefield.querySelectorAll('[data-action]')) {
        control.classList.toggle('threatened', !!combo && control.dataset.action === state.expectedDirection);
        control.style.setProperty('--threat-gap', `${Math.round((1 - comboProgress) * 16)}px`);
        control.classList.remove('secondary-threat');
      }
      pose(elements.playerFighter, state.effect?.kind === 'hit' ? 'hit' : state.effect?.kind === 'perfect' ? 'perfect' : state.effect?.kind === 'success' ? 'block' : state.stance.toLowerCase());
      pose(document.getElementById('opponent-fighter'), attack ? state.clock >= attack.impact ? 'combo' : state.expectedDirection.toLowerCase() : 'offensive');
      document.getElementById('opponent-fighter').classList.toggle('lunging', !!attack && state.clock >= attack.impact);
      if (combo) {
        pose(elements.playerFighter, combo.broken === 'player' ? 'broken' : combo.response ? 'combo' : state.stance.toLowerCase());
        pose(document.getElementById('opponent-fighter'), combo.broken === 'opponent' ? 'broken' : 'combo');
      }
      if (state.itemUseEndsAt !== null) pose(elements.playerFighter, 'healing');
      if (state.effect?.kind === 'combo' && !state.combo) pose(elements.playerFighter, 'combo');
      elements.centerControl.classList.toggle('ability', !!combo && combo.prompts.includes('CENTER'));
      if (combo && combo.prompts.includes('CENTER')) { elements.stanceIcon.textContent = '✦'; elements.stanceLabel.textContent = 'STRIKE'; }
      const symbols = {HIGH:'↑', LOW:'↓', LEFT:'←', RIGHT:'→', CENTER:'✦'};
      const sequence = document.getElementById('combo-sequence');
      sequence.textContent = combo ? combo.prompts.map((p, i) => i < combo.index ? combo.results[i] === 'success' ? '✓' : '×' : i === combo.index ? '[' + symbols[p] + ']' : symbols[p]).join('  ') : '';
      for (const side of ['player', 'opponent']) document.getElementById(side + '-fighter').classList.toggle('broken', state[side].broken);
      elements.battlefield.dataset.effect = state.effect?.kind || '';
      document.getElementById('start-game').textContent = state.mode === 'READY' ? 'Begin duel' : 'Restart duel';
    }

    function renderHistory(history) {
      if (!history.length) {
        elements.inputHistory.innerHTML = '<li class="empty-history">Use a key or click a control to begin.</li>';
        return;
      }

      elements.inputHistory.replaceChildren(...history.map((entry) => {
        const item = document.createElement("li");
        const action = document.createElement("span");
        const result = document.createElement("span");
        const source = document.createElement("span");
        action.textContent = entry.action;
        result.textContent = `${entry.result}${entry.expected ? ' / ' + entry.expected : ''}${entry.delta === null || entry.delta === undefined ? '' : ' / ' + Math.round(entry.delta) + 'ms'}`;
        source.textContent = entry.source;
        item.append(action, result, source);
        return item;
      }));
    }

    function openItems() {
      elements.itemPanel.hidden = false;
      elements.itemCancel.focus();
    }

    function closeItems() {
      elements.itemPanel.hidden = true;
      elements.battlefield.focus({ preventScroll: true });
    }

    function setFocusPause(paused) {
      elements.focusPause.hidden = !paused;
    }

    return { flashAction, renderState, renderHistory, openItems, closeItems, setFocusPause };
  }

  window.Riposte.renderer = { createRenderer };
})();
