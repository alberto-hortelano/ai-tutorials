

## PS3 2.a — Vanishing Gradient en $L_G^{\text{minimax}}$

**Minimax loss del generador (eq. 7):**

$$L_G^{\text{minimax}}(\theta;\phi) = \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0,I)}[\log(1 - D_\phi(G_\theta(\mathbf{z})))]$$

**En términos de los logits del discriminador (eq. 8):**

$$L_G^{\text{minimax}}(\theta;\phi) = \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0,I)}[\log(1 - \sigma(h_\phi(G_\theta(\mathbf{z}))))]$$

**Dato útil:** $\sigma'(x) = \sigma(x)(1 - \sigma(x))$

**Inicio de la demostración (dado en el enunciado):**

$$\frac{\partial L_G^{\text{minimax}}}{\partial \theta} = $$

$$\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0,I)}\left[-\frac{\sigma'(h_\phi(G_\theta(\mathbf{z})))}{1 - \sigma(h_\phi(G_\theta(\mathbf{z})))} \frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z}))\right] = $$

$$\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0,I)}\left[-\frac{\sigma(h_\phi(G_\theta(\mathbf{z}))) (1 - \sigma(h_\phi(G_\theta(\mathbf{z}))))}{1 - \sigma(h_\phi(G_\theta(\mathbf{z})))}\frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z}))\right] = $$

$$\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0,I)}\left[-{\sigma(h_\phi(G_\theta(\mathbf{z})))}\frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z}))\right] \approx $$

$$\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0,I)}\left[-{0}\frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z}))\right] \approx 0$$

Explanation:
This is a problem because gradient tends to 0 when the result of the generator is bad and that limits it's hability to learn when it is at its worst. 