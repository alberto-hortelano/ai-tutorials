# Modelos de Difusion (DDPM / DDIM)

Estos apuntes explican la teoria de los **modelos de difusion**, una familia de modelos generativos profundos que aprenden a generar datos invirtiendo un proceso gradual de destruccion por ruido. Cubren DDPM (Denoising Diffusion Probabilistic Models) y DDIM (Denoising Diffusion Implicit Models).

Basados en las notas del curso.

---

## Guia rapida de simbolos

Antes de empezar, aqui tienes una tabla con los simbolos que vas a ver una y otra vez. Vuelve aqui siempre que te pierdas.

| Simbolo | Que es | Como se lee |
|---------|--------|-------------|
| $x_0$ | La imagen original (limpia, sin ruido) | "equis sub cero" |
| $x_t$ | La imagen en el paso $t$ del proceso de ruido | "equis sub te" |
| $x_T$ | Ruido puro, aproximadamente $\mathcal{N}(0, I)$ | "equis sub te mayuscula" |
| $T$ | Numero total de pasos de difusion (tipicamente 1000) | "te mayuscula" |
| $t$ | Paso actual (timestep), un entero entre 1 y $T$ | "te" |
| $\beta_t$ | Schedule de ruido en el paso $t$: cuanto ruido se anade | "beta sub te" |
| $\alpha_t$ | Complemento del ruido: $1 - \beta_t$ | "alfa sub te" |
| $\bar{\alpha}_t$ | Producto acumulado: $\prod_{s=1}^{t} \alpha_s$ | "alfa barra sub te" |
| $\epsilon$ | Ruido gaussiano estandar $\sim \mathcal{N}(0, I)$ | "epsilon" |
| $\epsilon_\theta(x_t, t)$ | Red neuronal que predice el ruido anadido | "epsilon sub theta de equis-te, te" |
| $q(x_t \| x_{t-1})$ | Proceso forward: distribucion de $x_t$ dado $x_{t-1}$ | "cu de equis-te dado equis-te-menos-uno" |
| $p_\theta(x_{t-1} \| x_t)$ | Proceso reverse: distribucion aprendida de $x_{t-1}$ dado $x_t$ | "pe sub theta de equis-te-menos-uno dado equis-te" |
| $\tilde{\mu}_t$ | Media de la posterior forward $q(x_{t-1} \| x_t, x_0)$ | "mu tilde sub te" |
| $\tilde{\beta}_t$ | Varianza de la posterior forward $q(x_{t-1} \| x_t, x_0)$ | "beta tilde sub te" |
| $\eta$ | Parametro de estocasticidad en DDIM (0 = determinista, 1 = DDPM) | "eta" |
| $\sigma_t$ | Desviacion estandar del termino estocastico en DDIM | "sigma sub te" |
| $m$ | Mascara binaria para inpainting (1 = pixel desconocido) | "eme" |
| $\mathcal{N}(\mu, \sigma^2 I)$ | Distribucion normal con media $\mu$ y covarianza $\sigma^2 I$ | "normal de mu, sigma cuadrado por identidad" |
| $\nabla_{x_t}$ | Gradiente respecto a $x_t$ | "nabla respecto a equis sub te" |

---

## 1. El contexto: que problema resuelven los modelos de difusion?

### 1.1 Lo que ya sabemos

En el curso hemos estudiado tres familias de modelos generativos:

**Modelos autorregresivos**: factorizan la distribucion como producto de condicionales.
**VAEs**: introducen variables latentes y optimizan el ELBO.
**Flujos normalizantes y GANs**: transformaciones invertibles y entrenamiento adversario.

### 1.2 Fortalezas y debilidades

| Propiedad | Autorregresivos | VAEs | GANs | Flujos | **Difusion** |
|-----------|----------------|------|------|--------|:---:|
| Calidad de muestras | Media | Media | Alta | Media | **Muy alta** |
| Verosimilitud exacta | Si | No (ELBO) | No | Si | No (ELBO) |
| Entrenamiento estable | Si | Si | **No** | Si | **Si** |
| Muestreo rapido | No | Si | **Si** | Depende | No (lento) |
| Diversidad de muestras | Alta | Alta | Baja (mode collapse) | Alta | **Alta** |

Los modelos de difusion ofrecen **calidad excepcional** y **diversidad alta** con **entrenamiento estable**, a cambio de un muestreo mas lento (que DDIM mitiga parcialmente).

### 1.3 La idea central

La idea es sorprendentemente simple: si aprendemos a destruir datos anadiendo ruido poco a poco, podemos aprender a **revertir** ese proceso para generar datos desde ruido puro.

**Analogia:** Imagina una senal de television perfecta. Poco a poco le vamos anadiendo estatica (ruido) hasta que solo ves nieve. El proceso forward es trivial: solo anadir estatica. La clave es que si cada paso anade **muy poco** ruido, el paso inverso (quitar un poquito de estatica) es aproximadamente gaussiano, y podemos entrenar una red neuronal para aprenderlo.

---

## 2. La idea intuitiva: dos procesos opuestos

Un modelo de difusion consta de dos procesos:

```
Proceso Forward (q): anadir ruido gradualmente
x_0 ───► x_1 ───► x_2 ───► ··· ───► x_T
imagen    un poco    mas               ruido
limpia    ruidosa    ruidosa           puro

Proceso Reverse (p_θ): quitar ruido gradualmente
x_T ───► x_{T-1} ───► ··· ───► x_1 ───► x_0
ruido                                     imagen
puro      ◄── red neuronal aprende ──►    generada
```

**El insight clave:** Si los pasos forward son suficientemente pequenos, los pasos reverse son **tambien aproximadamente gaussianos**. Esto significa que podemos parametrizarlos con una red neuronal que predice la media y varianza de cada paso reverse.

**Otra analogia:** Piensa en una escultura de arena. El proceso forward es el viento erosionandola gradualmente hasta que solo queda un monton informe. El proceso reverse es un escultor que, paso a paso, va dando forma al monton de arena hasta recrear la escultura. La red neuronal es ese escultor.

```
                     PROCESO FORWARD (q)
                    destruccion gradual
     ┌─────┐    ┌─────┐    ┌─────┐         ┌─────┐
     │     │    │ ░   │    │░░░░ │         │░░░░░│
     │  ☺  │ →  │ ░☺  │ →  │░░☺░ │ → ··· → │░░░░░│
     │     │    │ ░   │    │░░░░ │         │░░░░░│
     └─────┘    └─────┘    └─────┘         └─────┘
      x_0        x_1        x_2             x_T
     (limpia)   (algo de   (mas            (ruido
                 ruido)     ruido)          puro)

                     PROCESO REVERSE (p_θ)
                    generacion gradual
     ┌─────┐         ┌─────┐    ┌─────┐    ┌─────┐
     │░░░░░│         │░░░░ │    │ ░   │    │     │
     │░░░░░│ → ··· → │░░☺░ │ →  │ ░☺  │ →  │  ☺  │
     │░░░░░│         │░░░░ │    │ ░   │    │     │
     └─────┘         └─────┘    └─────┘    └─────┘
      x_T             x_2        x_1        x_0
     (ruido          (se ve     (casi      (imagen
      puro)          algo)      limpia)    generada)
```

---

## 3. Proceso forward: anadir ruido

### 3.1 Un paso del proceso forward

El proceso forward esta completamente definido (no tiene parametros que aprender). En cada paso, escalamos la imagen anterior y le anadimos ruido gaussiano:

$$q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{\alpha_t} \, x_{t-1}, (1 - \alpha_t) I)$$

#### Como se lee

> "cu de equis-te dado equis-te-menos-uno es una distribucion normal con media raiz-de-alfa-te por equis-te-menos-uno y varianza uno-menos-alfa-te por la matriz identidad."

#### Que significa

En cada paso hacemos dos cosas:
1. **Escalamos** la imagen anterior por $\sqrt{\alpha_t}$ (la hacemos un poco mas pequena en magnitud).
2. **Anadimos** ruido gaussiano con varianza $(1 - \alpha_t)$.

#### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $q(\cdot)$ | El proceso forward (fijo, no aprendido) |
| $x_t$ | La imagen ruidosa que obtenemos en el paso $t$ |
| $x_{t-1}$ | La imagen (menos ruidosa) del paso anterior |
| $\sqrt{\alpha_t}$ | Factor de escalado. Como $\alpha_t < 1$, esto reduce la senal |
| $(1 - \alpha_t)$ | Varianza del ruido anadido. Cuando $\alpha_t \approx 1$, se anade poco ruido |
| $I$ | Matriz identidad: el ruido es independiente en cada dimension (pixel) |

### 3.2 El schedule de ruido

El schedule $\{\beta_t\}_{t=1}^{T}$ controla **cuanto ruido** se anade en cada paso. Recuerda que $\alpha_t = 1 - \beta_t$.

**Schedule lineal tipico:**
- $\beta_1 = 10^{-4}$ (muy poco ruido al principio)
- $\beta_T = 0.02$ (un poco mas de ruido al final)
- Los valores intermedios se interpolan linealmente

```
Ruido anadido (β_t) a lo largo de los pasos:

β_t
 |                                          ·····
 |                                    ·····
 |                              ·····
 |                        ·····
 |                  ·····
 |            ·····
 |      ·····
 | ·····
 └──────────────────────────────────────────── t
 1                                            T=1000

 Al principio se anade muy poco ruido (cambios sutiles).
 Al final se anade mas (la imagen ya esta muy ruidosa, da igual).
```

**Intuicion:** Al principio, la imagen tiene mucha estructura, asi que queremos destruirla lentamente. Al final, ya es casi ruido, asi que podemos ser mas agresivos.

### 3.3 La marginal cerrada: saltar pasos

Esta es una propiedad **crucial** para el entrenamiento eficiente. Podemos ir **directamente** desde $x_0$ hasta cualquier $x_t$ sin calcular los pasos intermedios:

$$q(x_t | x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} \, x_0, (1 - \bar{\alpha}_t) I)$$

#### Como se lee

> "cu de equis-te dado equis-cero es una normal con media raiz-de-alfa-barra-te por equis-cero y varianza uno-menos-alfa-barra-te por la identidad."

#### Que significa

No necesitamos simular los $t$ pasos uno a uno. En un solo paso podemos obtener la imagen ruidosa en cualquier timestep $t$, usando el **producto acumulado** $\bar{\alpha}_t = \prod_{s=1}^{t} \alpha_s$.

#### Forma equivalente (la que se usa en codigo)

$$x_t = \sqrt{\bar{\alpha}_t} \, x_0 + \sqrt{1 - \bar{\alpha}_t} \, \epsilon \qquad \text{donde } \epsilon \sim \mathcal{N}(0, I)$$

#### Como se lee

> "equis-te es igual a raiz-de-alfa-barra-te por equis-cero mas raiz-de-uno-menos-alfa-barra-te por epsilon, donde epsilon es ruido gaussiano estandar."

#### Que significa cada parte

| Parte | Significado | Analogia |
|-------|-------------|----------|
| $\sqrt{\bar{\alpha}_t} \, x_0$ | La **senal original** atenuada. Cuanto mayor es $t$, mas pequeno es $\bar{\alpha}_t$, mas debil es la senal | "La senal de TV se va apagando" |
| $\sqrt{1 - \bar{\alpha}_t} \, \epsilon$ | El **ruido acumulado**. Cuanto mayor es $t$, mas ruido hay | "La estatica va subiendo de volumen" |

**Comportamiento extremo:**
- Cuando $t = 0$: $\bar{\alpha}_0 = 1$, asi que $x_0 = 1 \cdot x_0 + 0 \cdot \epsilon = x_0$ (imagen limpia).
- Cuando $t = T$ (grande): $\bar{\alpha}_T \approx 0$, asi que $x_T \approx 0 \cdot x_0 + 1 \cdot \epsilon = \epsilon$ (ruido puro).

```
Descomposicion de x_t:

  x_t = √ᾱ_t · x_0  +  √(1-ᾱ_t) · ε
        ─────────────    ───────────────
         senal              ruido
         (se apaga)         (crece)

  t=0:   100% senal  +  0% ruido     = imagen limpia
  t=T/2: ~50% senal  + ~50% ruido    = imagen borrosa/ruidosa
  t=T:    ~0% senal  + 100% ruido    = ruido puro
```

**Por que es crucial?** Porque durante el entrenamiento podemos:
1. Tomar un dato $x_0$ del dataset.
2. Elegir un timestep $t$ al azar.
3. Calcular $x_t$ directamente con la formula cerrada.
4. Entrenar la red para predecir el ruido $\epsilon$ que anadimos.

Sin esta formula, tendriamos que simular todos los pasos $1, 2, \ldots, t$ secuencialmente. Con ella, el entrenamiento es **eficiente y paralelizable**.

---

## 4. Proceso reverse: quitar ruido

### 4.1 La idea

El proceso reverse va de $x_T$ (ruido puro) a $x_0$ (imagen limpia), paso a paso. Cada paso reverse lo parametrizamos como una gaussiana cuyos parametros predice una red neuronal:

$$p_\theta(x_{t-1} | x_t) = \mathcal{N}(x_{t-1}; \mu_\theta(x_t, t), \sigma_t^2 I)$$

#### Como se lee

> "pe sub theta de equis-te-menos-uno dado equis-te es una normal con media mu-theta de equis-te y te, y varianza sigma-te al cuadrado por la identidad."

#### Que significa

La red neuronal recibe la imagen ruidosa $x_t$ y el timestep $t$, y predice los parametros (media y varianza) de la distribucion de la imagen un paso menos ruidosa $x_{t-1}$.

### 4.2 La red neuronal: prediccion de ruido

En la practica, la red neuronal (tipicamente una **UNet** con embedding temporal) **no predice la media directamente**. En cambio, predice el **ruido** $\epsilon$ que fue anadido:

$$\epsilon_\theta(x_t, t) \approx \epsilon$$

Es decir, dada la imagen ruidosa $x_t$ y el timestep $t$, la red intenta adivinar **que ruido se anadio**.

### 4.3 Estimacion de la imagen limpia

Una vez que tenemos la prediccion del ruido $\epsilon_\theta(x_t, t)$, podemos **estimar** la imagen original limpia. Despejando $x_0$ de la formula cerrada $x_t = \sqrt{\bar{\alpha}_t} \, x_0 + \sqrt{1 - \bar{\alpha}_t} \, \epsilon$:

$$\hat{x}_0 = \frac{x_t - \sqrt{1 - \bar{\alpha}_t} \, \epsilon_\theta(x_t, t)}{\sqrt{\bar{\alpha}_t}}$$

#### Como se lee

> "equis-cero-sombrero es igual a equis-te menos raiz-de-uno-menos-alfa-barra-te por epsilon-theta, todo dividido por raiz-de-alfa-barra-te."

#### Que significa

Simplemente estamos **invirtiendo** la formula del proceso forward. Si sabemos cuanto ruido se anadio ($\epsilon_\theta$), podemos restar ese ruido (escalado) de $x_t$ para recuperar una estimacion de $x_0$.

Esta es la funcion `predict_x0`.

#### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\hat{x}_0$ | Estimacion de la imagen limpia ("x-cero-sombrero") |
| $x_t$ | La imagen ruidosa actual |
| $\epsilon_\theta(x_t, t)$ | La prediccion del ruido por la red neuronal |
| $\sqrt{1 - \bar{\alpha}_t}$ | Factor de escala del ruido (cuanto ruido habia) |
| $\sqrt{\bar{\alpha}_t}$ | Factor de escala de la senal (cuanta senal quedaba) |

### 4.4 Objetivo de entrenamiento (simplificado)

$$\mathcal{L} = \mathbb{E}_{t, x_0, \epsilon}\left[\|\epsilon - \epsilon_\theta(x_t, t)\|^2\right]$$

#### Como se lee

