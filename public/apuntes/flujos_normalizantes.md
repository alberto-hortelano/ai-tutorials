# Flujos Normalizantes (Normalizing Flows)

Estos apuntes explican la teoría de los **flujos normalizantes**, una familia de modelos generativos profundos que permite calcular verosimilitudes exactas y aprender representaciones latentes simultáneamente.

Basados en las notas del curso: [deepgenerativemodels.github.io/notes/flow](https://deepgenerativemodels.github.io/notes/flow/)

---

## Guía rápida de símbolos

| Símbolo | Nombre | Significado |
|---------|--------|-------------|
| $\mathbf{z}$ | Variable latente | Vector en el espacio simple (ruido), típicamente $\mathbf{z} \sim \mathcal{N}(\mathbf{0}, I)$ |
| $\mathbf{x}$ | Variable observada | Vector en el espacio de datos (imágenes, audio, etc.) |
| $f$ | Transformación forward | Función que mapea $\mathbf{z} \to \mathbf{x}$. Debe ser **invertible**. |
| $f^{-1}$ | Transformación inversa | Función que mapea $\mathbf{x} \to \mathbf{z}$. Deshace lo que hizo $f$. |
| $p_Z(\mathbf{z})$ | Distribución base | Distribución simple de la que sabemos muestrear (Gaussiana estándar). |
| $p_X(\mathbf{x})$ | Distribución del modelo | Distribución compleja que queremos aprender (la de los datos). |
| $J = \frac{\partial f^{-1}}{\partial \mathbf{x}}$ | Matriz Jacobiana | Matriz $n \times n$ de derivadas parciales de la transformación inversa. |
| $\det(J)$ | Determinante del Jacobiano | Escalar que mide cuánto "estira" o "comprime" la transformación localmente. |
| $\theta$ | Parámetros | Pesos de las redes neuronales que parametrizan la transformación $f_\theta$. |
| $n$ | Dimensionalidad | Dimensión de $\mathbf{x}$ y $\mathbf{z}$ (deben ser iguales en un flow). |
| $k$ | Número de capas | Cuántas transformaciones invertibles se componen. |

---

## 1. El contexto: ¿qué problema resuelven los flujos?

### 1.1 Lo que ya sabemos

En el curso hemos estudiado dos familias de modelos generativos basados en verosimilitud:

**Modelos autorregresivos** (PS1):

$$p_\theta(\mathbf{x}) = \prod_{i=1}^{n} p_\theta(x_i \mid \mathbf{x}_{<i})$$

Factorizan la distribución conjunta como producto de condicionales. Cada condicional es una distribución simple (ej: Gaussiana) parametrizada por una red neuronal.

**Autoencoders variacionales (VAEs)** (PS2):

$$p_\theta(\mathbf{x}) = \int p_\theta(\mathbf{x}, \mathbf{z}) \, d\mathbf{z}$$

Introducen variables latentes $\mathbf{z}$ que capturan factores ocultos. La integral sobre $\mathbf{z}$ es intratable, así que usamos el ELBO como cota inferior.

### 1.2 Fortalezas y debilidades

| Propiedad | Autorregresivos | VAEs | Flujos |
|-----------|----------------|------|--------|
| Verosimilitud exacta | Sí | No (solo ELBO) | **Sí** |
| Aprende representaciones latentes | No | Sí | **Sí** |
| Muestreo rápido | No (secuencial) | Sí | Depende del tipo |
| Entrenamiento estable | Sí | Sí | **Sí** |

Los flujos normalizantes combinan lo mejor de ambos mundos: **verosimilitud exacta** (como los autorregresivos) **y representaciones latentes** (como los VAEs).

### 1.3 La idea central

La idea es elegante: tomar una distribución **simple** que sabemos manejar (una Gaussiana estándar) y **deformarla** mediante una función invertible $f_\theta$ hasta que se parezca a la distribución de los datos.

```
Distribución simple               Distribución compleja
    p_Z (Gaussiana)    ════ f_θ ════►    p_X (datos)

         ●                                  ●  ●
        ●●●             deformar           ●    ●
       ●●●●●           ────────►         ●  ●●  ●
        ●●●                                ●    ●
         ●                                  ●  ●
```

**Analogía:** Imagina una lámina de goma con una Gaussiana pintada. Al estirar y doblar la lámina (sin romperla ni pegarla), la distribución cambia de forma. "Sin romperla" es la condición de invertibilidad: siempre puedes volver al estado original.

Como la transformación es invertible:
- **Generar muestras:** Muestrear $\mathbf{z} \sim \mathcal{N}(\mathbf{0}, I)$, luego calcular $\mathbf{x} = f_\theta(\mathbf{z})$.
- **Calcular verosimilitud:** Dado un dato $\mathbf{x}$, calcular $\mathbf{z} = f_\theta^{-1}(\mathbf{x})$ y evaluar la densidad usando la fórmula del cambio de variables.

---

## 2. La fórmula del cambio de variables (Change of Variables)

Esta es la pieza matemática fundamental de los flujos normalizantes. Explica cómo calcular la densidad de una variable aleatoria que es una transformación determinista de otra.

### 2.1 Intuición en 1D: ¿por qué la densidad cambia?

Imagina que tienes una regla elástica con puntos distribuidos uniformemente. Si estiras una sección de la regla, los puntos en esa sección se separan → la **densidad baja**. Si comprimes otra sección, los puntos se juntan → la **densidad sube**.

```
Antes (uniforme):     │ · · · · · · · · · · │
                       ↓ comprimir   estirar ↓
Después:              │····      ·   ·   ·   ·│

Donde se comprime → densidad SUBE
Donde se estira   → densidad BAJA
```

El factor que mide cuánto se estira o comprime la transformación en cada punto es la **derivada** $|f'(z)|$ en 1D, o el **determinante del Jacobiano** $|\det(J)|$ en múltiples dimensiones.

### 2.2 La fórmula en 1D

Si $X = f(Z)$ donde $f$ es invertible y diferenciable:

$$p_X(x) = p_Z\left(f^{-1}(x)\right) \cdot \left| \frac{d f^{-1}(x)}{d x} \right|$$

o equivalentemente, usando que $\frac{d f^{-1}}{d x} = \frac{1}{f'(f^{-1}(x))}$:

$$p_X(x) = \frac{p_Z\left(f^{-1}(x)\right)}{|f'(f^{-1}(x))|}$$

#### Cómo se lee

> "La densidad de $x$ bajo el modelo es igual a la densidad del punto correspondiente $z = f^{-1}(x)$ en el espacio base, dividida por cuánto 'estira' la transformación $f$ en ese punto."

#### Ejemplo numérico

Sea $Z \sim \mathcal{N}(0, 1)$ y $f(z) = 2z + 3$ (transformación afín con $\sigma = 2$, $\mu = 3$).

- Inversa: $f^{-1}(x) = (x - 3)/2$
- Derivada: $f'(z) = 2$ (constante)
- Para $x = 5$: $z = f^{-1}(5) = 1$, $p_Z(1) = 0.242$, $p_X(5) = 0.242 / 2 = 0.121$

La densidad se reduce a la mitad porque $f$ estira el espacio por un factor de 2.

> **Visualización interactiva:** Abre [`cambio_variables.html`](cambio_variables.html) para ver cómo la corrección Jacobiana afecta la densidad con distintas transformaciones.

### 2.3 La fórmula general ($n$ dimensiones)

$$p_X(\mathbf{x}) = p_Z\left(f^{-1}(\mathbf{x})\right) \cdot \left| \det\left(\frac{\partial f^{-1}(\mathbf{x})}{\partial \mathbf{x}}\right) \right|$$

#### Cómo se lee

> "La densidad de $\mathbf{x}$ es la densidad base evaluada en $\mathbf{z} = f^{-1}(\mathbf{x})$, multiplicada por el valor absoluto del determinante de la matriz Jacobiana de la transformación inversa."

#### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p_X(\mathbf{x})$ | La densidad del dato $\mathbf{x}$ bajo el modelo. Es lo que queremos calcular. |
| $p_Z(f^{-1}(\mathbf{x}))$ | La densidad base evaluada en el punto $\mathbf{z}$ que corresponde a $\mathbf{x}$. |
| $\frac{\partial f^{-1}(\mathbf{x})}{\partial \mathbf{x}}$ | **Matriz Jacobiana** de $f^{-1}$. Es una matriz $n \times n$ donde la entrada $(i, j)$ es $\frac{\partial z_i}{\partial x_j}$. |
| $\det(\cdot)$ | **Determinante** de la matriz. Un escalar que resume cómo la transformación cambia el "volumen" local. |
| $\|\cdot\|$ | **Valor absoluto**. Las densidades siempre son positivas. |

### 2.4 Cinco observaciones importantes

1. **Misma dimensionalidad:** $\mathbf{x}$ y $\mathbf{z}$ deben tener la **misma dimensión** $n$. Esto es una restricción importante de los flujos (a diferencia de VAEs, donde $\mathbf{z}$ puede tener dimensión diferente a $\mathbf{x}$).

2. **El Jacobiano es una matriz:** $\frac{\partial f^{-1}(\mathbf{x})}{\partial \mathbf{x}}$ tiene $n^2$ entradas. Calcular su determinante cuesta $O(n^3)$ en general — por eso necesitamos arquitecturas con Jacobianos eficientes.

3. **Forma alternativa:** Usando que $\det(A^{-1}) = \det(A)^{-1}$ para matrices invertibles:

   $$p_X(\mathbf{x}) = p_Z(\mathbf{z}) \cdot \left| \det\left(\frac{\partial f(\mathbf{z})}{\partial \mathbf{z}}\right) \right|^{-1}$$

4. **Preservación de volumen:** Si $|\det(J)| = 1$, la transformación no cambia el "volumen" — la distribución se deforma pero no se estira ni comprime. NICE tiene esta propiedad.

5. **En escala logarítmica** (más útil en la práctica):

   $$\log p_X(\mathbf{x}) = \log p_Z(f^{-1}(\mathbf{x})) + \log \left| \det\left(\frac{\partial f^{-1}(\mathbf{x})}{\partial \mathbf{x}}\right) \right|$$

   Los productos se convierten en sumas → numéricamente más estable.

---

## 3. Modelos de flujo normalizante

### 3.1 Definición formal

Un **modelo de flujo normalizante** es un modelo generativo con variables latentes donde el mapeo entre $\mathbf{z}$ y $\mathbf{x}$ es **determinista e invertible**:

$$\mathbf{x} = f_\theta(\mathbf{z}), \qquad \mathbf{z} = f_\theta^{-1}(\mathbf{x})$$

```
Modelo gráfico:

    Z ──── f_θ ────► X

  (latente)      (observado)
  N(0, I)        p_X(x; θ)
```

La verosimilitud marginal es **exacta** (no aproximada como en VAEs):

$$p_X(\mathbf{x}; \theta) = p_Z\left(f_\theta^{-1}(\mathbf{x})\right) \cdot \left| \det\left(\frac{\partial f_\theta^{-1}(\mathbf{x})}{\partial \mathbf{x}}\right) \right|$$

### 3.2 ¿Por qué se llaman "normalizing flows"?

- **"Normalizing"** (normalizante): la fórmula del cambio de variables produce una densidad correctamente **normalizada** (integra a 1) después de la transformación.

- **"Flow"** (flujo): las transformaciones invertibles se pueden **componer** una tras otra, creando un "flujo" de transformaciones que lleva de la distribución simple a la compleja.

### 3.3 Los tres requisitos arquitectónicos

Cualquier red neuronal que usemos como $f_\theta$ debe cumplir:

| Requisito | ¿Por qué? | Consecuencia |
|-----------|-----------|--------------|
| Misma dimensión entrada/salida | Fórmula del cambio de variables lo exige | No puedes comprimir dimensiones (como en un autoencoder) |
| Invertibilidad | Necesitamos $f^{-1}$ para calcular $\mathbf{z}$ dado $\mathbf{x}$ | No puedes usar cualquier red; necesitas arquitecturas especiales |
| Jacobiano eficiente | Calcular $\det(J)$ de una matriz $n \times n$ general cuesta $O(n^3)$ | Las arquitecturas de flujo diseñan $f$ para que $\det(J)$ sea barato |

Estos requisitos son más restrictivos que los de autorregresivos o VAEs. Esa es la razón por la que existen varias familias de flujos con diferentes compromisos.

### 3.4 Composición de flujos

Una sola transformación simple no es suficientemente expresiva. La solución: **componer** $k$ transformaciones invertibles:

$$f = f_k \circ f_{k-1} \circ \cdots \circ f_1$$

```
z₀ ──► f₁ ──► z₁ ──► f₂ ──► z₂ ──► ··· ──► f_k ──► x
│              │              │                       │
p_Z(z₀)       p₁(z₁)        p₂(z₂)                 p_X(x)
(Gaussiana)    (un poco       (más                   (distribución
               deformada)     deformada)              compleja)
```

La log-verosimilitud se descompone como:

$$\log p_X(\mathbf{x}) = \log p_Z(\mathbf{z}_0) + \sum_{j=1}^{k} \log \left| \det\left(\frac{\partial f_j^{-1}(\mathbf{z}_j)}{\partial \mathbf{z}_j}\right) \right|$$

Cada capa aporta su propio término de corrección Jacobiana. En la práctica, pasamos $\mathbf{x}$ por todas las inversas $f_k^{-1}, f_{k-1}^{-1}, \ldots, f_1^{-1}$ acumulando los log-determinantes, y al final evaluamos $p_Z(\mathbf{z}_0)$.

> **Visualización interactiva:** Abre [`composicion_flujos.html`](composicion_flujos.html) para ver cómo apilar flujos planares deforma una Gaussiana 2D en distribuciones cada vez más complejas.

---

## 4. Flujos planares (Planar Flows)

El flujo planar es uno de los flujos más sencillos. Fue propuesto por Rezende & Mohamed (2015).

### 4.1 La transformación

$$\mathbf{x} = f_\theta(\mathbf{z}) = \mathbf{z} + \mathbf{u} \cdot h(\mathbf{w}^\top \mathbf{z} + b)$$

#### Símbolo por símbolo

| Símbolo | Tipo | Significado |
|---------|------|-------------|
| $\mathbf{z}$ | Vector $\in \mathbb{R}^n$ | Entrada (punto en el espacio latente) |
| $\mathbf{u}$ | Vector $\in \mathbb{R}^n$ | **Dirección** del desplazamiento. Determina hacia dónde se "empujan" los puntos. |
| $\mathbf{w}$ | Vector $\in \mathbb{R}^n$ | Define el **hiperplano** $\mathbf{w}^\top \mathbf{z} + b = 0$ que actúa como "bisagra". |
| $b$ | Escalar $\in \mathbb{R}$ | **Sesgo** del hiperplano. Desplaza la bisagra. |
| $h$ | Función | **No linealidad** (típicamente $\tanh$). Controla la forma del desplazamiento. |
| $\mathbf{w}^\top \mathbf{z}$ | Escalar | Producto punto. Mide la "distancia con signo" de $\mathbf{z}$ al hiperplano. |

#### Intuición

La transformación "empuja" los puntos en la dirección $\mathbf{u}$, con una intensidad que depende de qué lado del hiperplano $\mathbf{w}^\top \mathbf{z} + b = 0$ se encuentren. Es como doblar el espacio a lo largo de un plano.

```
Antes (puntos en 2D):          Después (flujo planar):

    · · · · · ·                    · · · · · ·
    · · · · · ·     ──────►        · · · · · ·
    · · · · · ·     "doblar"         · · · · · ·
    · · · · · ·     a lo largo         · · · · ·
    · · · · · ·     del plano            · · · ·
```

### 4.2 El determinante del Jacobiano

$$\left| \det\left(\frac{\partial f(\mathbf{z})}{\partial \mathbf{z}}\right) \right| = \left| 1 + h'(\mathbf{w}^\top \mathbf{z} + b) \cdot \mathbf{u}^\top \mathbf{w} \right|$$

Esto es $O(n)$, no $O(n^3)$, porque el Jacobiano tiene una estructura especial (identidad más un producto externo de rango 1).

### 4.3 Limitaciones

- **Invertibilidad condicional:** Los parámetros $\mathbf{u}$, $\mathbf{w}$, $b$ deben satisfacer ciertas restricciones para que $f$ sea invertible. Con $h = \tanh$, se requiere $h'(\mathbf{w}^\top \mathbf{z} + b) \cdot \mathbf{u}^\top \mathbf{w} \geq -1$.

- **Inversa difícil:** Aunque $f(\mathbf{z})$ tiene forma analítica, la inversa $f^{-1}(\mathbf{x})$ generalmente **no** tiene forma cerrada. Hay que usar métodos numéricos (ej: Newton).

- **Expresividad limitada por capa:** Cada capa planar solo puede "doblar" el espacio a lo largo de un plano. Se necesitan muchas capas para distribuciones complejas.

---

## 5. NICE y RealNVP: capas de acoplamiento (Coupling Layers)

Las capas de acoplamiento resuelven el problema de la inversa analítica de los flujos planares. Tanto la transformación forward como la inversa tienen formas simples y cerradas.

### 5.1 La idea: dividir y conquistar

La estrategia es particionar el vector $\mathbf{z}$ en dos mitades y transformar una mitad condicionada en la otra:

```
z = (z₁, z₂)

┌──────────────────────────────────────────┐
│  z₁ ─────────────────────────────► x₁    │  ← pasa sin cambio (identidad)
│       │                                  │
│       ▼                                  │
│   [ m_θ(z₁) ] ──── suma/escala ──► x₂   │  ← z₂ se transforma usando z₁
│       ▲                                  │
│       │                                  │
│  z₂ ──┘                                 │
└──────────────────────────────────────────┘
```

**La clave:** como $x_1 = z_1$ (identidad), para invertir solo necesitas restar: $z_2 = x_2 - m_\theta(x_1)$. La red $m_\theta$ puede ser **arbitrariamente compleja** (no necesita ser invertible) porque solo se aplica a la mitad que no cambia.

### 5.2 NICE: acoplamiento aditivo

**Forward** ($\mathbf{z} \to \mathbf{x}$):

$$\mathbf{x}_1 = \mathbf{z}_1 \qquad \text{(identidad)}$$
$$\mathbf{x}_2 = \mathbf{z}_2 + m_\theta(\mathbf{z}_1) \qquad \text{(suma)}$$

**Inverse** ($\mathbf{x} \to \mathbf{z}$):

$$\mathbf{z}_1 = \mathbf{x}_1 \qquad \text{(identidad)}$$
$$\mathbf{z}_2 = \mathbf{x}_2 - m_\theta(\mathbf{x}_1) \qquad \text{(resta)}$$

#### Jacobiano

$$J = \frac{\partial \mathbf{x}}{\partial \mathbf{z}} = \begin{pmatrix} I & 0 \\ \frac{\partial m_\theta(\mathbf{z}_1)}{\partial \mathbf{z}_1} & I \end{pmatrix}$$

Es una **matriz triangular inferior por bloques**. Su determinante es el producto de los determinantes diagonales: $\det(I) \cdot \det(I) = 1$.

**NICE es volume-preserving** ($|\det(J)| = 1$): la transformación deforma pero no estira ni comprime el espacio. Esto simplifica el cálculo pero limita la expresividad.

### 5.3 RealNVP: acoplamiento afín

RealNVP añade un **factor de escala** que permite estirar y comprimir:

**Forward** ($\mathbf{z} \to \mathbf{x}$):

$$\mathbf{x}_1 = \mathbf{z}_1$$
$$\mathbf{x}_2 = \exp(s_\theta(\mathbf{z}_1)) \odot \mathbf{z}_2 + m_\theta(\mathbf{z}_1)$$

donde $\odot$ es el producto elemento a elemento.

**Inverse** ($\mathbf{x} \to \mathbf{z}$):

$$\mathbf{z}_1 = \mathbf{x}_1$$
$$\mathbf{z}_2 = (\mathbf{x}_2 - m_\theta(\mathbf{x}_1)) \odot \exp(-s_\theta(\mathbf{x}_1))$$

#### Jacobiano

$$J = \begin{pmatrix} I & 0 \\ \cdots & \text{diag}(\exp(s_\theta(\mathbf{z}_1))) \end{pmatrix}$$

$$|\det(J)| = \prod_i \exp(s_\theta(\mathbf{z}_1)_i) = \exp\left(\sum_i s_\theta(\mathbf{z}_1)_i\right)$$

RealNVP **no es volume-preserving**: la red $s_\theta$ controla cuánto se estira o comprime cada dimensión. Esto le da más expresividad que NICE.

### 5.4 Comparación NICE vs RealNVP

| Propiedad | NICE | RealNVP |
|-----------|------|---------|
| Transformación de $z_2$ | $z_2 + m(z_1)$ | $\exp(s(z_1)) \odot z_2 + m(z_1)$ |
| Redes neuronales | Solo $m_\theta$ | $m_\theta$ y $s_\theta$ |
| $\|\det(J)\|$ | $= 1$ siempre | $= \exp(\sum s_i)$ |
| Volume-preserving | Sí | No |
| Expresividad | Menor | Mayor |
| Invertir | $x_2 - m(x_1)$ | $(x_2 - m(x_1)) \cdot \exp(-s(x_1))$ |

### 5.5 ¿Y la otra mitad?

Un problema: una sola capa de acoplamiento **no transforma $z_1$** en absoluto. Para que ambas mitades se transformen, se alternan capas intercambiando cuál mitad es la "fija":

```
Capa 1: z₁ fijo, z₂ se transforma usando z₁
Capa 2: z₂ fijo, z₁ se transforma usando z₂
Capa 3: z₁ fijo, z₂ se transforma usando z₁
...
```

Esto es análogo a cómo MAF usa capas `PermuteLayer` entre bloques MADE (ver `PS-3/ex1.md`).

---

## 6. Flujos autorregresivos (Autoregressive Flows)

Los modelos autorregresivos Gaussianos pueden interpretarse como flujos normalizantes. Esta conexión es profunda y da lugar a dos familias importantes: MAF e IAF.

### 6.1 La conexión

Recuerda el modelo autorregresivo Gaussiano del PS1:

$$p(x_i \mid \mathbf{x}_{<i}) = \mathcal{N}(x_i \mid \mu_i(\mathbf{x}_{<i}), \sigma_i^2(\mathbf{x}_{<i}))$$

Cuando muestreamos, hacemos:

$$x_i = \mu_i(\mathbf{x}_{<i}) + z_i \cdot \sigma_i(\mathbf{x}_{<i}), \qquad z_i \sim \mathcal{N}(0, 1)$$

Esta ecuación define una **transformación invertible** $f: \mathbf{z} \to \mathbf{x}$. La inversa es:

$$z_i = \frac{x_i - \mu_i(\mathbf{x}_{<i})}{\sigma_i(\mathbf{x}_{<i})}$$

El Jacobiano es triangular (porque $x_i$ solo depende de $z_1, \ldots, z_i$), así que su determinante es el producto de la diagonal:

$$|\det(J)| = \prod_i \sigma_i(\mathbf{x}_{<i})$$

Esto es exactamente un normalizing flow.

### 6.2 MAF (Masked Autoregressive Flow)

MAF usa esta interpretación directamente, con bloques MADE para parametrizar los $\mu_i$ y $\sigma_i$.

```
MAF:

Forward (muestreo, z → x):     LENTO — secuencial O(n)
  x₁ = μ₁ + z₁·σ₁
  x₂ = μ₂(x₁) + z₂·σ₂(x₁)         ← necesita x₁ primero
  x₃ = μ₃(x₁,x₂) + z₃·σ₃(x₁,x₂)  ← necesita x₁, x₂ primero
  ...

Inverse (verosimilitud, x → z): RÁPIDO — paralelo O(1)
  Una pasada por MADE produce todos los μᵢ y σᵢ simultáneamente
  zᵢ = (xᵢ - μᵢ) / σᵢ   para todo i en paralelo
```

**Resumen MAF:** Verosimilitud rápida, muestreo lento.

> Para la implementación detallada de MAF con MADE, consulta [`PS-3/ex1.md`](PS-3/ex1.md).

### 6.3 IAF (Inverse Autoregressive Flow)

IAF invierte el proceso: el forward (muestreo) es paralelo, pero calcular la verosimilitud de datos nuevos es secuencial.

```
IAF:

Forward (muestreo, z → x):     RÁPIDO — paralelo O(1)
  Una pasada por la red produce todos los μᵢ(z_{<i}) y σᵢ(z_{<i})
  xᵢ = μᵢ(z_{<i}) + zᵢ·σᵢ(z_{<i})   para todo i en paralelo
  (porque z ya lo tenemos completo)

Inverse (verosimilitud, x → z): LENTO — secuencial O(n)
  z₁ = (x₁ - μ₁) / σ₁
  z₂ = (x₂ - μ₂(z₁)) / σ₂(z₁)         ← necesita z₁ primero
  z₃ = (x₃ - μ₃(z₁,z₂)) / σ₃(z₁,z₂)  ← necesita z₁, z₂ primero
```

**Resumen IAF:** Muestreo rápido, verosimilitud lenta.

### 6.4 MAF vs IAF

| Propiedad | MAF | IAF |
|-----------|-----|-----|
| Forward ($z \to x$) | Secuencial $O(n)$ | **Paralelo** $O(1)$ |
| Inverse ($x \to z$) | **Paralelo** $O(1)$ | Secuencial $O(n)$ |
| Calcular $p(\mathbf{x})$ de datos nuevos | **Rápido** | Lento |
| Muestrear | Lento | **Rápido** |
| Entrenamiento (MLE) | **Eficiente** | Ineficiente |
| Mejor para | Estimación de densidad | Generación rápida |

La asimetría es exactamente opuesta. MAF es bueno para **entrenar** (calcular verosimilitud rápido), IAF es bueno para **generar** (muestrear rápido).

### 6.5 Parallel WaveNet: lo mejor de ambos mundos

Parallel WaveNet combina MAF e IAF en un esquema de maestro-alumno:

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│   Maestro (MAF)          Alumno (IAF)               │
│   ─────────────          ───────────                │
│   Entrenado con MLE      Entrenado minimizando      │
│   (verosimilitud rápida) KL(alumno ‖ maestro)       │
│                                                     │
│   Evalúa p(x) rápido     Muestrea x rápido          │
│                                                     │
│   Se usa para EVALUAR    Se usa para GENERAR        │
│   al alumno durante      muestras en producción     │
│   entrenamiento                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

1. **Entrenar el maestro (MAF)** con MLE — es eficiente porque la verosimilitud se calcula rápido.
2. **Entrenar el alumno (IAF)** minimizando $D_\text{KL}(\text{IAF} \| \text{MAF})$. Esto funciona porque: el alumno genera muestras rápido (es IAF), y para esas mismas muestras ya tiene el ruido $\mathbf{z}$, así que calcular su propia verosimilitud es eficiente.
3. **En producción:** usar solo el alumno (IAF) para generar muestras rápidamente.

---

## 7. Tabla comparativa de familias de flujos

| Modelo | ¿Invertible? | Coste $\det(J)$ | Muestreo | Verosimilitud | Expresividad |
|--------|:---:|:---:|:---:|:---:|:---:|
| **Planar** | Con restricciones | $O(n)$ | Rápido | Rápido | Baja |
| **NICE** | Sí (analítico) | $O(1)$, $\det = 1$ | Rápido | Rápido | Media |
| **RealNVP** | Sí (analítico) | $O(n)$ | Rápido | Rápido | Media-alta |
| **MAF** | Sí | $O(n)$ | Lento $O(n)$ | **Rápido** $O(1)$ | Alta |
| **IAF** | Sí | $O(n)$ | **Rápido** $O(1)$ | Lento $O(n)$ | Alta |

---

## 8. Flujos en el panorama de modelos generativos

### 8.1 Ventajas

- **Verosimilitud exacta** — a diferencia de VAEs, no necesitan una cota (ELBO)
- **Representaciones latentes** — a diferencia de modelos autorregresivos puros, aprenden un espacio latente $\mathbf{z}$ con estructura
- **Entrenamiento estable** — a diferencia de GANs, no sufren de training mode collapse ni equilibrios inestables

### 8.2 Limitaciones

- **Misma dimensionalidad** — $\mathbf{z}$ y $\mathbf{x}$ deben tener la misma dimensión, lo que impide comprimir representaciones (un VAE puede tener $\mathbf{z}$ mucho más pequeño que $\mathbf{x}$)
- **Restricciones arquitectónicas** — la invertibilidad limita qué redes se pueden usar
- **Coste computacional** — componer muchas capas puede ser costoso en memoria y tiempo

### 8.3 Conexión con VAEs: el gap del ELBO

Un flujo normalizante se puede interpretar como un VAE donde el encoder es **exacto**. En un VAE, la brecha entre $\log p(\mathbf{x})$ y el ELBO es:

$$\log p_\theta(\mathbf{x}) - \text{ELBO} = D_\text{KL}(q_\phi(\mathbf{z}|\mathbf{x}) \| p_\theta(\mathbf{z}|\mathbf{x}))$$

En un flujo, la transformación invertible define $q(\mathbf{z}|\mathbf{x}) = \delta(\mathbf{z} - f^{-1}(\mathbf{x}))$ — un Dirac que coincide exactamente con la posterior verdadera. Por lo tanto, el gap KL es **cero** y la verosimilitud que calcula el flujo es **exacta**, no una cota inferior.

> **Conexión profunda:** Los flujos y los VAEs no son familias completamente separadas. Un VAE cuyo encoder fuera determinista e invertible sería exactamente un flujo normalizante. La diferencia práctica es que los VAEs permiten $\text{dim}(\mathbf{z}) < \text{dim}(\mathbf{x})$ (compresión), mientras los flujos exigen $\text{dim}(\mathbf{z}) = \text{dim}(\mathbf{x})$ (invertibilidad).

### 8.4 Conexión con el PS3

En el PS3, el ejercicio 1 implementa un modelo MAF de 5 capas sobre el dataset Moons (2D) usando bloques MADE. Los ejercicios 2-5 pasan a GANs, que son otra familia de modelos generativos que veremos por separado.

---

## 9. Glosario

| Castellano | Inglés | Definición breve |
|------------|--------|------------------|
| Flujo normalizante | Normalizing flow | Modelo generativo basado en transformaciones invertibles |
| Cambio de variables | Change of variables | Fórmula que relaciona densidades antes y después de una transformación |
| Jacobiano | Jacobian | Matriz de derivadas parciales de una transformación |
| Determinante | Determinant | Escalar que mide el cambio de volumen de una transformación |
| Capa de acoplamiento | Coupling layer | Capa que transforma la mitad de las variables condicionada en la otra mitad |
| Preservación de volumen | Volume preserving | Propiedad de transformaciones con $\|\det(J)\| = 1$ |
| Enmascaramiento | Masking | Técnica para hacer que la salida $i$ solo dependa de entradas $< i$ |
| Distribución base | Base distribution | Distribución simple de la que parte el flujo (típicamente Gaussiana) |
| Autorregresivo | Autoregressive | Cada variable depende solo de las anteriores |
