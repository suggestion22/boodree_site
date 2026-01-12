document.addEventListener("DOMContentLoaded", () => {
  // ================================
  // NAV ACTIVE (Scroll Spy)
  // ================================
  const navLinks = document.querySelectorAll(".nav a");
  const sections = Array.from(document.querySelectorAll("main section[id]"));

  const header = document.querySelector("header");
  const headerH = () => (header ? header.offsetHeight : 0);

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("active", isActive);

      if (isActive) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
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

        const top = target.getBoundingClientRect().top + window.scrollY - headerH();
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

  // ================================
  // Reveal on scroll
  // ================================
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-visible");
        else entry.target.classList.remove("is-visible"); // 한 번만 보이게 하려면 이 줄 삭제
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((el) => io.observe(el));




  // ================================
  // Background bubbles (Canvas)
  // ================================
  const canvas = document.getElementById("bubbles-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!prefersReduced) {
      let w = 0, h = 0, dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      let bubbles = [];
      let rafId = 0;

      // 색상은 현재 테마 변수와 맞추되, "은은한 탄산" 느낌이라 알파만 낮게
      // (bg=#FFFBEA, text=#004B29 기반)  :contentReference[oaicite:4]{index=4}
      const bubbleColor = "0, 75, 41"; // --text RGB

      const resize = () => {
        w = Math.floor(window.innerWidth);
        h = Math.floor(window.innerHeight);

        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      const rand = (min, max) => Math.random() * (max - min) + min;

      const makeBubble = (spawnY = h + rand(0, h * 0.3)) => {
        const r = rand(1.2, 5.2);
        return {
          x: rand(0, w),
          y: spawnY,
          r,
          vy: rand(30, 55) / 60,     // 위로 올라가는 속도(프레임 기준)
          vx: rand(-10, 10) / 60,    // 좌우 흔들림
          wobble: rand(0, Math.PI * 2),
          wobbleSpd: rand(0.8, 2.2) / 60,
          alpha: rand(0.1, 0.16),   // 매우 은은하게
          life: 0,
          lifeMax: rand(10, 20)       // 대략 6~13초 정도
        };
      };

      const targetCount = () => {
        // 화면 크기에 따른 적정 개수(과하지 않게)
        const area = w * h;
        return Math.max(40, Math.min(140, Math.floor(area / 9000)));
      };

      const resetPool = () => {
        bubbles = [];
        const n = targetCount();
        for (let i = 0; i < n; i++) {
          bubbles.push(makeBubble(rand(0, h)));
        }
      };

      const step = () => {
        ctx.clearRect(0, 0, w, h);

        // 약한 하이라이트(거품 테두리 느낌)
        for (const b of bubbles) {
          b.life += 1 / 60;

          b.wobble += b.wobbleSpd;
          const dx = Math.sin(b.wobble) * 0.35;

          b.x += (b.vx + dx);
          b.y -= b.vy;

          // 위로 갈수록 살짝 줄어드는 느낌(탄산이 터지며 사라짐)
          const t = Math.min(1, b.life / b.lifeMax);
          const fade = (1 - t);

          const a = b.alpha * fade;

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r * (0.9 + 0.2 * fade), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${bubbleColor}, ${a})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // 작은 하이라이트 점
          ctx.beginPath();
          ctx.arc(b.x - b.r * 0.35, b.y - b.r * 0.35, Math.max(0.6, b.r * 0.18), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${bubbleColor}, ${a * 0.7})`;
          ctx.fill();

          // 화면 밖/수명 끝 → 재생성
          if (b.y + b.r < -10 || b.life > b.lifeMax) {
            const nb = makeBubble();
            b.x = nb.x; b.y = nb.y; b.r = nb.r;
            b.vy = nb.vy; b.vx = nb.vx;
            b.wobble = nb.wobble; b.wobbleSpd = nb.wobbleSpd;
            b.alpha = nb.alpha; b.life = nb.life; b.lifeMax = nb.lifeMax;
          }

          // 좌우 래핑(자연스럽게)
          if (b.x < -20) b.x = w + 20;
          if (b.x > w + 20) b.x = -20;
        }

        rafId = requestAnimationFrame(step);
      };

      // 초기화
      resize();
      resetPool();
      step();

      // 리사이즈 대응(성능 위해 디바운스)
      let resizeT = 0;
      window.addEventListener("resize", () => {
        window.clearTimeout(resizeT);
        resizeT = window.setTimeout(() => {
          resize();
          resetPool();
        }, 120);
      });

      // 탭 비활성화 시 과한 연산 방지
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          cancelAnimationFrame(rafId);
        } else {
          rafId = requestAnimationFrame(step);
        }
      });
    }
  }

});