> "La loss es la esperanza, sobre el timestep te, la imagen equis-cero y el ruido epsilon, del cuadrado de la norma de epsilon menos epsilon-theta de equis-te, te."

#### Que significa

Entrenamos la red para que su prediccion de ruido $\epsilon_\theta(x_t, t)$ se parezca lo maximo posible al ruido real $\epsilon$ que anadimos. Es simplemente un **error cuadratico medio** entre el ruido real y el predicho.

#### El algoritmo de entrenamiento

```
Repetir hasta convergencia:
  1. Tomar un dato x_0 del dataset
  2. Elegir t ~ Uniforme(1, T) al azar
  3. Muestrear ruido ε ~ N(0, I)
  4. Calcular x_t = √ᾱ_t · x_0 + √(1-ᾱ_t) · ε
  5. Calcular la loss: L = ‖ε - ε_θ(x_t, t)‖²
  6. Actualizar θ con descenso por gradiente
```

**Observacion importante:** En cada iteracion solo procesamos **un** timestep $t$ aleatorio (no todos). Esto hace el entrenamiento muy eficiente.

---

## 5. DDPM: muestreo paso a paso

### 5.1 La posterior forward: la distribucion clave

Cuando conocemos **tanto** $x_t$ como $x_0$, la distribucion de $x_{t-1}$ es **tractable** (gaussiana con forma cerrada). Esta es la **posterior forward**:

$$q(x_{t-1} | x_t, x_0) = \mathcal{N}(x_{t-1}; \tilde{\mu}_t, \tilde{\beta}_t I)$$

#### Como se lee

> "cu de equis-te-menos-uno dado equis-te y equis-cero es una normal con media mu-tilde-te y varianza beta-tilde-te por la identidad."

#### Que significa

Si supieramos la imagen original $x_0$ Y la imagen ruidosa $x_t$, podriamos calcular exactamente la distribucion del paso intermedio $x_{t-1}$. El problema es que durante la generacion **no conocemos** $x_0$. Por eso usamos la estimacion $\hat{x}_0$.

### 5.2 La media de la posterior forward

$$\tilde{\mu}_t = \frac{\sqrt{\bar{\alpha}_{t-1}} \, \beta_t}{1 - \bar{\alpha}_t} \, x_0 + \frac{\sqrt{\alpha_t} \, (1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t} \, x_t$$

#### Como se lee

> "mu-tilde-te es igual a raiz-de-alfa-barra-te-menos-uno por beta-te, sobre uno-menos-alfa-barra-te, todo por equis-cero, mas raiz-de-alfa-te por uno-menos-alfa-barra-te-menos-uno, sobre uno-menos-alfa-barra-te, todo por equis-te."

#### Que significa

La media es una **combinacion ponderada** de la imagen original $x_0$ y la imagen ruidosa actual $x_t$. Los coeficientes dependen del schedule de ruido y aseguran que la transicion sea correcta segun la cadena de Markov.

#### Simbolo por simbolo

| Parte | Significado |
|-------|-------------|
| $\frac{\sqrt{\bar{\alpha}_{t-1}} \beta_t}{1 - \bar{\alpha}_t}$ | Peso de $x_0$ en la combinacion. Cuanta "confianza" le damos a la imagen limpia |
| $\frac{\sqrt{\alpha_t}(1 - \bar{\alpha}_{t-1})}{1 - \bar{\alpha}_t}$ | Peso de $x_t$ en la combinacion. Cuanta "confianza" le damos a la imagen ruidosa actual |
| $x_0$ | La imagen limpia (en la practica, la reemplazamos por $\hat{x}_0$) |
| $x_t$ | La imagen ruidosa actual |

Esta es la funcion `compute_forward_posterior_mean`.

### 5.3 La varianza de la posterior forward

$$\tilde{\beta}_t = \frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t} \, \beta_t$$

#### Como se lee

> "beta-tilde-te es igual a uno-menos-alfa-barra-te-menos-uno, sobre uno-menos-alfa-barra-te, por beta-te."

#### Que significa

La varianza esta completamente determinada por el schedule de ruido. No depende de los datos ni de la red neuronal. Es simplemente una combinacion de los coeficientes del schedule.

Esta es la funcion `compute_forward_posterior_variance`.

### 5.4 El algoritmo completo de muestreo DDPM

```
Algoritmo: Muestreo DDPM
──────────────────────────────────────────────

1. Muestrear x_T ~ N(0, I)             ← empezar con ruido puro

2. Para t = T, T-1, ..., 1:
   a. Predecir el ruido:
      ε = ε_θ(x_t, t)

   b. Estimar la imagen limpia:
      x̂_0 = (x_t - √(1-ᾱ_t)·ε) / √ᾱ_t

   c. Calcular la media de la posterior:
      μ̃_t = coef1 · x̂_0  +  coef2 · x_t

   d. Calcular la varianza:
      β̃_t = [(1-ᾱ_{t-1}) / (1-ᾱ_t)] · β_t

   e. Muestrear:
      Si t > 1:  x_{t-1} = μ̃_t + √β̃_t · z    donde z ~ N(0,I)
      Si t = 1:  x_{t-1} = μ̃_t               (sin ruido en el ultimo paso)

3. Devolver x_0
```

**Por que no se anade ruido en $t = 1$?** Porque $x_0$ es la imagen final y no queremos anadirle ruido. La media $\tilde{\mu}_1$ ya es nuestra mejor estimacion.

**Desventaja de DDPM:** Requiere los $T$ pasos completos (tipicamente 1000). Cada paso requiere una pasada por la UNet. Esto hace que la generacion sea **lenta** comparada con GANs o VAEs.

---

## 6. DDIM: muestreo rapido y determinista

### 6.1 Motivacion

DDPM necesita 1000 pasos para generar una imagen. DDIM resuelve esto permitiendo **saltar pasos** durante el muestreo, reduciendo a 10-50 pasos con buena calidad.

La idea clave: DDIM define un proceso reverse **no markoviano** que comparte las mismas marginales $q(x_t | x_0)$ que DDPM, pero puede operar sobre una subsecuencia de timesteps.

### 6.2 La formula de muestreo DDIM

$$x_{t-1} = \underbrace{\sqrt{\bar{\alpha}_{t-1}} \, \hat{x}_0}_{\text{predicted\_x0 (escalado)}} + \underbrace{\sqrt{1 - \bar{\alpha}_{t-1} - \sigma_t^2} \, \epsilon_\theta(x_t, t)}_{\text{predict\_sample\_direction}} + \underbrace{\sigma_t \, z}_{\text{stochasticity\_term}}$$

#### Como se lee

> "equis-te-menos-uno es igual a raiz-de-alfa-barra-te-menos-uno por equis-cero-sombrero, mas raiz-de-uno-menos-alfa-barra-te-menos-uno-menos-sigma-te-al-cuadrado por epsilon-theta, mas sigma-te por zeta."

#### Que significa cada termino

| Termino | Nombre | Que hace |
|---------|---------------|---------|
| $\sqrt{\bar{\alpha}_{t-1}} \, \hat{x}_0$ | (escalado de `predict_x0`) | Apunta hacia la imagen limpia estimada, escalada al nivel de ruido del paso $t-1$ |
| $\sqrt{1 - \bar{\alpha}_{t-1} - \sigma_t^2} \, \epsilon_\theta(x_t, t)$ | `predict_sample_direction` | "Direccion" hacia la que la muestra debe moverse, basada en el ruido predicho |
| $\sigma_t \, z$ | `stochasticity_term` | Ruido aleatorio opcional. Cuando $\sigma_t = 0$, el proceso es determinista |

### 6.3 El parametro $\sigma_t$ y su formula

$$\sigma_t = \eta \sqrt{\frac{1 - \bar{\alpha}_{t-1}}{1 - \bar{\alpha}_t}} \sqrt{\beta_t}$$

#### Como se lee

> "sigma-te es igual a eta por raiz-de-uno-menos-alfa-barra-te-menos-uno-sobre-uno-menos-alfa-barra-te, por raiz-de-beta-te."

