# Ejercicio 2 — Generative adversarial networks (GANs)

Este documento explica **qué significa cada parte del enunciado**, no cómo resolverlo.

---

## Contexto: ¿Qué es una GAN?

En el ejercicio 1 trabajamos con **normalizing flows** (MAF), un modelo generativo que aprende una distribución $p(\mathbf{x})$ directamente mediante transformaciones invertibles. Los flows nos dan densidades exactas, pero exigen que las transformaciones sean invertibles y con Jacobiano tratable.

Las **GANs** (Generative Adversarial Networks) toman un enfoque completamente distinto: en lugar de modelar la densidad explícitamente, entrenan un **generador** que aprende a producir muestras realistas, y un **discriminador** que aprende a distinguir muestras reales de falsas. Es un juego entre dos redes neuronales.

```
                    z ~ N(0, I)
                        │
                        ▼
                   ┌───────────┐
                   │ Generador │
                   │   G_θ     │
                   └─────┬─────┘
                         │
                    G_θ(z) = "imagen falsa"
                         │
         ┌───────────────┼───────────────┐
         │                               │
    datos reales                    datos falsos
    x ~ p_data(x)                   G_θ(z)
         │                               │
         └───────────┬───────────────────┘
                     ▼
              ┌───────────────┐
              │ Discriminador │
              │     D_φ       │
              └──────┬────────┘
                     │
              D_φ(x) ∈ (0, 1)
         "probabilidad de que x sea real"
```

La clave: el generador intenta **engañar** al discriminador, y el discriminador intenta **no dejarse engañar**. Al entrenarlos juntos, el generador mejora progresivamente hasta producir muestras que el discriminador no puede distinguir de las reales.

---

## Ecuación 4 — La función sigmoide

$$\sigma(x) = \frac{1}{1 + e^{-x}}$$

### Cómo se lee

> "Sigma de $x$ es igual a 1 dividido por 1 más $e$ elevado a menos $x$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\sigma(x)$ | La **función sigmoide**. Toma cualquier número real $x \in \mathbb{R}$ y lo "aplasta" al intervalo $(0, 1)$. |
| $e^{-x}$ | La **exponencial negativa**. Cuando $x$ es muy grande y positivo, $e^{-x} \approx 0$ y $\sigma(x) \approx 1$. Cuando $x$ es muy negativo, $e^{-x}$ es enorme y $\sigma(x) \approx 0$. |

### Intuición

La sigmoide convierte un número real cualquiera en algo que parece una probabilidad (entre 0 y 1). Es la última capa del discriminador: si $\sigma(x) \approx 1$, el discriminador cree que la entrada es real; si $\sigma(x) \approx 0$, cree que es falsa.

```
σ(x)
1.0 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╭────
                                        ╱
0.5 ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ╱
                                  ╱
0.0 ────────────────────────────╯─ ─ ─ ─ ─ ─
    -6  -4  -2   0   2   4   6        x
```

---

## Notación: logits vs probabilidades

El enunciado define:

$$D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$$

| Símbolo | Significado |
|---------|-------------|
| $D_\phi(\mathbf{x})$ | La **salida del discriminador**: una probabilidad en $(0, 1)$. Valores cercanos a 1 = "creo que es real". |
| $h_\phi(\mathbf{x})$ | Los **logits** del discriminador: la activación **antes** de aplicar la sigmoide. Es un número real sin restricciones ($\in \mathbb{R}$). |
| $\phi$ | Los **parámetros** (pesos) de la red neuronal del discriminador. |

Los logits son la "opinión cruda" del discriminador. La sigmoide los convierte en probabilidad. Trabajar con logits es numéricamente más estable que trabajar con probabilidades directamente.

---

## Ecuación 5 — El esquema de entrenamiento alternado

$$\min_\phi L_D(\phi; \theta), \qquad \min_\theta L_G(\theta; \phi).$$

### Cómo se lee

