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
        //else entry.target.classList.remove("is-visible"); // 한 번만 보이게 하려면 이 줄 삭제
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
  );

  items.forEach((el) => io.observe(el));



});