#### Que significa

El parametro $\eta$ (eta) controla **cuanta estocasticidad** tiene el proceso reverse:

| Valor de $\eta$ | Comportamiento | Resultado |
|:---:|---|---|
| $\eta = 0$ | $\sigma_t = 0$, completamente **determinista** | DDIM puro |
| $\eta = 1$ | Equivalente a DDPM | DDPM clasico |
| $0 < \eta < 1$ | Parcialmente estocastico | Interpolacion entre DDIM y DDPM |

Esta es la funcion `get_stochasticity_std`.

### 6.4 La ventaja clave: saltar pasos

DDIM permite usar una **subsecuencia** de timesteps en lugar de todos los $T$ pasos:

```
DDPM (1000 pasos):
x_1000 → x_999 → x_998 → ··· → x_2 → x_1 → x_0
 (cada paso requiere una pasada por la UNet)

DDIM (50 pasos, subsecuencia uniforme):
x_1000 → x_980 → x_960 → ··· → x_40 → x_20 → x_0
 (solo 50 pasadas por la UNet, 20x mas rapido)

DDIM (10 pasos):
x_1000 → x_900 → x_800 → ··· → x_200 → x_100 → x_0
 (solo 10 pasadas, 100x mas rapido)
```

**Por que funciona?** Porque la formula de DDIM usa directamente $\bar{\alpha}_{t-1}$ y $\bar{\alpha}_t$ (las acumuladas), no los $\beta_t$ individuales. Asi que podemos "saltar" timesteps sin que la formula se rompa.

### 6.5 El algoritmo completo de muestreo DDIM

```
Algoritmo: Muestreo DDIM
──────────────────────────────────────────────

Entrada: subsecuencia de timesteps S = [τ_1, τ_2, ..., τ_K]
         parametro η (0 = determinista, 1 = DDPM)

1. Muestrear x_{τ_K} ~ N(0, I)         ← empezar con ruido puro

2. Para i = K, K-1, ..., 1:
   Sea t = τ_i  y  t' = τ_{i-1}  (o 0 si i=1)

   a. Predecir el ruido:
      ε = ε_θ(x_t, t)

   b. Estimar la imagen limpia:
      x̂_0 = (x_t - √(1-ᾱ_t)·ε) / √ᾱ_t

   c. Calcular σ_t:
      σ_t = η · √[(1-ᾱ_{t'})/(1-ᾱ_t)] · √β_t

   d. Calcular la direccion:
      dir = √(1 - ᾱ_{t'} - σ_t²) · ε

   e. Muestrear:
      x_{t'} = √ᾱ_{t'} · x̂_0  +  dir  +  σ_t · z
      (donde z ~ N(0,I) si t > 1, sino z = 0)

3. Devolver x_0
```

### 6.6 Propiedad especial: interpolacion en espacio latente

Cuando $\eta = 0$, DDIM es completamente determinista: la misma semilla de ruido $x_T$ siempre produce la misma imagen $x_0$. Esto significa que $x_T$ funciona como un **espacio latente**.

Podemos interpolar entre dos imagenes interpolando sus ruidos iniciales:

```
x_T^(A) ──────────── DDIM ────────────► imagen A

x_T^(interp) = (1-λ)·x_T^(A) + λ·x_T^(B)   ← interpolacion lineal en espacio de ruido

x_T^(B) ──────────── DDIM ────────────► imagen B

La imagen interpolada sera una "mezcla" coherente de A y B.
```

En DDPM esto **no funciona** porque el proceso es estocastico: la misma semilla da imagenes distintas cada vez.

---

## 7. DDPM vs DDIM: tabla comparativa

| Propiedad | DDPM | DDIM |
|-----------|------|------|
| Proceso reverse | Estocastico (anade ruido $z$ en cada paso) | Determinista ($\eta=0$) o estocastico ($\eta>0$) |
| Pasos tipicos de muestreo | 1000 | 10-50 |
| Velocidad de muestreo | Lento | **Rapido** (10-100x mas rapido) |
| Calidad con pocos pasos (<50) | Mala (se degrada mucho) | **Buena** |
| Calidad con muchos pasos (1000) | **Excelente** | Excelente |
| Misma semilla → misma imagen | No (aleatorio por naturaleza) | **Si** (cuando $\eta=0$) |
| Interpolacion en espacio latente | No bien definida | **Si** (el ruido $x_T$ es el latente) |
| Parametro extra | Ninguno | $\eta$ (controla estocasticidad) |
| Red neuronal | Misma $\epsilon_\theta$ | **Misma** $\epsilon_\theta$ (entrenada con DDPM) |

**Punto clave:** DDPM y DDIM **comparten la misma red neuronal**. La diferencia esta solo en el **algoritmo de muestreo**. Puedes entrenar con el objetivo de DDPM y luego muestrear con cualquiera de los dos.

```
Entrenamiento          Muestreo (opcion A)      Muestreo (opcion B)
───────────            ──────────────────        ──────────────────
  Mismo                    DDPM                      DDIM
  objetivo    ──►      1000 pasos           o     50 pasos
  de DDPM              estocastico                determinista
  (predecir ε)         calidad maxima              rapido
```

---

## 8. Inpainting: rellenar regiones faltantes

### 8.1 El problema

Dado una imagen con una region faltante (oculta, danada, borrada), queremos generar contenido **coherente** para rellenar esa region.

### 8.2 La mascara binaria

Usamos una mascara binaria $m$ donde:
- $m = 0$ → pixel **conocido** (lo tenemos de la imagen original)
- $m = 1$ → pixel **desconocido** (hay que generarlo)

### 8.3 La idea: mezclar en cada paso

En cada paso $t$ del proceso reverse, combinamos:
- Para los pixeles **conocidos**: tomamos el valor de la imagen original pasada por el proceso forward hasta el paso $t$ (anadimos ruido a la original).
- Para los pixeles **desconocidos**: tomamos el valor que produce el modelo (la generacion normal).

$$x_t^{\text{inpaint}} = m \cdot x_t + (1 - m) \cdot x_{\text{orig\_noisy}}$$

#### Como se lee

> "equis-te inpaint es igual a eme por equis-te mas uno-menos-eme por equis-original-ruidosa."

#### Que significa

| Parte | Region | Que hace |
|-------|--------|---------|
| $m \cdot x_t$ | Pixeles desconocidos ($m=1$) | Toma del modelo generativo (que esta "inventando" contenido) |
| $(1-m) \cdot x_{\text{orig\_noisy}}$ | Pixeles conocidos ($m=0$) | Toma de la imagen original con ruido anadido al nivel $t$ |

Donde la imagen original ruidosa se calcula con la marginal cerrada:

$$x_{\text{orig\_noisy}} = \sqrt{\bar{\alpha}_t} \, x_{\text{orig}} + \sqrt{1 - \bar{\alpha}_t} \, \epsilon$$

**Intuicion:** En cada paso, le decimos al modelo: "los pixeles conocidos son estos (con el nivel de ruido correspondiente al paso $t$), ahora tu rellena los desconocidos de forma coherente."

### 8.4 Diagrama visual

```
Imagen original    Mascara (m)        Resultado inpaint
┌──────────┐      ┌──────────┐       ┌──────────┐
│          │      │ 0  0  0  │       │          │
│  imagen  │      │ 0  1  1  │       │  original│
│  con     │  +   │ 0  1  1  │  →    │  +genera-│
│  hueco   │      │ 0  0  0  │       │  do      │
│          │      │ 0  0  0  │       │          │
└──────────┘      └──────────┘       └──────────┘
  conocido          1=rellenar         combinado
```

### 8.5 El algoritmo de inpainting

