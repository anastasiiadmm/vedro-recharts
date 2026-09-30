import { Map as MapLibreMap } from 'maplibre-gl';

interface Particle {
  lng: number;
  lat: number;
  age: number;
  maxAge: number;
  speed: number;
  color: string;
}

export class CanvasWindParticleEngine {
  private map: MapLibreMap;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private maxParticles: number = 700;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private windGrid: Array<{ lng: number; lat: number; u: number; v: number; speed: number }> = [];

  private bounds = {
    minLng: 8.4,
    maxLng: 13.6,
    minLat: 46.2,
    maxLat: 48.6,
  };

  constructor(map: MapLibreMap) {
    this.map = map;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'wind-particles-canvas';
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '3';
    this.ctx = this.canvas.getContext('2d', { alpha: true })!;

    const container = map.getContainer();
    container.appendChild(this.canvas);

    this.resizeCanvas();
    this.map.on('resize', this.resizeCanvas);
    this.map.on('move', this.handleMapMove);
  }

  private resizeCanvas = () => {
    const container = this.map.getContainer();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = container.clientWidth * dpr;
    this.canvas.height = container.clientHeight * dpr;
    this.canvas.style.width = `${container.clientWidth}px`;
    this.canvas.style.height = `${container.clientHeight}px`;
    this.ctx.scale(dpr, dpr);
  };

  private handleMapMove = () => {
    const container = this.map.getContainer();
    this.ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
  };

  public setWindData(features: GeoJSON.Feature[]) {
    this.windGrid = features.map((f) => {
      const coords = (f.geometry as GeoJSON.Point).coordinates;
      const p = f.properties || {};
      return {
        lng: coords[0],
        lat: coords[1],
        u: p.u || 0,
        v: p.v || 0,
        speed: p.speed || 5,
      };
    });

    if (this.particles.length === 0) {
      this.initParticles();
    }
  }

  private initParticles() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const lng = this.bounds.minLng + Math.random() * (this.bounds.maxLng - this.bounds.minLng);
    const lat = this.bounds.minLat + Math.random() * (this.bounds.maxLat - this.bounds.minLat);
    const maxAge = 40 + Math.floor(Math.random() * 60);

    return {
      lng,
      lat,
      age: Math.floor(Math.random() * maxAge),
      maxAge,
      speed: 5,
      color: '#38bdf8',
    };
  }

  private sampleVelocity(lng: number, lat: number): { u: number; v: number; speed: number } {
    if (this.windGrid.length === 0) return { u: 0.005, v: 0.002, speed: 5 };

    let nearest = this.windGrid[0];
    let minDist = Infinity;

    for (let i = 0; i < this.windGrid.length; i++) {
      const g = this.windGrid[i];
      const d = (lng - g.lng) * (lng - g.lng) + (lat - g.lat) * (lat - g.lat);
      if (d < minDist) {
        minDist = d;
        nearest = g;
      }
    }

    return {
      u: (nearest.u / 100) * 0.002,
      v: (nearest.v / 100) * 0.002,
      speed: nearest.speed,
    };
  }

  private getParticleColor(speed: number): string {
    if (speed > 16) return '#ef4444';
    if (speed > 10) return '#f59e0b';
    if (speed > 5) return '#38bdf8';
    return '#a5f3fc';
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    const container = this.map.getContainer();
    this.ctx.clearRect(0, 0, container.clientWidth, container.clientHeight);
  }

  public setOpacity(opacity: number) {
    this.canvas.style.opacity = `${opacity}`;
  }

  private animate = () => {
    if (!this.isRunning) return;

    const container = this.map.getContainer();
    const w = container.clientWidth;
    const h = container.clientHeight;

    this.ctx.fillStyle = 'rgba(10, 15, 29, 0.92)';
    this.ctx.globalCompositeOperation = 'destination-in';
    this.ctx.fillRect(0, 0, w, h);
    this.ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      const currentPoint = this.map.project([p.lng, p.lat]);
      const vel = this.sampleVelocity(p.lng, p.lat);

      p.lng += vel.u;
      p.lat += vel.v;
      p.age++;
      p.speed = vel.speed;

      const nextPoint = this.map.project([p.lng, p.lat]);

      if (
        currentPoint.x >= 0 &&
        currentPoint.x <= w &&
        currentPoint.y >= 0 &&
        currentPoint.y <= h
      ) {
        const alpha = Math.sin((p.age / p.maxAge) * Math.PI);
        this.ctx.beginPath();
        this.ctx.moveTo(currentPoint.x, currentPoint.y);
        this.ctx.lineTo(nextPoint.x, nextPoint.y);
        this.ctx.strokeStyle = this.getParticleColor(p.speed);
        this.ctx.lineWidth = Math.min(2.5, Math.max(1.0, p.speed / 6));
        this.ctx.globalAlpha = alpha * 0.85;
        this.ctx.stroke();
      }

      if (
        p.age >= p.maxAge ||
        p.lng < this.bounds.minLng ||
        p.lng > this.bounds.maxLng ||
        p.lat < this.bounds.minLat ||
        p.lat > this.bounds.maxLat
      ) {
        this.particles[i] = this.createParticle();
      }
    }

    this.ctx.globalAlpha = 1.0;
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  public destroy() {
    this.stop();
    this.map.off('resize', this.resizeCanvas);
    this.map.off('move', this.handleMapMove);
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}
