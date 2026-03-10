# Ejercicio 1 — Flow models

Este documento explica **qué significa cada parte del enunciado**, no cómo resolverlo.

---

## Contexto: ¿Por qué normalizing flows?

En los PS anteriores hemos visto dos familias de modelos generativos:

- **PS1 — Modelos autorregresivos:** Factorizan la distribución usando la regla de la cadena. Dan una **verosimilitud exacta** pero son **lentos para muestrear** (hay que generar una variable a la vez, secuencialmente).

- **PS2 — VAEs:** Usan variables latentes $\mathbf{z}$ y un encoder/decoder. Son **rápidos para muestrear** pero solo dan una **cota inferior** (ELBO) de la verosimilitud, porque la marginal $p_\theta(\mathbf{x}) = \int p_\theta(\mathbf{x} \mid \mathbf{z}) p(\mathbf{z}) \, d\mathbf{z}$ es intratable.

Los **normalizing flows** intentan tener lo mejor de ambos mundos: transformaciones invertibles que permiten calcular la **verosimilitud exacta** y generar muestras relativamente rápido.

La idea central es: si tienes una distribución simple $p_z$ (por ejemplo, una Gaussiana estándar) y una función invertible $f$, puedes transformarla en una distribución más compleja usando la **fórmula del cambio de variables**.

```
Distribución simple   Transformación invertible    Distribución compleja

   p_z (Gaussiana)       ──────── f ────────►           p_x (datos)

        z               ──────── f(z) = x ─────►       x
        x               ◄────── f⁻¹(x) = z ────       z
```

En este ejercicio implementaremos un **MAF** (Masked Autoregressive Flow), que combina la idea de modelos autorregresivos con normalizing flows. Usaremos bloques **MADE** (Masked Autoencoder for Distribution Estimation) como componente fundamental.

El dataset es **Moons** (dos medias lunas entrelazadas en 2D, con $n = 2$).

---

## Ecuación 1 — Modelo autorregresivo Gaussiano

$$p(\mathbf{x}) = \prod_{i=1}^{n} p(x_i \mid \mathbf{x}_{<i})$$

### Cómo se lee

> "La distribución conjunta de $\mathbf{x}$ se factoriza como el producto de las distribuciones condicionales de cada componente $x_i$ dado todas las componentes anteriores $\mathbf{x}_{<i}$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p(\mathbf{x})$ | Distribución conjunta del vector $\mathbf{x} = (x_1, \ldots, x_n)$. Es la probabilidad de observar el dato completo. |
| $\prod_{i=1}^{n}$ | **Productorio**: multiplicar los $n$ términos desde $i=1$ hasta $i=n$. |
| $p(x_i \mid \mathbf{x}_{<i})$ | Distribución condicional de la componente $x_i$ dadas todas las componentes con índice menor que $i$. |
| $\mathbf{x}_{<i}$ | Todas las componentes anteriores: $(x_1, x_2, \ldots, x_{i-1})$. Para $i=1$, es el conjunto vacío. |

### Intuición

Esto es simplemente la **regla de la cadena de probabilidad** (chain rule). Cualquier distribución conjunta se puede escribir así — no es una suposición, es un hecho matemático.

Lo que hace especial a este modelo es que cada condicional es una **Gaussiana** cuyos parámetros dependen de las variables anteriores:

$$p(x_i \mid \mathbf{x}_{<i}) = \mathcal{N}\left(x_i \mid \mu_i, (\exp(\alpha_i))^2\right)$$

donde $\mu_i = f_{\mu_i}(\mathbf{x}_{<i})$ y $\alpha_i = f_{\alpha_i}(\mathbf{x}_{<i})$ son producidos por **redes neuronales**.

### ¿Qué es $\alpha_i$?

El enunciado dice que $\alpha_i$ es el **log de la desviación estándar** de la Gaussiana condicional $p(x_i \mid \mathbf{x}_{<i})$. Es decir:

$$\sigma_i = \exp(\alpha_i)$$

