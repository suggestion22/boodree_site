document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     NAV ACTIVE (Scroll Spy)
  ================================================== */
  const navLinks = document.querySelectorAll(".nav a");
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const header = document.querySelector("header");
  const headerH = () => (header ? header.offsetHeight : 0);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", isActive);
      isActive
        ? a.setAttribute("aria-current", "page")
        : a.removeAttribute("aria-current");
    });
  };

  if (navLinks.length && sections.length) {
    navLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        setActive(target.id);

        const top =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerH();

        window.scrollTo({ top, behavior: "smooth" });
      });
    });

    const onScroll = () => {
      const pos = window.scrollY + headerH() + 10;
      let currentId = sections[0].id;

      for (const section of sections) {
        if (pos >= section.offsetTop) currentId = section.id;
      }
      setActive(currentId);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ==================================================
     REVEAL ON SCROLL (1회 등장)
  ================================================== */
  const revealItems = document.querySelectorAll(".reveal");

  if (revealItems.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // ✅ 1회만 등장
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ==================================================
     BACKGROUND BUBBLES (Canvas)
  ================================================== */
  const canvas = document.getElementById("bubbles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!prefersReduced) {
      let w = 0, h = 0;
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      let bubbles = [];
      let rafId = 0;

      const bubbleColor = "0, 75, 41"; // text color RGB

      const resize = () => {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const rand = (min, max) => Math.random() * (max - min) + min;

      const makeBubble = (spawnY = h + rand(0, h * 0.3)) => ({
        x: rand(0, w),
        y: spawnY,
        r: rand(1.2, 5.2),
        vy: rand(30, 55) / 60,
        vx: rand(-10, 10) / 60,
        wobble: rand(0, Math.PI * 2),
        wobbleSpd: rand(0.8, 2.2) / 60,
        alpha: rand(0.1, 0.16),
        life: 0,
        lifeMax: rand(10, 20),
      });

      const targetCount = () =>
        Math.max(40, Math.min(140, Math.floor((w * h) / 9000)));

      const resetPool = () => {
        bubbles = [];
        for (let i = 0; i < targetCount(); i++) {
          bubbles.push(makeBubble(rand(0, h)));
        }
      };

      const step = () => {
        ctx.clearRect(0, 0, w, h);

        for (const b of bubbles) {
          b.life += 1 / 60;
          b.wobble += b.wobbleSpd;

          b.x += b.vx + Math.sin(b.wobble) * 0.35;
          b.y -= b.vy;

          const t = Math.min(1, b.life / b.lifeMax);
          const a = b.alpha * (1 - t);

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${bubbleColor}, ${a})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          if (b.y + b.r < -10 || b.life > b.lifeMax) {
            Object.assign(b, makeBubble());
          }

          if (b.x < -20) b.x = w + 20;
          if (b.x > w + 20) b.x = -20;
        }

        rafId = requestAnimationFrame(step);
      };

      resize();
      resetPool();
      step();

      window.addEventListener("resize", () => {
        resize();
        resetPool();
      });

      document.addEventListener("visibilitychange", () => {
        document.hidden
          ? cancelAnimationFrame(rafId)
          : (rafId = requestAnimationFrame(step));
      });
    }
  }

  /* ==================================================
   CONCEPT ART VIEWER (CPV)
================================================== */
const cpv = document.getElementById("cpv");

if (cpv) {
  const cpvEls = {
    bg: document.getElementById("cpvBg"),
    close: document.getElementById("cpvClose"),
    prev: document.getElementById("cpvPrev"),
    next: document.getElementById("cpvNext"),
    img: document.getElementById("cpvImg"),
    caption: document.getElementById("cpvCaption"),
    counter: document.getElementById("cpvCounter"),
  };

  const cards = Array.from(
    document.querySelectorAll("#conceptart .concept-card:not([aria-hidden='true'])")
  );

  const gallery = cards
    .map((card) => {
      const img = card.querySelector("img");
      const cap = card.querySelector("figcaption");
      return img
        ? {
            src: img.src,
            alt: img.alt || "Concept art",
            caption: cap?.textContent.trim() || "",
          }
        : null;
    })
    .filter(Boolean);

  let index = 0;

  const render = () => {
    const item = gallery[index];
    if (!item) return;

    cpvEls.img.src = item.src;
    cpvEls.img.alt = item.alt;
    cpvEls.caption.textContent = item.caption;
    cpvEls.counter.textContent = `${index + 1} / ${gallery.length}`;

    const single = gallery.length <= 1;
    cpvEls.prev.disabled = single;
    cpvEls.next.disabled = single;
  };

  const open = (i) => {
    index = Math.max(0, Math.min(i, gallery.length - 1));
    cpv.classList.add("is-open");
    cpv.setAttribute("aria-hidden", "false");
    document.body.classList.add("cpv-open");
    render();
  };

  const close = () => {
    cpv.classList.remove("is-open");
    cpv.setAttribute("aria-hidden", "true");
    document.body.classList.remove("cpv-open");
    cpvEls.img.src = "";
  };

  const move = (dir) => {
    index = (index + dir + gallery.length) % gallery.length;
    render();
  };

  cards.forEach((card, i) => {
    card.tabIndex = 0;
    card.role = "button";
    card.addEventListener("click", () => open(i));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(i);
      }
    });
  });

  cpvEls.close.addEventListener("click", close);
  cpvEls.bg.addEventListener("click", close);
  cpvEls.prev.addEventListener("click", () => move(-1));
  cpvEls.next.addEventListener("click", () => move(1));

  document.addEventListener("keydown", (e) => {
    if (!cpv.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });
}



});
