# f-Divergencias

## Intuicion: Que problema resuelve?

KL, Jensen-Shannon, variacion total, chi-cuadrado... todas miden "distancia" entre distribuciones, pero parecen formulas completamente distintas. Son realmente casos especiales de algo mas general? Si: las **f-divergencias** son una familia unificada. Cada eleccion de una funcion convexa $f$ genera una divergencia diferente.

## Analogia

Piensa en las f-divergencias como una familia de reglas para medir distancia entre distribuciones. Todas las reglas comparten el mismo plano: tomar el ratio de densidades $P(x)/Q(x)$, aplicarle una funcion $f$, y promediar bajo $Q$. Pero cada regla (cada $f$) mide de forma diferente -- unas son mas sensibles a las colas, otras al centro.

## Construyendo la idea paso a paso

### Paso 1: La definicion general

$$D_f(P \| Q) = \mathbb{E}_{x \sim Q}\left[f\left(\frac{P(x)}{Q(x)}\right)\right]$$

donde $f$ es una funcion convexa con $f(1) = 0$.

Como se lee: "La f-divergencia de P respecto a Q es la esperanza, bajo Q, de $f$ aplicada al ratio de densidades $P(x)/Q(x)$."

La condicion $f(1) = 0$ garantiza que cuando $P = Q$ (ratio = 1 en todos lados), la divergencia sea cero. La convexidad de $f$ garantiza que siempre sea no negativa (por la desigualdad de Jensen).

### Paso 2: Tabla de funciones generadoras

Cada eleccion de $f(t)$ produce una divergencia conocida. Esta tabla incluye todas las que aparecen en las slides del Mod5:

| Divergencia | $f(t)$ | $f^*(u)$ (conjugada) |
|---|---|---|
| KL forward $D_\text{KL}(P\|Q)$ | $t \log t$ | $e^{u-1}$ |
| KL reverse $D_\text{KL}(Q\|P)$ | $-\log t$ | $-1 - \log(-u)$ |
| Jensen-Shannon | $-(t+1)\log\frac{t+1}{2} + t \log t$ | $-\log(2 - e^u)$ |
| Variacion total (TV) | $\frac{1}{2}|t - 1|$ | $u$, con $u \in [-\frac{1}{2}, \frac{1}{2}]$ |
| Pearson $\chi^2$ | $(t-1)^2$ | $\frac{u^2}{4} + u$ |
| Neyman $\chi^2$ | $\frac{(1-t)^2}{t}$ | $2 - 2\sqrt{1-u}$ |
| Squared Hellinger | $(\sqrt{t} - 1)^2$ | $\frac{u}{1-u}$, con $u < 1$ |
| Jeffrey | $(t-1)\log t$ | (no tiene forma cerrada simple) |
| $\alpha$-divergencia | $\frac{t^\alpha - 1}{\alpha(\alpha-1)}$ (para $\alpha \notin \{0,1\}$) | Depende de $\alpha$ |
| GAN (Goodfellow) | $t \log t - (1+t)\log\frac{1+t}{2}$ | $-\log(2-e^u)$ |

### Paso 3: Propiedades compartidas

Todas las f-divergencias comparten estas propiedades por construccion:

- **No negativas**: $D_f(P \| Q) \geq 0$ (por la desigualdad de Jensen y la convexidad de $f$)
- **Cero sii $P = Q$**: $D_f(P \| Q) = 0 \iff P = Q$ (si $f$ es estrictamente convexa en $t = 1$)
- **No todas son simetricas**: KL no lo es, pero JSD y variacion total si lo son
- **Invariantes a reparametrizacion**: solo dependen de las distribuciones, no de como parametrices el espacio

### Paso 4: La conjugada de Fenchel

La **conjugada convexa** (transformada de Fenchel-Legendre) de $f$ se define como:

$$f^*(u) = \sup_{t \in \text{dom}(f)} \left(ut - f(t)\right)$$

Como se lee: "efe-estrella de u es el supremo sobre t de u-por-t menos efe de t."

Que significa: para cada $u$, buscamos la recta $ut$ que esta lo mas por encima posible de $f(t)$, y $f^*(u)$ es esa distancia maxima. Si $f$ es convexa y semicontinua inferior, se cumple la **dualidad fuerte**: $f^{**} = f$, es decir, aplicar la conjugada dos veces recupera la funcion original.

### Paso 5: Cota variacional y f-GANs

Calcular $D_f$ directamente requiere conocer $P$ y $Q$ explicitamente. Pero en GANs, solo tenemos muestras. Usando la conjugada de Fenchel y la dualidad fuerte ($f = f^{**}$):

$$D_f(P \| Q) = \sup_{T}\left(\mathbb{E}_{x \sim P}[T(\mathbf{x})] - \mathbb{E}_{x \sim Q}[f^*(T(\mathbf{x}))]\right)$$

La igualdad se alcanza cuando $T^*(x) = f'(P(x)/Q(x))$. En la practica, parametrizamos $T$ con una red neuronal $T_\phi$ y obtenemos una cota inferior (porque la red no puede representar $T^*$ exactamente). Este es el fundamento de los **f-GANs**:

$$\min_\theta \max_\phi \; \mathbb{E}_{x \sim p_\text{data}}[T_\phi(\mathbf{x})] - \mathbb{E}_{x \sim p_{G_\theta}}[f^*(T_\phi(\mathbf{x}))]$$

Cada eleccion de $f$ (y su conjugada $f^*$) produce un objetivo de entrenamiento diferente para el discriminador.

## Propiedades clave

| Propiedad | Significado |
|---|---|
| $D_f(P \| Q) \geq 0$ | No negativa (por Jensen + convexidad) |
| $D_f(P \| Q) = 0 \iff P = Q$ | Identidad de indiscernibles |
| No requiere simetria | Depende de la eleccion de $f$ |
| Cota variacional via $f^*$ | Permite estimacion con muestras (f-GANs) |
| Invariante a reparametrizacion | No depende de la representacion del espacio |

## Pregunta socratica

Si eliges $f(t) = t \log t$ (KL forward), cual es la conjugada $f^*(s)$? Y como se ve el objetivo del f-GAN resultante comparado con el GAN original de Goodfellow? Piensa en que funcion de activacion necesitaria la capa final del discriminador.

Cross-links: [KL-Divergence.md](KL-Divergence.md), [Divergencia-de-Jensen-Shannon.md](Divergencia-de-Jensen-Shannon.md), [Distancia-de-Wasserstein.md](Distancia-de-Wasserstein.md)
