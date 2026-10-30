/* Small WebGL viewer for the low poly model: flat shading, its texture, a slow
   turntable spin, and drag to rotate where the viewer is interactive. */
export const Model3D = (() => {
  const models = {};

  const parseOBJ = (src) => {
    const v = [], vt = [], pos = [], uv = [];
    for (const raw of src.split("\n")) {
      const p = raw.trim().split(/\s+/);
      if (p[0] === "v") v.push(p.slice(1, 4).map(Number));
      else if (p[0] === "vt") vt.push(p.slice(1, 3).map(Number));
      else if (p[0] === "f") {
        const idx = p.slice(1).map((t) => t.split("/").map((n) => (n ? parseInt(n, 10) : 0)));
        const res = (i, arr) => (i > 0 ? i - 1 : arr.length + i);
        for (let k = 1; k + 1 < idx.length; k++) {
          for (const c of [idx[0], idx[k], idx[k + 1]]) {
            pos.push(...v[res(c[0], v)]);
            uv.push(...(c[1] ? vt[res(c[1], vt)] : [0, 0]));
          }
        }
      }
    }
    // Center and scale to a unit radius
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i += 3) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], pos[i + a]); mx[a] = Math.max(mx[a], pos[i + a]); }
    const c = mn.map((m, a) => (m + mx[a]) / 2);
    let r = 0;
    for (let i = 0; i < pos.length; i += 3) {
      for (let a = 0; a < 3; a++) pos[i + a] -= c[a];
      r = Math.max(r, Math.hypot(pos[i], pos[i + 1], pos[i + 2]));
    }
    for (let i = 0; i < pos.length; i++) pos[i] /= r;
    // Flat normals, one per triangle
    const nrm = new Float32Array(pos.length);
    for (let i = 0; i < pos.length; i += 9) {
      const ax = pos[i + 3] - pos[i], ay = pos[i + 4] - pos[i + 1], az = pos[i + 5] - pos[i + 2];
      const bx = pos[i + 6] - pos[i], by = pos[i + 7] - pos[i + 1], bz = pos[i + 8] - pos[i + 2];
      let nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
      for (let k = 0; k < 3; k++) nrm.set([nx, ny, nz], i + k * 3);
    }
    return { pos: new Float32Array(pos), uv: new Float32Array(uv), nrm, count: pos.length / 3 };
  };

  const VS = `attribute vec3 p; attribute vec2 t; attribute vec3 n;
    uniform mat4 mvp; uniform mat3 nm; varying vec2 vt; varying vec3 vn;
    void main(){ vt=t; vn=normalize(nm*n); gl_Position=mvp*vec4(p,1.0); }`;
  const FS = `precision mediump float; varying vec2 vt; varying vec3 vn; uniform sampler2D tex;
    void main(){
      vec3 base=texture2D(tex,vt).rgb;
      vec3 n=normalize(vn);
      float key=max(dot(n,normalize(vec3(.45,.8,.6))),0.0);
      float fill=max(dot(n,normalize(vec3(-.6,.2,.4))),0.0);
      float rim=pow(1.0-max(n.z,0.0),2.0)*.18;
      vec3 c=base*(.42+.62*key+.22*fill)+rim;
      gl_FragColor=vec4(c,1.0);
    }`;

  const persp = (fov, asp, near, far) => {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    return [f / asp, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
  };
  const mul = (a, b) => { const o = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k]; return o; };
  const rotY = (a) => [Math.cos(a), 0, -Math.sin(a), 0, 0, 1, 0, 0, Math.sin(a), 0, Math.cos(a), 0, 0, 0, 0, 1];
  const rotX = (a) => [1, 0, 0, 0, 0, Math.cos(a), Math.sin(a), 0, 0, -Math.sin(a), Math.cos(a), 0, 0, 0, 0, 1];
  const trans = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

  // texUrl may be null for models that use a flat material color (hex) instead of a texture
  const load = (key, objSrc, texUrl, color) => {
    if (!models[key]) {
      const m = { geo: parseOBJ(objSrc), img: null, color: color || "#5A82BE" };
      m.ready = !texUrl ? Promise.resolve(m) : new Promise((res) => { const im = new Image(); im.onload = () => { m.img = im; res(m); }; im.onerror = () => res(m); im.src = texUrl; });
      models[key] = m;
    }
    return models[key].ready;
  };

  const mount = (canvas, { key, interactive = false, spin = true, yaw = -0.6, pitch = 0.32, dist = 2.75 } = {}) => {
    const { geo, img: texImg, color: matColor } = models[key];
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) { canvas.closest("[data-model-wrap]")?.classList.add("no-gl"); return () => {}; }
    const sh = (type, s) => { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); return o; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog); gl.useProgram(prog);
    const buf = (data, name, size) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); const l = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, size, gl.FLOAT, false, 0, 0); };
    buf(geo.pos, "p", 3); buf(geo.uv, "t", 2); buf(geo.nrm, "n", 3);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    if (texImg) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texImg);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([1, 3, 5].map((i) => parseInt(matColor.slice(i, i + 2), 16))));
    }
    gl.enable(gl.DEPTH_TEST);
    const uMvp = gl.getUniformLocation(prog, "mvp"), uNm = gl.getUniformLocation(prog, "nm");

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ry = yaw, rx = pitch, dragging = false, lx = 0, ly = 0, last = performance.now(), raf = 0, alive = true, idleUntil = 0;
    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h);
    };
    const draw = (now) => {
      if (!alive) return;
      const dt = Math.min(64, now - last); last = now;
      if (spin && !reduce && !dragging && now > idleUntil) ry += dt * 0.00035;
      size();
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const model = mul(rotX(rx), rotY(ry));
      const mvp = mul(persp(0.62, canvas.width / canvas.height, 0.1, 20), mul(trans(0, 0, -dist), model));
      gl.uniformMatrix4fv(uMvp, false, new Float32Array(mvp));
      gl.uniformMatrix3fv(uNm, false, new Float32Array([model[0], model[1], model[2], model[4], model[5], model[6], model[8], model[9], model[10]]));
      gl.drawArrays(gl.TRIANGLES, 0, geo.count);
      raf = (spin && !reduce) || dragging ? requestAnimationFrame(draw) : 0;
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(draw); } };

    if (interactive) {
      canvas.style.touchAction = "none";
      canvas.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); kick(); });
      canvas.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        ry += (e.clientX - lx) * 0.01; rx = Math.max(-1.2, Math.min(1.2, rx + (e.clientY - ly) * 0.01));
        lx = e.clientX; ly = e.clientY;
      });
      const end = () => { dragging = false; idleUntil = performance.now() + 2500; kick(); };
      canvas.addEventListener("pointerup", end);
      canvas.addEventListener("pointercancel", end);
      canvas.addEventListener("keydown", (e) => {
        const k = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
        if (!k) return;
        e.preventDefault(); e.stopPropagation();
        ry += k[0]; rx = Math.max(-1.2, Math.min(1.2, rx + k[1])); idleUntil = performance.now() + 2500;
        if (!raf) requestAnimationFrame(draw);
      });
    }
    let ro = null;
    if ("ResizeObserver" in window) { ro = new ResizeObserver(() => { if (!raf) requestAnimationFrame(draw); }); ro.observe(canvas); }
    // Only spin while on screen
    let io = null;
    if ("IntersectionObserver" in window && !interactive) {
      io = new IntersectionObserver(([e]) => { if (e.isIntersecting) kick(); else { cancelAnimationFrame(raf); raf = 0; } });
      io.observe(canvas);
    } else kick();
    requestAnimationFrame(draw);
    return () => { alive = false; cancelAnimationFrame(raf); ro && ro.disconnect(); io && io.disconnect(); const ext = gl.getExtension("WEBGL_lose_context"); ext && ext.loseContext(); };
  };

  return { load, mount };
})();