```
Algoritmo: Inpainting con difusion
──────────────────────────────────────────────

Entrada: imagen original x_orig, mascara m

1. Muestrear x_T ~ N(0, I)

2. Para t = T, T-1, ..., 1:

   a. Paso normal de reverse (DDPM o DDIM):
      x_t^{model} = paso_reverse(x_t, t)

   b. Inyectar pixeles conocidos:
      ε ~ N(0, I)
      x_orig_noisy = √ᾱ_t · x_orig + √(1-ᾱ_t) · ε
      x_{t-1} = m · x_t^{model} + (1-m) · x_orig_noisy

      (mezclar: modelo para lo desconocido,
       original ruidosa para lo conocido)

3. Paso final: inyectar pixeles conocidos limpios
   x_0 = m · x_0^{model} + (1-m) · x_orig

4. Devolver x_0
```

**Nota:** La calidad del inpainting depende de que la region generada sea **coherente** con los bordes de la region conocida. El modelo logra esto naturalmente porque en cada paso "ve" los pixeles conocidos (ruidosos) y ajusta su generacion para que los pixeles desconocidos sean consistentes.

---

## 9. Conexion con score matching

### 9.1 La funcion score

La **funcion score** de una distribucion $p(x)$ es el gradiente del log de la densidad:

$$s(x) = \nabla_x \log p(x)$$

#### Como se lee

> "ese de equis es el gradiente de log pe de equis respecto a equis."

#### Que significa

La score apunta en la direccion en la que la densidad **crece mas rapido**. Si seguimos la score, nos movemos hacia regiones de alta probabilidad (hacia los datos).

### 9.2 La conexion: epsilon y score

La red de prediccion de ruido $\epsilon_\theta(x_t, t)$ esta directamente relacionada con el score de la distribucion ruidosa $q(x_t)$:

$$\nabla_{x_t} \log q(x_t) \approx -\frac{\epsilon_\theta(x_t, t)}{\sqrt{1 - \bar{\alpha}_t}}$$

#### Como se lee

> "El gradiente de log cu de equis-te es aproximadamente menos epsilon-theta de equis-te, te, dividido por raiz-de-uno-menos-alfa-barra-te."

#### Que significa

Predecir el ruido y estimar el score son **la misma cosa** (salvo un factor de escala y un signo). Esto establece la equivalencia entre dos perspectivas:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Perspectiva de DIFUSION          Perspectiva de SCORE     │
│   ──────────────────────           ─────────────────────    │
│                                                             │
│   "Aprende a predecir             "Aprende el gradiente     │
│    el ruido ε que se               del log de la densidad   │
│    anadio a los datos"             en cada nivel de ruido"  │
│                                                             │
│   ε_θ(x_t, t) ≈ ε                 s_θ(x_t, t) ≈ ∇ log q   │
│                                                             │
│          Son matematicamente EQUIVALENTES                   │
│                                                             │
│   s_θ(x_t, t) = -ε_θ(x_t, t) / √(1 - ᾱ_t)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 9.3 Por que importa esta conexion

1. **Unificacion teorica:** Los modelos de difusion (DDPM/DDIM) y los modelos basados en score (score matching, Langevin dynamics) son **dos formas de ver lo mismo**.

2. **Intuicion geometrica:** Si la score apunta hacia los datos, el proceso reverse de difusion es esencialmente **seguir la score** desde el ruido hasta los datos, paso a paso.

3. **Multiples niveles de ruido:** Usar muchos niveles de ruido (los $t = 1, \ldots, T$ del proceso de difusion) resuelve el problema de que la score es dificil de estimar en regiones de baja densidad. Con ruido alto, la densidad se "suaviza" y la score es mas facil de estimar.

```
Score en diferentes niveles de ruido:

Datos originales (t=0):    Con algo de ruido (t=T/2):    Mucho ruido (t≈T):
    ↓ ↓                       ↘ ↓ ↙                         ↘ ↓ ↙
    · ·      ← score           ↘↓↙         ← score          ↘↓↙     ← score
  → · · ←     apunta        →  ●  ←         suave          → ● ←      muy suave
    · ·        a picos          ↗↑↖                           ↗↑↖       y facil
    ↑ ↑        estrechos       ↗ ↑ ↖                         ↗ ↑ ↖      de estimar
```

---

## 10. La ELBO de difusion (derivacion conceptual)

### 10.1 Conexion con VAEs

Los modelos de difusion son, conceptualmente, un **VAE con muchas capas de variables latentes**:

- $x_0$ es el dato observado.
- $x_1, x_2, \ldots, x_T$ son las variables latentes (las versiones ruidosas).
- La "prior" es $p(x_T) = \mathcal{N}(0, I)$.
- El "encoder" es el proceso forward $q(x_{1:T} | x_0)$.
- El "decoder" es el proceso reverse $p_\theta(x_{0:T-1} | x_T)$.

### 10.2 Estructura de la ELBO

La ELBO del modelo de difusion se descompone en tres tipos de terminos:

$$\mathcal{L} = \underbrace{D_{KL}(q(x_T | x_0) \| p(x_T))}_{\text{prior matching (L_T)}} + \sum_{t=2}^{T} \underbrace{D_{KL}(q(x_{t-1} | x_t, x_0) \| p_\theta(x_{t-1} | x_t))}_{\text{denoising matching (L_{t-1})}} - \underbrace{\log p_\theta(x_0 | x_1)}_{\text{reconstruccion (L_0)}}$$

| Termino | Nombre | Que mide |
|---------|--------|---------|
| $L_T$ | Prior matching | Que tan cerca esta el ruido final del ruido puro $\mathcal{N}(0,I)$. Es constante (no depende de $\theta$). |
| $L_{t-1}$ | Denoising matching | Que tan bien el reverse aprendido $p_\theta$ se parece a la posterior forward $q$ en cada paso. |
| $L_0$ | Reconstruccion | Que tan bien reconstruimos la imagen limpia al final. |

**Conexion con el objetivo simplificado:** Se puede demostrar que optimizar el objetivo simplificado $\|\epsilon - \epsilon_\theta\|^2$ es equivalente (hasta constantes) a optimizar los terminos $L_{t-1}$ de la ELBO. Por eso el entrenamiento funciona con la loss simple.

---

## 11. Arquitectura: la UNet con embedding temporal

### 11.1 Por que una UNet?

La red neuronal $\epsilon_\theta(x_t, t)$ toma una imagen ruidosa y un timestep, y devuelve una prediccion del ruido (que tiene la **misma forma** que la imagen de entrada). La UNet es ideal porque:

1. Tiene arquitectura **encoder-decoder** con skip connections.
2. La salida tiene la **misma resolucion** que la entrada.
3. Las skip connections preservan detalles de alta frecuencia.

### 11.2 Diagrama simplificado

```
                         UNet con embedding temporal
                    ┌─────────────────────────────────┐
                    │                                 │
 x_t ──────────────►│  ┌───┐   ┌───┐   ┌───┐        │
(imagen ruidosa)    │  │ E │──►│ E │──►│ E │──┐     │  E = encoder block
                    │  │ n │   │ n │   │ n │  │     │  (conv + downsample)
                    │  │ c │   │ c │   │ c │  │     │
                    │  └─┬─┘   └─┬─┘   └───┘  │     │
                    │    │skip  │skip    │     │     │
                    │    │      │        ▼     │     │
                    │  ┌─▼─┐   ┌─▼─┐   ┌───┐  │     │  D = decoder block
                    │  │ D │◄──│ D │◄──│ D │◄─┘     │  (conv + upsample)
                    │  │ e │   │ e │   │ e │        │
                    │  │ c │   │ c │   │ c │        │
                    │  └───┘   └───┘   └───┘        │
                    │                                 │──────► ε_θ(x_t, t)
 t ────────────────►│  [embedding temporal]           │  (ruido predicho)
(timestep)          │   sinusoidal + MLP              │
                    │   → se inyecta en cada bloque   │
                    │                                 │
                    └─────────────────────────────────┘
```

### 11.3 El embedding temporal

El timestep $t$ se codifica de forma similar a los positional embeddings de los Transformers:

1. Se convierte en un embedding sinusoidal (senos y cosenos de distintas frecuencias).
2. Se pasa por un MLP.
3. Se inyecta en cada bloque de la UNet (tipicamente sumandolo o concatenandolo a las feature maps).

