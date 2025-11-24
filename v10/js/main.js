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
