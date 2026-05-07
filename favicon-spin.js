(function () {
  const SIZE = 64;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.src = 'Website%20Photos/Logos/Amerigroup%20Blue%E7%81%AB%20%E5%9C%B0%E7%90%83%E4%BB%AA%E6%8A%A0%E5%9B%BE.png';

  img.onload = function () {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    let angle = 0;
    function frame() {
      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.save();
      ctx.translate(SIZE / 2, SIZE / 2);
      ctx.rotate(angle);
      ctx.drawImage(img, -SIZE / 2, -SIZE / 2, SIZE, SIZE);
      ctx.restore();
      link.href = canvas.toDataURL('image/png');
      angle += 0.04;
      requestAnimationFrame(frame);
    }
    frame();
  };
})();