Esto le permite a la red saber **cuanto ruido hay** y ajustar su comportamiento: en pasos tempranos ($t$ grande, mucho ruido) genera estructura global; en pasos tardios ($t$ pequeno, poco ruido) refina detalles finos.

---

## 12. Resumen basico: secciones 1-11

| Concepto | Que es | Formula/Idea clave |
|----------|--------|-------------------|
| **Forward process** | Destruccion gradual de datos anadiendo ruido | $q(x_t \| x_{t-1}) = \mathcal{N}(\sqrt{\alpha_t} x_{t-1}, (1-\alpha_t)I)$ |
| **Marginal cerrada** | Saltar al paso $t$ directamente | $x_t = \sqrt{\bar{\alpha}_t} x_0 + \sqrt{1-\bar{\alpha}_t} \epsilon$ |
| **Reverse process** | Generacion quitando ruido paso a paso | Red neuronal predice $\epsilon$ en cada paso |
| **Objetivo** | Entrenar la red para predecir el ruido | $\mathcal{L} = \|\epsilon - \epsilon_\theta(x_t, t)\|^2$ |
| **DDPM sampling** | Muestreo estocastico, 1000 pasos | Posterior forward + ruido en cada paso |
| **DDIM sampling** | Muestreo (semi-)determinista, 10-50 pasos | Mismo $\epsilon_\theta$, formula distinta, parametro $\eta$ |
| **Inpainting** | Rellenar regiones faltantes | Mezclar modelo + original ruidosa en cada paso |
| **Score connection** | $\epsilon_\theta$ es proporcional al score | $\nabla \log q \approx -\epsilon_\theta / \sqrt{1-\bar{\alpha}_t}$ |
| **predict_x0** | Estimar imagen limpia desde ruido predicho | $\hat{x}_0 = (x_t - \sqrt{1-\bar{\alpha}_t}\epsilon_\theta) / \sqrt{\bar{\alpha}_t}$ |

---

## 13. Perspectiva SDE: difusion en tiempo continuo

### 13.1 La formulacion continua

DDPM trabaja con $T$ pasos discretos. Si hacemos $T \to \infty$, obtenemos una **ecuacion diferencial estocastica (SDE)** en tiempo continuo. Esta perspectiva (Song et al., 2021) unifica los modelos de difusion con los modelos basados en score bajo un mismo marco.

**SDE forward (anadir ruido):**

$$dx_t = f(x_t, t) \, dt + g(t) \, dw_t$$

#### Como se lee

> "de-equis-te es igual a efe de equis-te, te por de-te, mas ge de te por de-doble-u-te."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $f(x_t, t)$ | **Drift** (deriva): componente determinista que escala la senal |
| $g(t)$ | **Diffusion coefficient**: controla la magnitud del ruido |
| $dw_t$ | **Proceso de Wiener** (movimiento Browniano): ruido aleatorio infinitesimal |
| $dt$ | Incremento de tiempo infinitesimal |

Para DDPM con schedule lineal, la SDE equivalente es:

$$dx_t = -\frac{1}{2}\beta(t) x_t \, dt + \sqrt{\beta(t)} \, dw_t$$

donde $\beta(t)$ es la version continua del schedule de ruido.

### 13.2 SDE reverse (generar datos)

Anderson (1982) demostro que todo proceso forward tiene un proceso reverse dado por:

$$dx_t = \left[f(x_t, t) - g(t)^2 \nabla_{x_t} \log p_t(x_t)\right] dt + g(t) \, d\bar{w}_t$$

#### Como se lee

> "de-equis-te es igual a efe menos ge-al-cuadrado por nabla-equis-te log pe-te de equis-te, todo por de-te, mas ge de te por de-doble-u-barra-te."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\nabla_{x_t} \log p_t(x_t)$ | El **score** de la distribucion marginal en tiempo $t$ |
| $-g(t)^2 \nabla \log p_t$ | Correccion que "deshace" la difusion, usando el score |
| $d\bar{w}_t$ | Movimiento Browniano reverso (el tiempo va hacia atras) |

**Insight clave:** Para revertir la SDE, solo necesitamos el score $\nabla_x \log p_t(x)$ en cada tiempo $t$. Esto es exactamente lo que entrena la red $\epsilon_\theta$, ya que $\nabla_x \log p_t(x) \approx -\epsilon_\theta(x_t, t) / \sqrt{1 - \bar{\alpha}_t}$.

### 13.3 Discretizacion: Euler-Maruyama

En la practica, resolvemos la SDE reverse numericamente usando el metodo de Euler-Maruyama:

$$x_{t-\Delta t} = x_t + \left[f(x_t, t) - g(t)^2 s_\theta(x_t, t)\right] \Delta t + g(t) \sqrt{\Delta t} \, z, \quad z \sim \mathcal{N}(0, I)$$

Con $\Delta t = 1$ y las funciones $f, g$ del DDPM, esto recupera exactamente el algoritmo de muestreo DDPM de la Seccion 5.

### 13.4 Predictor-corrector sampling

La perspectiva SDE sugiere una mejora: en cada paso, combinar un **predictor** (resolver la SDE un paso) con un **corrector** (refinar con Langevin MCMC):

```
Para cada paso t:
  1. PREDICTOR: resolver SDE reverse un paso → x_{t-1}^{pred}
  2. CORRECTOR: aplicar k pasos de Langevin dynamics en x_{t-1}^{pred}
     usando el score s_θ(x, t-1) para mejorar la muestra

El predictor avanza en el tiempo, el corrector refina localmente.
```

### 13.5 Probability Flow ODE: muestreo determinista via ODE

Toda SDE tiene una **ODE** asociada (sin termino de ruido) que produce las mismas distribuciones marginales $p_t(x)$:

$$\frac{dx_t}{dt} = f(x_t, t) - \frac{1}{2}g(t)^2 \nabla_x \log p_t(x_t)$$

#### Como se lee

> "de-equis-te sobre de-te es igual a efe menos un medio de ge-al-cuadrado por nabla log pe-te."

#### Que significa

Esta ODE define un **flujo normalizante continuo** (continuous normalizing flow). Tiene dos consecuencias importantes:

1. **Muestreo determinista:** Resolver la ODE desde $x_T \sim \mathcal{N}(0,I)$ hasta $t=0$ da una muestra exacta, sin estocasticidad. Esto es lo que hace DDIM.

2. **Calculo de verosimilitud:** Usando el teorema de la traza (instantaneous change of variables):

$$\log p_0(x_0) = \log p_T(x_T) + \int_0^T \text{Tr}\left(\frac{\partial}{\partial x_t}\left[f - \frac{1}{2}g^2 s_\theta\right]\right) dt$$

Esto permite calcular log-likelihoods exactas (con el estimador de Hutchinson para la traza), algo que DDPM solo podia acotar con la ELBO.

```
Resumen: SDE vs ODE

  SDE reverse                           Probability Flow ODE
  ─────────────                         ────────────────────
  Estocastico (tiene dw̄)               Determinista (sin ruido)
  Muestras diversas                     Misma semilla → misma muestra
  = DDPM                                = DDIM (en el limite continuo)
  No da likelihood exacta               Si da likelihood exacta
```

---

## 14. Formula de Tweedie y prediccion de $x_0$

### 14.1 La formula de Tweedie

Dado un dato $x_0$ corrompido con ruido: $\tilde{x} = x_0 + \sigma \epsilon$, donde $\epsilon \sim \mathcal{N}(0, I)$, la mejor estimacion de $x_0$ dado $\tilde{x}$ (en sentido de minimo error cuadratico) es:

$$\mathbb{E}[x_0 \mid \tilde{x}] = \tilde{x} + \sigma^2 \nabla_{\tilde{x}} \log q_\sigma(\tilde{x})$$

#### Como se lee

