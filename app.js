/* app.js — wire up the sounds and the settings modal */

document.addEventListener('DOMContentLoaded', () => {
  // --- settings / display mode ---
  const SETTINGS_KEY = 'sound-ui-mode'; // values: 'both' | 'icons' | 'text'
  const defaultMode = 'both';

  const settingsBtn = document.getElementById('settingsBtn');
  const modal = document.getElementById('settingsModal');
  const closeModal = document.getElementById('closeModal');
  const displayForm = document.getElementById('displayForm');

  function getMode() {
    return localStorage.getItem(SETTINGS_KEY) || defaultMode;
  }
  function setMode(mode) {
    localStorage.setItem(SETTINGS_KEY, mode);
    applyMode(mode);
  }
  function applyMode(mode) {
    document.body.classList.remove('mode-icons', 'mode-text', 'mode-both');
    if (mode === 'icons') document.body.classList.add('mode-icons');
    else if (mode === 'text') document.body.classList.add('mode-text');
    else document.body.classList.add('mode-both');

    // update radio checked state
    const r = displayForm.elements['mode'];
    for (const el of r) {
      el.checked = (el.value === mode);
    }
  }

  // open settings
  settingsBtn.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'false');
  });
  closeModal.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
  });
  modal.addEventListener('click', (e) => {
    // click outside panel closes
    if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
  });

  displayForm.addEventListener('change', (e) => {
    const v = displayForm.elements['mode'].value;
    setMode(v);
  });

  // load stored mode
  applyMode(getMode());

  // --- sound button setup (refactored from your code) ---
  function setupSound(buttonId, audioId) {
    const button = document.getElementById(buttonId);
    const img = button.querySelector('img');
    const label = button.querySelector('.label');
    const audio = document.getElementById(audioId);

    let state = 0;
    let unlocked = false;
    let fadeInterval = null;

    // states: volume must be in [0,1]
    const states = [
      { volume: 0.0, scale: 0.5, brightness: 1.0, color: "#013647" },
      { volume: 0.2, scale: 0.65, brightness: 1.0, color: "#1e657d" },
      { volume: 0.5, scale: 0.85, brightness: 1.0, color: "#3b87a1" },
      { volume: 0.9, scale: 1.15, brightness: 1.0, color: "#6fb9d1" },
      { volume: 1.0, scale: 1.45, brightness: 1.0, color: "#9fdff5" } // capped at 1.0
    ];

    function fadeTo(target, duration = 300) {
      if (fadeInterval) clearInterval(fadeInterval);
      const start = Number(audio.volume) || 0;
      const capped = Math.max(0, Math.min(1, target));
      const steps = 30;
      const stepTime = Math.max(8, duration / steps);
      let i = 0;
      fadeInterval = setInterval(() => {
        i++;
        audio.volume = start + (capped - start) * (i / steps);
        if (i >= steps) {
          audio.volume = capped;
          clearInterval(fadeInterval);
          fadeInterval = null;
          // pause when volume reaches 0 to save CPU
          if (Math.abs(capped) < 0.001) {
            try { audio.pause(); } catch (err) {}
          }
        }
      }, stepTime);
    }

    button.addEventListener('click', async () => {
      state = (state + 1) % states.length;
      const s = states[state];

      // visual
      button.style.backgroundColor = s.color;
      img.style.transform = `scale(${s.scale})`;
      img.style.filter = `brightness(${s.brightness})`;

      // audio unlock + play
      try {
        if (!unlocked) {
          audio.volume = 0.0;
          await audio.play(); // user interaction allows playback
          unlocked = true;
        } else {
          // ensure playing if fade in from zero (some browsers pause when volume 0)
          if (audio.paused && s.volume > 0) audio.play().catch(()=>{});
        }
      } catch (err) {
        // play could fail on some phones/browsers; ignore silently
        unlocked = true;
      }

      fadeTo(s.volume, 300);
    });

    // ensure starting visuals correspond to state 0
    const s0 = states[0];
    button.style.backgroundColor = s0.color;
    img.style.transform = `scale(${s0.scale})`;
    img.style.filter = `brightness(${s0.brightness})`;
    audio.volume = 0;
    try { audio.pause(); } catch {}
  }

  // list of id pairs to initialise
  const pairs = [
    ["whiteBtn", "whiteAudio"],
    ["rainBtn", "rainAudio"],
    ["birdsBtn", "birdsAudio"],
    ["catBtn", "catAudio"],
    ["violinBtn", "violinAudio"],
    ["fireBtn", "fireAudio"],
    ["dogBtn", "dogAudio"]
  ];
  for (const [b, a] of pairs) setupSound(b, a);

  // Accessibility: close modal with Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.setAttribute('aria-hidden', 'true');
  });
});
