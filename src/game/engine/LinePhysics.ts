import { Skia, SkPath, SkPathBuilder } from '@shopify/react-native-skia';
import Matter from 'matter-js';
import { CollisionCategory, GameConfig } from '../config/GameConfig';
import { AntiDrawZone, DrawnLine, DrawnSegment, Point } from '../types';

export class LinePhysicsManager {
  private activePoints: Point[] = [];
  private activeSegments: DrawnSegment[] = [];
  private builder: SkPathBuilder | null = null;
  private currentLineId = '';
  private world: Matter.World;

  constructor(world: Matter.World) {
    this.world = world;
  }

  startLine(worldPoint: Point, antiDrawZones: AntiDrawZone[]): boolean {
    if (this.isPointInsideAntiDraw(worldPoint, antiDrawZones)) {
      return false;
    }

    this.currentLineId = `line_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.activePoints = [worldPoint];
    this.activeSegments = [];
    this.builder = Skia.PathBuilder.Make();
    this.builder.moveTo(worldPoint.x, worldPoint.y);
    return true;
  }

  addPoint(
    worldPoint: Point,
    currentInk: number,
    antiDrawZones: AntiDrawZone[]
  ): {
    inkUsed: number;
    blocked: boolean;
    addedSegment: DrawnSegment | null;
  } {
    // Auto-recover: if line was broken or not started, seamlessly start a new one!
    if (!this.builder || this.activePoints.length === 0) {
      if (this.isPointInsideAntiDraw(worldPoint, antiDrawZones) || currentInk < 2) {
        return { inkUsed: 0, blocked: true, addedSegment: null };
      }
      this.startLine(worldPoint, antiDrawZones);
      return { inkUsed: 0, blocked: false, addedSegment: null };
    }

    // Check anti-draw zone
    if (this.isPointInsideAntiDraw(worldPoint, antiDrawZones)) {
      return { inkUsed: 0, blocked: true, addedSegment: null };
    }

    const lastPoint = this.activePoints[this.activePoints.length - 1];
    const dx = worldPoint.x - lastPoint.x;
    const dy = worldPoint.y - lastPoint.y;
    const distance = Math.hypot(dx, dy);

    if (distance < GameConfig.MIN_POINT_DISTANCE) {
      return { inkUsed: 0, blocked: false, addedSegment: null };
    }

    const inkCost = distance * GameConfig.INK_CONSUMPTION_PER_PIXEL;
    if (currentInk < inkCost) {
      return { inkUsed: 0, blocked: true, addedSegment: null };
    }

    // Cap line length to prevent memory spikes
    if (this.activePoints.length >= GameConfig.MAX_DRAW_POINTS_PER_LINE) {
      return { inkUsed: 0, blocked: true, addedSegment: null };
    }

    // Add smooth curve to Skia path builder
    const midX = (lastPoint.x + worldPoint.x) / 2;
    const midY = (lastPoint.y + worldPoint.y) / 2;
    this.builder.quadTo(lastPoint.x, lastPoint.y, midX, midY);

    // Create lightweight Matter.js physics segment
    const segment = this.createSegmentBody(lastPoint, worldPoint, distance);
    Matter.Composite.add(this.world, segment.body);

    this.activePoints.push(worldPoint);
    this.activeSegments.push(segment);

    return {
      inkUsed: inkCost,
      blocked: false,
      addedSegment: segment,
    };
  }

  finishLine(): DrawnLine | null {
    if (this.activePoints.length < 2 || !this.builder) {
      this.cancelCurrentLine();
      return null;
    }

    const lastPoint = this.activePoints[this.activePoints.length - 1];
    this.builder.lineTo(lastPoint.x, lastPoint.y);

    const line: DrawnLine = {
      id: this.currentLineId,
      points: [...this.activePoints],
      skPath: this.builder.build(),
      segments: [...this.activeSegments],
      createdAt: Date.now(),
    };

    this.activePoints = [];
    this.activeSegments = [];
    this.builder = null;
    this.currentLineId = '';

    return line;
  }

  cancelCurrentLine(): void {
    for (const seg of this.activeSegments) {
      Matter.Composite.remove(this.world, seg.body);
    }
    this.activePoints = [];
    this.activeSegments = [];
    this.builder = null;
    this.currentLineId = '';
  }

  getCurrentPath(): SkPath | null {
    return this.builder ? this.builder.build() : null;
  }

  getCurrentPoints(): Point[] {
    return this.activePoints;
  }

  isPointInsideAntiDraw(p: Point, zones: AntiDrawZone[]): boolean {
    for (const zone of zones) {
      if (
        p.x >= zone.x &&
        p.x <= zone.x + zone.width &&
        p.y >= zone.y &&
        p.y <= zone.y + zone.height
      ) {
        return true;
      }
    }
    return false;
  }

  private createSegmentBody(p1: Point, p2: Point, length: number): DrawnSegment {
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2;
    const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    // Clean lightweight rectangle: 4 vertices (10x faster SAT than chamfered polygon)
    const body = Matter.Bodies.rectangle(
      cx,
      cy,
      length + 2,
      GameConfig.LINE_PHYSICS_THICKNESS,
      {
        isStatic: true,
        angle,
        friction: 0.001,
        frictionStatic: 0.001,
        restitution: 0.08,
        collisionFilter: {
          category: CollisionCategory.DRAWN_LINE,
          mask: CollisionCategory.NINJA,
        },
        label: 'drawn_segment',
      }
    );

    return { p1, p2, body, length };
  }
}