> "Minimizar la pérdida del discriminador $L_D$ respecto a los parámetros $\phi$, y minimizar la pérdida del generador $L_G$ respecto a los parámetros $\theta$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\min_\phi$ | "Encontrar los $\phi$ que minimizan..." — se actualizan los pesos del discriminador. |
| $L_D(\phi; \theta)$ | **Pérdida del discriminador**. Depende de $\phi$ (que se optimiza) y de $\theta$ (que se trata como fijo en este paso). El punto y coma separa "variable a optimizar" de "parámetros fijos". |
| $\min_\theta$ | "Encontrar los $\theta$ que minimizan..." — se actualizan los pesos del generador. |
| $L_G(\theta; \phi)$ | **Pérdida del generador**. Depende de $\theta$ (que se optimiza) y de $\phi$ (que se trata como fijo en este paso). |

### Intuición

El entrenamiento de una GAN alterna entre dos pasos:

1. **Paso del discriminador**: fija el generador, mejora el discriminador para que distinga mejor entre real y falso.
2. **Paso del generador**: fija el discriminador, mejora el generador para que engañe mejor al discriminador.

```
Paso 1: Entrenar D        Paso 2: Entrenar G
(φ cambia, θ fijo)        (θ cambia, φ fijo)
         │                          │
         ▼                          ▼
   D mejora su                G mejora sus
   capacidad de               imágenes falsas
   distinguir                 para engañar a D
         │                          │
         └──────────┬───────────────┘
                    │
              Repetir...
```

---

## Ecuación 6 — La pérdida del discriminador

$$L_D(\phi; \theta) = -\mathbb{E}_{\mathbf{x} \sim p_{\text{data}}(\mathbf{x})}[\log D_\phi(\mathbf{x})] - \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}[\log(1 - D_\phi(G_\theta(\mathbf{z})))]$$

### Cómo se lee

> "La pérdida del discriminador es menos la esperanza, sobre datos reales, del log de la probabilidad que D asigna a que sean reales, menos la esperanza, sobre ruido $\mathbf{z}$, del log de la probabilidad que D asigna a que las muestras generadas sean falsas."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\mathbb{E}_{\mathbf{x} \sim p_{\text{data}}(\mathbf{x})}[\cdot]$ | **Esperanza sobre datos reales**. Promedia sobre muestras $\mathbf{x}$ del dataset real. |
| $\log D_\phi(\mathbf{x})$ | Log de la probabilidad que el discriminador asigna a que $\mathbf{x}$ sea real. Si $D_\phi(\mathbf{x}) \approx 1$ (correctamente real), este término es $\approx 0$. Si $D_\phi(\mathbf{x}) \approx 0$ (incorrectamente falso), es $\approx -\infty$. |
| $\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}[\cdot]$ | **Esperanza sobre ruido**. Promedia sobre vectores $\mathbf{z}$ muestreados de una Gaussiana estándar. |
| $G_\theta(\mathbf{z})$ | **Muestra generada**. El generador transforma el ruido $\mathbf{z}$ en una "imagen falsa". |
| $D_\phi(G_\theta(\mathbf{z}))$ | La probabilidad que el discriminador asigna a que la muestra generada sea real. |
| $\log(1 - D_\phi(G_\theta(\mathbf{z})))$ | Log de la probabilidad de que $G_\theta(\mathbf{z})$ sea **falsa** (según D). Si D la clasifica correctamente como falsa ($D \approx 0$), este término es $\approx 0$. |
| $-(\cdot) - (\cdot)$ | Los signos negativos hacen que **minimizar** $L_D$ sea equivalente a **maximizar** la capacidad del discriminador de clasificar correctamente. |

### Intuición

El discriminador quiere:
- $D_\phi(\mathbf{x}) \approx 1$ para datos **reales** → $\log D_\phi(\mathbf{x}) \approx 0$ (no hay penalización)
- $D_\phi(G_\theta(\mathbf{z})) \approx 0$ para datos **falsos** → $\log(1 - D_\phi(G_\theta(\mathbf{z}))) \approx 0$ (no hay penalización)

Si se equivoca en cualquiera de los dos, la pérdida se dispara (hacia $+\infty$ porque hay un signo negativo delante).

---

## Ecuación 7 — La pérdida minimax del generador

$$L_G^{\text{minimax}}(\theta; \phi) = \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}[\log(1 - D_\phi(G_\theta(\mathbf{z})))]$$

### Cómo se lee

> "La pérdida minimax del generador es la esperanza, sobre ruido $\mathbf{z}$, del log de la probabilidad de que las muestras generadas sean clasificadas como falsas por el discriminador."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $L_G^{\text{minimax}}$ | La pérdida del generador en la formulación **minimax** original de las GANs. El superíndice "minimax" la distingue de otras variantes. |
| $\log(1 - D_\phi(G_\theta(\mathbf{z})))$ | El mismo término que aparecía en $L_D$, pero ahora desde la perspectiva del generador. |