¿Por qué usar $\alpha_i = \log \sigma_i$ en lugar de $\sigma_i$ directamente? Porque la desviación estándar debe ser **positiva** ($\sigma_i > 0$), y si la red neuronal produce un valor cualquiera $\alpha_i \in \mathbb{R}$, al aplicar $\exp(\alpha_i)$ obtenemos automáticamente un número positivo. Así no necesitamos restringir la salida de la red.

| Notación | Significado | Rango |
|----------|-------------|-------|
| $\alpha_i$ | Log de la desviación estándar | $\mathbb{R}$ (cualquier real) |
| $\exp(\alpha_i)$ | Desviación estándar $\sigma_i$ | $\mathbb{R}_{++}$ (positivo) |
| $\exp(\alpha_i)^2$ | Varianza $\sigma_i^2$ | $\mathbb{R}_{++}$ (positivo) |

### Ejemplo con $n = 2$ (el caso del dataset Moons)

$$p(x_1, x_2) = p(x_1) \cdot p(x_2 \mid x_1)$$

- $p(x_1) = \mathcal{N}(x_1 \mid \mu_1, \exp(\alpha_1)^2)$ donde $\mu_1$ y $\alpha_1$ son constantes (no dependen de nada)
- $p(x_2 \mid x_1) = \mathcal{N}(x_2 \mid \mu_2(x_1), \exp(\alpha_2(x_1))^2)$ donde $\mu_2$ y $\alpha_2$ son funciones de $x_1$

---

## El mapeo forward y el mapeo inverse

El enunciado define dos mapeos que son la clave de este ejercicio:

### Mapeo forward: $z \to x$

$$x_i = \mu_i + z_i \cdot \exp(\alpha_i)$$

### Cómo se lee

> "Para obtener $x_i$ a partir de $z_i$, tomo la media $\mu_i$ y le sumo el ruido $z_i$ escalado por la desviación estándar $\exp(\alpha_i)$."

### Mapeo inverse: $x \to z$

$$z_i = \frac{x_i - \mu_i}{\exp(\alpha_i)}$$

### Cómo se lee

> "Para obtener $z_i$ a partir de $x_i$, le resto la media $\mu_i$ y divido por la desviación estándar $\exp(\alpha_i)$. Es decir, estandarizo $x_i$."

### Intuición: ¿qué hacen estos mapeos?

Si $z_i \sim \mathcal{N}(0, 1)$ (Gaussiana estándar), entonces $x_i = \mu_i + z_i \cdot \exp(\alpha_i)$ sigue una $\mathcal{N}(\mu_i, \exp(\alpha_i)^2)$. Esto es la **reparametrización** que ya conoces del PS2 (el reparameterization trick del VAE).

El mapeo inverse es simplemente la operación opuesta: **estandarizar** $x_i$ para recuperar el ruido $z_i$.

```
Espacio latente z          Espacio de datos x
(Gaussiana estándar)       (distribución compleja)

     z_i ~ N(0,1)    ──── forward ────►    x_i = μ_i + z_i · exp(α_i)
                                                  ~ N(μ_i, exp(α_i)²)

     z_i = (x_i-μ_i) ◄──── inverse ────   x_i
          / exp(α_i)
```

### ¿De dónde vienen $\mu_i$ y $\alpha_i$?

Aquí está lo importante y lo que hace autorregresivo al modelo: $\mu_i$ y $\alpha_i$ son **funciones de las variables anteriores**, producidas por la red MADE.

- En el **forward** ($z \to x$): se calculan secuencialmente. Para obtener $x_i$, necesitas $\mu_i(\mathbf{x}_{<i})$ y $\alpha_i(\mathbf{x}_{<i})$, que dependen de los $x_j$ con $j < i$ (los que ya generaste en pasos anteriores).

- En el **inverse** ($x \to z$): se pueden calcular **en paralelo**. Dado $\mathbf{x}$ completo, la red MADE produce todos los $\mu_i$ y $\alpha_i$ en una sola pasada, gracias al enmascaramiento (masking).

