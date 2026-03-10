# Modelos Basados en Energia (Energy-Based Models)

## Intuicion: Que problema resuelve?

Todos los modelos generativos que hemos visto (autoregresivos, VAEs, flows) imponen restricciones arquitectonicas especificas para que la verosimilitud sea tratable. Que pasa si queremos maxima flexibilidad para definir $p_\theta(x)$? Los modelos basados en energia (EBMs) nos permiten definir CUALQUIER funcion $E_\theta(x)$ como una "energia" y convertirla en una distribucion de probabilidad.

## Analogia

Piensa en una pelota sobre un paisaje montanoso. La pelota naturalmente rueda hacia los puntos mas bajos (valles = baja energia = alta probabilidad). Las montanas altas = alta energia = baja probabilidad. La funcion de energia define la forma del paisaje, y la fisica (la distribucion de Boltzmann) convierte energias en probabilidades.

## Construyendo la idea paso a paso

### Paso 1: De energia a probabilidad

$$p_\theta(\mathbf{x}) = \frac{1}{Z_\theta} \exp(-E_\theta(\mathbf{x}))$$

Como se lee: p-theta de x es igual a uno sobre Z-theta por la exponencial de menos E-theta de x.

Que significa: Los puntos con baja energia tienen alta probabilidad, y viceversa. Z normaliza para que sume/integre a 1.

| Simbolo | Significado |
|---|---|
| $E_\theta(\mathbf{x})$ | Funcion de energia. Puede ser CUALQUIER red neuronal. Menor energia = mas probable. |
| $Z_\theta$ | Funcion de particion: $Z_\theta = \int \exp(-E_\theta(\mathbf{x})) d\mathbf{x}$. Constante de normalizacion. |
| $\exp(-\cdot)$ | La exponencial negativa convierte energias en "pesos" no negativos. |

### Paso 2: El problema fundamental — $Z_\theta$ es intratable

Calcular $Z_\theta = \int \exp(-E_\theta(\mathbf{x})) d\mathbf{x}$ requiere integrar sobre TODOS los posibles $\mathbf{x}$. En dimensiones altas, esto es intratable (similar al problema en VAEs, pero aqui no hay un atajo tipo ELBO para la verosimilitud en si).

### Paso 3: El gradiente de MLE para EBMs

Aunque $Z_\theta$ es intratable, el gradiente de la log-verosimilitud tiene una forma interesante:

$$\nabla_\theta \log p_\theta(\mathbf{x}) = -\nabla_\theta E_\theta(\mathbf{x}) + \mathbb{E}_{\mathbf{x}' \sim p_\theta}[\nabla_\theta E_\theta(\mathbf{x}')]$$

Como se lee: "El gradiente de log p es el negativo del gradiente de la energia en el dato real, mas la esperanza del gradiente de la energia bajo el modelo."

Que significa: el primer termino "baja la energia" de los datos reales (haciendolos mas probables), y el segundo "sube la energia" de las muestras del modelo (haciendolas menos probables). Pero el segundo termino requiere **muestrear del propio modelo** $p_\theta$, lo cual necesita MCMC.

### Paso 4: Cuatro formas de entrenar sin calcular $Z$ exactamente

**Contrastive Divergence (CD):** Aproximar la esperanza bajo $p_\theta$ usando pocas iteraciones de MCMC (tipicamente 1) en vez de correr la cadena hasta convergencia. CD-$k$ usa $k$ pasos de Gibbs sampling o Langevin dynamics.

**Score Matching:** En vez de igualar $p_\theta(x)$ con $p_\text{data}(x)$, igualar sus SCORES: $\nabla_x \log p_\theta(x) = -\nabla_x E_\theta(x)$ (la $Z$ se cancela!).

**Noise Contrastive Estimation (NCE):** Entrenar un clasificador binario para distinguir datos reales de ruido artificial $q(\mathbf{x})$ (e.g., Gaussiana). Si el clasificador es $D(\mathbf{x}) = \sigma(\log p_\theta(\mathbf{x}) - \log q(\mathbf{x}))$, entrenarlo es equivalente a estimar $\log p_\theta$ hasta una constante. NCE transforma el problema de estimacion de densidad en un problema de **clasificacion**.

**Denoising Score Matching (DSM):** Corromper datos con ruido y entrenar el modelo a predecir el score de la distribucion ruidosa. Evita tanto $Z$ como la traza del Jacobiano.

### Paso 4: Muestreo — Langevin Dynamics

Para muestrear de un EBM, usamos el score:

$$\mathbf{x}_{t+1} = \mathbf{x}_t + \frac{\eta}{2} \nabla_\mathbf{x} \log p_\theta(\mathbf{x}_t) + \sqrt{\eta} \cdot \boldsymbol{\epsilon}_t$$

donde $\boldsymbol{\epsilon}_t \sim \mathcal{N}(0, I)$. Seguimos el gradiente cuesta arriba (hacia alta densidad) con algo de ruido para exploracion.

### Paso 5: Conexion con score-based models

Como $\nabla_x \log p_\theta(x) = -\nabla_x E_\theta(x)$ (la Z se cancela), entrenar un modelo de score es equivalente a entrenar un EBM donde solo nos importa la FORMA del paisaje de energia, no sus valores absolutos.

## Propiedades clave

| Propiedad | Significado |
|---|---|
| $E_\theta$ puede ser cualquier funcion | Maxima flexibilidad arquitectonica |
| $Z_\theta$ es intratable | No podemos evaluar $p_\theta(x)$ exactamente |
| El score no depende de $Z$ | $\nabla_x \log p_\theta = -\nabla_x E_\theta$; entrenamiento via score matching es posible |
| Gradiente MLE necesita muestras del modelo | $\nabla_\theta \log p = -\nabla_\theta E(x_\text{real}) + \mathbb{E}_{p_\theta}[\nabla_\theta E]$ |
| Muestreo via MCMC/Langevin | Lento comparado con flows o VAEs |
| NCE como alternativa a MLE | Transforma estimacion de densidad en clasificacion binaria |
| Relacion con fisica estadistica | Distribucion de Boltzmann: baja energia = alta probabilidad |

## Por que aparece en generative models?

Los EBMs son el puente conceptual entre los modelos probabilisticos clasicos y los modelos basados en score/difusion. Entender que "no necesitamos Z si solo necesitamos gradientes" es la intuicion clave que lleva al score matching y, en ultima instancia, a los modelos de difusion.

Te pregunto: Si podemos entrenar un EBM con score matching (sin calcular $Z$), eso significa que nunca necesitamos $Z$? En que situaciones si necesitariamos calcularlo? (Pista: piensa en que operaciones requieren la densidad absoluta $p(x)$ y no solo el gradiente.)

## Visualizaciones interactivas

- [Langevin Dynamics](/interactives/langevin_dynamics.html) — Muestreo MCMC usando el score: particulas se mueven por el campo de gradientes hasta converger a la distribucion objetivo

---

Cross-links: [Funcion-Score.md](Funcion-Score.md), [score_matching.md](score_matching.md), [MLE-Maximum-Likelihood-Estimation.md](MLE-Maximum-Likelihood-Estimation.md), [KL-Divergence.md](KL-Divergence.md)