### Intuición

El generador quiere **minimizar** esta pérdida. Como $\log(1 - D_\phi(G_\theta(\mathbf{z})))$ es grande cuando el discriminador clasifica la muestra como falsa, el generador aprende a producir muestras que hagan $D_\phi(G_\theta(\mathbf{z})) \approx 1$ (que parezcan reales).

---

## Ecuación 8 — La pérdida minimax en términos de logits

$$L_G^{\text{minimax}}(\theta; \phi) = \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}[\log(1 - \sigma(h_\phi(G_\theta(\mathbf{z}))))]$$

### Cómo se lee

> "La pérdida minimax del generador, reescrita usando logits: es la esperanza del log de 1 menos la sigmoide aplicada a los logits del discriminador evaluados en la muestra generada."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\sigma(h_\phi(G_\theta(\mathbf{z})))$ | Primero el generador produce $G_\theta(\mathbf{z})$, luego el discriminador calcula sus logits $h_\phi(G_\theta(\mathbf{z}))$, y finalmente la sigmoide los convierte en probabilidad. Es lo mismo que $D_\phi(G_\theta(\mathbf{z}))$. |
| $1 - \sigma(\cdot)$ | La probabilidad complementaria: "probabilidad de que sea falso". |

Esta reescritura simplemente sustituye $D_\phi = \sigma(h_\phi)$ para hacer explícita la dependencia en los logits, que es necesaria para analizar los gradientes.

---

## Apartado (a) — [3 puntos, Escrito]

> *"Unfortunately, this form of loss for $L_G$ suffers from a vanishing gradient problem. In terms of the discriminator's logits, the minimax loss is"*
>
> $$L_G^{\text{minimax}}(\theta; \phi) = \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}[\log(1 - \sigma(h_\phi(G_\theta(\mathbf{z}))))]$$
>
> *"Show that the derivative of $L_G^{\text{minimax}}$ with respect to $\theta$ is approximately 0 if $D(G_\theta(\mathbf{z})) \approx 0$, or equivalently, if $h_\phi(G_\theta(\mathbf{z})) \ll 0$. You may use the fact that $\sigma'(x) = \sigma(x)(1 - \sigma(x))$. Why is this problematic for the training of the generator when the discriminator successfully identifies a fake sample $G_\theta(\mathbf{z})$?"*
>
> *"To help you start the proof: Using the chain rule and the fact that $\sigma'(x) = \sigma(x)(1 - \sigma(x))$,"*
>
> $$\frac{\partial L_G^{\text{minimax}}}{\partial \theta} = \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}\left[-\frac{\sigma'(h_\phi(G_\theta(\mathbf{z})))}{1 - \sigma(h_\phi(G_\theta(\mathbf{z})))} \frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z}))\right] = $$

### ¿Qué pide?

Te pide dos cosas:

1. **Demostrar** que el gradiente de $L_G^{\text{minimax}}$ respecto a $\theta$ se hace aproximadamente cero cuando $D(G_\theta(\mathbf{z})) \approx 0$ (es decir, cuando el discriminador está seguro de que la muestra es falsa).

2. **Explicar** por qué esto es un problema para el entrenamiento del generador.

### Símbolo por símbolo (de la expresión del gradiente)

| Símbolo | Significado |
|---------|-------------|
| $\frac{\partial L_G^{\text{minimax}}}{\partial \theta}$ | La **derivada parcial** de la pérdida del generador respecto a los parámetros $\theta$. Este es el gradiente que se usa para actualizar los pesos del generador. |
| $\sigma'(x)$ | La **derivada** de la sigmoide. Se da como dato que $\sigma'(x) = \sigma(x)(1 - \sigma(x))$. |
| $\frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z}))$ | La derivada de los logits del discriminador respecto a $\theta$, aplicando la regla de la cadena a través de $G_\theta$. |
| $h_\phi(G_\theta(\mathbf{z})) \ll 0$ | "$h_\phi$ evaluado en $G_\theta(\mathbf{z})$ es mucho menor que 0." Esto significa que el discriminador asigna logits muy negativos a la muestra generada, lo cual indica alta confianza de que es falsa. |