```
Forward (secuencial):

  z₁ ──► x₁ = μ₁ + z₁·exp(α₁)          ← μ₁, α₁ son constantes
              │
              ▼
  z₂ ──► x₂ = μ₂(x₁) + z₂·exp(α₂(x₁)) ← μ₂, α₂ dependen de x₁
              │
              ...

Inverse (paralelo):

  x = (x₁, x₂, ..., xₙ)
       │
       ▼
    [  MADE  ] ──► (μ₁, α₁, μ₂, α₂, ..., μₙ, αₙ)  ← una sola pasada
       │
       ▼
  z_i = (x_i - μ_i) / exp(α_i)  para todo i simultáneamente
```

Esta asimetría es una propiedad fundamental de MAF:
- **Inverse** (calcular $z$ desde $x$): rápido (una pasada por la red)
- **Forward** (calcular $x$ desde $z$): lento (secuencial, $n$ pasadas)

---

## Ecuación 2 — Propiedad del cambio de variables

$$\log p(\mathbf{x}) = \log p_z\left(f^{-1}(\mathbf{x})\right) + \sum_{j=1}^{k} \log \left| \det \left( \frac{\partial f_j^{-1}(\mathbf{x}_j)}{\partial \mathbf{x}_j} \right) \right|$$

### Cómo se lee

> "El log de la verosimilitud de un dato $\mathbf{x}$ es igual al log de la densidad base evaluada en el punto $z = f^{-1}(\mathbf{x})$ más la suma de los logs de los valores absolutos de los determinantes de los Jacobianos de cada transformación inversa."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\log p(\mathbf{x})$ | **Log-verosimilitud** del dato $\mathbf{x}$ bajo el modelo. Esto es lo que queremos calcular (y maximizar durante el entrenamiento). |
| $p_z$ | **Distribución base** (prior). En nuestro caso, una Gaussiana estándar isotrópica $\mathcal{N}(\mathbf{0}, I)$. |
| $f^{-1}(\mathbf{x})$ | La transformación inversa total: mapea $\mathbf{x}$ de vuelta al espacio latente $\mathbf{z}$. Es la composición de todas las inversas. |
| $k$ | Número de **capas de flujo** (flow layers). En nuestro caso, el modelo usa $k = 5$ bloques MADE. |
| $f_j^{-1}$ | La transformación inversa de la $j$-ésima capa de flujo. |
| $\mathbf{x}_j$ | La entrada a la $j$-ésima capa inversa (la salida de la capa anterior). $\mathbf{x}_1 = \mathbf{x}$ (el dato original). |
| $\frac{\partial f_j^{-1}(\mathbf{x}_j)}{\partial \mathbf{x}_j}$ | La **matriz Jacobiana** de la $j$-ésima transformación inversa. Es una matriz de derivadas parciales de tamaño $n \times n$. |
| $\det(\cdot)$ | **Determinante** de una matriz. Para una matriz $n \times n$, es un escalar que mide cómo la transformación cambia el "volumen". |
| $\|\cdot\|$ | **Valor absoluto**. Tomamos el valor absoluto del determinante. |
| $\log \|\det(\cdot)\|$ | El **log del valor absoluto del determinante** del Jacobiano. Este término corrige por cómo la transformación "estira" o "comprime" el espacio. |

### Intuición: ¿por qué necesitamos el determinante del Jacobiano?

Cuando transformas una variable aleatoria, la densidad no se preserva directamente. El determinante del Jacobiano actúa como un **factor de corrección** que ajusta la densidad por el cambio de "volumen" que introduce la transformación.

```
Analogía: estirar un globo

  Espacio z (globo normal)         Espacio x (globo estirado)

  Densidad uniforme:               Densidad NO uniforme:
  ┌─────────────┐                  ┌─────────────────────┐
  │ ▓▓▓▓▓▓▓▓▓▓▓ │                  │ ▓▓▓▓▓▓     ░░░░░░░░ │
  │ ▓▓▓▓▓▓▓▓▓▓▓ │   ── estira ──►  │ ▓▓▓▓▓▓     ░░░░░░░░ │
  │ ▓▓▓▓▓▓▓▓▓▓▓ │                  │ ▓▓▓▓▓▓     ░░░░░░░░ │
  └─────────────┘                  └─────────────────────┘

  Donde se estira más,              El Jacobiano mide cuánto
  la densidad baja.                 se "estira" en cada punto.
```

