// Real-time chrome: inflated marks lit only by a painted environment, the way
// airbrushed chrome is drawn — sky, hard horizon, warm ground — plus star glints.
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  EquirectangularReflectionMapping,
  Group,
  Mesh,
  MeshStandardMaterial,
  NoToneMapping,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Texture,
} from 'three';
import { inflate, loadImage, type InflateOptions } from './inflate';

export type Finish = 'chrome' | 'gray' | 'gold' | 'candy' | 'onyx';

export interface Layer extends InflateOptions {
  mask: string;
  finish: Finish;
  /** Offset toward the viewer, in model units. */
  lift?: number;
  glints?: boolean;
}

interface StageOptions {
  /** Share of the view the mark may fill (0–1). */
  fit?: number;
  /** Follow the pointer across the whole window instead of only over the canvas. */
  followWindow?: boolean;
  /** Spin in from the side on first load. */
  entrance?: boolean;
}

type Stop = [number, string];
interface EnvSpec {
  sky: Stop[];
  strips: { u: number; w: number; v0: number; v1: number; color: string }[];
  spots: { u: number; v: number; r: number; color: string }[];
}

// u = 0.75 is straight behind the camera, so that is where the key lights sit.
const ENVS: Record<Exclude<Finish, 'onyx'>, EnvSpec> = {
  gray: {
    sky: [
      [0, '#0b0b0c'],
      [0.22, '#3a3b3e'],
      [0.4, '#8c8e93'],
      [0.482, '#e4e5e8'],
      [0.498, '#ffffff'],
      [0.512, '#060606'],
      [0.6, '#2a2a2c'],
      [0.78, '#76777b'],
      [0.9, '#c9cacd'],
      [1, '#101011'],
    ],
    strips: [
      { u: 0.66, w: 0.03, v0: 0.08, v1: 0.47, color: 'rgba(255,255,255,1)' },
      { u: 0.86, w: 0.018, v0: 0.14, v1: 0.47, color: 'rgba(255,255,255,0.95)' },
      { u: 0.2, w: 0.04, v0: 0.1, v1: 0.47, color: 'rgba(255,255,255,0.8)' },
    ],
    spots: [{ u: 0.76, v: 0.27, r: 0.045, color: '#ffffff' }],
  },
  chrome: {
    sky: [
      [0, '#040c2c'],
      [0.2, '#1443b4'],
      [0.38, '#5fa3f4'],
      [0.482, '#e4f3ff'],
      [0.498, '#ffffff'],
      [0.512, '#0a0603'],
      [0.57, '#3a2313'],
      [0.71, '#9c6c3b'],
      [0.85, '#eac28c'],
      [1, '#160c05'],
    ],
    strips: [
      { u: 0.66, w: 0.03, v0: 0.08, v1: 0.47, color: 'rgba(255,255,255,1)' },
      { u: 0.86, w: 0.018, v0: 0.14, v1: 0.47, color: 'rgba(255,255,255,0.95)' },
      { u: 0.2, w: 0.04, v0: 0.1, v1: 0.47, color: 'rgba(255,255,255,0.85)' },
      { u: 0.44, w: 0.05, v0: 0.2, v1: 0.47, color: 'rgba(255,70,170,0.55)' },
      { u: 0.95, w: 0.05, v0: 0.22, v1: 0.47, color: 'rgba(150,90,255,0.5)' },
    ],
    spots: [
      { u: 0.76, v: 0.27, r: 0.045, color: '#ffffff' },
      { u: 0.3, v: 0.72, r: 0.07, color: '#fff2d4' },
    ],
  },
  gold: {
    sky: [
      [0, '#1c0e02'],
      [0.22, '#7c4d0c'],
      [0.4, '#eab544'],
      [0.485, '#fff3c8'],
      [0.498, '#ffffff'],
      [0.512, '#110801'],
      [0.6, '#4d2a05'],
      [0.76, '#c98a22'],
      [0.88, '#ffe2a1'],
      [1, '#1c0e02'],
    ],
    strips: [
      { u: 0.66, w: 0.03, v0: 0.08, v1: 0.47, color: 'rgba(255,255,255,1)' },
      { u: 0.86, w: 0.02, v0: 0.14, v1: 0.47, color: 'rgba(255,250,225,0.95)' },
      { u: 0.2, w: 0.04, v0: 0.1, v1: 0.47, color: 'rgba(255,255,255,0.85)' },
    ],
    spots: [{ u: 0.76, v: 0.27, r: 0.045, color: '#ffffff' }],
  },
  candy: {
    sky: [
      [0, '#01030f'],
      [0.2, '#071f7a'],
      [0.37, '#2472f5'],
      [0.482, '#b9dcff'],
      [0.498, '#ffffff'],
      [0.512, '#01020a'],
      [0.6, '#081a5c'],
      [0.78, '#3d8bff'],
      [0.9, '#a8d0ff'],
      [1, '#030924'],
    ],
    strips: [
      { u: 0.66, w: 0.03, v0: 0.08, v1: 0.47, color: 'rgba(255,255,255,1)' },
      { u: 0.86, w: 0.018, v0: 0.14, v1: 0.47, color: 'rgba(255,255,255,0.95)' },
      { u: 0.2, w: 0.04, v0: 0.1, v1: 0.47, color: 'rgba(255,255,255,0.8)' },
      { u: 0.44, w: 0.06, v0: 0.18, v1: 0.47, color: 'rgba(255,30,60,0.7)' },
    ],
    spots: [{ u: 0.76, v: 0.27, r: 0.045, color: '#ffffff' }],
  },
};

