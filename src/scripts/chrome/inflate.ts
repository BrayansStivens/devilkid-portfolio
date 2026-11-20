// Inflate a flat mark (any image with an alpha channel) into a closed,
// pillow-like mesh: distance field -> rounded height profile -> marching squares.
// The front and back halves share the silhouette vertices, so the result is watertight.
import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

export interface InflateOptions {
  /** Longest side of the sampling grid, in cells. */
  grid?: number;
  /** Edge roundness as a fraction of the longest side. */
  roundness?: number;
  /** Height multiplier applied to the rounded profile. */
  depth?: number;
  /** Blur passes on the height field: 0 = chiselled ridges, 3 = liquid. */
  soften?: number;
}

export interface Inflated {
  geometry: BufferGeometry;
  /** Size of the mark in model units (longest side = 1). */
  width: number;
  height: number;
  /** Peak z of the front face. */
  peak: number;
  /** Points on the upper part of the relief, used to place glints. */
  anchors: { position: Vector3; normal: Vector3 }[];
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

const INF = 1e20;

/** Felzenszwalb–Huttenlocher squared distance transform, one line. */
function edt1d(f: Float32Array, d: Float32Array, v: Int32Array, z: Float32Array, n: number) {
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = 0;
    do {
      const r = v[k];
      s = (f[q] + q * q - (f[r] + r * r)) / (2 * q - 2 * r);
    } while (s <= z[k] && --k > -1);
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const r = v[k];
    d[q] = (q - r) * (q - r) + f[r];
  }
}

/** Distance from every pixel to the nearest pixel where `seed` is true. */
function distanceTo(seed: (i: number) => boolean, w: number, h: number): Float32Array {
  const out = new Float32Array(w * h);
  const n = Math.max(w, h);
  const f = new Float32Array(n);
  const d = new Float32Array(n);
  const v = new Int32Array(n);
  const z = new Float32Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = seed(y * w + x) ? 0 : INF;
    edt1d(f, d, v, z, h);
    for (let y = 0; y < h; y++) out[y * w + x] = d[y];
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = out[y * w + x];
    edt1d(f, d, v, z, w);
    for (let x = 0; x < w; x++) out[y * w + x] = Math.sqrt(d[x]);
  }
  return out;
}

function boxBlur(src: Float32Array, w: number, h: number, passes: number) {
  const tmp = new Float32Array(src.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        tmp[i] = (src[i - (x > 0 ? 1 : 0)] + src[i] + src[i + (x < w - 1 ? 1 : 0)]) / 3;
      }
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        src[i] = (tmp[i - (y > 0 ? w : 0)] + tmp[i] + tmp[i + (y < h - 1 ? w : 0)]) / 3;
      }
    }
  }
}