### ¿Por qué una suma sobre $j$?

Un normalizing flow compone $k$ transformaciones invertibles:

$$\mathbf{x} = f^k \circ f^{k-1} \circ \cdots \circ f^1(\mathbf{z}_0)$$

Cada transformación tiene su propio Jacobiano. Por la regla de la cadena, el determinante del Jacobiano total es el **producto** de los determinantes individuales. En escala logarítmica, el producto se convierte en **suma**:

$$\log |\det(J_{\text{total}})| = \sum_{j=1}^{k} \log |\det(J_j)|$$

### Nota sobre $f_k$ vs $f^k$

El enunciado aclara que $f_k$ es lo mismo que $f^k$. Ambas notaciones se refieren a la $k$-ésima transformación en la composición (no a "$f$ elevado a la $k$").

---

## Ecuación 3 — El log-det-Jacobiano para MAF

$$\log \left| \det \left( \frac{\partial f^{-1}}{\partial \mathbf{x}} \right) \right| = -\sum_{i=1}^{n} \alpha_i$$

### Cómo se lee

> "El logaritmo del valor absoluto del determinante del Jacobiano de la transformación inversa es igual al negativo de la suma de todos los $\alpha_i$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\frac{\partial f^{-1}}{\partial \mathbf{x}}$ | Matriz Jacobiana de la transformación inversa $f^{-1}$, de tamaño $n \times n$. Cada entrada $(i,j)$ es $\frac{\partial z_i}{\partial x_j}$. |
| $\alpha_i$ | Log de la desviación estándar de la $i$-ésima condicional, como se definió antes: $\alpha_i = f_{\alpha_i}(\mathbf{x}_{<i})$. |
| $-\sum_{i=1}^{n} \alpha_i$ | El negativo de la suma de todos los $\alpha_i$. Es un escalar. |

### ¿Por qué es tan simple?

La razón por la que el log-det-Jacobiano se reduce a una simple suma es que el Jacobiano de la transformación inversa $z_i = (x_i - \mu_i) / \exp(\alpha_i)$ es una **matriz triangular inferior**.

¿Por qué triangular? Porque, por la estructura autorregresiva, $z_i$ solo depende de $x_1, \ldots, x_i$ (no de $x_j$ con $j > i$). Esto hace que $\frac{\partial z_i}{\partial x_j} = 0$ para $j > i$.

El determinante de una matriz triangular es simplemente el **producto de sus elementos diagonales**. Los elementos diagonales son $\frac{\partial z_i}{\partial x_i} = \frac{1}{\exp(\alpha_i)}$, por lo que:

$$\det(J) = \prod_{i=1}^{n} \frac{1}{\exp(\alpha_i)}$$

En escala logarítmica:

$$\log |\det(J)| = \sum_{i=1}^{n} \log \frac{1}{\exp(\alpha_i)} = -\sum_{i=1}^{n} \alpha_i$$

```
Jacobiano (n=3):

┌                                     ┐
│  ∂z₁/∂x₁    ∂z₁/∂x₂    ∂z₁/∂x₃   │     ┌                              ┐
│                                     │     │  1/exp(α₁)    0         0     │
│  ∂z₂/∂x₁    ∂z₂/∂x₂    ∂z₂/∂x₃   │  =  │  *        1/exp(α₂)    0     │
│                                     │     │  *           *      1/exp(α₃) │
│  ∂z₃/∂x₁    ∂z₃/∂x₂    ∂z₃/∂x₃   │     └                              ┘
└                                     ┘
                                              ↑ triangular inferior
        * = valores que no importan             det = producto de la diagonal
          (no afectan el determinante)
```

