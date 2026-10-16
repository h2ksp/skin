import { render } from 'preact';
import { App } from './app';
// 1. CSS를 일반 임포트 대신 텍스트 문자열로 가져옴 (?inline 붙이기)
import cssText from './app.css?inline';

function mountWidget() {
  if (document.getElementById('spot-widget-host')) return;

  const host = document.createElement('div');
  host.id = 'spot-widget-host';
  document.body.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: 'open' });

  // 2. Shadow DOM 내부에 전용 <style> 태그를 만들어 꽂아줌
  const styleTag = document.createElement('style');
  styleTag.textContent = cssText;
  shadowRoot.appendChild(styleTag);

  // 3. 컴포넌트 렌더링
  const container = document.createElement('div');
  shadowRoot.appendChild(container);

  render(<App />, container);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWidget);
} else {
  mountWidget();
}