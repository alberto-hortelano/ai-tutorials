# Ejercicio 3 — Score-Based Diffusion Models

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: Tres variantes de score matching

Los modelos basados en score aprenden a estimar $\nabla_x \log p_\text{data}(x)$ sin necesidad de calcular la densidad normalizada. El problema es que el **objetivo original** (ecuacion 1 del ejercicio 1) requiere conocer el score real $\nabla_x \log p_\text{data}(x)$.

Este ejercicio explora tres formas de resolver este problema:

1. **Exact Score Matching (ESM)**: Reformula el objetivo usando integracion por partes para eliminar el score real, pero requiere calcular el **Jacobiano** del modelo
2. **Sliced Score Matching (SSM)**: Aproxima la traza del Jacobiano usando el **estimador de Hutchinson**
3. **Denoising Score Matching (DSM)**: Anade ruido a los datos y entrena el modelo para predecir el score de la distribucion ruidosa

---

## Ecuacion 5 — Exact Score Matching (forma original)

$$\mathcal{J}(\theta) = \frac{1}{2} \mathbb{E}_{p_\text{data}(x)} \left[ \| s_\theta(x) - \nabla_x \log p_\text{data}(x) \|^2 \right]$$

### Como se lee

> "El objetivo de score matching es la esperanza, bajo los datos reales, de la mitad del error cuadratico entre el score del modelo y el score real."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\mathcal{J}(\theta)$ | **Objetivo** de score matching que queremos minimizar. |
| $s_\theta(x)$ | La **funcion score del modelo**: una red neuronal parametrizada por $\theta$ que toma $x$ y devuelve un vector (la estimacion del score). |
| $\nabla_x \log p_\text{data}(x)$ | El **score real** de la distribucion de datos. No lo conocemos explicitamente. |

---

## Ecuacion 6 — Exact Score Matching (forma simplificada)

$$\mathcal{J}(\theta) = \mathbb{E}_{p_\text{data}(x)} \left[ \left\| \frac{1}{2} s_\theta(x) \right\|^2 + \text{Tr}(\nabla_x s_\theta(x)) \right] + C$$

### Como se lee

> "El objetivo simplificado tiene dos terminos: la norma al cuadrado del score del modelo, mas la traza del Jacobiano del score del modelo. Todo bajo la esperanza de los datos."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\left\| \frac{1}{2} s_\theta(x) \right\|^2$ | La mitad de la **norma al cuadrado** del score del modelo. Penaliza scores grandes. |
| $\nabla_x s_\theta(x)$ | El **Jacobiano** de $s_\theta$: una matriz donde la entrada $(i, j)$ es $\frac{\partial [s_\theta(x)]_i}{\partial x_j}$. Si $x \in \mathbb{R}^n$, el Jacobiano es $n \times n$. |
| $\text{Tr}(\cdot)$ | La **traza** de la matriz: la suma de los elementos diagonales $\sum_i \frac{\partial [s_\theta(x)]_i}{\partial x_i}$. |
| $C$ | Una **constante** que no depende de $\theta$ (viene del termino $\|\nabla_x \log p_\text{data}\|^2$). Se puede ignorar en la optimizacion. |

### ¿Por que es importante?

Esta forma **no requiere** conocer $\nabla_x \log p_\text{data}(x)$. Solo depende del modelo $s_\theta$. El problema es que calcular $\text{Tr}(\nabla_x s_\theta(x))$ requiere $n$ evaluaciones de backpropagation (una por cada dimension), lo cual es muy costoso.

---

## Ecuacion 7 — Estimador de Hutchinson

$$\text{Tr}(A) \approx \frac{1}{m} \sum_{j=1}^{m} z_j^\top A z_j$$

### Como se lee

> "La traza de una matriz $A$ puede aproximarse con el promedio de $z^\top A z$ sobre vectores aleatorios $z$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\text{Tr}(A)$ | La **traza** de $A$: $\sum_i A_{ii}$. |
| $z_j \in \mathbb{R}^n$ | Vectores aleatorios i.i.d. tales que $\mathbb{E}[z_j z_j^\top] = I_n$. Pueden ser Rademacher ($\pm 1$ con prob. 1/2) o Gaussianos estandar. |
| $z_j^\top A z_j$ | **Forma cuadratica** que da un escalado aleatorio de la traza. Su esperanza es exactamente $\text{Tr}(A)$. |
| $m$ | Numero de **muestras** de vectores aleatorios. Con $m = 1$ ya es insesgado; con $m > 1$ reduce varianza. |

### ¿Por que se usa?

Calcular la traza del Jacobiano $n \times n$ directamente cuesta $O(n)$ pases de backpropagation. Con Hutchinson, un solo vector $z$ y un **producto Jacobiano-vector** (eficiente via autograd) da una estimacion insesgada en $O(1)$ pases.

---

## Apartado (a) — [8 puntos, Extra Credit, Codigo]

> *"Implementing the Exact Score Matching objective."*

### ¿Que pide?

Implementar las siguientes funciones en `score_matching_utils.py` y `score_matching.py`:

| Funcion | ¿Que calcula? |
|---------|---------------|
| `log_p_theta` | Log-densidad $\log p_\theta(x)$ del modelo |
| `compute_score` | Score del modelo $s_\theta(x) = \nabla_x \log p_\theta(x)$ via autograd |
| `compute_l2norm_squared` | $\|s_\theta(x)\|^2$ |
| `score_matching_objective` | El objetivo completo (ecuacion 6): norma + traza del Jacobiano |

