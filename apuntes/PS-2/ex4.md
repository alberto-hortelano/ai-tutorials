# Ejercicio 4 — Implementing the Semi-Supervised VAE (SSVAE)

Este documento explica **qué significa cada parte del enunciado**, no cómo resolverlo.

---

## Contexto: ¿Por qué aprendizaje semi-supervisado?

Hasta ahora, en los ejercicios 1-3, hemos trabajado con modelos **no supervisados**: entrenamos VAE, GMVAE e IWAE usando solo las imágenes $\mathbf{x}$, sin usar las etiquetas (qué dígito es cada imagen). El objetivo era modelar $p_\theta(\mathbf{x})$.

Ahora queremos algo diferente: queremos **clasificar** imágenes (predecir el dígito $y$ dado $\mathbf{x}$). El problema es que tenemos:

- **100 imágenes etiquetadas**: $\mathbf{x}_\ell = \{(\mathbf{x}^{(i)}, y^{(i)})\}_{i=1}^{100}$ — sabemos qué dígito son.
- **59900 imágenes sin etiquetar**: $\mathbf{x}_u = \{\mathbf{x}^{(i)}\}_{i=101}^{60000}$ — solo tenemos los píxeles.

Con solo 100 etiquetas y 10 clases posibles (dígitos 0-9), un clasificador supervisado clásico tendría solo ~10 ejemplos por clase. Eso es **muy poco**.

```
Datos de entrenamiento:
  ┌─────────────────────────────────────────────────────┐
  │  100 etiquetados  │     59900 sin etiquetar         │
  │  (x, y) conocido  │     solo x, sin y               │
  │  ← pocos pero     │     ← muchos, pero sin          │
  │    valiosos       │       supervisión directa       │
  └─────────────────────────────────────────────────────┘

¿Cómo aprovechar los 59900 datos sin etiqueta para mejorar el clasificador?
```

La idea del **SSVAE** (Semi-Supervised VAE) es usar un modelo generativo para aprovechar **ambos** conjuntos de datos. El modelo generativo aprende la estructura de las imágenes (usando todos los datos), y esa estructura compartida ayuda a clasificar mejor (incluso con pocas etiquetas).

---

## Proceso generativo del SSVAE

El SSVAE tiene **dos** variables latentes: la etiqueta $y$ (el dígito) y el código continuo $\mathbf{z}$ (estilo de escritura, grosor del trazo, etc.). Para generar una imagen:

1. Muestrear la etiqueta: $y \sim p(y)$
2. Muestrear el estilo: $\mathbf{z} \sim p(\mathbf{z})$
3. Generar la imagen: $\mathbf{x} \sim p_\theta(\mathbf{x} \mid y, \mathbf{z})$

```
Modelo generativo:

   y (etiqueta)     z (estilo)
      ↘                ↙
        ↘            ↙
          ↘        ↙
            x (imagen)

"La imagen x depende tanto del dígito y como del estilo z"
```

---

## Arquitectura del SSVAE en código

El constructor de `SSVAE` en `ssvae.py` define los componentes del modelo:

```python
class SSVAE(nn.Module):
    def __init__(self, nn='v1', name='ssvae', gen_weight=1, class_weight=100):
        self.z_dim = 64          # dimensión del espacio latente continuo
        self.y_dim = 10          # número de clases (dígitos 0-9)
        self.gen_weight = gen_weight   # peso del término ELBO(x) en el objetivo
        self.class_weight = class_weight  # peso α del término de clasificación
        self.enc = nn.Encoder(self.z_dim, self.y_dim)  # q_φ(z|x,y)
        self.dec = nn.Decoder(self.z_dim, self.y_dim)  # p_θ(x|z,y)
        self.cls = nn.Classifier(self.y_dim)            # q_φ(y|x)
```

| Componente | Clase | Rol en el modelo |
|-----------|-------|-----------------|
| `self.enc` | `Encoder` | Posterior aproximado $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$. Recibe x e y, produce μ y σ² de z. |
| `self.dec` | `Decoder` | Modelo de observación $p_\theta(\mathbf{x} \mid \mathbf{z}, y)$. Recibe z e y, produce logits de cada píxel. |
| `self.cls` | `Classifier` | Clasificador $q_\phi(y \mid \mathbf{x})$. Recibe x, produce logits sobre las 10 clases. |

El prior sobre z se define como parámetro fijo (no aprendido):

```python
self.z_prior_m = torch.nn.Parameter(torch.zeros(1), requires_grad=False)   # μ = 0
self.z_prior_v = torch.nn.Parameter(torch.ones(1), requires_grad=False)    # σ² = 1
self.z_prior = (self.z_prior_m, self.z_prior_v)  # → N(0, I)
```

### Redes neuronales (definidas en `nns/v1.py`)

Las tres redes son MLPs con dos capas ocultas de 300 neuronas:

**Encoder** — $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$:

```python
class Encoder(nn.Module):
    def __init__(self, z_dim, y_dim=0):
        self.net = nn.Sequential(
            nn.Linear(784 + y_dim, 300),  # entrada: x (784) concatenado con y (10) = 794
            nn.ELU(),
            nn.Linear(300, 300),
            nn.ELU(),
            nn.Linear(300, 2 * z_dim),    # salida: 128 valores (64 para μ, 64 para σ²)
        )

    def forward(self, x, y=None):
        xy = x if y is None else torch.cat((x, y), dim=1)  # concatena x e y
        h = self.net(xy)
        m, v = ut.gaussian_parameters(h, dim=1)  # divide en μ y σ² (softplus + ε)
        return m, v
```

La función `gaussian_parameters` (de `utils.py`) divide la salida de 128 dimensiones por la mitad: la primera mitad (64) es μ directamente, y la segunda mitad (64) pasa por softplus ($\log(1 + e^x) + 10^{-8}$) para garantizar σ² > 0:

```python
def gaussian_parameters(h, dim=-1):
    m, h = torch.split(h, h.size(dim) // 2, dim=dim)
    v = F.softplus(h) + 1e-8
    return m, v
```

**Decoder** — $p_\theta(\mathbf{x} \mid \mathbf{z}, y)$:

