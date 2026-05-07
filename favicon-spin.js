(function () {
  const SIZE = 64;
  const r = SIZE / 2;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

  // Offscreen canvas to sample source pixels
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = SIZE;
  srcCanvas.height = SIZE;
  const sctx = srcCanvas.getContext('2d');

  const img = new Image();
  img.src = 'Website%20Photos/Logos/Amerigroup%20Blue%E7%81%AB%20%E5%9C%B0%E7%90%83%E4%BB%AA%E6%8A%A0%E5%9B%BE.png';

  img.onload = function () {
    sctx.drawImage(img, 0, 0, SIZE, SIZE);
    const src = sctx.getImageData(0, 0, SIZE, SIZE).data;
    const out = ctx.createImageData(SIZE, SIZE);
    const d = out.data;

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }

    // Light direction (top-left-front)
    const lx = -0.4, ly = -0.6, lz = 0.7;
    const ll = Math.sqrt(lx*lx + ly*ly + lz*lz);
    const lnx = lx/ll, lny = ly/ll, lnz = lz/ll;

    let angle = 0;

    function frame() {
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      for (let py = 0; py < SIZE; py++) {
        for (let px = 0; px < SIZE; px++) {
          const nx = (px - r) / r;
          const ny = (py - r) / r;
          const dist = nx*nx + ny*ny;
          const di = (py * SIZE + px) * 4;

          if (dist > 1) {
            d[di] = d[di+1] = d[di+2] = d[di+3] = 0;
            continue;
          }

          const nz = Math.sqrt(1 - dist);

          // Rotate surface point around Y axis
          const rx = nx * cosA + nz * sinA;
          const ry = ny;
          const rz = -nx * sinA + nz * cosA;

          // Spherical UV mapping
          const u = (Math.atan2(rx, rz) / (2 * Math.PI) + 0.5);
          const v = Math.acos(Math.max(-1, Math.min(1, ry))) / Math.PI;

          const sx = (Math.floor(u * SIZE) + SIZE) % SIZE;
          const sy = Math.min(Math.floor(v * SIZE), SIZE - 1);
          const si = (sy * SIZE + sx) * 4;

          // Lambertian shading using surface normal
          const diffuse = Math.max(0, nz*lnz - nx*lnx - ny*lny);
          const light = 0.35 + 0.65 * diffuse;

          d[di]   = src[si]   * light;
          d[di+1] = src[si+1] * light;
          d[di+2] = src[si+2] * light;
          d[di+3] = src[si+3];
        }
      }

      ctx.putImageData(out, 0, 0);
      link.href = canvas.toDataURL('image/png');
      angle += 0.04;
      requestAnimationFrame(frame);
    }
    frame();
  };
})();