### Ejecucion

```
python run_score_matching.py
```

Genera graficos de tiempo y memoria vs batch size para dimensiones 8x8, 64x64 y 128x128.

---

## Apartado (b) — [2 puntos, Escrito]

> *"Given the definition of Hutchinson's Estimator, explain how it can be used to approximate the previous objective. Then derive the Sliced Score Matching Objective and explain, by providing the big-O complexity, why minimizing this objective is faster than the Exact Score Matching."*

### ¿Que pide?

1. Explicar como usar la ecuacion 7 para aproximar $\text{Tr}(\nabla_x s_\theta(x))$ en la ecuacion 6
2. Escribir el objetivo **Sliced Score Matching** resultante
3. Comparar complejidad: ESM necesita $O(n)$ pases de backprop (para la traza completa); SSM necesita $O(m)$ con $m \ll n$ (tipicamente $m = 1$)

### Intuicion

```
Exact Score Matching:                Sliced Score Matching:
Tr(Jacobiano) = sum de n derivadas   Tr ~ z^T * (Jacobiano * z)

Coste: O(n) backprops               Coste: O(1) backprop (un JVP)
                                     (insesgado, pero con varianza)
```

---

## Ecuacion 8 — Denoising Score Matching

$$\mathcal{L}_\text{denoising} = \mathbb{E}_{x \sim p_\text{data}(x)} \mathbb{E}_{z \sim \mathcal{N}(0, \sigma^2 I)} \left[ \left\| \mathbf{s}_\theta(x + z) + z / \sigma^2 \right\|^2 \right]$$

### Como se lee

> "La loss de denoising score matching es la esperanza (sobre datos y ruido) del error cuadratico entre el score del modelo evaluado en el dato ruidoso y el target $-z/\sigma^2$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $x \sim p_\text{data}(x)$ | Un dato real muestreado del dataset. |
| $z \sim \mathcal{N}(0, \sigma^2 I)$ | **Ruido Gaussiano** con varianza $\sigma^2$ en cada dimension. |
| $x + z$ | El dato **corrompido** (con ruido anadido). |
| $\mathbf{s}_\theta(x + z)$ | El score del modelo evaluado en el dato ruidoso. |
| $z / \sigma^2$ | El **target**: el score de la distribucion de ruido $\nabla_z \log \mathcal{N}(z \mid 0, \sigma^2 I) = -z / \sigma^2$. |
| $\mathbf{s}_\theta(x + z) + z / \sigma^2$ | La **diferencia** entre el score del modelo y el negativo del target. Queremos que sea cero. |

### Intuicion

En lugar de calcular la traza del Jacobiano (costoso), DSM anade ruido Gaussiano a los datos y entrena el modelo para que su score en el punto corrompido $x + z$ coincida con $-z/\sigma^2$. Esto funciona porque el score de la distribucion corrompida $p_\sigma(\tilde{x}) = \int p_\text{data}(x) \mathcal{N}(\tilde{x} \mid x, \sigma^2 I) dx$ se puede estimar sin conocer $p_\text{data}$ explicitamente.

```
Dato original x  -->  Anadir ruido z  -->  Dato ruidoso x+z
                                                |
El score en x+z debe "apuntar de vuelta" a x   |
Es decir: s_theta(x+z) ~ -z/sigma^2           v
```

---

## Apartado (c) — [3 puntos, Extra Credit, Codigo]

> *"Implement Denoising Score Matching."*

### ¿Que pide?

Implementar las siguientes funciones en `score_matching_utils.py` y `score_matching.py`:

| Funcion | ¿Que calcula? |
|---------|---------------|
| `add_noise` | Anadir ruido Gaussiano: $\tilde{x} = x + z$ con $z \sim \mathcal{N}(0, \sigma^2 I)$ |
| `compute_gaussian_score` | Score del modelo $s_\theta(\tilde{x})$ evaluado en el dato ruidoso |
| `compute_target_score` | El target $-z / \sigma^2$ |
| `denoising_score_matching_objective` | La loss completa (ecuacion 8) |

### Ejecucion

```
python run_score_matching.py --denoise
```

Los graficos de DSM muestran una mejora significativa en tiempo y memoria respecto a ESM.

---

## Resumen del ejercicio 3

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Codigo (EC) | 8 | Implementar Exact Score Matching |
| (b) | Escrito | 2 | Derivar Sliced Score Matching y comparar complejidad |
| (c) | Codigo (EC) | 3 | Implementar Denoising Score Matching |
| **Total** | | **2 + 11 EC** | |

### Conceptos clave del ejercicio

1. **ESM** elimina el score real via integracion por partes, pero requiere la traza del Jacobiano ($O(n)$ backprops)
2. El **estimador de Hutchinson** aproxima la traza con un solo producto Jacobiano-vector ($O(1)$)
3. **SSM** aplica Hutchinson a ESM, reduciendo drasticamente el coste computacional
4. **DSM** evita el Jacobiano completamente: anade ruido y entrena contra un target analitico $-z/\sigma^2$
5. DSM es la base de los **modelos de difusion** modernos (DDPM, DDIM)
