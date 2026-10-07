# Mathematical Foundations & Governing Equations

**Department of Mathematics, Institute for Excellence in Higher Education (IEHE), Bhopal (M.P.)**  
**Undergraduate Computational Physics Project P1**  
*Interactive Numerical Gravitational Assist Simulator*

---

## 1. Newtonian Gravitational Dynamics & State Space
Consider a spacecraft of mass $m$ operating in the gravitational field of a central star (Sun, mass $M_\odot$, gravitational parameter $\mu_\odot = G M_\odot$) and $N$ planetary bodies of mass $M_i$ ($\mu_i = G M_i$). The equation of motion is governed by Newton's Law of Universal Gravitation:

$$\vec{a}(t, \vec{r}) = -\frac{\mu_\odot}{|\vec{r} - \vec{r}_\odot|^3} (\vec{r} - \vec{r}_\odot) - \sum_{i=1}^N \frac{\mu_i}{|\vec{r} - \vec{r}_i(t)|^3} (\vec{r} - \vec{r}_i(t))$$

### 1.1 State Vector Formulation
The spacecraft dynamics are formulated as a 6-dimensional first-order ordinary differential equation system:

$$\mathbf{y}(t) = \begin{bmatrix} x \\ y \\ z \\ v_x \\ v_y \\ v_z \end{bmatrix}, \quad \frac{d\mathbf{y}}{dt} = \mathbf{f}(t, \mathbf{y}) = \begin{bmatrix} v_x \\ v_y \\ v_z \\ a_x(t, \mathbf{r}) \\ a_y(t, \mathbf{r}) \\ a_z(t, \mathbf{r}) \end{bmatrix}$$

---

## 2. Reference-Frame Transformations
Let $S$ denote the Heliocentric inertial reference frame with origin at the Sun's center of mass, and $S'$ denote the Planetocentric reference frame moving with the target planet at heliocentric position $\vec{r}_p(t)$ and orbital velocity $\vec{v}_p(t)$.

### 2.1 Galilean State Transformations
$$\vec{r}' = \vec{r}_{sc} - \vec{r}_p, \quad \vec{v}' = \vec{v}_{sc} - \vec{v}_p$$
$$\vec{r}_{sc} = \vec{r}' + \vec{r}_p, \quad \vec{v}_{sc} = \vec{v}' + \vec{v}_p$$

### 2.2 Hyperbolic Excess Velocity Invariance in $S'$
Upon entry into the planet's sphere of influence (SOI):
$$\vec{v}_{\infty,\text{in}} = \vec{v}_{sc,\text{in}} - \vec{v}_p$$
Because the gravitational potential in $S'$ is static and conservative, specific orbital energy is conserved along the hyperbola:
$$\epsilon_{S'} = \frac{1}{2}(v')^2 - \frac{\mu_p}{r'} = \frac{1}{2} v_\infty^2 = \text{constant}$$
As $r' \to \infty$, the asymptotic speeds before and after flyby are strictly equal in magnitude:
$$|\vec{v}_{\infty,\text{out}}| = |\vec{v}_{\infty,\text{in}}| = v_\infty$$

### 2.3 Heliocentric Velocity & Kinetic Energy Boost in $S$
Returning to the heliocentric frame $S$:
$$\vec{v}_{sc,\text{out}} = \vec{v}_{\infty,\text{out}} + \vec{v}_p$$
The effective velocity boost is:
$$\Delta \vec{v} = \vec{v}_{sc,\text{out}} - \vec{v}_{sc,\text{in}} = \vec{v}_{\infty,\text{out}} - \vec{v}_{\infty,\text{in}}$$
The specific orbital energy change relative to the Sun is:
$$\Delta \epsilon_\odot = \frac{1}{2} v_{sc,\text{out}}^2 - \frac{1}{2} v_{sc,\text{in}}^2 = \vec{v}_p \cdot (\vec{v}_{\infty,\text{out}} - \vec{v}_{\infty,\text{in}}) = \vec{v}_p \cdot \Delta \vec{v}$$

---

## 3. Hyperbolic Flyby Geometry & Deflection Angle
Let $r_p$ be the closest approach distance (periapsis radius) and $\mu$ be the planet's gravitational parameter:
1. **Hyperbolic Eccentricity**:
   $$e = 1 + \frac{r_p v_\infty^2}{\mu} \quad (e > 1)$$
2. **Semi-Major Axis**:
   $$a = -\frac{\mu}{v_\infty^2}$$
3. **Turning / Deflection Angle**:
   $$\delta = 2 \arcsin\left(\frac{1}{e}\right)$$
4. **Impact Parameter**:
   $$b = |a| \sqrt{e^2 - 1} = \frac{\mu}{v_\infty^2} \sqrt{e^2 - 1} = r_p \sqrt{1 + \frac{2\mu}{r_p v_\infty^2}}$$
5. **Theoretical Maximum Heliocentric $\Delta v$**:
   $$\Delta v = 2 v_\infty \sin\left(\frac{\delta}{2}\right) = \frac{2 v_\infty}{e}$$

---

## 4. Custom Fourth-Order Runge-Kutta (RK4) Algorithm
For initial condition $\mathbf{y}(t_0) = \mathbf{y}_0$ and fixed step size $\Delta t$:
$$\begin{aligned}
\mathbf{k}_1 &= \mathbf{f}(t_n, \mathbf{y}_n) \\
\mathbf{k}_2 &= \mathbf{f}\left(t_n + \frac{\Delta t}{2}, \mathbf{y}_n + \frac{\Delta t}{2} \mathbf{k}_1\right) \\
\mathbf{k}_3 &= \mathbf{f}\left(t_n + \frac{\Delta t}{2}, \mathbf{y}_n + \frac{\Delta t}{2} \mathbf{k}_2\right) \\
\mathbf{k}_4 &= \mathbf{f}\left(t_n + \Delta t, \mathbf{y}_n + \Delta t \, \mathbf{k}_3\right) \\
\mathbf{y}_{n+1} &= \mathbf{y}_n + \frac{\Delta t}{6} (\mathbf{k}_1 + 2\mathbf{k}_2 + 2\mathbf{k}_3 + \mathbf{k}_4)
\end{aligned}$$
- Local truncation error: $\mathcal{O}(\Delta t^5)$
- Global truncation error: $\mathcal{O}(\Delta t^4)$

---

## 5. Observational Telemetry Error Formulations
For simulation state $\mathbf{y}_{\text{sim}}(t)$ and NASA JPL Horizons observation $\mathbf{y}_{\text{ref}}(t)$:
$$\text{RelError}_r(t) = \frac{|\vec{r}_{\text{sim}}(t) - \vec{r}_{\text{ref}}(t)|}{|\vec{r}_{\text{ref}}(t)|} \times 100\%$$
$$\text{RelError}_v(t) = \frac{|\vec{v}_{\text{sim}}(t) - \vec{v}_{\text{ref}}(t)|}{|\vec{v}_{\text{ref}}(t)|} \times 100\%$$
$$\text{RMSE}_r = \sqrt{\frac{1}{M} \sum_{k=1}^M |\vec{r}_{\text{sim}}(t_k) - \vec{r}_{\text{ref}}(t_k)|^2}$$
**SMART Project Criterion**: $\max_k \left( \text{RelError}(t_k) \right) < 5.0\%$.