const LOOK: Record<Finish, { env: keyof typeof ENVS; color: string; roughness: number; intensity: number }> = {
  chrome: { env: 'chrome', color: '#ffffff', roughness: 0.1, intensity: 1.1 },
  gray: { env: 'gray', color: '#e6e7ea', roughness: 0.12, intensity: 1.1 },
  gold: { env: 'gold', color: '#ffe2a0', roughness: 0.09, intensity: 1.15 },
  candy: { env: 'candy', color: '#dbe8ff', roughness: 0.07, intensity: 1.15 },
  onyx: { env: 'chrome', color: '#4b4f60', roughness: 0.16, intensity: 1 },
};

const GLINT_LIGHTS = [
  new Vector3(-0.45, 0.7, 0.55).normalize(),
  new Vector3(0.6, 0.25, 0.75).normalize(),
  new Vector3(0.05, -0.55, 0.83).normalize(),
];

function paintEnv(spec: EnvSpec): HTMLCanvasElement {
  const W = 1024;
  const H = 512;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  const sky = g.createLinearGradient(0, 0, 0, H);
  for (const [at, color] of spec.sky) sky.addColorStop(at, color);
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H);

  for (const s of spec.strips) {
    for (const shift of [0, -1, 1]) {
      const x = (s.u + shift) * W;
      const half = (s.w * W) / 2;
      const grad = g.createLinearGradient(x - half, 0, x + half, 0);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.3, s.color);
      grad.addColorStop(0.7, s.color);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(x - half, s.v0 * H, half * 2, (s.v1 - s.v0) * H);
    }
  }
  for (const s of spec.spots) {
    const x = s.u * W;
    const y = s.v * H;
    const r = s.r * W;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, s.color);
    grad.addColorStop(0.35, s.color);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  return c;
}

function paintGlint(): HTMLCanvasElement {
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d')!;
  g.translate(S / 2, S / 2);
  const halo = g.createRadialGradient(0, 0, 0, 0, 0, S * 0.3);
  halo.addColorStop(0, 'rgba(255,255,255,0.95)');
  halo.addColorStop(0.18, 'rgba(255,255,255,0.4)');
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = halo;
  g.fillRect(-S / 2, -S / 2, S, S);
  // Four concave rays, the star he paints on every highlight.
  for (const [len, wide] of [
    [S * 0.5, S * 0.03],
    [S * 0.3, S * 0.022],
  ] as const) {
    g.fillStyle = '#fff';
    g.beginPath();
    g.moveTo(0, -len);
    g.quadraticCurveTo(wide, -wide, len, 0);
    g.quadraticCurveTo(wide, wide, 0, len);
    g.quadraticCurveTo(-wide, wide, -len, 0);
    g.quadraticCurveTo(-wide, -wide, 0, -len);
    g.fill();
    g.rotate(Math.PI / 4);
  }
  return c;
}

export class ChromeStage {
  readonly canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(28, 1, 0.1, 50);
  private group = new Group();
  private meshes: Mesh<any, MeshStandardMaterial>[] = [];
  private glints: { sprite: Sprite; position: Vector3; normal: Vector3; level: number; phase: number }[] = [];
  private envs = new Map<string, Texture>();
  private pmrem: PMREMGenerator;
  private glintTexture: CanvasTexture;
  private bounds = { w: 1, h: 1 };
  private opts: Required<StageOptions>;
  private pose = { rx: 0, ry: 0, vx: 0, vy: 0, tx: 0, ty: 0 };
  private drag = { on: false, x: 0, y: 0 };
  private raf = 0;
  private last = 0;
  private clock = 0;
  private onScreen = true;
  private still = window.matchMedia('(prefers-reduced-motion: reduce)');
  private cleanup: (() => void)[] = [];
  private token = 0;