Esto es una gran ventaja computacional: calcular el determinante de una matriz genérica $n \times n$ cuesta $O(n^3)$, pero aquí cuesta $O(n)$ (simplemente sumar los $\alpha_i$).

---

## La arquitectura del código

Antes de ver los apartados, es útil entender cómo está organizado el código en `flow_network.py`.

### Clase `MADE`

MADE es un bloque autorregresivo que, dada una entrada, produce los parámetros $\mu_i$ y $\alpha_i$ para cada componente $i$. Usa **capas lineales enmascaradas** (`MaskedLinear`) para garantizar que la salida $i$ solo dependa de las entradas con índice $< i$.

La red toma una entrada de tamaño `input_size` y produce una salida de tamaño `input_size * 2`: los primeros `input_size` valores son los $\mu_i$ y los siguientes `input_size` valores son los $\alpha_i$.

```
Entrada: x = (x₁, x₂)          Salida: (μ₁, μ₂, α₁, α₂)
    │                                         │
    ▼                                         │
┌──────────────────┐                          │
│   MaskedLinear   │  ← las máscaras          │
│   + ReLU         │    garantizan que         │
│   MaskedLinear   │    μ₂ y α₂ solo          │
│   + ReLU         │    dependan de x₁        │
│   MaskedLinear   │    (no de x₂)            │
└──────────┬───────┘                          │
           │                                  │
           ▼                                  ▼
    (μ₁, μ₂, α₁, α₂)  ← se separan en dos mitades
```

### Clase `PermuteLayer`

Después de cada bloque MADE, se aplica una **permutación** que invierte el orden de las componentes. Esto garantiza que diferentes capas de flujo aprendan dependencias en distintos órdenes.

Para datos 2D (como en el dataset Moons), permutar simplemente intercambia $x_1$ y $x_2$. La permutación es su propia inversa (aplicarla dos veces devuelve el orden original).

### Clase `MAF`

MAF es el modelo completo: una secuencia de bloques MADE intercalados con capas de permutación. La distribución base es $\mathcal{N}(\mathbf{0}, I)$ (Gaussiana estándar).

```
Arquitectura MAF (n_flows = 5):

z₀ ~ N(0,I) ──► [MADE₁] ──► [Permute] ──► [MADE₂] ──► [Permute] ──► ... ──► [MADE₅] ──► [Permute] ──► x

Para log_probs (inverse, derecha a izquierda):
x ──► [Permute⁻¹] ──► [MADE₅⁻¹] ──► ... ──► [MADE₁⁻¹] ──► z₀,  luego evaluar p_z(z₀)
```

---

## Apartado (a) — [5 puntos, Código]

> *"Implement the `forward` function in the `MADE` class in `submission/flow_network.py`. The forward pass describes the mapping $x_i = \mu_i + z_i \cdot \exp(\alpha_i)$."*

### ¿Qué pide?

Implementar el mapeo **forward** de un bloque MADE: dado un vector de ruido $\mathbf{z}$, producir el vector de datos $\mathbf{x}$ usando la fórmula $x_i = \mu_i + z_i \cdot \exp(\alpha_i)$.

### Firma de la función

```python
def forward(self, z):
    """
    :param z: Input noise of size (batch_size, self.input_size)
    :return: (x, log_det). log_det should be 1-D (batch_size,)
    """
```

| Parámetro | Shape | Significado |
|-----------|-------|-------------|
| `z` | `(batch_size, input_size)` | Ruido de entrada, muestreado de $\mathcal{N}(\mathbf{0}, I)$ |

| Retorno | Shape | Significado |
|---------|-------|-------------|
| `x` | `(batch_size, input_size)` | Datos generados por el mapeo forward |
| `log_det` | `(batch_size,)` | Log del valor absoluto del determinante del Jacobiano del mapeo **forward** |

### ¿Por qué es secuencial?

El forward es **inherentemente secuencial** porque para calcular $x_i = \mu_i + z_i \cdot \exp(\alpha_i)$, necesitas conocer $\mu_i(\mathbf{x}_{<i})$ y $\alpha_i(\mathbf{x}_{<i})$, que dependen de los $x_j$ generados en pasos anteriores.