```python
class Decoder(nn.Module):
    def __init__(self, z_dim, y_dim=0):
        self.net = nn.Sequential(
            nn.Linear(z_dim + y_dim, 300),  # entrada: z (64) concatenado con y (10) = 74
            nn.ELU(),
            nn.Linear(300, 300),
            nn.ELU(),
            nn.Linear(300, 784)             # salida: 784 logits (uno por píxel)
        )

    def forward(self, z, y=None):
        zy = z if y is None else torch.cat((z, y), dim=1)
        return self.net(zy)  # devuelve logits, NO probabilidades
```

El decoder produce **logits** (no probabilidades). La conversión a probabilidades Bernoulli ocurre fuera de la red: en `log_bernoulli_with_logits` (para calcular la pérdida) o en `compute_sigmoid_given` (para generar imágenes).

**Classifier** — $q_\phi(y \mid \mathbf{x})$:

```python
class Classifier(nn.Module):
    def __init__(self, y_dim):
        self.net = nn.Sequential(
            nn.Linear(784, 300),      # entrada: solo x (784 píxeles)
            nn.ReLU(),                # nota: usa ReLU, no ELU como las otras redes
            nn.Linear(300, 300),
            nn.ReLU(),
            nn.Linear(300, y_dim)     # salida: 10 logits (uno por dígito)
        )

    def forward(self, x):
        return self.net(x)   # devuelve logits; softmax se aplica fuera
```

Flujo de datos completo:

    x (784) ──→ Classifier ──→ logits (10) ──→ softmax ──→ q(y|x)
                                                             │
    x (784) ─┐                                               │
             ├─ concat ──→ Encoder ──→ μ_φ(x,y), σ²_φ(x,y) ─→ z ~ N(μ,σ²)
    y (10) ──┘                                               │
                                                             │
    z (64) ──┐                                               │
             ├─ concat ──→ Decoder ──→ logits (784) ──→ Bern(x|logits)
    y (10) ──┘

El diagrama tiene tres bloques, uno por cada red neuronal. Se leen de arriba a abajo:

Bloque 1 — Classifier $q_\phi(y \mid \mathbf{x})$

    x (784) ──→ Classifier ──→ logits (10) ──→ softmax ──→ q(y|x)

Entra la imagen (784 píxeles). La red produce 10 logits (uno por dígito). Softmax los convierte en 10 probabilidades que suman 1. Ejemplo:
"92% de que es un 7, 5% de que es un 1, ..."

Bloque 2 — Encoder $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$

    x (784) ─┐
             ├─ concat ──→ Encoder ──→ μ_φ(x,y), σ²_φ(x,y) ─→ z ~ N(μ,σ²)
    y (10) ──┘

Se concatenan la imagen (784) y la etiqueta (10 valores one-hot) en un solo vector de 794 dimensiones. La red produce 128 valores: los
primeros 64 son μ, los últimos 64 se convierten en σ². Con μ y σ² se muestrea z usando el reparameterization trick. El resultado es un
vector z de 64 dimensiones que codifica el "estilo" (grosor, inclinación, etc.) — el "qué dígito es" ya lo aporta y.

Bloque 3 — Decoder $p_\theta(\mathbf{x} \mid \mathbf{z}, y)$

    z (64) ──┐
             ├─ concat ──→ Decoder ──→ logits (784) ──→ Bern(x|logits)
    y (10) ──┘

Se concatenan z (64) e y (10) en un vector de 74 dimensiones. La red produce 784 logits (uno por píxel). Cada logit dice cuánta evidencia
hay de que ese píxel sea blanco vs negro. Esos logits definen una distribución de Bernoulli sobre la imagen reconstruida.

La conexión entre bloques — la línea vertical │ en el diagrama indica que la y del bloque 1 (predicción del clasificador) alimenta los
bloques 2 y 3. En entrenamiento, para datos sin etiquetar, se prueban las 10 posibles etiquetas y se pondera cada resultado por su
probabilidad $q(y|\mathbf{x})$.

Resumen: qué entra y qué sale de cada red

    Classifier:  784 → 10           "¿qué dígito es?"
    Encoder:     794 → 128 → μ,σ²   "¿qué estilo tiene, dado que es un [y]?"
    Decoder:      74 → 784          "genera la imagen dado estilo [z] y dígito [y]"


---

## Ecuación 16 — Prior sobre $\mathbf{z}$

$$p(\mathbf{z}) = \mathcal{N}(\mathbf{z} \mid 0, I)$$

### Cómo se lee

> "La distribución a priori sobre las variables latentes continuas $\mathbf{z}$ es una Gaussiana estándar multivariada, con media cero y covarianza identidad."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p(\mathbf{z})$ | Prior sobre las variables latentes continuas. No depende de $\theta$ — es fijo (como en el VAE estándar del ejercicio 1). |
| $\mathcal{N}(\mathbf{z} \mid 0, I)$ | Gaussiana estándar: media $\mathbf{0}$ (vector de ceros) y covarianza $I$ (matriz identidad). Cada dimensión de $\mathbf{z}$ es independiente con media 0 y varianza 1. |

### Intuición

Igual que en el VAE del ejercicio 1, las variables latentes continuas $\mathbf{z}$ capturan variaciones "de estilo" (inclinación, grosor, etc.). El prior es simple y no estructurado — toda la estructura multi-modal ahora la captura la variable discreta $y$.

---

## Ecuación 17 — Prior sobre $y$

$$p(y) = \text{Categorical}(y \mid \pi) = \frac{1}{10}$$

### Cómo se lee

> "La distribución a priori sobre la etiqueta $y$ es una distribución Categórica uniforme: cada dígito del 0 al 9 tiene la misma probabilidad, $\frac{1}{10}$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p(y)$ | Prior sobre la etiqueta. No se aprende — es fijo y uniforme. |
| $\text{Categorical}(y \mid \pi)$ | Distribución Categórica (también llamada Multinoulli). Generaliza la Bernoulli a más de dos categorías. Cada categoría tiene una probabilidad dada por el vector $\pi$. |
| $\pi$ | Vector de probabilidades $\pi = (1/10, \ldots, 1/10)$. Hay 10 componentes (una por dígito), todas iguales. |
| $y$ | La etiqueta del dígito. Toma valores en $\mathcal{Y} = \{0, 1, 2, \ldots, 9\}$. |

### Intuición

Asumimos que a priori todos los dígitos son igual de probables. Esto es razonable para MNIST, donde las clases están balanceadas.

---

## Ecuación 18 — Decoder (modelo de observación)

