import React, { useEffect, useRef } from 'react';
import { TrajectoryPoint } from '../types';

interface TrajectoryCanvas2DProps {
  trajectory: TrajectoryPoint[];
  playbackProgress: number;
  planetRadiusKm: number;
  planetColor?: string;
  periapsisKm?: number;
  turningAngleDeg?: number;
}

export const TrajectoryCanvas2D: React.FC<TrajectoryCanvas2DProps> = ({
  trajectory,
  playbackProgress,
  planetRadiusKm,
  planetColor = '#F59E0B',
  periapsisKm,
  turningAngleDeg,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || trajectory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Center coordinates
    const cx = width / 2;
    const cy = height / 2;

    // Find bounding box in orbital XY plane
    let maxDist = planetRadiusKm * 5;
    trajectory.forEach((pt) => {
      const d = Math.sqrt(pt.x_km * pt.x_km + pt.y_km * pt.y_km);
      if (d > maxDist) maxDist = d;
    });

    const scale = (Math.min(width, height) * 0.42) / maxDist;

    // Background grid & concentric range rings
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach((ratio) => {
      const r = maxDist * ratio * scale;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`${((maxDist * ratio) / 1e6).toFixed(1)}M km`, cx + r + 4, cy - 4);
    });

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(width, cy);
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, height);
    ctx.stroke();

    // Draw Central Body (Planet)
    const planetRadiusPx = Math.max(3, planetRadiusKm * scale);
    ctx.fillStyle = planetColor;
    ctx.beginPath();
    ctx.arc(cx, cy, planetRadiusPx, 0, 2 * Math.PI);
    ctx.fill();

    // Planet atmosphere glow
    ctx.strokeStyle = planetColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw Trajectory curve
    ctx.beginPath();
    trajectory.forEach((pt, idx) => {
      const sx = cx + pt.x_km * scale;
      const sy = cy - pt.y_km * scale; // Inverted Y for screen coordinates
      if (idx === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw Periapsis vector
    if (periapsisKm) {
      // Find periapsis index
      let minPt = trajectory[0];
      let minD = Infinity;
      trajectory.forEach((p) => {
        if (p.distance_to_planet_km < minD) {
          minD = p.distance_to_planet_km;
          minPt = p;
        }
      });

      const px = cx + minPt.x_km * scale;
      const py = cy - minPt.y_km * scale;

      // Dashed line from origin to periapsis
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.setLineDash([]);

      // Periapsis marker
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#FDA4AF';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`rp: ${(periapsisKm / 1e3).toFixed(0)}k km`, px + 8, py - 4);
    }

    // Spacecraft current playback position
    const currentIdx = Math.min(
      trajectory.length - 1,
      Math.max(0, Math.floor(playbackProgress * (trajectory.length - 1)))
    );
    const curPt = trajectory[currentIdx];
    const curX = cx + curPt.x_km * scale;
    const curY = cy - curPt.y_km * scale;

    // Outer probe glow
    ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.beginPath();
    ctx.arc(curX, curY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Inner probe dot
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Velocity arrow
    const vLen = Math.min(30, Math.max(10, curPt.speed_km_s * 0.8));
    const speed = curPt.speed_km_s || 1;
    const vxNorm = curPt.vx_km_s / speed;
    const vyNorm = curPt.vy_km_s / speed;
    const arrowEndX = curX + vxNorm * vLen;
    const arrowEndY = curY - vyNorm * vLen;

    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(curX, curY);
    ctx.lineTo(arrowEndX, arrowEndY);
    ctx.stroke();
  }, [trajectory, playbackProgress, planetRadiusKm, planetColor, periapsisKm, turningAngleDeg]);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-space-800 bg-space-950 flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={750}
        height={540}
        className="w-full h-full object-contain"
      />
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-space-900/80 backdrop-blur border border-space-700/60 text-xs font-mono text-slate-300">
        2D Orbital Plane Projection (Equatorial View)
      </div>
    </div>
  );
};
