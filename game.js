// ============================================================
// SHARAABI SHAAM — GAME LOGIC
// ============================================================

(function () {
  'use strict';

  const C = window.GAME_CONTENT;

  // ─── STATE ───
  const state = {
    risque: false,
    nhie: { deck: [], index: 0 },
    mr:   { deck: [], index: 0 },
    bb:   { deck: [], index: 0, timerInterval: null, timeLeft: 15, running: false },
  };

  // ─── HELPERS ───
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function buildDeck(safeArr, risqueArr) {
    const cards = state.risque
      ? shuffle([...safeArr, ...risqueArr])
      : shuffle([...safeArr]);
    return cards;
  }

  function getDare() {
    const pool = state.risque
      ? [...C.dares.safe, ...C.dares.risque]
      : [...C.dares.safe];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function updateCount(gameKey) {
    const s = state[gameKey];
    const badgeMap = { nhie: 'nhie-count', mr: 'mr-count', bb: 'bb-count' };
    const el = document.getElementById(badgeMap[gameKey]);
    if (el) {
      const remaining = s.deck.length - s.index;
      el.textContent = remaining + ' left';
    }
  }

  // ─── SCREEN TRANSITIONS ───
  function showScreen(id) {
    document.querySelectorAll('.screen.active').forEach(s => {
      s.classList.remove('active');
      s.classList.add('slide-out');
      setTimeout(() => s.classList.remove('slide-out'), 350);
    });
    setTimeout(() => {
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
    }, 100);
  }

  window.goHome = function () {
    stopBlitzTimer();
    showScreen('screen-splash');
  };

  window.openGame = function (game) {
    const risque = document.getElementById('risque-toggle').checked;
    state.risque = risque;

    if (game === 'never-have-i-ever') {
      initNHIE();
      showScreen('screen-never-have-i-ever');
    } else if (game === 'majority-rules') {
      initMR();
      showScreen('screen-majority-rules');
    } else if (game === 'bollywood-blitz') {
      initBB();
      showScreen('screen-bollywood-blitz');
    }
  };

  // ─── GAME OVER ───
  function renderGameOver(gameKey) {
    const bodyMap = { nhie: 'screen-never-have-i-ever', mr: 'screen-majority-rules', bb: 'screen-bollywood-blitz' };
    const body = document.querySelector('#' + bodyMap[gameKey] + ' .game-body');
    if (!body) return;
    body.innerHTML = `
      <div class="game-over-card">
        <span class="game-over-emoji">🎉</span>
        <p class="game-over-title">That's a wrap!</p>
        <p class="game-over-sub">You've gone through all the cards. Someone's definitely drunk.</p>
        <button class="restart-btn" onclick="openGame('${
          gameKey === 'nhie' ? 'never-have-i-ever' :
          gameKey === 'mr' ? 'majority-rules' : 'bollywood-blitz'
        }')">Play Again 🔄</button>
      </div>
    `;
  }

  // ─── NEVER HAVE I EVER ───
  function initNHIE() {
    state.nhie.deck = buildDeck(C.neverHaveIEver.safe, C.neverHaveIEver.risque);
    state.nhie.index = 0;
    renderNHIE();
  }

  function renderNHIE() {
    const s = state.nhie;
    updateCount('nhie');
    if (s.index >= s.deck.length) { renderGameOver('nhie'); return; }
    const card = s.deck[s.index];
    const textEl = document.getElementById('nhie-text');
    if (textEl) textEl.textContent = card;
    const cardEl = document.getElementById('nhie-card');
    if (cardEl) {
      cardEl.classList.remove('card-flip');
      void cardEl.offsetWidth;
      cardEl.classList.add('card-flip');
    }
  }

  window.nextCard = function (gameKey) {
    if (gameKey === 'nhie') {
      state.nhie.index++;
      renderNHIE();
    } else if (gameKey === 'mr') {
      state.mr.index++;
      renderMR();
    } else if (gameKey === 'bb') {
      stopBlitzTimer();
      state.bb.index++;
      renderBB();
    }
  };

  // ─── MAJORITY RULES ───
  function initMR() {
    state.mr.deck = buildDeck(C.majorityRules.safe, C.majorityRules.risque);
    state.mr.index = 0;
    renderMR();
  }

  function renderMR() {
    const s = state.mr;
    updateCount('mr');
    if (s.index >= s.deck.length) { renderGameOver('mr'); return; }
    const card = s.deck[s.index];
    const textEl = document.getElementById('mr-text');
    if (textEl) textEl.textContent = card.question;
    const cardEl = document.querySelector('#screen-majority-rules .question-card');
    if (cardEl) {
      cardEl.style.animation = 'none';
      void cardEl.offsetWidth;
      cardEl.style.animation = 'cardIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  }

  // ─── BOLLYWOOD BLITZ ───
  function initBB() {
    state.bb.deck = buildDeck(C.bollywoodBlitz.safe, C.bollywoodBlitz.risque);
    state.bb.index = 0;
    stopBlitzTimer();
    renderBB();
  }

  function renderBB() {
    const s = state.bb;
    updateCount('bb');
    stopBlitzTimer();
    state.bb.timeLeft = C.bollywoodBlitz.timerSeconds;
    updateTimerDisplay(state.bb.timeLeft);

    if (s.index >= s.deck.length) { renderGameOver('bb'); return; }
    const card = s.deck[s.index];
    const textEl = document.getElementById('bb-text');
    if (textEl) textEl.textContent = card.question;

    const answerWrap = document.getElementById('bb-answer-wrap');
    if (answerWrap) answerWrap.classList.add('hidden');
    const revealBtn = document.getElementById('bb-reveal-btn');
    if (revealBtn) revealBtn.classList.add('hidden');
    const startBtn = document.getElementById('bb-start-btn');
    if (startBtn) startBtn.classList.remove('hidden');

    const cardEl = document.querySelector('#screen-bollywood-blitz .trivia-card');
    if (cardEl) {
      cardEl.style.animation = 'none';
      void cardEl.offsetWidth;
      cardEl.style.animation = 'cardIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  }

  window.startBlitzTimer = function () {
    const startBtn = document.getElementById('bb-start-btn');
    if (startBtn) startBtn.classList.add('hidden');
    const revealBtn = document.getElementById('bb-reveal-btn');
    if (revealBtn) revealBtn.classList.remove('hidden');

    state.bb.running = true;
    state.bb.timeLeft = C.bollywoodBlitz.timerSeconds;
    const circumference = 213.6;
    const ringFill = document.getElementById('bb-ring-fill');

    state.bb.timerInterval = setInterval(() => {
      state.bb.timeLeft--;
      updateTimerDisplay(state.bb.timeLeft);

      const progress = state.bb.timeLeft / C.bollywoodBlitz.timerSeconds;
      if (ringFill) {
        ringFill.style.strokeDashoffset = circumference * (1 - progress);
        if (progress <= 0.33) ringFill.style.stroke = '#FF6B35';
        else if (progress <= 0.66) ringFill.style.stroke = '#FFCC00';
        else ringFill.style.stroke = '#00C9A7';
      }

      if (state.bb.timeLeft <= 0) {
        stopBlitzTimer();
        // Time's up - auto reveal
        revealAnswer();
        const timerNum = document.getElementById('bb-timer');
        if (timerNum) {
          timerNum.textContent = '💀';
          timerNum.style.fontSize = '22px';
        }
      }
    }, 1000);
  };

  function stopBlitzTimer() {
    if (state.bb.timerInterval) {
      clearInterval(state.bb.timerInterval);
      state.bb.timerInterval = null;
    }
    state.bb.running = false;
    const ringFill = document.getElementById('bb-ring-fill');
    if (ringFill) {
      ringFill.style.strokeDashoffset = 0;
      ringFill.style.stroke = '#00C9A7';
    }
  }

  function updateTimerDisplay(n) {
    const el = document.getElementById('bb-timer');
    if (!el) return;
    el.style.fontSize = '28px';
    el.textContent = Math.max(0, n);
    el.style.color = n <= 5 ? '#FF6B35' : n <= 10 ? '#FFCC00' : '#00C9A7';
  }

  window.revealAnswer = function () {
    const s = state.bb;
    if (s.index >= s.deck.length) return;
    const card = s.deck[s.index];
    const answerWrap = document.getElementById('bb-answer-wrap');
    const answerText = document.getElementById('bb-answer-text');
    const revealBtn = document.getElementById('bb-reveal-btn');
    if (answerText) answerText.textContent = card.answer;
    if (answerWrap) answerWrap.classList.remove('hidden');
    if (revealBtn) revealBtn.classList.add('hidden');
    stopBlitzTimer();
  };

  // ─── SPIN THE BOTTLE ───
  window.showSpinBottle = function () {
    const overlay = document.getElementById('spin-overlay');
    if (!overlay) return;
    // reset to spin phase
    document.getElementById('spin-phase-spin').classList.remove('hidden');
    document.getElementById('spin-phase-dare').classList.add('hidden');
    const bottle = document.getElementById('bottle-emoji');
    bottle.classList.remove('spinning');
    bottle.style.transform = 'rotate(0deg)';
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = false;
    spinBtn.textContent = 'Spin!';
    overlay.classList.remove('hidden');
  };

  window.closeSpinBottle = function () {
    document.getElementById('spin-overlay').classList.add('hidden');
  };

  window.spinBottle = function () {
    const bottle = document.getElementById('bottle-emoji');
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = true;
    spinBtn.textContent = 'Spinning...';

    // Random full rotations (5-10) plus random extra degrees
    const extraDeg = Math.floor(Math.random() * 360);
    const totalDeg = (5 + Math.floor(Math.random() * 5)) * 360 + extraDeg;
    const duration = 2.2 + Math.random() * 0.8;

    bottle.classList.remove('spinning');
    void bottle.offsetWidth;
    bottle.style.setProperty('--spin-total', totalDeg);
    bottle.style.setProperty('--spin-duration', duration + 's');
    bottle.classList.add('spinning');

    setTimeout(() => {
      // Show dare phase
      const dare = getDare();
      document.getElementById('spin-dare-text').textContent = dare;
      const landedNames = ['you', 'the one who looked away', 'the birthday star', 'whoever\'s holding this phone'];
      document.getElementById('spin-landed-text').textContent =
        'It landed on ' + landedNames[Math.floor(Math.random() * landedNames.length)] + '...';
      document.getElementById('spin-phase-spin').classList.add('hidden');
      document.getElementById('spin-phase-dare').classList.remove('hidden');
    }, (duration * 1000) + 100);
  };

  window.spinAgain = function () {
    document.getElementById('spin-phase-dare').classList.add('hidden');
    document.getElementById('spin-phase-spin').classList.remove('hidden');
    const bottle = document.getElementById('bottle-emoji');
    bottle.classList.remove('spinning');
    bottle.style.transform = 'rotate(0deg)';
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = false;
    spinBtn.textContent = 'Spin!';
  };

  // Keep old closeDare as no-op for safety
  window.closeDare = window.closeSpinBottle;
  window.showDare = window.showSpinBottle;

  // ─── RISQUE TOGGLE LIVE LISTENER ───
  document.getElementById('risque-toggle').addEventListener('change', function () {
    state.risque = this.checked;
  });

  // ─── PREVENT BOUNCE SCROLL ON IOS ───
  document.addEventListener('touchmove', function (e) {
    if (!e.target.closest('.screen')) e.preventDefault();
  }, { passive: false });

})();