$$p_\theta(\mathbf{x} \mid y, \mathbf{z}) = \text{Bern}(\mathbf{x} \mid f_\theta(y, \mathbf{z}))$$

### Cómo se lee

> "La probabilidad de los píxeles $\mathbf{x}$ dados la etiqueta $y$ y el código latente $\mathbf{z}$ es un producto de Bernoullis, con probabilidades determinadas por una red neuronal $f_\theta$ que recibe tanto $y$ como $\mathbf{z}$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p_\theta(\mathbf{x} \mid y, \mathbf{z})$ | Modelo de observación (**decoder**). Genera la imagen dado el dígito y el estilo. |
| $\text{Bern}(\mathbf{x} \mid f_\theta(y, \mathbf{z}))$ | Distribución de Bernoulli sobre cada píxel. Igual que en el VAE (ejercicio 1), pero ahora el decoder recibe $y$ **además** de $\mathbf{z}$. |
| $f_\theta(y, \mathbf{z})$ | Red neuronal decoder que toma la etiqueta $y$ y el código $\mathbf{z}$ y produce los **logits** de las probabilidades de cada píxel. |

### Diferencia clave con el VAE/GMVAE

En el VAE del ejercicio 1, el decoder era $p_\theta(\mathbf{x} \mid \mathbf{z})$: solo dependía de $\mathbf{z}$. Ahora depende de **dos** cosas: $y$ y $\mathbf{z}$. Esto permite que $\mathbf{z}$ capture el *estilo* y $y$ capture el *contenido* (qué dígito es).

### En código: cómo se usa el decoder

En `ssvae.py`, el decoder se invoca a través de dos métodos auxiliares:

```python
def compute_sigmoid_given(self, z, y):
    logits = self.dec(z, y)          # la red produce logits (valores sin acotar)
    return torch.sigmoid(logits)     # convierte a probabilidades [0,1]

def sample_x_given(self, z, y):
    return torch.bernoulli(self.compute_sigmoid_given(z, y))  # muestrea píxeles 0/1
```

Para **generar** una imagen completa desde cero, el flujo es:

```python
def sample_z(self, batch):
    return ut.sample_gaussian(
        self.z_prior[0].expand(batch, self.z_dim),   # μ=0 expandido a (batch, 64)
        self.z_prior[1].expand(batch, self.z_dim)     # σ²=1 expandido a (batch, 64)
    )
# Uso: z = model.sample_z(batch) → x = model.sample_x_given(z, y)
```

---

## Figura 1 — Modelo gráfico del SSVAE

El enunciado presenta dos variantes del modelo gráfico:

```
Caso NO supervisado          Caso supervisado
(y no observado)             (y observado)

    y       z                 [y]      z
     ╲     ╱                    ╲     ╱
      ╲   ╱                      ╲   ╱
       ╲ ╱                        ╲ ╱
       [x]                        [x]

[ ] = nodo observado (gris)
sin corchetes = nodo latente (blanco)
```

- **Izquierda**: Datos sin etiquetar ($\mathbf{x}_u$). Tanto $y$ como $\mathbf{z}$ son latentes. Hay que marginalizar sobre ambos.
- **Derecha**: Datos etiquetados ($\mathbf{x}_\ell$). $y$ es observado; solo $\mathbf{z}$ es latente. Solo hay que marginalizar sobre $\mathbf{z}$.

---

## Ecuación 19 — Objetivo de máxima verosimilitud

$$\max_\theta \sum_{\mathbf{x} \in \mathbf{X}_u} \log p_\theta(\mathbf{x}) + \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \log p_\theta(\mathbf{x}, y)$$

### Cómo se lee

> "Maximizar sobre los parámetros $\theta$ la suma de: (1) el log de la verosimilitud marginal para cada dato sin etiquetar, más (2) el log de la verosimilitud conjunta para cada par dato-etiqueta de los datos etiquetados."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\max_\theta$ | Buscar los parámetros $\theta$ que maximicen la expresión. |
| $\sum_{\mathbf{x} \in \mathbf{X}_u}$ | Suma sobre todos los datos **sin etiquetar**. Son 59900 imágenes. |
| $\log p_\theta(\mathbf{x})$ | Log-verosimilitud marginal para un dato sin etiqueta. El modelo debe asignar alta probabilidad a $\mathbf{x}$ integrando sobre **todos** los posibles $y$ y $\mathbf{z}$. |
| $\sum_{\mathbf{x}, y \in \mathbf{X}_\ell}$ | Suma sobre todos los datos **etiquetados**. Son 100 pares $(\mathbf{x}, y)$. |
| $\log p_\theta(\mathbf{x}, y)$ | Log-verosimilitud conjunta para un dato etiquetado. El modelo debe asignar alta probabilidad al par $(\mathbf{x}, y)$ integrando solo sobre $\mathbf{z}$. |

### Intuición

Tenemos dos tipos de datos, y cada tipo aporta información diferente:

- **Sin etiqueta**: El modelo aprende a generar imágenes realistas (estructura general de los dígitos).
- **Con etiqueta**: El modelo aprende a asociar imágenes con sus dígitos correctos.

---

## Ecuaciones 20 y 21 — Verosimilitudes marginales

### Ecuación 20 — Para datos sin etiquetar

$$p_\theta(\mathbf{x}) = \sum_{y \in \mathcal{Y}} \int p_\theta(\mathbf{x}, y, \mathbf{z}) \, d\mathbf{z}$$

> "La probabilidad de $\mathbf{x}$ es la suma sobre todas las posibles etiquetas $y$ de la integral sobre todos los posibles $\mathbf{z}$ de la conjunta $p_\theta(\mathbf{x}, y, \mathbf{z})$."

### Ecuación 21 — Para datos etiquetados

$$p_\theta(\mathbf{x}, y) = \int p_\theta(\mathbf{x}, y, \mathbf{z}) \, d\mathbf{z}$$

> "La probabilidad conjunta de $(\mathbf{x}, y)$ es la integral sobre todos los posibles $\mathbf{z}$ de la distribución conjunta completa."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p_\theta(\mathbf{x}, y, \mathbf{z})$ | Distribución conjunta completa: $p(y) \cdot p(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid y, \mathbf{z})$. La probabilidad de que ocurran simultáneamente la etiqueta $y$, el código $\mathbf{z}$, y la imagen $\mathbf{x}$. |
| $\sum_{y \in \mathcal{Y}}$ | Suma sobre las 10 posibles etiquetas: $y \in \{0, 1, \ldots, 9\}$. |
| $\int \cdot \, d\mathbf{z}$ | Integral sobre todas las posibles variables latentes continuas $\mathbf{z}$. Esta integral es **intratable**. |
| $\mathcal{Y}$ | Espacio de etiquetas: $\{0, 1, \ldots, 9\}$. |


