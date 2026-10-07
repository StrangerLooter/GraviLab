# GraviLab — Gravity Simulation Laboratory
### Interactive Numerical Simulation & Orbital Dynamics of Planetary Gravitational Slingshot Maneuvers

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel&style=flat-square)](https://GraviLab.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-blue?logo=react&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Three.js](https://img.shields.io/badge/WebGL-Three.js-black?logo=three.js&style=flat-square)](https://threejs.org)
[![Numerical Integrator](https://img.shields.io/badge/Integrator-Custom%20RK4-brightgreen?style=flat-square)]()
[![Validation](https://img.shields.io/badge/NASA%20Horizons-0.703%25%20Error%20%28%3C%205.0%25%29-success?style=flat-square)]()
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

> **Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)**  
> **Undergraduate Computational Physics & Orbital Mechanics Project P1**  
> **Target Production URL:** [https://GraviLab.vercel.app](https://GraviLab.vercel.app)

---

## Executive Overview

**GraviLab (Gravity Simulation Laboratory)** is a high-performance, 100% client-side computational physics laboratory for modeling planetary gravitational slingshot (gravity-assist) maneuvers. Running entirely within the user's browser via a dedicated TypeScript numerical physics engine, GraviLab eliminates all server and backend dependencies, enabling real-time orbital trajectory integration, reference frame transformations, and observational validation against authentic NASA JPL Horizons ephemerides.

The laboratory was engineered according to the rigorous requirements of the Department of Mathematics IEHE Bhopal Project Proposal P1, guaranteeing mathematical fidelity, energy conservation verification, empirical convergence order $p \approx 4$, and validation against authentic Voyager 1 telemetry well within the $< 5.0\%$ error threshold.

---

## Core Scientific & Numerical Capabilities

### 1. Standalone Client-Side Physics Engine (`src/physics/`)
All trajectory modeling and vector mathematics execute locally in the browser with zero external API calls:
- **Newtonian Gravitational Acceleration**: Exact vector gravity modeling:
  $$\vec{a} = - \frac{G M_p}{r^3} \vec{r}$$
- **Custom Fourth-Order Runge-Kutta (RK4) Integrator**: Implemented directly in TypeScript without black-box numerical libraries:
  $$\begin{aligned}
    \vec{k}_1 &= f(t, \mathbf{y}) \\
    \vec{k}_2 &= f\left(t + \frac{\Delta t}{2}, \mathbf{y} + \frac{\Delta t}{2} \vec{k}_1\right) \\
    \vec{k}_3 &= f\left(t + \frac{\Delta t}{2}, \mathbf{y} + \frac{\Delta t}{2} \vec{k}_2\right) \\
    \vec{k}_4 &= f\left(t + \Delta t, \mathbf{y} + \Delta t \vec{k}_3\right) \\
    \mathbf{y}_{n+1} &= \mathbf{y}_n + \frac{\Delta t}{6} (\vec{k}_1 + 2\vec{k}_2 + 2\vec{k}_3 + \vec{k}_4)
  \end{aligned}$$
- **State Vector Support**: Full 6-dimensional phase space coordinates $\mathbf{y} = [x, y, z, v_x, v_y, v_z]^T$.
- **Bidirectional Time Stepping**: Numerical integration forward and backward in time.

### 2. Dual Galilean Reference Frames ($S \leftrightarrow S'$)
- **Heliocentric Frame ($S$)**: Centered at the Sun; tracks total spacecraft kinetic energy, solar orbit deflection, and planetary orbital velocity $\vec{v}_p$.
- **Planetocentric Frame ($S'$)**: Centered at the planet; verifies hyperbolic excess velocity invariance ($|\vec{v}_{\infty,\text{out}}| = |\vec{v}_{\infty,\text{in}}|$), turning angle $\delta$, and periapsis radius $r_p$.
- **Heliocentric Energy Extraction Theorem**:
  $$\Delta \epsilon_\odot = \vec{v}_p \cdot \Delta \vec{v} = v_p \Delta v \cos \theta$$

### 3. Hyperbolic Flyby Mechanics & Conservation
- **Analytical Hyperbolic Geometry**:
  $$\text{Eccentricity: } e = 1 + \frac{r_p v_\infty^2}{\mu}, \quad \text{Turning Angle: } \delta = 2 \arcsin\left(\frac{1}{e}\right), \quad \text{Impact Parameter: } b = r_p \sqrt{1 + \frac{2\mu}{r_p v_\infty^2}}$$
- **Conservation Diagnostics**: Live tracking of specific orbital energy $\epsilon = \frac{v^2}{2} - \frac{\mu}{r}$ and specific angular momentum vector $\vec{h} = \vec{r} \times \vec{v}$ to detect numerical drift and collisions ($r \le R_p$).

### 4. Convergence & Error Analysis
- **Empirical Order of Convergence**: Automated multi-grid Richardson extrapolation across timesteps $(\Delta t, \Delta t/2, \Delta t/4)$ demonstrating 4th-order scaling:
  $$p = \frac{\log(E_{\Delta t} / E_{\Delta t/2})}{\log(2)} \approx 4.0$$

### 5. Authentic NASA JPL Horizons Telemetry Validation
- **Historical Calibration**: Ingestion of authentic historical Voyager 1 Jupiter encounter telemetry (March 1979) covering 19 synchronized 12-hour tracking stations across 777,600 seconds.
- **Strict $< 5.0\%$ Relative Error Benchmark**:
  - **Achieved Maximum Relative Error**: **$0.703\%$** (well within the $\le 5.0\%$ project threshold)
  - **Position RMSE**: $19,096\text{ km}$
  - **Velocity RMSE**: $60.68\text{ m/s}$
  - Standalone local reference dataset bundled in `public/data/horizons/` — fully functional offline with zero API downtime.

---

## Target Architecture

```
Vercel Edge / Static CDN
  │
  ▼
React 18 + TypeScript + Vite Single-Page Application
  │
  ├── UI & Controls Layer (Tailwind CSS, Lucide Icons)
  │     ├── Dashboard (SMART Objectives Scorecard, Presets)
  │     ├── Simulation Lab (3D Three.js Viewport, 2D Plane, HUD)
  │     ├── Physics Analysis (Galilean Vectors, Energy Curves, Convergence)
  │     ├── Validation Lab (NASA Horizons Benchmark Table, Error vs Time)
  │     └── Theory & Viva Deck (LaTeX Derivations, 10-Slide Presentation)
  │
  └── Pure TypeScript Physics Engine (`src/physics/`)
        ├── constants.ts          (Astronomical constants & presets)
        ├── vectors.ts            (3D vector algebra & Rodrigues rotations)
        ├── state.ts              (6D orbital state vector)
        ├── gravity.ts            (Newtonian gravitation)
        ├── rk4.ts                (Hand-crafted RK4 numerical integrator)
        ├── referenceFrames.ts    (S <-> S' Galilean transformations)
        ├── orbitalMechanics.ts   (Hyperbolic flyby analytics)
        ├── conservation.ts       (Energy & angular momentum invariants)
        ├── datasets.ts           (Embedded JPL Horizons ephemerides)
        ├── simulationEngine.ts   (In-browser trajectory dispatcher)
        └── validationEngine.ts   (Observational error & RMSE metrics)
```

---

## Responsive Design & Accessibility

- **Breakpoints Supported**:
  - **Mobile (320px – 767px)**: Dedicated top-bar navigation, compact 3D viewport, collapsible drawer, telemetry cards, and touch-optimized gestures.
  - **Tablet (768px – 1023px)**: Adaptive side-by-side telemetry and touch canvas.
  - **Desktop (1024px – 1439px)**: Full multi-pane mission-control layout with dual 3D/2D views.
  - **Large Display / TV (1440px+)**: Expansive scientific command dashboard with high-DPI canvas rendering.
- **Touch Gestures**: Single-finger orbit rotation, two-finger pinch-to-zoom, and touch drag panning.
- **Accessibility**: Semantic HTML5 elements, ARIA labels, high-contrast HUD badges, and complete keyboard navigation.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (tested with Node 20 & 24)
- npm 9+

### Installation & Execution
```bash
# Clone the repository
git clone https://github.com/StrangerLooter/GraviLab.git
cd GraviLab

# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Automated Physics Test Suite
```bash
npm test
```
Executes 12 comprehensive unit tests in `src/physics/__tests__/physics.test.ts` verifying:
1. Newtonian gravitational acceleration field accuracy
2. Harmonic oscillator RK4 accuracy vs analytical solution
3. Closed circular orbit integration (radius drift $< 0.05\%$)
4. 4th-order convergence confirmation ($p \approx 4.0$)
5. Heliocentric $\leftrightarrow$ Planetocentric Galilean frame transformations
6. Excess velocity invariance ($|\vec{v}_{\infty,\text{in}}| = |\vec{v}_{\infty,\text{out}}|$)
7. Heliocentric energy gain formula ($\Delta \epsilon_\odot = \vec{v}_p \cdot \Delta \vec{v}$)
8. Analytical turning angle $\delta = 2 \arcsin(1/e)$
9. Specific orbital energy and angular momentum conservation
10. In-browser simulation runner end-to-end execution
11. NASA JPL Horizons Voyager 1 telemetry ingestion
12. Validation relative error gate strictly satisfying $< 5.0\%$ (**0.703% achieved**)

### Production Build
```bash
npm run build
```
Generates an optimized, tree-shaken static production bundle in `dist/`.

---

## Deployment to Vercel

The application is configured for zero-config deployment on Vercel:
```bash
# Direct deployment via Vercel CLI
npx vercel --prod
```
Or connect your GitHub repository directly to Vercel with:
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Target production domain: **`GraviLab.vercel.app`**

---

## Laboratory Pages & Modules

| Page | Route | Description |
| :--- | :--- | :--- |
| **Mission Dashboard** | `/` | Mission status, SMART objectives scorecard, planet selection, preset launcher. |
| **Simulation Lab** | `/simulation` | Interactive 3D Three.js spatial view, 2D orbital plane projection, playback controls, live telemetry HUD. |
| **Physics Analysis** | `/physics` | Frame transformation vectors ($S \leftrightarrow S'$), energy/momentum conservation charts, convergence test. |
| **Validation Lab** | `/validation` | NASA JPL Horizons Voyager 1 benchmark comparison, error plots, 19-epoch observation table. |
| **Theory & Viva Deck** | `/theory` | Derivations, downloadable Markdown report, and interactive 10-slide oral viva presentation deck. |

---

## Academic Attribution & Team

**Institution**: Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)  
**Department**: Department of Mathematics  
**Project**: P1 — Gravitational Slingshot Simulation & Horizons Validation  
**Author / Developer**: Ram Vishwakarma (`@StrangerLooter`)  

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
