'use client';

import { useEffect, useRef } from 'react';

const TOTAL = 260;

const phrases = [
  "你闪闪发光", "是个可爱的人间宝藏", "你的笑容能治愈一切", "每天都在变优秀",
  "灵魂有趣又自由", "怎么会有这么好的人", "执行力满分", "品味真的很好",
  "自带阳光属性", "总能带给人温暖", "你的想法总是很酷", "你认真的样子最迷人",
  "愿你每天开心", "世界因你柔软", "好好生活慢慢相遇", "前路浩浩荡荡",
  "万事皆可期待", "保持心里的光", "平安喜乐", "晚风也温柔了",
  "想和你去看海", "星光都为你闪", "遇见你是件幸运的事", "风都是甜的",
  "想成为你的例外", "一瞬也是永恒", "你眼里有星星", "你是人间奇迹",
  "宇宙都在偏爱你", "目光所及皆是你", "万物不及你", "所念皆星河",
  "春风十里不如你", "你是无意穿堂风", "陪你碎碎念念", "伴你岁岁年年",
];

const gradients = [
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  "linear-gradient(135deg, #c471ed 0%, #f64f59 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
];

function getHeartPoint(t, scale) {
  const x = scale * (16 * Math.pow(Math.sin(t), 3));
  const y = -scale * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
  return { x, y };
}