### Intuición

La ecuación 20 marginaliza sobre **todo** lo no observado ($y$ y $\mathbf{z}$). La ecuación 21 solo marginaliza sobre $\mathbf{z}$ (porque $y$ lo conocemos). Ambas integrales son intratables por la integral sobre $\mathbf{z}$, así que necesitamos el ELBO.

---

## Ecuación 22 — Objetivo con ELBOs

$$\max_{\theta, \phi} \sum_{\mathbf{x} \in \mathbf{X}_u} \text{ELBO}(\mathbf{x}; \theta, \phi) + \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \text{ELBO}(\mathbf{x}, y; \theta, \phi)$$

### Cómo se lee

> "Maximizar sobre $\theta$ y $\phi$ la suma de los ELBOs: un ELBO para cada dato sin etiquetar (marginalizando sobre $y$ y $\mathbf{z}$), más un ELBO para cada dato etiquetado (marginalizando solo sobre $\mathbf{z}$)."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\max_{\theta, \phi}$ | Ahora optimizamos tanto los parámetros del modelo generativo ($\theta$) como los del modelo de inferencia ($\phi$). |
| $\text{ELBO}(\mathbf{x}; \theta, \phi)$ | Cota inferior de $\log p_\theta(\mathbf{x})$. Para datos **sin** etiquetar. |
| $\text{ELBO}(\mathbf{x}, y; \theta, \phi)$ | Cota inferior de $\log p_\theta(\mathbf{x}, y)$. Para datos **con** etiqueta. |
| $\phi$ | Parámetros del modelo de inferencia (encoder + clasificador). |

Hay **dos ELBOs** distintos porque hay dos situaciones: una donde $y$ es desconocido y otra donde $y$ es conocido.

---

## El modelo de inferencia amortizado

Para construir los ELBOs, necesitamos un posterior aproximado. El SSVAE usa:

$$q_\phi(y, \mathbf{z} \mid \mathbf{x}) = q_\phi(y \mid \mathbf{x}) \cdot q_\phi(\mathbf{z} \mid \mathbf{x}, y)$$

> "El posterior aproximado sobre $(y, \mathbf{z})$ dado $\mathbf{x}$ se factoriza como: primero predecir $y$ a partir de $\mathbf{x}$, y luego inferir $\mathbf{z}$ a partir de $\mathbf{x}$ **y** $y$."

Esta factorización tiene dos componentes:

---

## Ecuación 23 — Clasificador (posterior sobre $y$)

$$q_\phi(y \mid \mathbf{x}) = \text{Categorical}(y \mid f_\phi(\mathbf{x}))$$

### Cómo se lee

> "La distribución aproximada de la etiqueta $y$ dada la imagen $\mathbf{x}$ es una distribución Categórica cuyos parámetros son producidos por una red neuronal $f_\phi(\mathbf{x})$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $q_\phi(y \mid \mathbf{x})$ | **Clasificador**. Dada una imagen, predice la probabilidad de cada dígito. Es una red neuronal MLP. |
| $\text{Categorical}(y \mid f_\phi(\mathbf{x}))$ | Distribución Categórica con probabilidades dadas por $f_\phi(\mathbf{x})$, un vector de 10 probabilidades (una por dígito) que suman 1. |
| $f_\phi(\mathbf{x})$ | Red neuronal que toma la imagen $\mathbf{x}$ y produce un vector de 10 probabilidades (tras softmax). |

### Doble papel del clasificador

Lo notable es que $q_\phi(y \mid \mathbf{x})$ cumple **dos funciones**:

1. Es parte del **modelo de inferencia** (encoder): ayuda a inferir las variables latentes.
2. Es un **clasificador** en sí mismo: al final del entrenamiento, lo usamos directamente para predecir el dígito de imágenes nuevas.

### En código: cómo se obtienen las probabilidades

En `negative_elbo_bound`, el código ya proporcionado obtiene las probabilidades del clasificador así:

```python
y_logits = self.cls(x)                          # (batch, 10) — logits crudos
y_logprob = F.log_softmax(y_logits, dim=1)       # (batch, 10) — log-probabilidades
y_prob = torch.softmax(y_logprob, dim=1)          # (batch, 10) — probabilidades q(y|x)
```

Estas tres variables se usan en distintos contextos:
- `y_prob` → para ponderar la expectativa $\sum_y q(y|\mathbf{x}) [\cdots]$
- `y_logprob` → para calcular la KL categórica con `kl_cat`
- `y_logits` → no se usan directamente en el ELBO, pero sí en `classification_cross_entropy`

El clasificador también tiene un método dedicado para la cross-entropy supervisada:

```python
def classification_cross_entropy(self, x, y):
    y_logits = self.cls(x)
    return F.cross_entropy(y_logits, y.argmax(1))  # y es one-hot → argmax lo convierte a índice
```

---

## Ecuación 24 — Encoder (posterior sobre $\mathbf{z}$)

$$q_\phi(\mathbf{z} \mid \mathbf{x}, y) = \mathcal{N}\left(\mathbf{z} \mid \mu_\phi(\mathbf{x}, y), \text{diag}(\sigma_\phi^2(\mathbf{x}, y))\right)$$

### Cómo se lee

> "La distribución aproximada de $\mathbf{z}$ dados la imagen $\mathbf{x}$ y la etiqueta $y$ es una Gaussiana con media y varianza producidas por una red neuronal que recibe **tanto** $\mathbf{x}$ como $y$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ | Encoder. A diferencia del VAE estándar que usa $q_\phi(\mathbf{z} \mid \mathbf{x})$, aquí el encoder también recibe la etiqueta $y$. |
| $\mu_\phi(\mathbf{x}, y)$ | Red neuronal que produce la media de la Gaussiana, dado $\mathbf{x}$ **y** $y$. |
| $\sigma_\phi^2(\mathbf{x}, y)$ | Red neuronal que produce la varianza, dado $\mathbf{x}$ **y** $y$. |

