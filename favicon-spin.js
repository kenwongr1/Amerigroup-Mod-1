(function () {
  const SIZE = 64;
  const r = SIZE / 2;

  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');

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

    // Three independent rotation angles at different speeds
    let yaw   = 0;  // Y-axis spin
    let pitch = 0;  // X-axis tilt
    let roll  = 0;  // Z-axis roll

    function frame() {
      // Combined 3-axis rotation matrix: Rz * Rx * Ry
      const cy = Math.cos(yaw),   sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cr = Math.cos(roll),  sr = Math.sin(roll);

      // Rz(roll) * Rx(pitch) * Ry(yaw)
      const m00 =  cy*cr + sy*sp*sr;
      const m01 = -cy*sr + sy*sp*cr;
      const m02 =  sy*cp;
      const m10 =  cp*sr;
      const m11 =  cp*cr;
      const m12 = -sp;
      const m20 = -sy*cr + cy*sp*sr;
      const m21 =  sy*sr + cy*sp*cr;
      const m22 =  cy*cp;

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

          // Apply inverse rotation to find which texel maps here
          // (transpose of rotation matrix = inverse for orthogonal matrices)
          const rx = m00*nx + m10*ny + m20*nz;
          const ry = m01*nx + m11*ny + m21*nz;
          const rz = m02*nx + m12*ny + m22*nz;

          // Spherical UV mapping
          const u = (Math.atan2(rx, rz) / (2 * Math.PI) + 0.5);
          const v = Math.acos(Math.max(-1, Math.min(1, ry))) / Math.PI;

          const sx = (Math.floor(u * SIZE) + SIZE) % SIZE;
          const sy2 = Math.min(Math.floor(v * SIZE), SIZE - 1);
          const si = (sy2 * SIZE + sx) * 4;

          // Lambertian shading using screen-space normal
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

      yaw   += 0.04;
      pitch += 0.013;
      roll  += 0.007;

      requestAnimationFrame(frame);
    }
    frame();
  };
})();