> "La esperanza de equis-cero dado equis-tilde es equis-tilde mas sigma-cuadrado por el score de la distribucion ruidosa evaluado en equis-tilde."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\mathbb{E}[x_0 \mid \tilde{x}]$ | La mejor prediccion del dato limpio dado el ruidoso |
| $\tilde{x}$ | Empezamos con el dato ruidoso |
| $\sigma^2 \nabla \log q_\sigma(\tilde{x})$ | Correccion: "caminar" en la direccion del score, escalado por la varianza del ruido |

### 14.2 Conexion con el modelo de difusion

Si nuestro modelo $s_\theta(\tilde{x}) \approx \nabla_{\tilde{x}} \log q_\sigma(\tilde{x})$, entonces:

$$\hat{x}_0 \approx \tilde{x} + \sigma^2 s_\theta(\tilde{x})$$

Usando la relacion $s_\theta = -\epsilon_\theta / \sqrt{1 - \bar{\alpha}_t}$ y que $\sigma^2 = (1 - \bar{\alpha}_t) / \bar{\alpha}_t$, se recupera exactamente la formula `predict_x0` de la Seccion 4.3.

**Insight:** Tweedie nos dice que predecir el ruido, predecir el score, y predecir $x_0$ son tres formulaciones equivalentes del mismo problema. Los modelos de difusion eligen predecir $\epsilon$ por estabilidad numerica.

---

## 15. Generacion condicional

### 15.1 El problema

Hasta ahora, los modelos de difusion generan muestras **incondicionales** de $p(\mathbf{x})$. Pero en muchas aplicaciones queremos generar condicionado a una senal $y$: una etiqueta de clase, un texto descriptivo, una imagen parcial, etc.

Queremos muestrear de $p(\mathbf{x} | y)$ en vez de $p(\mathbf{x})$.

### 15.2 Regla de Bayes para scores

La herramienta clave es aplicar la regla de Bayes **en el espacio de scores**:

$$\nabla_{\mathbf{x}} \log p(\mathbf{x} | y) = \nabla_{\mathbf{x}} \log p(\mathbf{x}) + \nabla_{\mathbf{x}} \log p(y | \mathbf{x})$$

#### Como se lee

> "El score condicional es el score incondicional mas el gradiente del log de la verosimilitud de y dado x."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\nabla_\mathbf{x} \log p(\mathbf{x})$ | Score incondicional (lo que ya sabemos entrenar) |
| $\nabla_\mathbf{x} \log p(y \mid \mathbf{x})$ | Gradiente del "forward model": como cambian las predicciones de y al cambiar x |

No necesitamos reentrenar el modelo de difusion. Basta con sumar el gradiente de un modelo auxiliar (clasificador, modelo de texto, etc.) al score incondicional durante el muestreo.

### 15.3 Classifier guidance (Dhariwal & Nichol, 2021)

Si tenemos un clasificador $p_\phi(y | x_t)$ entrenado sobre datos ruidosos en cada nivel $t$:

$$\tilde{\epsilon}(x_t, t) = \epsilon_\theta(x_t, t) - \sqrt{1 - \bar{\alpha}_t} \cdot w \cdot \nabla_{x_t} \log p_\phi(y | x_t)$$

donde $w$ es un parametro de **guidance scale** que controla cuanto influye la condicion.

```
w = 0:   generacion incondicional (ignora y)
w = 1:   posterior exacta p(x|y)
w > 1:   amplifica la condicion (muestras mas fieles a y pero menos diversas)
```

**Limitacion:** Requiere entrenar un clasificador separado sobre datos ruidosos para cada nivel de ruido $t$.

### 15.4 Classifier-free guidance (Ho & Salimans, 2022)

La idea: eliminar el clasificador externo entrenando un unico modelo $\epsilon_\theta(x_t, t, y)$ que acepta la condicion $y$ como entrada. Durante el entrenamiento, con probabilidad $p_\text{uncond}$ (tipicamente 10-20%), se reemplaza $y$ por $\varnothing$ (un token nulo), lo que entrena simultaneamente el modelo condicional e incondicional.

Durante el muestreo:

$$\tilde{\epsilon}(x_t, t, y) = (1 + w) \cdot \epsilon_\theta(x_t, t, y) - w \cdot \epsilon_\theta(x_t, t, \varnothing)$$

#### Como se lee

> "El ruido guiado es uno-mas-w por epsilon condicional, menos w por epsilon incondicional."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\epsilon_\theta(x_t, t, y)$ | Prediccion condicionada a $y$ |
| $\epsilon_\theta(x_t, t, \varnothing)$ | Prediccion incondicional (sin condicion) |
| $w$ | Guidance scale: cuanto "amplificamos" la senal condicional |
| $(1+w) \cdot (\ldots) - w \cdot (\ldots)$ | Extrapola mas alla de la prediccion condicional |

```
Classifier-free guidance en accion:

  w=0:  epsilon(x,t,y)                    ← solo condicional
  w=1:  2·epsilon(x,t,y) - epsilon(x,t,∅) ← dobla la "direccion" de y
  w=7:  8·epsilon(x,t,y) - 7·epsilon(x,t,∅) ← muy guiado (tipico en Stable Diffusion)
```

**Ventaja:** No necesita un clasificador externo. Un unico modelo hace todo. Este es el metodo usado por DALL-E 2, Imagen y Stable Diffusion.

---

## 16. Difusion latente y Stable Diffusion

### 16.1 El problema: difusion en espacio de pixeles es costosa

DDPM opera directamente sobre imagenes de alta resolucion (e.g., $256 \times 256 \times 3$). Cada paso del proceso reverse requiere una pasada por la UNet sobre este espacio de $\sim$200K dimensiones. Para 1000 pasos, esto es computacionalmente muy costoso.

### 16.2 La solucion: difusion en espacio latente

**Latent Diffusion Model (LDM)** (Rombach et al., 2022) separa el problema en dos etapas:

1. **Pre-entrenar un autoencoder** (VAE): encoder $\mathcal{E}: \mathbf{x} \to \mathbf{z}$ y decoder $\mathcal{D}: \mathbf{z} \to \mathbf{x}$, donde $\mathbf{z}$ tiene resolucion mucho menor (e.g., $32 \times 32 \times 4$).

2. **Aplicar difusion en el espacio latente** $\mathbf{z}$, no en el espacio de pixeles $\mathbf{x}$.

```
Difusion en pixeles (DDPM):
  x_0 (256×256×3) → x_1 → ··· → x_T → reverse → ··· → x_0
  ~200K dimensiones por paso

Difusion latente (LDM):
  x_0 → [Encoder E] → z_0 (32×32×4) → z_1 → ··· → z_T → reverse → ··· → z_0 → [Decoder D] → x_0
                       ~4K dimensiones por paso (50x mas rapido)
```

### 16.3 Stable Diffusion

Stable Diffusion es la implementacion mas conocida de difusion latente. Su arquitectura tiene tres componentes:

```
┌────────────────────────────────────────────────────────────────────┐
│                      STABLE DIFFUSION                              │
│                                                                    │
│  ┌──────────┐     ┌──────────────────────────┐     ┌──────────┐  │
│  │ Encoder  │     │   Difusion en espacio     │     │ Decoder  │  │
│  │ (VAE)    │────►│   latente (UNet)          │────►│ (VAE)    │  │
│  │ E(x)→z   │     │   ε_θ(z_t, t, c)         │     │ D(z)→x   │  │
│  └──────────┘     └──────────┬───────────────┘     └──────────┘  │
│                               │                                    │
│                    ┌──────────┴──────────┐                         │
│                    │  Condicionamiento   │                         │
│                    │  (texto, imagen...) │                         │
│                    │  via CLIP/T5        │                         │
│                    └─────────────────────┘                         │
└────────────────────────────────────────────────────────────────────┘
```

| Componente | Funcion | Se entrena? |
|------------|---------|-------------|
| Encoder VAE ($\mathcal{E}$) | Comprime imagen a latente de baja dimension | Pre-entrenado (fijo) |
| UNet ($\epsilon_\theta$) | Proceso de difusion reverse en espacio latente | **Si** (el modelo principal) |
| Text encoder (CLIP/T5) | Codifica el prompt de texto en embeddings | Pre-entrenado (fijo) |
| Decoder VAE ($\mathcal{D}$) | Reconstruye imagen desde latente | Pre-entrenado (fijo) |