### ¿Qué es el "vanishing gradient"?

El **vanishing gradient** (gradiente que desaparece) es un problema donde los gradientes se hacen tan pequeños que los parámetros prácticamente dejan de actualizarse. En este contexto:

```
Situación:   D es bueno → detecta que G_θ(z) es falso → D(G_θ(z)) ≈ 0
                                                           │
                                                           ▼
Consecuencia: El gradiente de L_G respecto a θ ≈ 0
                                                           │
                                                           ▼
Problema:     G no recibe señal útil → no puede mejorar → se queda atascado
```

El generador necesita gradientes para aprender, pero justamente cuando más necesita aprender (cuando el discriminador lo está derrotando), los gradientes desaparecen.

### ¿Qué te dan como ayuda?

1. La **derivada de la sigmoide**: $\sigma'(x) = \sigma(x)(1 - \sigma(x))$
2. El **inicio de la derivación** aplicando la regla de la cadena al $\log(1 - \sigma(\cdot))$

---

## Ecuación 9 — La pérdida non-saturating del generador

$$L_G^{\text{non-saturating}}(\theta; \phi) = -\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, I)}[\log D_\phi(G_\theta(\mathbf{z}))]$$

### Cómo se lee

> "La pérdida non-saturating del generador es menos la esperanza, sobre ruido $\mathbf{z}$, del log de la probabilidad que el discriminador asigna a que la muestra generada sea real."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $L_G^{\text{non-saturating}}$ | La pérdida del generador en la variante **non-saturating**. Se llama así porque **no sufre** el problema de vanishing gradient del apartado (a). |
| $-\mathbb{E}[\cdot]$ | El signo negativo convierte la maximización de $\log D_\phi(G_\theta(\mathbf{z}))$ en una minimización. |
| $\log D_\phi(G_\theta(\mathbf{z}))$ | Log de la probabilidad de que el discriminador clasifique la muestra generada como **real**. |

### Intuición: minimax vs non-saturating

La diferencia es sutil pero importante:

| | Minimax | Non-saturating |
|--|---------|---------------|
| **Fórmula** | $\log(1 - D(G(\mathbf{z})))$ | $-\log D(G(\mathbf{z}))$ |
| **Perspectiva** | "Minimizar la probabilidad de que parezca falso" | "Maximizar la probabilidad de que parezca real" |
| **Gradiente cuando D gana** | $\approx 0$ (vanishing) | Grande (señal útil) |

```
Gradiente para G:

Minimax:                          Non-saturating:
∂/∂θ [log(1 - D(G(z)))]         ∂/∂θ [-log(D(G(z)))]

Cuando D(G(z)) ≈ 0:              Cuando D(G(z)) ≈ 0:
  gradiente ≈ 0  (atascado)        gradiente grande (aprende)

Cuando D(G(z)) ≈ 1:              Cuando D(G(z)) ≈ 1:
  gradiente grande                  gradiente ≈ 0  (ya está bien)
```

La pérdida non-saturating da gradientes fuertes **justamente cuando el generador más los necesita** (cuando el discriminador lo está derrotando).

---

## Ecuaciones 10-11 — Estimaciones Monte Carlo de las pérdidas

$$L_D(\phi; \theta) \approx -\frac{1}{m} \sum_{i=1}^{m} \log D_\phi\left(\mathbf{x}^{(i)}\right) - \frac{1}{m} \sum_{i=1}^{m} \log\left(1 - D_\phi\left(G_\theta\left(\mathbf{z}^{(i)}\right)\right)\right)$$

$$L_G^{\text{non-saturating}}(\theta; \phi) \approx -\frac{1}{m} \sum_{i=1}^{m} \log D_\phi\left(G_\theta\left(\mathbf{z}^{(i)}\right)\right)$$

### Cómo se leen

