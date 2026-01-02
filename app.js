document.addEventListener('DOMContentLoaded', () => {
  const SETTINGS_KEY = 'sound-ui-mode';
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

    const r = displayForm.elements['mode'];
    for (const el of r) {
      el.checked = (el.value === mode);
    }
  }

  settingsBtn.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'false');
  });
  closeModal.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.setAttribute('aria-hidden', 'true');
  });

  displayForm.addEventListener('change', (e) => {
    const v = displayForm.elements['mode'].value;
    setMode(v);
  });

  applyMode(getMode());

  function setupSound(buttonId, audioId) {
    const button = document.getElementById(buttonId);
    const img = button.querySelector('img');
    const label = button.querySelector('.label');
    const audio = document.getElementById(audioId);

    let state = 0;
    let unlocked = false;
    let fadeInterval = null;

    const states = [
      { volume: 0.0, scale: 0.5, brightness: 1.0, color: "#013647" },
      { volume: 0.2, scale: 0.65, brightness: 1.0, color: "#1e657d" },
      { volume: 0.5, scale: 0.85, brightness: 1.0, color: "#3b87a1" },
      { volume: 0.9, scale: 1.15, brightness: 1.0, color: "#6fb9d1" },
      { volume: 1.0, scale: 1.45, brightness: 1.0, color: "#9fdff5" }
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
          if (Math.abs(capped) < 0.001) {
            audio.pause();
          }
        }
      }, stepTime);
    }

    button.addEventListener('click', async () => {
      state = (state + 1) % states.length;
      const s = states[state];

      button.style.backgroundColor = s.color;
      img.style.transform = `scale(${s.scale})`;
      img.style.filter = `brightness(${s.brightness})`;

      try {
        if (!unlocked) {
          audio.volume = 0.0;
          await audio.play();
          unlocked = true;
        } else {
          if (audio.paused && s.volume > 0) audio.play().catch(()=>{});
        }
      } catch (err) {
        unlocked = true;
      }

      fadeTo(s.volume, 300);
    });

    const s0 = states[0];
    button.style.backgroundColor = s0.color;
    img.style.transform = `scale(${s0.scale})`;
    img.style.filter = `brightness(${s0.brightness})`;
    audio.volume = 0;
    try { audio.pause(); } catch {}
  }

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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.setAttribute('aria-hidden', 'true');
  });
});