Para $i = 1$: $\mu_1$ y $\alpha_1$ no dependen de nada (son constantes de la red).
Para $i = 2$: $\mu_2$ y $\alpha_2$ dependen de $x_1$ (que acabas de generar).
Para $i = 3$: $\mu_3$ y $\alpha_3$ dependen de $x_1$ y $x_2$.
...y así sucesivamente.

```
Paso 1: x = (0, 0)  [inicializar]
        │
        ▼  pasar x por self.net → obtener μ₁, μ₂, α₁, α₂
        │  (solo μ₁ y α₁ son válidos porque x₂ aún no es correcto)
        │
        ▼  x₁ = μ₁ + z₁·exp(α₁)

Paso 2: x = (x₁, 0)  [x₁ ya es correcto]
        │
        ▼  pasar x por self.net → obtener μ₁, μ₂, α₁, α₂
        │  (ahora μ₂ y α₂ son válidos porque dependen de x₁)
        │
        ▼  x₂ = μ₂ + z₂·exp(α₂)

Resultado: x = (x₁, x₂)
```

### Sobre `log_det` en el forward

Nota que el enunciado pide el `log_det` del mapeo **forward** ($z \to x$), no del inverse. El Jacobiano del forward es la inversa del Jacobiano del inverse, por lo que sus determinantes son recíprocos. En escala logarítmica, esto cambia el signo.

---

## Apartado (b) — [5 puntos, Código]

> *"Implement the `inverse` function in the `MADE` class in `submission/flow_network.py`. The inverse pass describes the mapping $z_i = (x_i - \mu_i) / \exp(\alpha_i)$."*

### ¿Qué pide?

Implementar el mapeo **inverse** de un bloque MADE: dado un vector de datos $\mathbf{x}$, producir el vector de ruido $\mathbf{z}$ usando la fórmula $z_i = (x_i - \mu_i) / \exp(\alpha_i)$.

### Firma de la función

```python
def inverse(self, x):
    """
    :param x: Input data of size (batch_size, self.input_size)
    :return: (z, log_det). log_det should be 1-D (batch_size,)
    """
```

| Parámetro | Shape | Significado |
|-----------|-------|-------------|
| `x` | `(batch_size, input_size)` | Datos de entrada |

| Retorno | Shape | Significado |
|---------|-------|-------------|
| `z` | `(batch_size, input_size)` | Ruido recuperado por el mapeo inverso |
| `log_det` | `(batch_size,)` | Log del valor absoluto del determinante del Jacobiano del mapeo **inverse** (ecuación 3) |

### ¿Por qué es paralelo?

A diferencia del forward, el inverse se puede calcular **en una sola pasada** por la red. ¿Por qué? Porque ya tenemos $\mathbf{x}$ completo. Al pasar $\mathbf{x}$ por `self.net`, la red produce todos los $\mu_i(\mathbf{x}_{<i})$ y $\alpha_i(\mathbf{x}_{<i})$ simultáneamente (gracias al enmascaramiento). Luego aplicamos la fórmula $z_i = (x_i - \mu_i) / \exp(\alpha_i)$ a todas las componentes a la vez.

```
                 UNA sola pasada por la red
x = (x₁, x₂) ──────► self.net ──────► (μ₁, μ₂, α₁, α₂)
                                              │
                                              ▼
              z₁ = (x₁ - μ₁) / exp(α₁)   ← todas las componentes
              z₂ = (x₂ - μ₂) / exp(α₂)     en paralelo
```

### Sobre `log_det` en el inverse

El `log_det` aquí corresponde a la ecuación 3: $\log |\det(J)| = -\sum_{i=1}^{n} \alpha_i$.

---

## Apartado (c) — [5 puntos, Código]

> *"Implement the `log_probs` function in the `MAF` class in `submission/flow_network.py`."*

### ¿Qué pide?

Implementar el cálculo de la log-verosimilitud $\log p(\mathbf{x})$ para el modelo MAF completo, usando la ecuación 2 (fórmula del cambio de variables).