> "La pérdida del discriminador se aproxima como el promedio, sobre $m$ muestras reales y $m$ muestras de ruido, de los términos de clasificación real/falso."
>
> "La pérdida non-saturating del generador se aproxima como menos el promedio, sobre $m$ muestras de ruido, del log de la probabilidad de que las muestras generadas parezcan reales."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $m$ | El **tamaño del batch** (mini-batch). Número de muestras usadas para estimar la esperanza. |
| $\mathbf{x}^{(i)} \sim p_{\text{data}}(\mathbf{x})$ | La $i$-ésima muestra **real** del dataset. |
| $\mathbf{z}^{(i)} \sim \mathcal{N}(0, I)$ | El $i$-ésimo vector de **ruido** muestreado de la Gaussiana estándar. |
| $\frac{1}{m} \sum_{i=1}^{m}$ | **Promedio empírico**: la forma práctica de estimar una esperanza con muestras finitas. |
| $\approx$ | Es una **aproximación** (estimación Monte Carlo), no una igualdad exacta. Se vuelve exacta cuando $m \to \infty$. |

### Intuición

Las ecuaciones 6, 7 y 9 usan **esperanzas** (que requieren integrar sobre todas las posibles $\mathbf{x}$ o $\mathbf{z}$). En la práctica, aproximamos estas esperanzas con **promedios sobre mini-batches**: muestreamos $m$ datos reales y $m$ vectores de ruido, y promediamos.

---

## Apartado (b) — [7 puntos, Código]

> *"Implement and train a non-saturating GAN on Fashion MNIST for one epoch. Read through `main.py`, and in `submission/gan.py`, implement the `loss_nonsaturating_g` and `loss_nonsaturating_d` functions."*
>
> *"To train the model, execute:"*
> ```
> python main.py --model gan --out_dir gan_nonsat
> ```
>
> *"Hint: Note that $1 - \sigma(x) = \sigma(-x)$."*

### ¿Qué pide?

Implementar dos funciones en `submission/gan.py`:

1. **`loss_nonsaturating_g`**: La pérdida del generador (ecuación 11).
2. **`loss_nonsaturating_d`**: La pérdida del discriminador (ecuación 10).

Y entrenar el modelo un epoch en Fashion MNIST.

### Funciones a implementar

| Función | Ecuación | ¿Qué calcula? |
|---------|----------|---------------|
| `loss_nonsaturating_d` | Ec. 10 | Pérdida del discriminador: penaliza cuando clasifica mal datos reales o falsos |
| `loss_nonsaturating_g` | Ec. 11 | Pérdida del generador: penaliza cuando el discriminador detecta las muestras falsas |

### La pista: $1 - \sigma(x) = \sigma(-x)$

El enunciado da la identidad:

$$1 - \sigma(x) = \sigma(-x)$$

Esto es una propiedad de la función sigmoide. Puedes verificarlo:

$$1 - \frac{1}{1 + e^{-x}} = \frac{e^{-x}}{1 + e^{-x}} = \frac{1}{1 + e^{x}} = \sigma(-x)$$

Esta identidad es útil porque en PyTorch, `F.logsigmoid(x)` calcula $\log \sigma(x)$ de forma numéricamente estable. Usando la identidad, $\log(1 - \sigma(x)) = \log \sigma(-x)$, que también se puede calcular de forma estable.

### ¿Qué se espera ver?

Las muestras generadas (en `gan_nonsat/`) deberían parecerse vagamente a prendas de ropa del dataset Fashion MNIST. No serán perfectas (solo se entrena un epoch), pero deberían ser reconocibles.

---

## Resumen del ejercicio 2

| Apartado | Tipo | Puntos | ¿Qué hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 3 | Demostrar que el gradiente de $L_G^{\text{minimax}}$ se anula cuando $D(G_\theta(\mathbf{z})) \approx 0$ y explicar por qué es problemático |
| (b) | Código | 7 | Implementar `loss_nonsaturating_g` y `loss_nonsaturating_d` en `gan.py` y entrenar en Fashion MNIST |
| **Total** | | **10** | |

### Conceptos clave del ejercicio

1. **Generador vs Discriminador**: dos redes que se entrenan de forma alternada, una generando y otra clasificando
2. **Logits**: la activación antes de la sigmoide; trabajar con logits es numéricamente más estable
3. **Vanishing gradient**: la pérdida minimax da gradientes nulos cuando el discriminador gana, paralizando al generador
4. **Non-saturating loss**: reemplaza $\log(1 - D)$ por $-\log D$ para que el generador reciba gradientes útiles incluso cuando el discriminador es bueno
5. **Estimación Monte Carlo**: las esperanzas teóricas se aproximan con promedios sobre mini-batches