El condicionamiento de texto se inyecta en la UNet via **cross-attention**: las features del texto atienden a las features espaciales del latente.

---

## 17. Muestreo acelerado

### 17.1 DDIM como ODE solver

Desde la perspectiva SDE, DDIM es equivalente a resolver la Probability Flow ODE con un solver de primer orden. Esto explica por que DDIM puede saltar pasos: la ODE es valida en cualquier discretizacion temporal.

### 17.2 Destilacion progresiva (Salimans & Ho, 2022)

Otra forma de acelerar el muestreo es la **destilacion progresiva**:

```
Paso 1: Entrenar modelo "teacher" con N pasos (e.g., 1024)
Paso 2: Entrenar modelo "student" para hacer en 1 paso
         lo que el teacher hace en 2 pasos
         → Student necesita N/2 pasos
Paso 3: Repetir: el student se convierte en teacher
         → Siguiente student necesita N/4 pasos
...
Paso k: Despues de log2(N) rondas, el modelo genera en 1-4 pasos
```

Cada ronda de destilacion reduce los pasos a la mitad. Despues de 8-10 rondas (empezando con 1024 pasos), se puede generar en 1-4 pasos con buena calidad.

---

## 18. Resumen ampliado: que hemos aprendido?

| Concepto | Que es | Formula/Idea clave |
|----------|--------|-------------------|
| **Forward process** | Destruccion gradual de datos anadiendo ruido | $q(x_t \| x_{t-1}) = \mathcal{N}(\sqrt{\alpha_t} x_{t-1}, (1-\alpha_t)I)$ |
| **Marginal cerrada** | Saltar al paso $t$ directamente | $x_t = \sqrt{\bar{\alpha}_t} x_0 + \sqrt{1-\bar{\alpha}_t} \epsilon$ |
| **Reverse process** | Generacion quitando ruido paso a paso | Red neuronal predice $\epsilon$ en cada paso |
| **Objetivo** | Entrenar la red para predecir el ruido | $\mathcal{L} = \|\epsilon - \epsilon_\theta(x_t, t)\|^2$ |
| **DDPM sampling** | Muestreo estocastico, 1000 pasos | Posterior forward + ruido en cada paso |
| **DDIM sampling** | Muestreo (semi-)determinista, 10-50 pasos | Mismo $\epsilon_\theta$, formula distinta, parametro $\eta$ |
| **Inpainting** | Rellenar regiones faltantes | Mezclar modelo + original ruidosa en cada paso |
| **Score connection** | $\epsilon_\theta$ es proporcional al score | $\nabla \log q \approx -\epsilon_\theta / \sqrt{1-\bar{\alpha}_t}$ |
| **predict_x0** | Estimar imagen limpia desde ruido predicho | $\hat{x}_0 = (x_t - \sqrt{1-\bar{\alpha}_t}\epsilon_\theta) / \sqrt{\bar{\alpha}_t}$ |
| **SDE forward** | Difusion en tiempo continuo | $dx = f(x,t)dt + g(t)dw$ |
| **SDE reverse** | Generacion usando el score | Necesita $\nabla_x \log p_t(x)$ |
| **Probability Flow ODE** | Version determinista de la SDE | Flujo normalizante continuo |
| **Tweedie** | Estimacion optima del dato limpio | $\mathbb{E}[x_0|\tilde{x}] = \tilde{x} + \sigma^2 \nabla \log q_\sigma(\tilde{x})$ |
| **Classifier-free guidance** | Generacion condicional sin clasificador | $(1+w)\epsilon(x,t,y) - w\epsilon(x,t,\varnothing)$ |
| **Latent diffusion** | Difusion en espacio latente comprimido | Encoder VAE → difusion → Decoder VAE |
| **Destilacion** | Reducir pasos de muestreo | Student aprende a hacer en 1 paso lo del teacher en 2 |

---

## 19. Glosario

| Castellano | Ingles | Definicion breve |
|------------|--------|------------------|
| Modelo de difusion | Diffusion model | Modelo generativo que aprende a revertir un proceso de destruccion por ruido |
| Proceso forward | Forward process | Cadena de Markov que anade ruido gaussiano gradualmente hasta llegar a ruido puro |
| Proceso reverse | Reverse process | Cadena (aprendida) que quita ruido gradualmente para generar datos |
| Schedule de ruido | Noise schedule | Secuencia $\{\beta_t\}$ que controla cuanto ruido se anade en cada paso |
| Prediccion de ruido | Noise prediction | La tarea de la red neuronal: predecir que ruido se anadio |
| Paso temporal | Timestep | Indice $t$ que indica en que punto del proceso forward/reverse estamos |
| Posterior forward | Forward posterior | Distribucion $q(x_{t-1} \| x_t, x_0)$: el paso reverse "ideal" cuando conocemos $x_0$ |
| Marginal cerrada | Closed-form marginal | Formula que permite saltar directamente de $x_0$ a $x_t$ sin pasos intermedios |
| DDPM | Denoising Diffusion Probabilistic Model | Muestreo estocastico paso a paso (1000 pasos tipicos) |
| DDIM | Denoising Diffusion Implicit Model | Muestreo (semi-)determinista que permite saltar pasos (10-50 tipicos) |
| Inpainting | Inpainting | Rellenar regiones faltantes de una imagen usando el modelo generativo |
| Mascara binaria | Binary mask | Tensor de 0s y 1s que indica que pixeles son conocidos (0) o desconocidos (1) |
| UNet | UNet | Arquitectura encoder-decoder con skip connections, usada como red de prediccion |
| Embedding temporal | Temporal embedding | Codificacion del timestep $t$ que se inyecta en la UNet |
| Funcion score | Score function | Gradiente del log de la densidad: $\nabla_x \log p(x)$ |
| Score matching | Score matching | Tecnica para estimar la score sin conocer la constante de normalizacion |
| Estocasticidad | Stochasticity | Grado de aleatoriedad en el proceso reverse (controlado por $\eta$ en DDIM) |
| Subsecuencia de timesteps | Timestep subsequence | Subconjunto de pasos usado en DDIM para acelerar el muestreo |
| Producto acumulado | Cumulative product | $\bar{\alpha}_t = \prod_{s=1}^t \alpha_s$: cuanta senal queda en el paso $t$ |
| Ecuacion diferencial estocastica | Stochastic Differential Equation (SDE) | Generalizacion continua del proceso de difusion: $dx = f(x,t)dt + g(t)dw$ |
| Probability Flow ODE | Probability Flow ODE | ODE determinista asociada a la SDE, mismas marginales pero sin estocasticidad |
| Predictor-corrector | Predictor-corrector | Esquema de muestreo: predictor (SDE solver) + corrector (Langevin MCMC) |
| Euler-Maruyama | Euler-Maruyama | Metodo numerico de primer orden para resolver SDEs |
| Formula de Tweedie | Tweedie's formula | $\mathbb{E}[x_0|\tilde{x}] = \tilde{x} + \sigma^2 \nabla \log q_\sigma(\tilde{x})$: estimacion optima del dato limpio |
| Classifier guidance | Classifier guidance | Generacion condicional sumando gradiente de un clasificador al score |
| Classifier-free guidance | Classifier-free guidance | Generacion condicional sin clasificador externo, usando dropout de la condicion |
| Guidance scale | Guidance scale | Parametro $w$ que controla cuanto influye la condicion en la generacion |
| Difusion latente | Latent diffusion | Aplicar difusion en un espacio latente comprimido (via autoencoder) en vez de pixeles |
| Stable Diffusion | Stable Diffusion | Implementacion de difusion latente con condicionamiento de texto via CLIP |
| Cross-attention | Cross-attention | Mecanismo de atencion que conecta features del texto con features espaciales del latente |
| Destilacion progresiva | Progressive distillation | Tecnica para reducir pasos de muestreo: student aprende lo del teacher en la mitad de pasos |
