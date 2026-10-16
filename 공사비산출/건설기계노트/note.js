(function() {
  // 1. CSS 주입
  const style = document.createElement('style');
  style.textContent = `
    .sketch-box {
      width: 100%;
      position: relative;
      background-image: linear-gradient(to bottom, #d5d5d5 1px, transparent 1px);
      background-size: 100% 28px;
      background-position: 0 34px;
      border-bottom: 1px solid #d5d5d5;
    }

    .sketch-textarea {
      width: 100%;
      min-height: 420px; 
      border: none;
      outline: none;
      background: transparent;
      font-size: 16px;
      color: #222;
      line-height: 28px; 
      padding: 6px 40px;
      font-family: inherit;
      box-sizing: border-box;
      resize: none;
      overflow: hidden;
      display: block;
    }
  `;
  document.head.appendChild(style);

  // 2. 원하는 div 선택자를 받아서 그 안에 노트를 꽂아넣는 함수
  window.mountSketchNote = function(selector) {
    const targetElement = document.querySelector(selector);
    if (!targetElement) {
      console.error('노트를 붙일 요소를 못 찾았어:', selector);
      return;
    }

    // HTML 구조 주입
    targetElement.innerHTML = `
      <div class="sketch-box" id="sketchBox">
        <textarea class="sketch-textarea" placeholder="여기에 적어봐..."></textarea>
      </div>
    `;

    const textarea = targetElement.querySelector('.sketch-textarea');
    const sketchBox = targetElement.querySelector('#sketchBox');

    function autoResize() {
      textarea.style.height = 'auto';
      const contentHeight = Math.max(textarea.scrollHeight, 420) + 28;
      textarea.style.height = contentHeight + 'px';
      sketchBox.style.height = contentHeight + 'px';
    }

    textarea.addEventListener('input', autoResize);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        setTimeout(autoResize, 0);
      }
    });

    autoResize();
  };
})();