### Firma de la función

```python
def log_probs(self, x):
    """
    :param x: Input data of size (batch_size, self.input_size)
    :return: log_prob. This should be a Tensor scalar.

    Important: Make sure you take the mean over samples for the log-likelihood
    """
```

| Parámetro | Shape | Significado |
|-----------|-------|-------------|
| `x` | `(batch_size, input_size)` | Mini-batch de datos |

| Retorno | Shape | Significado |
|---------|-------|-------------|
| `log_prob` | escalar | Log-verosimilitud promediada sobre el batch |

### ¿Qué contiene `self.nf`?

El atributo `self.nf` es un `nn.Sequential` que contiene los bloques del flujo en orden: `[MADE₁, Permute₁, MADE₂, Permute₂, ..., MADE₅, Permute₅]`.

### ¿Qué es `self.base_dist`?

Es la distribución base $p_z = \mathcal{N}(0, 1)$, creada como `torch.distributions.normal.Normal(0, 1)`. Su método `.log_prob(z)` evalúa el log de la densidad Gaussiana estándar en el punto $z$.

### Estructura conceptual de `log_probs`

El cálculo sigue la ecuación 2. Conceptualmente:

1. Pasar $\mathbf{x}$ a través de todas las capas **inversas** (en orden), acumulando los log-det-Jacobianos.
2. Evaluar la densidad base $\log p_z(\mathbf{z}_0)$ en el punto final $\mathbf{z}_0$.
3. Sumar ambos términos.
4. Promediar sobre el batch.

```
x ──► [Permute⁻¹] ──► [MADE₅⁻¹] ──► ... ──► [Permute⁻¹] ──► [MADE₁⁻¹] ──► z₀
         │ log_det₁       │ log_det₂                              │ log_det_k
         │                 │                                       │
         └────────────── sumar todos los log_det ──────────────────┘
                                    │
                                    ▼
              log p(x) = log p_z(z₀) + Σ log_det_j
```

### Nota importante sobre el orden

La ecuación 2 calcula $\log p(\mathbf{x})$ usando las transformaciones **inversas**. Cada bloque en `self.nf` tiene un método `.inverse()` que devuelve tanto la salida transformada como su log-det-Jacobiano.

---

## Entrenamiento y evaluación

Después de implementar los tres apartados, se entrena el modelo MAF de 5 capas en el dataset Moons durante 50 epochs:

```
python main.py --model flow
```

Para GPU:
```
python main.py --model flow --device gpu
```

El enunciado indica que la validation/test loss esperada es de aproximadamente **-1.2 nats**. Las muestras generadas (en `maf/samples_epoch50.png`) deben parecerse razonablemente a la forma de las dos medias lunas del dataset original.

---

## Resumen del ejercicio 1

| Apartado | Tipo | Puntos | ¿Qué hacer? |
|----------|------|--------|-------------|
| (a) | Código | 5 | Implementar `forward` en `MADE`: mapeo $z \to x$ (secuencial) |
| (b) | Código | 5 | Implementar `inverse` en `MADE`: mapeo $x \to z$ (paralelo) |
| (c) | Código | 5 | Implementar `log_probs` en `MAF`: log-verosimilitud usando cambio de variables |
| **Total** | | **15** | |

### Conceptos clave del ejercicio

1. **Normalizing flows** transforman una distribución simple en una compleja mediante funciones invertibles
2. La **fórmula del cambio de variables** permite calcular la verosimilitud exacta si la transformación es invertible y su Jacobiano es tratable
3. **MAF** usa bloques MADE para construir transformaciones autorregresivas con **Jacobianos triangulares**
4. El Jacobiano triangular hace que el determinante sea un simple **producto de la diagonal**, computacionalmente barato
5. El **forward** ($z \to x$) es secuencial; el **inverse** ($x \to z$) es paralelo — esta asimetría es fundamental en MAF
6. Componer $k$ capas de flujo (con permutaciones intermedias) permite modelar distribuciones más complejas