### Diferencia con el VAE estándar

En el VAE del ejercicio 1, el encoder era $q_\phi(\mathbf{z} \mid \mathbf{x})$: solo recibía la imagen. Aquí recibe también la etiqueta $y$. Esto permite que el encoder codifique solo el **estilo** en $\mathbf{z}$ (el contenido ya lo proporciona $y$).

```
VAE (ej. 1):       x ──→ encoder ──→ μ, σ² de z
SSVAE (ej. 4):     x, y ──→ encoder ──→ μ, σ² de z
                    ↑
                    la etiqueta y condiciona el encoder
```

---

## Ecuaciones 25 y 26 — Los dos ELBOs

### Ecuación 25 — ELBO para datos sin etiquetar

$$\text{ELBO}(\mathbf{x}; \theta, \phi) = \mathbb{E}_{q_\phi(y, \mathbf{z} \mid \mathbf{x})} \left[ \log \frac{p_\theta(\mathbf{x}, y, \mathbf{z})}{q_\phi(y, \mathbf{z} \mid \mathbf{x})} \right]$$

#### Cómo se lee

> "El ELBO para un dato sin etiquetar es la esperanza, bajo el posterior aproximado sobre $(y, \mathbf{z})$, del logaritmo del ratio entre la conjunta del modelo y el posterior aproximado."

#### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\mathbb{E}_{q_\phi(y, \mathbf{z} \mid \mathbf{x})}$ | Esperanza bajo el posterior aproximado **completo**, que incluye tanto la predicción de $y$ como la inferencia de $\mathbf{z}$. |
| $p_\theta(\mathbf{x}, y, \mathbf{z})$ | Distribución conjunta del modelo: $p(y) \cdot p(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid y, \mathbf{z})$. |
| $q_\phi(y, \mathbf{z} \mid \mathbf{x})$ | Posterior aproximado completo: $q_\phi(y \mid \mathbf{x}) \cdot q_\phi(\mathbf{z} \mid \mathbf{x}, y)$. |

### Ecuación 26 — ELBO para datos etiquetados

$$\text{ELBO}(\mathbf{x}, y; \theta, \phi) = \mathbb{E}_{q_\phi(\mathbf{z} \mid \mathbf{x}, y)} \left[ \log \frac{p_\theta(\mathbf{x}, y, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x}, y)} \right]$$

#### Cómo se lee

> "El ELBO para un dato etiquetado es la esperanza, bajo el posterior aproximado **solo sobre $\mathbf{z}$** (porque $y$ ya lo conocemos), del logaritmo del ratio entre la conjunta y el posterior."

#### Diferencia clave

| | ELBO sin etiqueta (eq. 25) | ELBO con etiqueta (eq. 26) |
|---|---|---|
| ¿Qué es latente? | $y$ **y** $\mathbf{z}$ | Solo $\mathbf{z}$ |
| ¿Bajo qué distribución? | $q_\phi(y, \mathbf{z} \mid \mathbf{x})$ | $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ |
| ¿Qué marginaliza? | Sobre $y$ y $\mathbf{z}$ | Solo sobre $\mathbf{z}$ |

---

## Ecuaciones 27 y 28 — Objetivo con término de clasificación

### Ecuación 27 — Objetivo de Kingma et al. (2014)

$$\max_{\theta, \phi} \sum_{\mathbf{x} \in \mathbf{X}_u} \text{ELBO}(\mathbf{x}; \theta, \phi) + \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \text{ELBO}(\mathbf{x}, y; \theta, \phi) + \alpha \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \log q_\phi(y \mid \mathbf{x})$$

### Cómo se lee

> "Al objetivo de la ecuación 22, se le añade un término extra: $\alpha$ veces la suma del log de la probabilidad que el clasificador $q_\phi$ asigna a la etiqueta correcta $y$ para cada dato etiquetado."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\alpha$ | Hiperparámetro ($\alpha \geq 0$) que controla la importancia relativa del término de clasificación. Mayor $\alpha$ → más peso a clasificar bien. |
| $\log q_\phi(y \mid \mathbf{x})$ | Log-probabilidad que el clasificador asigna a la etiqueta correcta $y$. Es la **log-verosimilitud supervisada** del clasificador. |

### ¿Por qué añadir este término?

El ELBO solo maximiza la verosimilitud del modelo generativo. Kingma et al. (2014) observaron que eso no basta para aprender un buen clasificador. El término $\alpha \sum \log q_\phi(y \mid \mathbf{x})$ entrena el clasificador directamente con las etiquetas disponibles.

### Ecuación 28 — Variante simplificada (la que se usa en este ejercicio)

$$\max_{\theta, \phi} \sum_{\mathbf{x} \in \mathbf{X}} \text{ELBO}(\mathbf{x}; \theta, \phi) + \alpha \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \log q_\phi(y \mid \mathbf{x})$$

donde $\mathbf{X} = \{\mathbf{X}_u, \mathbf{X}_\ell\}$.

### Cómo se lee

> "Maximizar la suma del ELBO sin etiqueta sobre **todos** los datos (etiquetados y no), más $\alpha$ veces la log-verosimilitud del clasificador sobre los datos etiquetados."

### Diferencia con la ecuación 27

La simplificación es que se usa **un solo tipo de ELBO** — el $\text{ELBO}(\mathbf{x})$ sin etiqueta — aplicado a **todos** los datos. Se elimina el $\text{ELBO}(\mathbf{x}, y)$ separado para los datos etiquetados. Esto simplifica la implementación sin perder rendimiento significativo.

### Interpretación del objetivo

El enunciado ofrece una interpretación: se trata de maximizar el ELBO sujeto a una **restricción blanda** (soft constraint) de que el clasificador $q_\phi(y \mid \mathbf{x})$ funcione bien en los datos etiquetados. El peso $\alpha$ controla cuánto se penaliza una mala clasificación. Esto es una forma de **regularización de inferencia amortizada**.

### En código: la función `loss`

La ecuación 28 se implementa directamente en el método `loss` de `ssvae.py`:

```python
def loss(self, x, xl, yl):
    if self.gen_weight > 0:
        nelbo, kl_z, kl_y, rec = self.negative_elbo_bound(x)  # -ELBO sobre todos los datos
    else:
        nelbo, kl_z, kl_y, rec = [0] * 4                       # sin ELBO (baseline, --gw 0)
    ce = self.classification_cross_entropy(xl, yl)              # -log q(y|x) sobre etiquetados
    loss = self.gen_weight * nelbo + self.class_weight * ce     # ecuación 28 (negada)
    ...
```

