# Numerical Methodology & Algorithmic Design

**Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)**  
**Undergraduate Computational Physics Project P1**  
*Interactive Numerical Gravitational Assist Simulator*

---

## 1. Numerical Integration Strategy

The project intentionally avoids black-box library solvers (e.g., `scipy.integrate.solve_ivp`) for the core numerical orbital propagation. In accordance with the undergraduate proposal, the trajectory solver is implemented as an explicit, transparent 4th-order Runge-Kutta numerical integrator (`rk4.py`).

### 1.1 First-Order ODE Reduction
Second-order Newtonian equations of motion:
$$\frac{d^2 \vec{r}}{dt^2} = \vec{a}(t, \vec{r})$$
are decomposed into six coupled first-order ordinary differential equations:
$$\frac{d\vec{r}}{dt} = \vec{v}, \quad \frac{d\vec{v}}{dt} = \vec{a}(t, \vec{r})$$

### 1.2 Custom RK4 Step Implementation
The state vector $\mathbf{y}_n \in \mathbb{R}^6$ is updated across interval $\Delta t$ via:
$$\mathbf{k}_1 = \mathbf{f}(t_n, \mathbf{y}_n)$$
$$\mathbf{k}_2 = \mathbf{f}\left(t_n + \frac{\Delta t}{2}, \mathbf{y}_n + \frac{\Delta t}{2} \mathbf{k}_1\right)$$
$$\mathbf{k}_3 = \mathbf{f}\left(t_n + \frac{\Delta t}{2}, \mathbf{y}_n + \frac{\Delta t}{2} \mathbf{k}_2\right)$$
$$\mathbf{k}_4 = \mathbf{f}(t_n + \Delta t, \mathbf{y}_n + \Delta t \, \mathbf{k}_3)$$
$$\mathbf{y}_{n+1} = \mathbf{y}_n + \frac{\Delta t}{6} (\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)$$

---

## 2. Timestep Convergence & Accuracy Verification

To empirically demonstrate that the custom solver achieves 4th-order global convergence, the engine implements a multi-step study evaluating trajectory solutions at three step sizes: $\Delta t$, $\Delta t/2$, and $\Delta t/4$.

Let $E_1 = ||\mathbf{y}_{\Delta t} - \mathbf{y}_{\Delta t/2}||$ and $E_2 = ||\mathbf{y}_{\Delta t/2} - \mathbf{y}_{\Delta t/4}||$.
The empirical convergence order $p$ is calculated as:
$$p \approx \frac{\log_2(E_1 / E_2)}{\log_2(2)} = \log_2\left(\frac{E_1}{E_2}\right)$$
For RK4, theoretical scaling demands $E_1 / E_2 \approx 2^4 = 16$, which yields $p \approx 4.0$. In automated unit tests (`tests/test_rk4.py`), the measured ratio satisfies $p \in [3.8, 4.2]$, verifying the numerical algorithm.

---

## 3. Physical Safety Triggers & Collision Bounds

1. **Collision Boundary**: If $|\vec{r}_{\text{rel}}| \le R_p$, the simulator flags an immediate planetary impact warning.
2. **Grazing Encounter Warning**: If $|\vec{r}_{\text{rel}}| < 1.15 \, R_p$, the system flags atmospheric entry risk.
3. **Displacement Resolution Check**: If $\Delta t \cdot v_{\text{rel}} > 0.25 \, |\vec{r}_{\text{rel}}|$, the simulation warns that the current timestep is too coarse to resolve periapsis curvature and recommends a reduced $\Delta t$.