  constructor(canvas: HTMLCanvasElement, options: StageOptions = {}) {
    this.canvas = canvas;
    this.opts = { fit: 0.8, followWindow: false, entrance: true, ...options };
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = NoToneMapping;
    this.renderer.setClearColor(0x000000, 0);
    this.pmrem = new PMREMGenerator(this.renderer);
    this.glintTexture = new CanvasTexture(paintGlint());
    this.glintTexture.colorSpace = SRGBColorSpace;
    this.camera.position.set(0, 0, 4.2);
    this.scene.add(this.group);
    if (this.opts.entrance && !this.still.matches) {
      this.pose.ry = -Math.PI * 1.15;
      this.pose.rx = 0.35;
    }
    this.bind();
    this.resize();
  }

  private env(name: keyof typeof ENVS): Texture {
    let tex = this.envs.get(name);
    if (!tex) {
      const source = new CanvasTexture(paintEnv(ENVS[name]));
      source.mapping = EquirectangularReflectionMapping;
      source.colorSpace = SRGBColorSpace;
      tex = this.pmrem.fromEquirectangular(source).texture;
      source.dispose();
      this.envs.set(name, tex);
    }
    return tex;
  }

  private material(finish: Finish): MeshStandardMaterial {
    const look = LOOK[finish];
    return new MeshStandardMaterial({
      color: new Color(look.color),
      metalness: 1,
      roughness: look.roughness,
      envMap: this.env(look.env),
      envMapIntensity: look.intensity,
    });
  }

  /** Replace what is on stage. Resolves once the new meshes are in the scene. */
  async setLayers(layers: Layer[]): Promise<void> {
    const token = ++this.token;
    const images = await Promise.all(layers.map((l) => loadImage(l.mask)));
    if (token !== this.token) return;
    this.clear();
    let w = 0;
    let h = 0;
    layers.forEach((layer, i) => {
      const built = inflate(images[i], layer);
      const mesh = new Mesh(built.geometry, this.material(layer.finish));
      mesh.position.z = layer.lift ?? 0;
      mesh.userData.finish = layer.finish;
      this.group.add(mesh);
      this.meshes.push(mesh);
      w = Math.max(w, built.width);
      h = Math.max(h, built.height);
      if (layer.glints !== false) {
        for (const a of built.anchors) {
          const sprite = new Sprite(
            new SpriteMaterial({
              map: this.glintTexture,
              blending: AdditiveBlending,
              depthTest: false,
              depthWrite: false,
              transparent: true,
              opacity: 0,
            }),
          );
          sprite.position.copy(a.position).addScaledVector(a.normal, 0.004);
          sprite.position.z += layer.lift ?? 0;
          sprite.scale.setScalar(0.0001);
          sprite.renderOrder = 10;
          this.group.add(sprite);
          this.glints.push({ sprite, position: sprite.position.clone(), normal: a.normal, level: 0, phase: Math.random() * 6.28 });
        }
      }
    });
    this.bounds = { w: w || 1, h: h || 1 };
    this.refit();
    this.render();
  }

  /** Re-skin the layers that are not the dark body. */
  setFinish(finish: Finish) {
    for (const mesh of this.meshes) {
      if (mesh.userData.finish === 'onyx') continue;
      mesh.material.dispose();
      mesh.material = this.material(finish);
      mesh.userData.finish = finish;
    }
    this.render();
  }

  private clear() {
    for (const mesh of this.meshes) {
      mesh.geometry.dispose();
      mesh.material.dispose();
      this.group.remove(mesh);
    }
    for (const g of this.glints) {
      g.sprite.material.dispose();
      this.group.remove(g.sprite);
    }
    this.meshes = [];
    this.glints = [];
  }

  private refit() {
    const viewH = 2 * this.camera.position.z * Math.tan((this.camera.fov * Math.PI) / 360);
    const viewW = viewH * this.camera.aspect;
    const s = this.opts.fit * Math.min(viewW / this.bounds.w, viewH / this.bounds.h);
    this.group.scale.setScalar(s);
  }

  private resize = () => {
    const w = this.canvas.clientWidth || 1;
    const h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.refit();
    this.render();
  };

