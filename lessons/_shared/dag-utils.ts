// Shared utilities for drawing directed acyclic graphs (Bayesian networks)

import { colors } from '../../engine/shared/design-tokens';
import { easeOut } from '../../engine/animation/tween';

export interface DagNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  filled?: boolean;
}

export interface DagEdge {
  from: string;
  to: string;
  color?: string;
}

/** Draw a DAG node (circle with label) */
export function drawNode(
  ctx: CanvasRenderingContext2D,
  node: DagNode,
  progress: number,
  radius = 22,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));
  const r = radius * p;

  ctx.save();
  ctx.globalAlpha = p;

  // Circle
  ctx.beginPath();
  ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
  if (node.filled) {
    ctx.fillStyle = node.color || colors.accent;
    ctx.fill();
  } else {
    ctx.fillStyle = colors.panelBg;
    ctx.fill();
    ctx.strokeStyle = node.color || colors.accent;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Label
  ctx.fillStyle = node.filled ? colors.bodyBg : (node.color || colors.textPrimary);
  ctx.font = 'bold 13px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, node.x, node.y);

  ctx.restore();
}

/** Draw a directed edge (arrow) between two nodes */
export function drawEdge(
  ctx: CanvasRenderingContext2D,
  nodes: Map<string, DagNode>,
  edge: DagEdge,
  progress: number,
  nodeRadius = 22,
): void {
  if (progress <= 0) return;
  const from = nodes.get(edge.from);
  const to = nodes.get(edge.to);
  if (!from || !to) return;

  const p = easeOut(Math.min(progress, 1));
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;
  const ux = dx / dist, uy = dy / dist;

  const startX = from.x + ux * nodeRadius;
  const startY = from.y + uy * nodeRadius;
  const endX = to.x - ux * nodeRadius;
  const endY = to.y - uy * nodeRadius;

  const cx = startX + (endX - startX) * p;
  const cy = startY + (endY - startY) * p;

  ctx.save();
  ctx.globalAlpha = p;
  ctx.strokeStyle = edge.color || colors.textMuted;
  ctx.lineWidth = 1.5;

  // Line
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(cx, cy);
  ctx.stroke();

  // Arrowhead
  if (p > 0.8) {
    const headSize = 8;
    const angle = Math.atan2(cy - startY, cx - startX);
    ctx.fillStyle = edge.color || colors.textMuted;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - headSize * Math.cos(angle - 0.4), cy - headSize * Math.sin(angle - 0.4));
    ctx.lineTo(cx - headSize * Math.cos(angle + 0.4), cy - headSize * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/** Draw a complete DAG with nodes and edges */
export function drawDag(
  ctx: CanvasRenderingContext2D,
  nodes: DagNode[],
  edges: DagEdge[],
  nodeProgress: number,
  edgeProgress: number,
  nodeRadius = 22,
): void {
  const nodeMap = new Map<string, DagNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // Draw edges first (behind nodes)
  for (const edge of edges) {
    drawEdge(ctx, nodeMap, edge, edgeProgress, nodeRadius);
  }

  // Draw nodes on top
  for (const node of nodes) {
    drawNode(ctx, node, nodeProgress, nodeRadius);
  }
}

/** Draw a plate notation (rectangle with label) */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  label: string,
  progress: number,
  color = colors.textDimmed,
): void {
  if (progress <= 0) return;
  const p = easeOut(Math.min(progress, 1));

  ctx.save();
  ctx.globalAlpha = p * 0.6;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  ctx.fillStyle = color;
  ctx.font = '10px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(label, x + w - 4, y + h - 3);

  ctx.restore();
}
