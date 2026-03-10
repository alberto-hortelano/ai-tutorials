# Ejercicio 4 — DDPM y DDIM

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: Modelos de difusion

Los modelos de difusion generan muestras empezando desde ruido puro y eliminando el ruido iterativamente, guiados por un modelo aprendido. Hay dos variantes principales:

1. **DDPM** (Denoising Diffusion Probabilistic Models): proceso reverso **estocastico** (Markoviano), tipicamente 1000 pasos
2. **DDIM** (Denoising Diffusion Implicit Models): proceso reverso **determinista** (no Markoviano), permite usar muchos menos pasos

Ambos comparten el mismo proceso forward y el mismo modelo entrenado (una UNet que predice ruido). La diferencia esta en **como se usa** ese modelo para generar.

---

## Background: Proceso Forward

### Noise schedule

Se define un **noise schedule** $\{\beta_t\}_{t=1}^T$ y se calcula $\alpha_t = 1 - \beta_t$.

El proceso forward anade ruido gradualmente:

$$q(x_t \mid x_{t-1}) = \mathcal{N}(x_t; \sqrt{\alpha_t} \, x_{t-1}, (1 - \alpha_t) I)$$

### Notacion acumulada

$$\bar{\alpha}_t = \prod_{s=1}^{t} \alpha_s$$

Esto permite saltar directamente del dato original $x_0$ a cualquier paso $t$:

$$q(x_t \mid x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} \, x_0, (1 - \bar{\alpha}_t) I)$$

| Simbolo | Significado |
|---------|-------------|
| $\beta_t$ | **Varianza del ruido** anadido en el paso $t$. Tipicamente pequeno (0.0001 a 0.02). |
| $\alpha_t = 1 - \beta_t$ | **Factor de retencion** de la senal. Cercano a 1 al principio, menor al final. |
| $\bar{\alpha}_t$ | **Producto acumulado** de todos los $\alpha_s$ hasta $t$. Mide cuanta senal original queda en $x_t$. |
| $x_T$ | Despues de $T$ pasos, es aproximadamente **ruido Gaussiano puro** ($\bar{\alpha}_T \approx 0$). |

---

## Background: Proceso Reverse y prediccion de $x_0$

### El modelo

La red neuronal $\epsilon_\theta(x_t, t)$ predice el **ruido** $\epsilon$ que se anadio para llegar de $x_0$ a $x_t$. Con esa prediccion, podemos estimar $x_0$:

$$x_0 \approx \frac{x_t - \sqrt{1 - \bar{\alpha}_t} \, \epsilon_\theta(x_t, t)}{\sqrt{\bar{\alpha}_t}}$$

### Como se lee

> "La estimacion de $x_0$ se obtiene restando el ruido predicho (escalado) de $x_t$ y dividiendo por el factor de retencion de senal."

| Simbolo | Significado |
|---------|-------------|
| $\epsilon_\theta(x_t, t)$ | **Prediccion de ruido** de la UNet. Toma la imagen ruidosa $x_t$ y el timestep $t$. |
| $\sqrt{1 - \bar{\alpha}_t}$ | Factor de escala del ruido en $x_t$. |
| $\sqrt{\bar{\alpha}_t}$ | Factor de escala de la senal en $x_t$. |

---

## Apartado (a) — [17 puntos, Codigo]

> *"Sampling using Vanilla DDPM and DDIM."*

### Posterior del forward process (DDPM)

Para DDPM, la distribucion posterior del paso forward, dados $x_t$ y $x_0$, es:

$$q(x_{t-1} \mid x_t, x_0) = \mathcal{N}(x_{t-1}; \tilde{\mu}_t, \tilde{\beta}_t I)$$

con:

