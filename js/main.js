// 부드리 버블 애니메이션
const bubblesContainer = document.querySelector('.bubbles');

for (let i = 0; i < 15; i++) {
  const bubble = document.createElement('span');
  bubble.classList.add('bubble');
  bubble.style.left = Math.random() * 100 + '%';
  bubble.style.animationDuration = 5 + Math.random() * 5 + 's';
  bubble.style.opacity = Math.random();
  bubblesContainer.appendChild(bubble);
}

const style = document.createElement('style');
style.textContent = `
  .bubble {
    position: absolute;
    bottom: -50px;
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    animation: rise linear infinite;
  }
  @keyframes rise {
    from { transform: translateY(0); }
    to { transform: translateY(-110vh); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ================================
// Scroll Navigation Activation + Click Navigation
// ================================
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".scroll-nav a");

// Scroll 시 현재 섹션 하이라이트
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - sectionHeight / 3) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// 클릭 시 해당 섹션으로 부드럽게 스크롤 이동
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop,
        behavior: "smooth"
      });
    }
  });
});

// ================================
// 기존 JS 코드 유지 (필요 시 아래에 추가)
// ================================