| Argumento | Significado | Corresponde a |
|-----------|-------------|---------------|
| `x` | Batch de datos (todos, etiquetados y no) | $\mathbf{X}$ en ecuación 28 |
| `xl` | Datos etiquetados (imágenes) | $\mathbf{x} \in \mathbf{X}_\ell$ |
| `yl` | Etiquetas de los datos etiquetados (one-hot) | $y \in \mathbf{X}_\ell$ |

La correspondencia con la ecuación 28 (como **minimización**) es:

$$\min_{\theta, \phi} \quad \underbrace{\texttt{gen\_weight}}_{\text{default }1} \cdot \underbrace{(-\text{ELBO})}_{\texttt{nelbo}} \;+\; \underbrace{\texttt{class\_weight}}_{\text{default }100 = \alpha} \cdot \underbrace{(-\log q_\phi(y \mid \mathbf{x}))}_{\texttt{ce}}$$

Los valores por defecto son `gen_weight=1` y `class_weight=100`, lo que da un peso relativo alto al término de clasificación ($\alpha = 100$).

La función también devuelve un diccionario de métricas para monitorizar el entrenamiento:

```python
summaries = dict((
    ('train/loss', loss),      # pérdida total
    ('class/ce', ce),          # cross-entropy de clasificación
    ('gen/elbo', -nelbo),      # ELBO (positivo, para monitorizar)
    ('gen/kl_z', kl_z),        # componente KL_z
    ('gen/kl_y', kl_y),        # componente KL_y
    ('gen/rec', rec),          # componente de reconstrucción
))
```

---

## Apartado (a) — [3 puntos, Código]

> *"Run*
> *`python main.py --model ssvae --train --gw 0`"*

### ¿Qué pide?

Entrenar el SSVAE **sin** el término $\text{ELBO}(\mathbf{x})$, es decir, con el peso `gw` (generative weight) puesto a 0.

### ¿Qué significa `--gw 0`?

El flag `gw` controla cuánto peso se le da al término $\text{ELBO}(\mathbf{x})$ en el objetivo (ecuación 28). Cuando `gw = 0`, el ELBO se anula y queda solo:

$$\alpha \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \log q_\phi(y \mid \mathbf{x})$$

Esto equivale a un **clasificador supervisado puro** entrenado solo con los 100 datos etiquetados, sin aprovechar los datos sin etiquetar. Es el baseline de referencia.

### Ejecución y verificación

Los resultados se guardan en `submission/SSVAE_0.pkl` y se verifican con:

```
python grader.py 4a-0-basic
```

---

## Ecuaciones 29 y 30 — Descomposición del ELBO sin etiqueta

El enunciado descompone el $-\text{ELBO}(\mathbf{x}; \theta, \phi)$ en componentes interpretables:

### Ecuación 29

$$-\text{ELBO}(\mathbf{x}; \theta, \phi) = -\mathbb{E}_{q_\phi(y|\mathbf{x})} \log \frac{p(y)}{q_\phi(y \mid \mathbf{x})} - \mathbb{E}_{q_\phi(y|\mathbf{x})} \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x},y)} \left( \log \frac{p(\mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x}, y)} + \log p_\theta(\mathbf{x} \mid \mathbf{z}, y) \right)$$

### Ecuación 30 — La misma, reescrita con nombres

$$\underbrace{D_{\text{KL}}(q_\phi(y \mid \mathbf{x}) \| p(y))}_{\text{KL}_y} + \underbrace{\mathbb{E}_{q_\phi(y|\mathbf{x})} D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}, y) \| p(\mathbf{z}))}_{\text{KL}_z} + \underbrace{\mathbb{E}_{q_\phi(y, \mathbf{z}|\mathbf{x})} [-\log p_\theta(\mathbf{x} \mid \mathbf{z}, y)]}_{\text{Reconstrucción}}$$

### Cómo se lee

> "El negativo del ELBO se descompone en tres términos: (1) la KL entre el clasificador y el prior uniforme sobre etiquetas, (2) la esperanza (sobre $y$) de la KL entre el encoder y el prior sobre $\mathbf{z}$, y (3) la pérdida de reconstrucción promediada sobre las predicciones de $y$ y las muestras de $\mathbf{z}$."

### Los tres términos

| Término | Nombre | ¿Qué mide? |
|---------|--------|-------------|
| $D_{\text{KL}}(q_\phi(y \mid \mathbf{x}) \| p(y))$ | $\text{KL}_y$ | Cuánto difiere la predicción del clasificador de la distribución uniforme $\frac{1}{10}$. Penaliza predicciones muy seguras (que concentren toda la probabilidad en un dígito). |
| $\mathbb{E}_{q_\phi(y\|\mathbf{x})} D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}, y) \| p(\mathbf{z}))$ | $\text{KL}_z$ | Para cada posible etiqueta $y$, cuánto difiere el encoder de $\mathbf{z}$ del prior Gaussiano. Promediada sobre las predicciones de $y$. |
| $\mathbb{E}_{q_\phi(y, \mathbf{z}\|\mathbf{x})} [-\log p_\theta(\mathbf{x} \mid \mathbf{z}, y)]$ | Reconstrucción | Qué tan bien puede el decoder reconstruir $\mathbf{x}$ a partir de $\mathbf{z}$ y $y$. Promediada sobre todas las combinaciones de $y$ y $\mathbf{z}$. |

### Intuición

La descomposición separa los tres "costes" del modelo:

```
-ELBO(x) = KL_y + KL_z + Reconstrucción

KL_y:            ¿El clasificador se parece al prior uniforme?
KL_z:            ¿El encoder de z se parece al prior N(0,I)?
Reconstrucción:  ¿El decoder regenera bien la imagen original?
```

---

## Apartado (b) — [4.50 puntos, Código]

> *"Implement the `negative_elbo_bound` function in `ssvae.py`. Note that the function expects as output the negative Evidence Lower Bound as well as its decomposition into the following terms"*

### ¿Qué pide?

Implementar la función `negative_elbo_bound` en `ssvae.py` que calcula el $-\text{ELBO}(\mathbf{x}; \theta, \phi)$ y sus tres componentes: $\text{KL}_y$, $\text{KL}_z$, y la reconstrucción.

