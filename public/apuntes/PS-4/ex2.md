# Ejercicio 2 — Concrete Score Matching

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: Score matching para datos discretos

El score matching clasico (ejercicio 1) esta disenado para distribuciones **continuas** — el gradiente $\nabla_x \log p(x)$ requiere que $x$ sea continuo. Pero muchos datos reales son **discretos** (texto, secuencias binarias, grafos, etc.).

**Concrete Score Matching** extiende la idea de score matching a datos discretos reemplazando el gradiente continuo por un concepto analogo basado en **vecindarios**.

### Espacio discreto

Trabajamos con el espacio $\mathcal{X} = \{0, 1\}^d$: vectores binarios de dimension $d$. Cada $\mathbf{x}$ es una secuencia de $d$ bits.

---

## Ecuacion 2 — Vecindario por distancia de Hamming

$$\mathcal{N}(\mathbf{x}) = \{\mathbf{x}' \in \mathcal{X} : \text{Hamming}(\mathbf{x}, \mathbf{x}') = 1\}$$

### Como se lee

> "El vecindario de $\mathbf{x}$ es el conjunto de todos los vectores binarios que difieren de $\mathbf{x}$ en exactamente un bit."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\mathcal{N}(\mathbf{x})$ | **Vecindario** de $\mathbf{x}$. No confundir con la distribucion normal $\mathcal{N}$. Aqui $\mathcal{N}$ es una funcion que mapea cada punto a sus vecinos. |
| $\text{Hamming}(\mathbf{x}, \mathbf{x}')$ | **Distancia de Hamming**: numero de posiciones en las que $\mathbf{x}$ y $\mathbf{x}'$ difieren. |
| $= 1$ | Los vecinos difieren en **exactamente un bit**. |

### Ejemplo

Si $d = 3$ y $\mathbf{x} = (0, 1, 0)$:

$$\mathcal{N}(\mathbf{x}) = \{(1,1,0), \ (0,0,0), \ (0,1,1)\}$$

El tamano del vecindario siempre es $|\mathcal{N}(\mathbf{x})| = d$ (hay $d$ bits que podemos flipear).

---

## Ecuacion 3 — Concrete Score

$$c_{p_\text{data}}(\mathbf{x}; \mathcal{N}) \triangleq \left[ \frac{p_\text{data}(\mathbf{x}_{n_1}) - p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x})}, \ldots, \frac{p_\text{data}(\mathbf{x}_{n_K}) - p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x})} \right]^\top$$

### Como se lee

> "El concrete score de $\mathbf{x}$ es un vector donde cada componente mide el cambio relativo en probabilidad al moverse de $\mathbf{x}$ a cada uno de sus vecinos."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $c_{p_\text{data}}(\mathbf{x}; \mathcal{N})$ | El **concrete score** de $\mathbf{x}$ respecto a la distribucion de datos. Es un vector de dimension $K = |\mathcal{N}(\mathbf{x})| = d$. |
| $\mathbf{x}_{n_k}$ | El $k$-esimo **vecino** de $\mathbf{x}$ (el vector que se obtiene flipeando el $k$-esimo bit). |
| $\frac{p_\text{data}(\mathbf{x}_{n_k}) - p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x})}$ | **Cambio relativo de probabilidad** al ir de $\mathbf{x}$ a su vecino $\mathbf{x}_{n_k}$. Si es positivo, el vecino tiene mayor probabilidad; si es negativo, menor. |
| $\triangleq$ | "Se define como" (notacion de definicion). |

### Analogia con el gradiente continuo

En el caso continuo, $\nabla_x \log p(x) = \frac{\nabla_x p(x)}{p(x)}$ — es el cambio relativo de la densidad en cada direccion. El concrete score hace lo mismo pero en direcciones discretas (flipear cada bit).

---

## Ecuacion 4 — Objetivo de Concrete Score Matching

$$\mathcal{L}_\text{CSM}(\theta) = \sum_\mathbf{x} p_\text{data}(\mathbf{x}) \| c_\theta(\mathbf{x}; \mathcal{N}) - c_{p_\text{data}}(\mathbf{x}; \mathcal{N}) \|_2^2$$

### Como se lee