  private bind() {
    const ro = new ResizeObserver(this.resize);
    ro.observe(this.canvas);
    const io = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.onScreen ? this.start() : this.stop();
    });
    io.observe(this.canvas);
    const onVisibility = () => (document.hidden ? this.stop() : this.start());
    document.addEventListener('visibilitychange', onVisibility);

    const follow = (e: PointerEvent) => {
      if (this.drag.on || e.pointerType === 'touch') return;
      const r = this.opts.followWindow
        ? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
        : this.canvas.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      this.pose.ty = Math.max(-0.5, Math.min(0.5, nx)) * 1.0;
      this.pose.tx = Math.max(-0.5, Math.min(0.5, ny)) * 0.6;
    };
    const followTarget: Window | HTMLElement = this.opts.followWindow ? window : this.canvas;
    followTarget.addEventListener('pointermove', follow as EventListener);

    const down = (e: PointerEvent) => {
      this.drag = { on: true, x: e.clientX, y: e.clientY };
      this.canvas.setPointerCapture(e.pointerId);
      this.canvas.classList.add('is-grabbing');
    };
    const move = (e: PointerEvent) => {
      if (!this.drag.on) return;
      const dx = e.clientX - this.drag.x;
      const dy = e.clientY - this.drag.y;
      this.drag.x = e.clientX;
      this.drag.y = e.clientY;
      this.pose.ry += dx * 0.011;
      this.pose.rx = Math.max(-1.1, Math.min(1.1, this.pose.rx + dy * 0.006));
      this.pose.vy = dx * 0.6;
      this.pose.vx = 0;
      if (this.still.matches) this.render();
    };
    const up = () => {
      this.drag.on = false;
      this.canvas.classList.remove('is-grabbing');
    };
    this.canvas.addEventListener('pointerdown', down);
    this.canvas.addEventListener('pointermove', move);
    this.canvas.addEventListener('pointerup', up);
    this.canvas.addEventListener('pointercancel', up);

    this.cleanup.push(() => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      followTarget.removeEventListener('pointermove', follow as EventListener);
      this.canvas.removeEventListener('pointerdown', down);
      this.canvas.removeEventListener('pointermove', move);
      this.canvas.removeEventListener('pointerup', up);
      this.canvas.removeEventListener('pointercancel', up);
    });
  }

  start() {
    if (this.raf || !this.onScreen || document.hidden) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame = (now: number) => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.step(dt);
    this.render();
  };

  /** Advance the simulation; exposed so the scene can be driven by hand. */
  step(dt: number) {
    const p = this.pose;
    const calm = this.still.matches;
    if (!calm) this.clock += dt;
    if (!this.drag.on) {
      // Spring back to the pointer-led pose, by the shortest way round.
      const turns = Math.round((p.ry - p.ty) / (Math.PI * 2));
      const goalY = p.ty + turns * Math.PI * 2;
      p.vy += ((goalY - p.ry) * 22 - p.vy * 6.5) * dt;
      p.vx += ((p.tx - p.rx) * 22 - p.vx * 6.5) * dt;
      p.ry += p.vy * dt;
      p.rx += p.vx * dt;
    }
    const t = this.clock;
    this.group.rotation.set(p.rx + Math.sin(t * 0.7) * 0.05, p.ry + Math.sin(t * 0.45) * 0.12, Math.sin(t * 0.5) * 0.025);
    this.group.position.y = Math.sin(t * 0.9) * 0.035;
    for (const mesh of this.meshes) mesh.material.envMapRotation.y = t * 0.12;
    this.updateGlints(dt);
  }

  private tmpN = new Vector3();
  private tmpP = new Vector3();
  private tmpV = new Vector3();
  private tmpR = new Vector3();

  private updateGlints(dt: number) {
    this.group.updateMatrixWorld();
    const q = this.group.quaternion;
    for (const g of this.glints) {
      const n = this.tmpN.copy(g.normal).applyQuaternion(q);
      const world = this.tmpP.copy(g.position).applyMatrix4(this.group.matrixWorld);
      const view = this.tmpV.copy(this.camera.position).sub(world).normalize();
      let hit = 0;
      if (n.dot(view) > 0.08) {
        const r = this.tmpR.copy(view).negate().reflect(n);
        for (const light of GLINT_LIGHTS) hit = Math.max(hit, Math.pow(Math.max(r.dot(light), 0), 16));
      }
      const twinkle = 0.75 + 0.25 * Math.sin(this.clock * 3.1 + g.phase);
      const goal = hit * twinkle;
      g.level += (goal - g.level) * Math.min(1, dt * 9);
      const s = 0.02 + g.level * 0.26;
      g.sprite.scale.setScalar(s);
      g.sprite.material.opacity = Math.min(1, g.level * 1.6);
      g.sprite.material.rotation = g.phase + this.clock * 0.2;
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  /** Render a frame and return it as a data URL (for checks and thumbnails). */
  snapshot(): string {
    this.step(0.016);
    this.render();
    return this.canvas.toDataURL('image/png');
  }

  /** Force a pose; `settle` runs the simulation forward without drawing. */
  debugPose(ry: number, rx = 0, settle = 0) {
    this.pose.ry = this.pose.ty = ry;
    this.pose.rx = this.pose.tx = rx;
    this.pose.vx = this.pose.vy = 0;
    for (let i = 0; i < settle; i++) this.step(0.016);
  }

  dispose() {
    this.stop();
    this.clear();
    for (const fn of this.cleanup) fn();
    for (const tex of this.envs.values()) tex.dispose();
    this.glintTexture.dispose();
    this.pmrem.dispose();
    this.renderer.dispose();
  }
}