export function inflate(img: CanvasImageSource & { width: number; height: number }, opts: InflateOptions = {}): Inflated {
  const { grid = 380, roundness = 0.035, depth = 1.5, soften = 2 } = opts;

  // Rasterise with a transparent margin so the silhouette never touches the border.
  const pad = 3;
  const scale = (grid - pad * 2) / Math.max(img.width, img.height);
  const iw = Math.max(1, Math.round(img.width * scale));
  const ih = Math.max(1, Math.round(img.height * scale));
  const w = iw + pad * 2;
  const h = ih + pad * 2;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, pad, pad, iw, ih);
  const rgba = ctx.getImageData(0, 0, w, h).data;

  // Ink coverage: opaque *and* dark. Some marks carry white lettering inside a
  // black shape, so alpha alone would fill those letters in.
  const ink = new Float32Array(w * h);
  for (let i = 0; i < ink.length; i++) {
    const luma = (rgba[i * 4] * 0.299 + rgba[i * 4 + 1] * 0.587 + rgba[i * 4 + 2] * 0.114) / 255;
    ink[i] = (rgba[i * 4 + 3] / 255) * (1 - luma);
  }
  const inside = (i: number) => ink[i] > 0.5;
  const dIn = distanceTo((i) => !inside(i), w, h);
  const dOut = distanceTo(inside, w, h);

  // Signed distance (positive inside), nudged by the anti-aliased coverage so
  // the contour lands between pixels instead of on them.
  const sdf = new Float32Array(w * h);
  for (let i = 0; i < sdf.length; i++) {
    const cover = ink[i] - 0.5;
    sdf[i] = inside(i) ? dIn[i] - 0.5 + cover : -(dOut[i] - 0.5) + cover;
  }
  boxBlur(sdf, w, h, 1);

  const R = Math.max(1.5, roundness * grid);
  const field = new Float32Array(w * h);
  for (let i = 0; i < field.length; i++) {
    const d = sdf[i];
    if (d <= 0) continue;
    const t = Math.min(d / R, 1);
    field[i] = R * Math.sqrt(1 - (1 - t) * (1 - t));
  }
  boxBlur(field, w, h, soften);

  // --- Marching squares ---------------------------------------------------
  const pos: number[] = [];
  const onRim: number[] = [];
  const corner = new Int32Array(w * h).fill(-1);
  const hEdge = new Int32Array(w * h).fill(-1);
  const vEdge = new Int32Array(w * h).fill(-1);
  const S = Math.max(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const zScale = depth / S;
  let peak = 0;

  const put = (x: number, y: number, z: number, rim: number) => {
    pos.push((x - cx) / S, -(y - cy) / S, z);
    onRim.push(rim);
    return pos.length / 3 - 1;
  };
  const cornerAt = (x: number, y: number) => {
    const i = y * w + x;
    if (corner[i] < 0) {
      const z = Math.max(field[i], 0.05) * zScale;
      if (z > peak) peak = z;
      corner[i] = put(x, y, z, 0);
    }
    return corner[i];
  };
  const hEdgeAt = (x: number, y: number) => {
    const i = y * w + x;
    if (hEdge[i] < 0) {
      const a = sdf[i];
      const b = sdf[i + 1];
      hEdge[i] = put(x + a / (a - b), y, 0, 1);
    }
    return hEdge[i];
  };
  const vEdgeAt = (x: number, y: number) => {
    const i = y * w + x;
    if (vEdge[i] < 0) {
      const a = sdf[i];
      const b = sdf[i + w];
      vEdge[i] = put(x, y + a / (a - b), 0, 1);
    }
    return vEdge[i];
  };

  const front: number[] = [];
  const poly: number[] = [];
  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i = y * w + x;
      const in0 = sdf[i] > 0;
      const in1 = sdf[i + 1] > 0;
      const in2 = sdf[i + w + 1] > 0;
      const in3 = sdf[i + w] > 0;
      if (!in0 && !in1 && !in2 && !in3) continue;
      poly.length = 0;
      if (in0) poly.push(cornerAt(x, y));
      if (in0 !== in1) poly.push(hEdgeAt(x, y));
      if (in1) poly.push(cornerAt(x + 1, y));
      if (in1 !== in2) poly.push(vEdgeAt(x + 1, y));
      if (in2) poly.push(cornerAt(x + 1, y + 1));
      if (in2 !== in3) poly.push(hEdgeAt(x, y + 1));
      if (in3) poly.push(cornerAt(x, y + 1));
      if (in3 !== in0) poly.push(vEdgeAt(x, y));
      // Image space runs clockwise once y is flipped, so reverse for a CCW front.
      for (let k = 1; k < poly.length - 1; k++) front.push(poly[0], poly[k + 1], poly[k]);
    }
  }

  // Mirror the relief for the back; rim vertices are shared.
  const nFront = pos.length / 3;
  const mirror = new Int32Array(nFront);
  for (let v = 0; v < nFront; v++) {
    if (onRim[v]) {
      mirror[v] = v;
    } else {
      mirror[v] = pos.length / 3;
      pos.push(pos[v * 3], pos[v * 3 + 1], -pos[v * 3 + 2]);
    }
  }
  const index = new Uint32Array(front.length * 2);
  index.set(front, 0);
  for (let k = 0; k < front.length; k += 3) {
    index[front.length + k] = mirror[front[k]];
    index[front.length + k + 1] = mirror[front[k + 2]];
    index[front.length + k + 2] = mirror[front[k + 1]];
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3));
  geometry.setIndex(new BufferAttribute(index, 1));
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();

  // Glint anchors: spread across the upper part of the relief.
  const anchors: Inflated['anchors'] = [];
  const normals = geometry.getAttribute('normal');
  const high: number[] = [];
  for (let v = 0; v < nFront; v++) if (!onRim[v] && pos[v * 3 + 2] >= peak * 0.6) high.push(v);
  const minGap = 0.1;
  for (let k = 0; k < high.length && k < 4000 && anchors.length < 26; k++) {
    const v = high[(k * 7919) % high.length];
    const p = new Vector3(pos[v * 3], pos[v * 3 + 1], pos[v * 3 + 2]);
    if (anchors.some((a) => a.position.distanceTo(p) < minGap)) continue;
    anchors.push({ position: p, normal: new Vector3(normals.getX(v), normals.getY(v), normals.getZ(v)) });
  }

  return { geometry, width: iw / S, height: ih / S, peak, anchors };
}