### Ecuación 31 — Aproximación práctica del $-\text{ELBO}$

$$D_{\text{KL}}(q_\phi(y \mid \mathbf{x}) \| p(y)) + \sum_{y \in \mathcal{Y}} q_\phi(y \mid \mathbf{x}) \left[ D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}, y) \| p(\mathbf{z})) - \log p_\theta\left(\mathbf{x} \mid \mathbf{z}^{(y)}, y\right) \right]$$

donde $\mathbf{z}^{(y)} \sim q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ denota una muestra de la distribución de inferencia condicionada a cada posible pareja $(\mathbf{x}, y)$.

#### Cómo se lee

> "Aproximamos el negativo del ELBO como: la KL entre el clasificador y el prior uniforme, más una suma sobre las 10 posibles etiquetas $y$, ponderada por las probabilidades del clasificador, de la KL del encoder de $\mathbf{z}$ menos la log-probabilidad de reconstrucción."

#### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\sum_{y \in \mathcal{Y}}$ | Suma sobre las 10 etiquetas $\{0, 1, \ldots, 9\}$. |
| $q_\phi(y \mid \mathbf{x})$ | Probabilidad que el clasificador asigna a cada etiqueta $y$. Son 10 valores que suman 1. |
| $D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}, y) \| p(\mathbf{z}))$ | KL entre una Gaussiana (el encoder condicionado a $y$) y la Gaussiana estándar $\mathcal{N}(0, I)$. Esta KL **sí** tiene fórmula cerrada (como en el VAE del ejercicio 1). |
| $\mathbf{z}^{(y)}$ | Muestra del encoder condicionada a la etiqueta $y$. Se genera una muestra **diferente** para cada valor de $y$. |
| $\log p_\theta(\mathbf{x} \mid \mathbf{z}^{(y)}, y)$ | Log-probabilidad de reconstruir $\mathbf{x}$ dado el código $\mathbf{z}^{(y)}$ y la etiqueta $y$. |

#### Desglose de cómo se calculan las esperanzas

El enunciado explica dos decisiones de aproximación:

1. **Sobre $y$**: Como solo hay 10 etiquetas, se computan las expectativas con respecto a $q_\phi(y \mid \mathbf{x})$ **exactamente** (sumando sobre los 10 valores, ponderado por sus probabilidades).

2. **Sobre $\mathbf{z}$**: Se usa **una sola muestra de Monte Carlo** de $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ para cada valor de $y$. Es decir, para cada $y \in \{0, \ldots, 9\}$, se muestrea un $\mathbf{z}^{(y)}$ diferente.

```
Para cada x del batch:

  y=0: z⁽⁰⁾ ~ q(z|x,y=0) → KL_z(y=0) y Recon(y=0), ponderados por q(y=0|x)
  y=1: z⁽¹⁾ ~ q(z|x,y=1) → KL_z(y=1) y Recon(y=1), ponderados por q(y=1|x)
  ...
  y=9: z⁽⁹⁾ ~ q(z|x,y=9) → KL_z(y=9) y Recon(y=9), ponderados por q(y=9|x)

  KL_y  = KL(q(y|x) || p(y))          ← una sola divergencia, sobre 10 categorías
  KL_z  = Σ_y q(y|x) · KL(q(z|x,y) || p(z))
  Recon = Σ_y q(y|x) · (-log p(x|z⁽ʸ⁾,y))
```

### Funciones auxiliares (de `utils.py`)

#### `kl_normal` — KL entre dos Gaussianas

Se usa para calcular $D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}, y) \| p(\mathbf{z}))$.

```python
def kl_normal(qm, qv, pm, pv):
    """
    Args:
        qm: (batch, dim) — media de q
        qv: (batch, dim) — varianza de q
        pm: (batch, dim) — media de p     (para el prior: 0)
        pv: (batch, dim) — varianza de p  (para el prior: 1)
    Return:
        kl: (batch,) — KL por muestra (suma sobre dimensiones de z)
    """
    element_wise = 0.5 * (torch.log(pv) - torch.log(qv) + qv / pv + (qm - pm).pow(2) / pv - 1)
    kl = element_wise.sum(-1)   # suma sobre las 64 dimensiones de z
    return kl
```

#### `kl_cat` — KL entre dos Categóricas

Se usa para calcular $D_{\text{KL}}(q_\phi(y \mid \mathbf{x}) \| p(y))$.

```python
def kl_cat(q, log_q, log_p):
    """
    Args:
        q:     (batch, dim) — probabilidades de q            → y_prob
        log_q: (batch, dim) — log-probabilidades de q        → y_logprob
        log_p: (batch, dim) — log-probabilidades del prior   → log(1/10)
    Return:
        kl: (batch,) — KL por muestra
    """
    element_wise = (q * (log_q - log_p))
    kl = element_wise.sum(-1)   # suma sobre las 10 categorías
    return kl
```

**Atención con `log_p`**: debe ser un tensor de log-probabilidades del prior uniforme, es decir, $\log(1/10)$ para cada categoría. Si se pasa un valor incorrecto aquí, $\text{KL}_z$ puede explotar (ver Nota 1 abajo).

#### `log_bernoulli_with_logits` — Log-probabilidad de Bernoulli

Se usa para calcular $\log p_\theta(\mathbf{x} \mid \mathbf{z}, y)$ (el término de reconstrucción).

```python
def log_bernoulli_with_logits(x, logits):
    """
    Args:
        x:      (batch, 784) — imagen observada (píxeles en [0,1])
        logits: (batch, 784) — salida del decoder (logits, sin sigmoid)
    Return:
        log_prob: (batch,) — log p(x|z,y) por muestra (suma sobre 784 píxeles)
    """
    bce = torch.nn.BCEWithLogitsLoss(reduction='none')
    log_prob = -bce(input=logits, target=x).sum(-1)
    return log_prob
```

Usa `BCEWithLogitsLoss` internamente, que aplica sigmoid + BCE de forma numéricamente estable. El negativo es porque `BCEWithLogitsLoss` devuelve la pérdida (negativo de log-prob).

#### `sample_gaussian` — Reparameterization trick

Se usa para muestrear $\mathbf{z}^{(y)} \sim q_\phi(\mathbf{z} \mid \mathbf{x}, y)$.

