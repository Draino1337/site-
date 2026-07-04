/* ============================================================
   DRAINO1337 — глитч-логика
   1. TV-шум на canvas
   2. Эффект «дешифровки» текста при загрузке
   3. Скремблинг букв при наведении на ссылки
   4. Случайные вспышки глитча заголовка + разрывы кадра
   5. Часы в статус-баре
   ============================================================ */

const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. TV-ШУМ ---------- */
(function initNoise() {
  if (REDUCED) return;

  const canvas = document.getElementById("noise");
  const ctx = canvas.getContext("2d");
  let w, h, imageData;

  function resize() {
    // рисуем в низком разрешении — быстрее и «зернистее»
    w = canvas.width = Math.floor(window.innerWidth / 3);
    h = canvas.height = Math.floor(window.innerHeight / 3);
    imageData = ctx.createImageData(w, h);
  }

  function draw() {
    const buf = new Uint32Array(imageData.data.buffer);
    for (let i = 0; i < buf.length; i++) {
      // случайный серый пиксель с рандомной прозрачностью
      const shade = (Math.random() * 255) | 0;
      buf[i] = (255 << 24) | (shade << 16) | (shade << 8) | shade;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  // ~12 fps достаточно для эффекта и не грузит батарею
  setInterval(draw, 80);
})();

/* ---------- 2. ДЕШИФРОВКА ТЕКСТА ---------- */
const GLITCH_CHARS = "!<>-_\\/[]{}—=+*^?#________абвгдежзXYZ01";

function scrambleTo(el, finalText, speed = 1) {
  let frame = 0;
  const total = finalText.length;
  const duration = Math.max(20, total * 3 / speed);

  clearInterval(el._scrambleTimer);
  el._scrambleTimer = setInterval(() => {
    frame++;
    const progress = frame / duration;
    let out = "";
    for (let i = 0; i < total; i++) {
      if (i / total < progress) {
        out += finalText[i];
      } else {
        out += GLITCH_CHARS[(Math.random() * GLITCH_CHARS.length) | 0];
      }
    }
    el.textContent = out;
    if (progress >= 1) {
      el.textContent = finalText;
      clearInterval(el._scrambleTimer);
    }
  }, 24);
}

// строка под заголовком расшифровывается при загрузке
window.addEventListener("DOMContentLoaded", () => {
  const decode = document.getElementById("decode");
  if (decode && !REDUCED) {
    setTimeout(() => scrambleTo(decode, decode.dataset.text, 0.5), 400);
  }

  // заголовок тоже «собирается» из мусора
  const title = document.getElementById("title");
  if (title && !REDUCED) {
    scrambleTo(title, title.dataset.text, 0.7);
  }
});

/* ---------- 3. СКРЕМБЛИНГ ПРИ НАВЕДЕНИИ ---------- */
document.querySelectorAll(".scramble").forEach((el) => {
  const original = el.dataset.text || el.textContent;
  const parent = el.closest("a") || el;
  parent.addEventListener("mouseenter", () => {
    if (!REDUCED) scrambleTo(el, original, 2);
  });
});

/* ---------- 4. СЛУЧАЙНЫЕ ВСПЫШКИ ГЛИТЧА ---------- */
(function initBursts() {
  if (REDUCED) return;

  const title = document.getElementById("title");

  // усиление глитча заголовка на короткое время
  function burst() {
    title.classList.add("burst");
    setTimeout(() => title.classList.remove("burst"), 180 + Math.random() * 250);
    schedule(burst, 2500, 6500);
  }

  // разрыв всего кадра
  function tear() {
    document.body.classList.add("tear");
    setTimeout(() => document.body.classList.remove("tear"), 170);
    // иногда двойной разрыв подряд — выглядит агрессивнее
    if (Math.random() < 0.3) {
      setTimeout(() => {
        document.body.classList.add("tear");
        setTimeout(() => document.body.classList.remove("tear"), 140);
      }, 300);
    }
    schedule(tear, 4000, 9000);
  }

  function schedule(fn, min, max) {
    setTimeout(fn, min + Math.random() * (max - min));
  }

  schedule(burst, 1500, 3000);
  schedule(tear, 3000, 6000);
})();

/* ---------- 5. ЧАСЫ ---------- */
(function initClock() {
  const clock = document.getElementById("clock");
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");
    clock.textContent = `${hh}:${mm}:${ss}`;
  }

  tick();
  setInterval(tick, 1000);
})();