> "La loss de concrete score matching es la suma, ponderada por la probabilidad de los datos, del error cuadratico entre el concrete score del modelo y el de los datos."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\mathcal{L}_\text{CSM}(\theta)$ | La **loss** del concrete score matching. |
| $\sum_\mathbf{x}$ | Suma sobre **todos** los puntos $\mathbf{x} \in \{0, 1\}^d$. |
| $p_\text{data}(\mathbf{x})$ | Probabilidad de $\mathbf{x}$ bajo la distribucion real. Pondera la loss. |
| $c_\theta(\mathbf{x}; \mathcal{N})$ | Concrete score del **modelo** parametrizado por $\theta$. Es lo que queremos aprender. |
| $c_{p_\text{data}}(\mathbf{x}; \mathcal{N})$ | Concrete score de los **datos reales**. Es el "target" que queremos igualar. |
| $\|\cdot\|_2^2$ | **Norma L2 al cuadrado**: suma de los cuadrados de las diferencias componente a componente. |

### Problema

La loss depende del concrete score real $c_{p_\text{data}}$, que requiere conocer $p_\text{data}(\mathbf{x})$ para todo $\mathbf{x}$ y sus vecinos. En la practica no conocemos $p_\text{data}$ — solo tenemos muestras.

---

## Apartado (a) — [4 puntos, Escrito]

> *"Simplify the learning objective for concrete score matching with a Hamming distance of 1 to remove dependency on the concrete score of the true data distribution $c_{p_\text{data}}$."*

### ¿Que pide?

Reescribir la ecuacion 4 de modo que **no aparezca** $c_{p_\text{data}}$ explicitamente. Esto es analogo a como el score matching continuo se simplifica (via integracion por partes) para eliminar la dependencia del score real.

### Intuicion

En el score matching continuo, la identidad clave es que $\mathbb{E}_p[\nabla_x \log p(x)] = 0$ (se demuestra por integracion por partes). Para datos discretos, existe una identidad analoga que permite expandir la norma al cuadrado y eliminar los terminos que dependen solo de $p_\text{data}$.

---

## Apartado (b) — [2 puntos, Escrito]

> *"In our discrete space where $\mathcal{X} = \{0, 1\}^d$, consider the Hamming distance of size $k$. Show how the learning objective quickly becomes intractable and why in practice Monte Carlo sampling is used."*

### ¿Que pide?

1. Calcular cuantos vecinos tiene cada $\mathbf{x}$ si usamos distancia de Hamming $k$ (en vez de 1)
2. Expresar la complejidad en notacion big-O
3. Explicar por que esto se vuelve intratable y justificar el uso de Monte Carlo

### ¿Que conceptos necesitas?

- Combinatoria: el numero de vecinos a distancia de Hamming $k$ en $\{0, 1\}^d$ es $\binom{d}{k}$
- Notacion big-O para expresar como crece el coste con $d$ y $k$
- La idea de que Monte Carlo permite aproximar una suma gigantesca con pocas muestras aleatorias

### Ejemplo de escalabilidad

| $d$ | Vecinos ($k=1$) | Vecinos ($k=2$) | Vecinos ($k=3$) |
|-----|-----------------|-----------------|-----------------|
| 10 | 10 | 45 | 120 |
| 100 | 100 | 4,950 | 161,700 |
| 784 (MNIST) | 784 | 306,936 | ~80 millones |

Para $k$ grande, el numero de vecinos crece como $O(d^k)$, haciendolo rapidamente intratable.

---

## Resumen del ejercicio 2

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 4 | Simplificar la loss CSM para eliminar dependencia de $c_{p_\text{data}}$ |
| (b) | Escrito | 2 | Analizar complejidad con Hamming $k$ y justificar Monte Carlo |
| **Total** | | **6** | |

### Conceptos clave del ejercicio

1. El **concrete score** es el analogo discreto del gradiente de la log-densidad
2. Para datos binarios con Hamming 1, cada punto tiene exactamente $d$ vecinos
3. La loss se puede simplificar para no requerir $p_\text{data}$ explicitamente (analogo a integracion por partes)
4. Con distancia de Hamming $k > 1$, el numero de vecinos crece como $\binom{d}{k}$, haciendo la suma intratable
5. **Monte Carlo** resuelve esto muestreando un subconjunto de vecinos