$$\tilde{\mu}_t = \frac{\sqrt{\bar{\alpha}_{t-1}} \beta_t}{1 - \bar{\alpha}_t} x_0 + \frac{\sqrt{\alpha_t}(1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t} x_t$$

$$\tilde{\beta}_t = \frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \beta_t$$

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\tilde{\mu}_t$ | **Media de la posterior**: promedio ponderado entre $x_0$ (estimado) y $x_t$ (observado). |
| $\tilde{\beta}_t$ | **Varianza de la posterior**: determina cuanto ruido se inyecta en el paso reverso. |
| $\frac{\sqrt{\bar{\alpha}_{t-1}} \beta_t}{1 - \bar{\alpha}_t}$ | Peso de $x_0$ en la media. |
| $\frac{\sqrt{\alpha_t}(1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t}$ | Peso de $x_t$ en la media. |

### DDIM Sampling

DDIM usa un atajo determinista:

$$x_{t-1} = \sqrt{\bar{\alpha}_{t-1}} \, x_0 + \sqrt{1 - \bar{\alpha}_{t-1}} \, \epsilon_\theta(x_t, t)$$

Es el caso especial de la formula (16) del paper de DDIM con $\eta = 0$ (sin ruido).

### Funciones a implementar

En `sample.py`:

| Funcion | ¿Que calcula? |
|---------|---------------|
| `get_timesteps` | Seleccionar los timesteps para el sampling (subconjunto uniforme de $\{1, \ldots, T\}$) |
| `predict_x0` | Estimar $x_0$ a partir de $x_t$ y la prediccion de ruido |
| `compute_forward_posterior_mean` | $\tilde{\mu}_t$ (media de la posterior del forward) |
| `compute_forward_posterior_variance` | $\tilde{\beta}_t$ (varianza de la posterior del forward) |
| `ddim_inference` | El paso DDIM: $x_{t-1} = \sqrt{\bar{\alpha}_{t-1}} x_0 + \sqrt{1 - \bar{\alpha}_{t-1}} \epsilon$ |

### Ejecucion

```
python run_sampling.py --dataset mnist --experiment ddpm
python run_sampling.py --dataset mnist --experiment ddim
```

Con `num_steps=5, 10, 20, 50` para DDIM. DDPM usa 1000 pasos por defecto.

---

## Apartado (b) — [9.5 puntos, Codigo]

> *"DDIM as Markovian Process."*

### Contexto

DDIM vanilla ($\eta = 0$) es **determinista**: dado el mismo $x_T$, siempre genera la misma imagen. Para hacerlo estocastico (Markoviano), introducimos un parametro $\sigma_t$ que controla cuanto ruido se inyecta:

$$x_{t-1} = \sqrt{\bar{\alpha}_{t-1}} \, x_0 + \underbrace{\sqrt{1 - \bar{\alpha}_{t-1} - \sigma_t^2} \, \epsilon}_\text{predict\_sample\_direction} + \underbrace{\sigma_t z}_\text{stochasticity\_term}$$

donde $z \sim \mathcal{N}(0, I)$.

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\sigma_t$ | **Parametro de estocasticidad**. Controla cuanto ruido se anade en el paso reverso. |
| $\eta$ | Hiperparametro que escala $\sigma_t$. Con $\eta = 0$ recuperamos DDIM determinista; con $\eta = 1$ y $T$ pasos recuperamos DDPM. |
| $\sqrt{1 - \bar{\alpha}_{t-1} - \sigma_t^2}$ | Factor de escala de la **direccion de la muestra** (predict_sample_direction). |
| $\sigma_t z$ | **Termino de estocasticidad**: ruido Gaussiano escalado. |
| $z \sim \mathcal{N}(0, I)$ | Ruido Gaussiano estandar fresco (independiente en cada paso). |

### Funciones a implementar

En `sample.py`:

| Funcion | ¿Que calcula? |
|---------|---------------|
| `get_stochasticity_std` | $\sigma_t$ segun la formula del paper DDIM (depende de $\eta$, $\bar{\alpha}_t$, $\bar{\alpha}_{t-1}$) |
| `predict_sample_direction` | El termino $\sqrt{1 - \bar{\alpha}_{t-1} - \sigma_t^2} \, \epsilon$ |
| `stochasticity_term` | El termino $\sigma_t z$ |

### Ejecucion

```
python run_sampling.py --dataset mnist --experiment ddim
```

Con `eta=0, 0.2, 0.5, 0.75, 1` y `num_steps=10`.

### Espectro DDIM-DDPM

```
eta = 0:    DDIM puro (determinista)
            |
eta = 0.5:  Intermedio (algo de ruido)
            |
eta = 1:    DDPM puro (totalmente estocastico, con T pasos)
```

---

## Apartado (c) — [2 puntos, Escrito]

> *"What differences in sample quality and speed do you observe between DDPM and DDIM sampling?"*

### ¿Que pide?

Comparar cualitativamente los resultados de DDPM (1000 pasos) vs DDIM (5-50 pasos), observando:

1. **Calidad visual** de las muestras generadas
2. **Velocidad** de generacion (tiempo de inferencia)
3. El trade-off entre ambos

---

## Resumen del ejercicio 4

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Codigo | 17 | Implementar sampling DDPM y DDIM |
| (b) | Codigo | 9.5 | Implementar DDIM Markoviano con $\sigma_t$ y $\eta$ |
| (c) | Escrito | 2 | Comparar DDPM vs DDIM (calidad y velocidad) |
| **Total** | | **28.5** | |

### Conceptos clave del ejercicio

1. El **proceso forward** destruye la senal anadiendo ruido; el **reverse** la reconstruye
2. $\bar{\alpha}_t$ resume cuanta senal original queda en el paso $t$
3. El modelo $\epsilon_\theta$ predice **el ruido anadido**, no la imagen limpia directamente
4. **DDPM** inyecta ruido en cada paso reverso (estocastico, 1000 pasos)
5. **DDIM** no inyecta ruido ($\eta = 0$), permitiendo sampling determinista con muchos menos pasos
6. El parametro $\eta$ interpola continuamente entre DDIM ($\eta = 0$) y DDPM ($\eta = 1$)