function getHeartAngle(t, scale) {
  const p1 = getHeartPoint(t, scale);
  const p2 = getHeartPoint(t + 0.01, scale);
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function WordHeart({ onComplete, senderName, receiverName }) {
  const stageRef = useRef(null);
  const centerRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current;
    const centerText = centerRef.current;
    if (!stage || !centerText) return;

    let cancelled = false;
    const elements = [];

    // Set center text
    centerText.textContent = '喜乐无忧';

    async function spawnElement() {
      if (cancelled) return;
      const el = document.createElement('div');
      const textSpan = document.createElement('span');
      textSpan.className = 'text';
      textSpan.textContent = phrases[Math.floor(Math.random() * phrases.length)];
      el.appendChild(textSpan);
      el.style.background = gradients[Math.floor(Math.random() * gradients.length)];

      // Base styles
      el.style.position = 'absolute';
      el.style.padding = '8px 24px';
      el.style.borderRadius = '30px';
      el.style.color = 'white';
      el.style.fontWeight = '600';
      el.style.fontSize = '13px';
      el.style.whiteSpace = 'nowrap';
      el.style.boxShadow = '0 6px 15px rgba(0,0,0,0.1)';
      el.style.opacity = '0';
      el.style.willChange = 'transform, opacity';
      el.style.pointerEvents = 'none';
      el.style.fontFamily = "'PingFang SC', 'Microsoft YaHei', sans-serif";
      textSpan.style.position = 'relative';
      textSpan.style.zIndex = '2';
      textSpan.style.transition = 'opacity 1.5s ease';

      stage.appendChild(el);
      elements.push(el);

      // Spawn far away
      const startX = (Math.random() - 0.5) * window.innerWidth * 3;
      const startY = (Math.random() - 0.5) * window.innerHeight * 3;
      const startZ = -2000 - Math.random() * 1000;
      const startRot = Math.random() * 360;

      el.style.transform = `translate3d(${startX}px, ${startY}px, ${startZ}px) rotateZ(${startRot}deg)`;

      await wait(20);
      if (cancelled) return;

      // Float in
      const floatX = (Math.random() - 0.5) * window.innerWidth * 0.9;
      const floatY = (Math.random() - 0.5) * window.innerHeight * 0.9;
      const floatZ = Math.random() * 300 - 150;
      const floatRot = (Math.random() - 0.5) * 60;

      el.style.transition = 'transform 3s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.5s ease';
      el.style.opacity = '1';
      el.style.transform = `translate3d(${floatX}px, ${floatY}px, ${floatZ}px) rotateZ(${floatRot}deg) scale(1.1)`;
    }

    async function runTimeline() {
      // Phase 1: Fly in
      for (let i = 0; i < TOTAL; i++) {
        if (cancelled) return;
        spawnElement();
        await wait(30);
      }

      // Phase 2: Float
      await wait(2500);
      if (cancelled) return;

      // Phase 3: Assemble into heart
      elements.forEach((el, i) => {
        const layerIndex = i % 4;
        const scaleBase = 18 + layerIndex * 1.6;
        const t = (i / TOTAL) * Math.PI * 2;
        const targetPos = getHeartPoint(t, scaleBase);
        const angle = getHeartAngle(t, scaleBase);
        const offsetX = (Math.random() - 0.5) * 14;
        const offsetY = (Math.random() - 0.5) * 14;
        const targetZ = (i % 8) * 12 - layerIndex * 10;

        el.style.transition = 'transform 3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = `translate3d(${targetPos.x + offsetX}px, ${targetPos.y + offsetY}px, ${targetZ}px) rotateZ(${angle}deg) scale(1)`;
      });

      // Wait for assembly
      await wait(3500);
      if (cancelled) return;

      // Phase 4: Lock - fade text, keep original gradient
      elements.forEach((el) => {
        const textSpan = el.querySelector('.text');
        if (textSpan) textSpan.style.opacity = '0';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      });

      // Phase 5: Center text
      await wait(600);
      if (cancelled) return;
      centerText.style.opacity = '1';
      centerText.style.transform = 'translate3d(0, -15px, 300px) scale(1)';

      // Phase 6: Heartbeat
      await wait(800);
      if (cancelled) return;
      stage.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      stage.style.transform = 'scale(1.06)';
      await wait(400);
      stage.style.transform = 'scale(1)';
      await wait(600);
      stage.style.transform = 'scale(1.08)';
      await wait(400);
      stage.style.transform = 'scale(1)';

      // Admire
      await wait(1500);
      if (cancelled) return;

      // Phase 7: Fly away
      centerText.style.transition = 'all 2s ease-in';
      centerText.style.opacity = '0';
      centerText.style.transform = 'translate3d(0, -15px, 300px) scale(2.5)';

      elements.forEach((el) => {
        const delay = Math.random() * 1.4;
        const outX = (Math.random() - 0.5) * window.innerWidth * 3;
        const outY = (Math.random() - 0.5) * window.innerHeight * 3;
        const outZ = 1200 + Math.random() * 1500;
        const rotX = (Math.random() - 0.5) * 720;
        const rotY = (Math.random() - 0.5) * 720;

        el.style.transition = `transform 3s cubic-bezier(0.55, 0.085, 0.68, 0.53) ${delay}s, opacity 0.5s ease-in ${delay + 1.5}s`;
        el.style.transform = `translate3d(${outX}px, ${outY}px, ${outZ}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        el.style.opacity = '0';
      });

      // Done
      await wait(3500);
      if (!cancelled) onComplete?.();
    }

    const timer = setTimeout(() => runTimeline(), 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      // Clean up spawned elements
      elements.forEach((el) => el.remove());
    };
  }, [onComplete, senderName, receiverName]);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ userSelect: 'none' }}>
      <div
        ref={stageRef}
        className="w-full h-full flex items-center justify-center"
        style={{
          position: 'relative',
          perspective: '1800px',
          transformStyle: 'preserve-3d',
        }}
      >
        <div
          ref={centerRef}
          className="absolute"
          style={{
            fontSize: '36px',
            fontWeight: 900,
            color: '#ff5277',
            letterSpacing: '4px',
            opacity: 0,
            transform: 'translate3d(0, -15px, 0) scale(0.5)',
            transition: 'all 2s cubic-bezier(0.34, 1.56, 0.64, 1)',
            zIndex: 100,
            textShadow: '0 4px 15px rgba(255, 82, 119, 0.4)',
            pointerEvents: 'none',
          }}
        >
          喜乐无忧
        </div>
      </div>
    </div>
  );
}