```python
def sample_gaussian(m, v):
    """z = μ + σ · ε, donde ε ~ N(0,1)"""
    e = torch.randn_like(m)     # ε ~ N(0,1), misma forma que μ
    s = torch.sqrt(v)            # σ = √(σ²)
    z = m + s * e                # reparameterization trick
    return z
```

#### `duplicate` — Replicar tensores

Se usa para expandir x a todas las combinaciones con las 10 etiquetas.

```python
def duplicate(x, rep):
    """Duplica x 'rep' veces a lo largo de dim=0.
    (batch, ...) → (batch * rep, ...)"""
    return x.expand(rep, *x.shape).reshape(-1, *x.shape[1:]).to(x.device)
```

### Código ya proporcionado para vectorización

El código dentro de `negative_elbo_bound` ya incluye la lógica de vectorización para enumerar todas las combinaciones de x con las 10 etiquetas:

```python
y_logits = self.cls(x)
y_logprob = F.log_softmax(y_logits, dim=1)
y_prob = torch.softmax(y_logprob, dim=1)  # (batch, 10)

# Crear todas las combinaciones (x, y) para y ∈ {0,...,9}
y = np.repeat(np.arange(self.y_dim), x.size(0))  # [0,0,...,0, 1,1,...,1, ..., 9,9,...,9]
y = x.new(np.eye(self.y_dim)[y])                  # one-hot: (batch*10, 10)
x = ut.duplicate(x, self.y_dim)                    # replica x 10 veces: (batch*10, 784)
```

Después de esto, `x` tiene forma `(batch*10, 784)` e `y` tiene forma `(batch*10, 10)`. Cada imagen aparece 10 veces, una vez por cada posible etiqueta.

```
Antes:                          Después (batch=3, y_dim=10):
  x = [x₁, x₂, x₃]             x = [x₁,x₂,x₃, x₁,x₂,x₃, ..., x₁,x₂,x₃]  (30 filas)
                                 y = [y=0,y=0,y=0, y=1,y=1,y=1, ..., y=9,y=9,y=9] (30 filas)
```

### Hints del código para la implementación

Los comentarios en `ssvae.py` dan estas pistas:

1. **HINT 1**: Usar `kl_normal` y `kl_cat` de `utils.py`.

2. **HINT 2**: Empezar calculando KL_y, KL_z y rec por separado. Para KL_z y rec hay una dimensión extra (`y_dim`) para la expectativa sobre $y$.

3. **HINT 3** (crucial para el reshape): Al calcular la expectativa $\sum_y q(y|\mathbf{x}) \cdot [\cdots]$, los valores de KL_z y rec están **agrupados por `y_dim`**, así que hay que hacer reshape a `(y_dim, batch)` y **NO** a `(batch, y_dim)`. Se puede usar la transpuesta de `y_prob` para la ponderación.

4. **HINT 4**: Usar `log_bernoulli_with_logits` para calcular el término de reconstrucción.

```
¿Por qué (y_dim, batch) y no (batch, y_dim)?

Después de duplicate, el orden de los datos es:
  [y=0: x₁,x₂,...,xₙ | y=1: x₁,x₂,...,xₙ | ... | y=9: x₁,x₂,...,xₙ]

Es decir, primero van TODAS las muestras del batch para y=0,
luego todas para y=1, etc. Así que al hacer reshape (y_dim, batch):
  fila 0 = resultados para y=0 de todas las muestras
  fila 1 = resultados para y=1 de todas las muestras
  ...
  fila 9 = resultados para y=9 de todas las muestras

Y y_prob.T tiene forma (y_dim, batch), donde cada fila contiene
q(y=k|x) para todas las muestras. Así la multiplicación elemento a
elemento y_prob.T * valores da los términos ponderados correctamente.
```

### Notas del enunciado

- **Nota 1**: Si el término $\text{KL}_z$ crece descontroladamente durante el entrenamiento, revisar los inputs a `kl_cat`. Comprobar especialmente el tercer argumento (`log_p` debe ser $\log(1/10)$ para cada categoría, no las log-probabilidades del posterior).
- **Nota 2**: Si la accuracy cae durante el entrenamiento, probablemente hay un error de reshape o de summing sobre la dimensión incorrecta (ver HINT 3).

---

## Apartado (c) — [3 puntos, Código]

> *"Run*
> *`python main.py --model ssvae --train`"*
>
> *"This will run the SSVAE with the ELBO(x) term included, and thus perform semi-supervised learning."*

### ¿Qué pide?

Entrenar el SSVAE **completo** (con el término $\text{ELBO}(\mathbf{x})$ activo), usando tanto datos etiquetados como no etiquetados.

### ¿Qué se espera?

La accuracy del clasificador en el test set debería ser **mayor que 90%**. Compara esto con el apartado (a) donde solo se usaban los 100 datos etiquetados — la mejora viene de aprovechar los datos sin etiquetar a través del modelo generativo.

### Ejecución y verificación

Los resultados se guardan en `submission/SSVAE_1.pkl` y se verifican con:

```
python grader.py 4c-0-basic
```

---

## Resumen del ejercicio 4

| Apartado | Tipo | Puntos | ¿Qué hacer? |
|----------|------|--------|-------------|
| (a) | Código | 3 | Entrenar SSVAE sin ELBO(x) (`--gw 0`) — baseline supervisado |
| (b) | Código | 4.50 | Implementar `negative_elbo_bound` en `ssvae.py` |
| (c) | Código | 3 | Entrenar SSVAE completo — accuracy > 90% |
| **Total** | | **10.50** | |

### Conceptos clave del ejercicio

1. **Aprendizaje semi-supervisado**: usar datos sin etiquetar para mejorar la clasificación
2. **Dos variables latentes**: $y$ (discreta, el dígito) y $\mathbf{z}$ (continua, el estilo)
3. **Dos ELBOs**: uno para datos sin etiquetar (marginaliza $y$ y $\mathbf{z}$) y otro para datos etiquetados (marginaliza solo $\mathbf{z}$)
4. **Expectativa exacta sobre $y$**: como solo hay 10 categorías, se suma exactamente en vez de muestrear
5. **Término de clasificación $\alpha \log q_\phi(y \mid \mathbf{x})$**: señal supervisada adicional para entrenar el clasificador
6. **Regularización de inferencia amortizada**: entrenar el modelo generativo mejora el clasificador como efecto secundario
