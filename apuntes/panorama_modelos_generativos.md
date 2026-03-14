# Panorama de Modelos Generativos Profundos

Este documento sintetiza **todas las familias de modelos generativos profundos** cubiertas en XCS236, comparandolas a lo largo de dimensiones clave: verosimilitud, calidad de muestras, velocidad, estabilidad, representaciones latentes y restricciones arquitectonicas.

No repite las explicaciones completas de cada familia (para eso estan los apuntes individuales), sino que las pone lado a lado para entender el **panorama completo**: que resuelve cada una, que sacrifica, y como se relacionan entre si.

Basado en las notas del curso y los apuntes en esta carpeta.

---

## 1. El problema central

Todos los modelos generativos profundos abordan el mismo problema fundamental:

> **Dados datos muestreados de una distribución desconocida $p_\text{data}(\mathbf{x})$, aprender un modelo $p_\theta(\mathbf{x})$ que la aproxime.**

### 1.1 La escala del problema

Para apreciar la dificultad, considera una imagen de un teléfono moderno: 980,000 píxeles, 3 canales de color (RGB), cada canal con 256 valores posibles. El número total de imágenes posibles es:

$$256^{2{,}940{,}000} \approx 10^{7{,}000{,}000}$$

Eso son $10$ elevado a 7 millones — un número con 7 millones de dígitos. Sin embargo, las imágenes "reales" (fotos de personas, paisajes, objetos) son una fracción minúscula de ese espacio. **El mundo real es altamente estructurado**, y los modelos generativos deben capturar esa estructura.

### 1.2 Las tres preguntas fundamentales

Todo modelo generativo profundo debe responder tres preguntas:

| Pregunta | Descripción | Ejemplos |
|----------|-------------|----------|
| **Representación** | ¿Cómo parametrizamos $p_\theta(\mathbf{x})$? | Producto de condicionales (AR), variable latente (VAE), transformación invertible (flujo), implícita (GAN) |
| **Objetivo** | ¿Qué función de pérdida optimizamos? | MLE, ELBO, divergencia JSD, distancia Wasserstein, Fisher divergence |
| **Optimización** | ¿Cómo resolvemos el problema de optimización? | SGD directo, EM variacional, juego minimax, Langevin dynamics |

Las diferentes familias de modelos dan respuestas diferentes a estas tres preguntas, y esas diferencias explican sus fortalezas y debilidades (ver Sección 3).

### 1.3 Las tres tareas fundamentales

Ese objetivo general se desglosa en **tres tareas fundamentales**:

| Tarea | Descripcion | Pregunta que responde |
|-------|-------------|-----------------------|
| **Estimacion de densidad** | Evaluar $p_\theta(\mathbf{x})$ para cualquier $\mathbf{x}$ | "Que tan probable es este dato bajo mi modelo?" |
| **Muestreo (generacion)** | Generar nuevas muestras $\mathbf{x} \sim p_\theta$ | "Puedo crear datos nuevos que parezcan reales?" |
| **Aprendizaje de representaciones** | Encontrar factores latentes significativos $\mathbf{z}$ | "Que estructura oculta explica mis datos?" |

Ninguna familia de modelos sobresale en las tres tareas simultaneamente. Esa es la razon por la que existen tantas familias: cada una hace compromisos diferentes.

$$
\text{No existe } p_\theta \text{ que sea simultaneamente: } \underbrace{\text{exacta en densidad}}_{\text{autorregresivos, flujos}} + \underbrace{\text{rapida al muestrear}}_{\text{VAEs, GANs}} + \underbrace{\text{con representaciones ricas}}_{\text{VAEs, flujos}}
$$

---

### 1.4 Modelos discriminativos vs generativos

Antes de entrar en las familias de modelos generativos, es útil recordar la distinción fundamental:

| Tipo | Modela | Ejemplo | Objetivo |
|------|--------|---------|----------|
| **Discriminativo** | $p(y \mid \mathbf{x})$ | Regresión logística, clasificador neuronal | Predecir etiquetas dado input |
| **Generativo** | $p(\mathbf{x})$ o $p(\mathbf{x}, y)$ | VAE, GAN, flujos, difusión | Modelar la distribución completa de datos |

Un modelo generativo puede usarse para clasificar (vía Bayes: $p(y|\mathbf{x}) \propto p(\mathbf{x}|y)p(y)$), pero su objetivo principal es capturar la estructura de los datos. Naive Bayes es el ejemplo clásico de clasificador generativo: modela $p(\mathbf{x}|y)$ con independencia condicional de las features.

---

## 2. Mapa visual del curso

Este diagrama muestra como se organizan todas las familias de modelos generativos que cubre XCS236:

```
                          Modelos Generativos Profundos
                                      │
                  ┌───────────────────┼───────────────────┐
                  │                   │                   │
            Basados en           Variables           Libre de
            verosimilitud        latentes             verosimilitud
            (maximizan           (marginalizan         (no usan p(x)
             log p(x))            sobre z)             directamente)
                  │                   │                   │
            ┌─────┴─────┐      ┌─────┴─────┐      ┌─────┴─────┐
            │           │      │           │      │           │
       Autoregresivos Flujos  VAEs       EBMs   GANs     Score-based
                                                          / Difusion
```

### Relaciones entre ramas

Las fronteras entre estas categorias no son rigidas. Varias conexiones las cruzan:

```
Autorregresivo ←──── "AR gaussiano = flujo" ────→ Flujo (MAF/IAF)

VAE ←──── "flujo = VAE perfecto" ────→ Flujo

EBM ←──── "score = gradiente de energia" ────→ Score-based

Score-based ←──── "DSM multi-escala = difusion" ────→ DDPM/DDIM

GAN ←──── "D optimo → divergencia" ────→ f-divergencias / Wasserstein
```

Estas conexiones se desarrollan en la Seccion 5.

---

## 3. Tabla maestra de comparacion

Esta es la tabla central de este documento. Resume las propiedades de cada familia en una sola vista.

| Dimension | Autoregresivo | VAE | Flujo | GAN | EBM | Score-based | Difusion |
|---|---|---|---|---|---|---|---|
| **Verosimilitud exacta** | Si | No (ELBO) | Si | No | No ($Z_\theta$ intratable) | No | No (ELBO) |
| **Calidad de muestras** | Media | Media | Media-alta | **Alta** | Media | Alta | **Alta** |
| **Diversidad de muestras** | **Alta** | **Alta** | Alta | Baja (mode collapse) | Alta | Alta | **Alta** |
| **Velocidad de muestreo** | Lenta $O(n)$ | **Rapida** | Rapida-media | **Rapida** | Lenta (MCMC) | Lenta (Langevin) | Lenta ($T$ pasos) |
| **Velocidad de entrenamiento** | Rapido | Rapido | Rapido | **Inestable** | Lento | Rapido | Rapido |
| **Espacio latente** | No | **Si** ($\dim z < \dim x$) | Si ($\dim z = \dim x$) | No explicito | No | No | Si (ruido) |
| **Estabilidad de entrenamiento** | Alta | Alta | Alta | **Baja** | Media | Alta | Alta |
| **Metrica de progreso** | Log-likelihood | ELBO | Log-likelihood | Ninguna clara | — | Fisher divergence | ELBO variacional |
| **Restricciones arquitectonicas** | Ordenamiento causal | Encoder + Decoder | Invertible, $\dim z = \dim x$ | Generador + Discriminador | Cualquier red | Cualquier red | UNet (tipicamente) |

### Notas sobre la tabla

- **"Calidad"** se refiere a nitidez perceptual de las muestras generadas (no a la fidelidad de distribucion).
- **"Diversidad"** se refiere a si el modelo cubre todos los modos de la distribucion real.
- Los GANs tienen alta calidad pero baja diversidad (mode collapse); los VAEs tienen alta diversidad pero calidad media (muestras borrosas por ser mode-covering).
- Los modelos de difusion logran tanto alta calidad como alta diversidad, pero a costa de muestreo lento.

---

## 4. Familia por familia

### 4.1 Modelos autoregresivos

**Idea central:** Factorizar la distribucion conjunta usando la regla de la cadena de la probabilidad:

$$p_\theta(\mathbf{x}) = \prod_{i=1}^{n} p_\theta(x_i \mid \mathbf{x}_{<i})$$

Cada factor condicional $p_\theta(x_i \mid \mathbf{x}_{<i})$ se parametriza con una red neuronal. La clave es que la regla de la cadena es una **identidad** — no hay aproximacion. Cualquier distribucion conjunta se puede escribir asi para cualquier ordenamiento de las variables.

**Compromiso fundamental:** Verosimilitud exacta pero muestreo secuencial. Para generar una muestra de $n$ dimensiones, necesitas $n$ pasadas por la red (cada $x_i$ depende de los anteriores). Para evaluar la verosimilitud, todas las condicionales se calculan en paralelo.

```
Muestreo (lento, secuencial):     Verosimilitud (rapida, paralela):

x₁ → x₂ → x₃ → ··· → xₙ         x₁, x₂, x₃, ..., xₙ
                                    │   │   │         │
Cada paso depende                   ▼   ▼   ▼         ▼
del anterior                       p(x₁)p(x₂|x₁)··· p(xₙ|x<ₙ)
                                   Todas en paralelo
```

**Modelos representativos:** NADE, MADE, PixelRNN, PixelCNN, WaveNet, GPT.

**Referencia:** [vae.md](vae.md) seccion 1.1 para el contexto.

---

### 4.2 Autoencoders variacionales (VAEs)

**Idea central:** Introducir variables latentes $\mathbf{z}$ que capturan los factores ocultos de los datos, y usar una cota inferior (ELBO) porque la verosimilitud marginal es intratable.

$$\log p_\theta(\mathbf{x}) \geq \underbrace{\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}[\log p_\theta(\mathbf{x}|\mathbf{z})]}_{\text{Reconstruccion}} - \underbrace{D_\text{KL}(q_\phi(\mathbf{z}|\mathbf{x}) \| p(\mathbf{z}))}_{\text{Regularizacion}} = \text{ELBO}$$

El codificador $q_\phi(\mathbf{z}|\mathbf{x})$ aproxima la posterior intratable $p(\mathbf{z}|\mathbf{x})$. El decodificador $p_\theta(\mathbf{x}|\mathbf{z})$ genera datos a partir de representaciones latentes. El truco de reparametrizacion ($\mathbf{z} = \mu + \sigma \odot \epsilon$, con $\epsilon \sim \mathcal{N}(0,I)$) permite que los gradientes fluyan a traves del muestreo.

**Compromiso fundamental:** Muestreo rapido y espacio latente interpretable, pero muestras borrosas. El VAE minimiza $D_\text{KL}(q \| p)$ (KL forward), que es **mode-covering**: la distribucion aprendida intenta cubrir todos los modos, promediando entre ellos y produciendo muestras difusas.

**Variantes del curso:** GMVAE, IWAE, Semi-supervised VAE, Factor-separated VAE.

**Referencia:** [vae.md](vae.md) para la explicacion completa.

---

### 4.3 Flujos normalizantes

**Idea central:** Transformar una distribucion simple (Gaussiana) en la distribucion de datos mediante una funcion invertible $f_\theta$, usando la formula del cambio de variables:

$$\log p_X(\mathbf{x}) = \log p_Z(f_\theta^{-1}(\mathbf{x})) + \log\left|\det\left(\frac{\partial f_\theta^{-1}(\mathbf{x})}{\partial \mathbf{x}}\right)\right|$$

La verosimilitud es **exacta** (no una cota). El espacio latente $\mathbf{z} = f^{-1}(\mathbf{x})$ tiene estructura (a diferencia de autorregresivos). Sin embargo, $\mathbf{z}$ y $\mathbf{x}$ deben tener la **misma dimension**, y $f$ debe ser invertible con Jacobiano eficiente.

**Compromiso fundamental:** Verosimilitud exacta y espacio latente, pero restricciones arquitectonicas severas. No puedes usar cualquier red neuronal; necesitas arquitecturas especiales (NICE, RealNVP, MAF, IAF) que garanticen invertibilidad y determinante Jacobiano tratable.

```
Distribucion simple            Distribucion compleja
   p_Z (Gaussiana)   ═══ f_θ ═══►   p_X (datos)
        ●                                ●  ●
       ●●●           deformar           ●    ●
      ●●●●●         ────────►        ●  ●●  ●
       ●●●                            ●    ●
        ●                              ●  ●
```

**Conexion clave:** Un modelo autorregresivo Gaussiano es un flujo normalizante (MAF). Un flujo es un VAE con encoder perfecto (sin gap en el ELBO).

**Referencia:** [flujos_normalizantes.md](flujos_normalizantes.md) para la explicacion completa.

---

### 4.4 Redes generativas adversariales (GANs)

**Idea central:** En lugar de maximizar la verosimilitud, entrenar dos redes en un juego minimax: un generador $G$ que produce datos falsos y un discriminador $D$ que intenta distinguir los falsos de los reales.

$$\min_G \max_D \; V(G, D) = \mathbb{E}_{\mathbf{x} \sim p_\text{data}}[\log D(\mathbf{x})] + \mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log(1 - D(G(\mathbf{z})))]$$

El generador nunca ve los datos directamente — solo aprende a traves de las senales del discriminador. Cuando el discriminador es optimo, el objetivo se reduce a minimizar la divergencia de Jensen-Shannon entre $p_\text{data}$ y $p_G$.

**Compromiso fundamental:** Muestras de muy alta calidad pero entrenamiento inestable y mode collapse. El GAN minimiza la KL reversa $D_\text{KL}(p_G \| p_\text{data})$, que es **mode-seeking**: prefiere generar muestras muy realistas de unos pocos modos a cubrir toda la distribucion.

```
Generador G                  Discriminador D

z ~ N(0,I) ──► G(z) ──┐     ┌── x_real ──► D(x) ──► "real" (1)
                       ├──►  │
                       │     └── G(z)   ──► D(x) ──► "falso" (0)
                       │
               G quiere que D         D quiere clasificar
               se equivoque           correctamente
```

**Variantes del curso:** f-GAN, WGAN, WGAN-GP, GAN condicional.

**Referencia:** [gans.md](gans.md) para la explicacion completa.

---

### 4.5 Modelos basados en energia (EBMs)

**Idea central:** Definir la probabilidad a traves de una funcion de energia $E_\theta(\mathbf{x})$ arbitraria:

$$p_\theta(\mathbf{x}) = \frac{1}{Z_\theta} \exp(-E_\theta(\mathbf{x}))$$

donde $Z_\theta = \int \exp(-E_\theta(\mathbf{x})) \, d\mathbf{x}$ es la constante de normalizacion (funcion de particion).

La gran ventaja es la **maxima flexibilidad**: $E_\theta$ puede ser cualquier red neuronal, sin restricciones de invertibilidad, ordenamiento o arquitectura. La desventaja es que $Z_\theta$ es intratable, lo que hace que tanto el entrenamiento (no podemos calcular $\log p_\theta(\mathbf{x})$ directamente) como el muestreo (necesitamos MCMC) sean dificiles.

**Compromiso fundamental:** Flexibilidad maxima pero $Z_\theta$ intratable. El entrenamiento requiere tecnicas especiales (contrastive divergence, score matching) y el muestreo es lento (Langevin dynamics, MCMC).

**Puente conceptual:** Los EBMs conectan directamente con los modelos basados en score: si tomamos el gradiente del log de la densidad, la constante $Z_\theta$ desaparece, y obtenemos el score $\nabla_\mathbf{x} \log p_\theta(\mathbf{x}) = -\nabla_\mathbf{x} E_\theta(\mathbf{x})$.

**Referencia:** [Modelos-Basados-en-Energia.md](Modelos-Basados-en-Energia.md).

---

### 4.6 Score matching y modelos basados en score

**Idea central:** En vez de aprender la densidad $p_\theta(\mathbf{x})$ directamente, aprender su **score** (gradiente del logaritmo de la densidad):

$$s_\theta(\mathbf{x}) \approx \nabla_\mathbf{x} \log p_\text{data}(\mathbf{x})$$

El objetivo de entrenamiento es la **divergencia de Fisher**:

$$\mathcal{J}(\theta) = \mathbb{E}_{p_\text{data}}\left[\|s_\theta(\mathbf{x}) - \nabla_\mathbf{x} \log p_\text{data}(\mathbf{x})\|^2\right]$$

Como el score verdadero es desconocido, se usan variantes equivalentes: **explicit score matching** (requiere la traza del Jacobiano), **denoising score matching** (corromper datos con ruido y aprender a "limpiarlos"), o **sliced score matching** (proyeccion aleatoria para evitar calcular la traza).

**Compromiso fundamental:** Evita la constante de normalizacion $Z_\theta$ (el score no depende de ella), pero el muestreo sigue siendo lento (Langevin dynamics) y el score es impreciso en regiones de baja densidad. Esto ultimo se resuelve anadiendo ruido a multiples escalas.

**Conexion clave:** El denoising score matching a multiples escalas de ruido es conceptualmente equivalente al proceso de difusion (DDPM). Son dos perspectivas del mismo fenomeno.

**Referencia:** [score_matching.md](score_matching.md) y [Funcion-Score.md](Funcion-Score.md).

---

### 4.7 Modelos de difusion (DDPM / DDIM)

**Idea central:** Definir un proceso forward que destruye los datos gradualmente anadiendo ruido Gaussiano en $T$ pasos, y aprender un proceso reverse que deshace esa destruccion:

**Forward (fijo, no aprendido):**
$$q(x_t | x_{t-1}) = \mathcal{N}(x_t; \sqrt{\alpha_t} \, x_{t-1}, \beta_t I)$$

**Atajo** (saltar directamente al paso $t$):
$$x_t = \sqrt{\bar{\alpha}_t} \, x_0 + \sqrt{1 - \bar{\alpha}_t} \, \epsilon, \qquad \epsilon \sim \mathcal{N}(0, I)$$

**Reverse (aprendido):** Una red neuronal $\epsilon_\theta(x_t, t)$ predice el ruido $\epsilon$ que fue anadido, y se entrena minimizando:

$$\mathcal{L}_\text{simple} = \mathbb{E}_{t, x_0, \epsilon}\left[\|\epsilon - \epsilon_\theta(x_t, t)\|^2\right]$$

**Compromiso fundamental:** Calidad de muestras de estado del arte y alta diversidad, pero muestreo lento (tipicamente $T = 1000$ pasos). DDIM mitiga esto haciendo el proceso reverse **determinista**, permitiendo saltar pasos sin perder mucha calidad.

```
Proceso forward (destruir):
x₀ ──► x₁ ──► x₂ ──► ··· ──► x_T ≈ N(0,I)
 │      │      │               │
 ▼      ▼      ▼               ▼
imagen  +ruido +ruido          ruido puro

Proceso reverse (generar):
x_T ──► x_{T-1} ──► ··· ──► x₁ ──► x₀
 │        │                    │      │
 ▼        ▼                    ▼      ▼
ruido    -ruido               -ruido  imagen
         (ε_θ)               (ε_θ)   generada
```

**Referencia:** [modelos_difusion.md](modelos_difusion.md).

---

## 5. Conexiones entre familias

Las familias de modelos generativos no son islas. Existen conexiones profundas que las unen:

### 5.1 Diagrama de conexiones

```
┌──────────────────┐          ┌──────────────────┐
│  AUTORREGRESIVO  │◄────────►│      FLUJO       │
│  p(x)=∏p(xᵢ|x<ᵢ)│  AR      │  x = f_θ(z)     │
└────────┬─────────┘ Gaussiano └────────┬─────────┘
         │           = MAF              │
         │                              │ Flujo = VAE
         │                              │ con encoder
         │                              │ perfecto
         │           ┌─────────────────┘
         │           ▼
         │  ┌──────────────────┐         ┌──────────────────┐
         │  │       VAE        │         │       GAN        │
         │  │  ELBO = E[log p] │         │  min_G max_D V   │
         │  │  - KL(q||p)      │         │                  │
         │  └────────┬─────────┘         └────────┬─────────┘
         │           │                            │
         │           │ Decoder VAE ≈              │ D optimo
         │           │ Generador GAN              │ → minimiza JSD
         │           │ (ambos mapean z→x)         │ → f-GAN: otras f-div
         │           │                            │ → WGAN: Wasserstein
         │           │                            │
┌────────┴───────────┴────────────────────────────┴───────────┐
│                                                              │
│  ┌──────────────────┐    score = -∇E    ┌────────────────┐  │
│  │       EBM        │─────────────────►│  SCORE-BASED   │  │
│  │  p = exp(-E)/Z   │                  │  s_θ ≈ ∇log p  │  │
│  └──────────────────┘                  └───────┬────────┘  │
│                                                 │           │
│                                    DSM multi-   │           │
│                                    escala       │           │
│                                                 ▼           │
│                                        ┌────────────────┐  │
│                                        │    DIFUSION     │  │
│                                        │  DDPM / DDIM   │  │
│                                        └────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Explicacion de cada conexion

**Autorregresivo ↔ Flujo:**
Un modelo autorregresivo Gaussiano (donde cada $p(x_i | x_{<i})$ es una Gaussiana con media y varianza parametrizadas) es exactamente un flujo normalizante con Jacobiano triangular. MAF formaliza esta equivalencia: la transformacion inversa $z_i = (x_i - \mu_i(x_{<i})) / \sigma_i(x_{<i})$ es invertible y tiene determinante Jacobiano eficiente.

**Flujo ↔ VAE:**
Un flujo normalizante puede verse como un VAE donde el encoder es **exacto** (no una aproximacion). En un VAE, el gap entre $\log p(\mathbf{x})$ y el ELBO es $D_\text{KL}(q \| p(\mathbf{z}|\mathbf{x}))$. En un flujo, la transformacion invertible define $q(\mathbf{z}|\mathbf{x}) = \delta(\mathbf{z} - f^{-1}(\mathbf{x}))$ (un Dirac), que coincide con la posterior verdadera. Por lo tanto, el gap KL es cero y el ELBO es exacto.

**Decoder VAE ≈ Generador GAN:**
Ambos mapean un vector latente $\mathbf{z}$ a un dato $\mathbf{x}$. La diferencia esta en como se entrenan: el VAE maximiza el ELBO (reconstruccion + regularizacion KL), mientras que el GAN se entrena a traves de la senal del discriminador.

**EBM → Score-based:**
Si tomamos el gradiente del logaritmo de un EBM: $\nabla_\mathbf{x} \log p_\theta(\mathbf{x}) = -\nabla_\mathbf{x} E_\theta(\mathbf{x})$. La constante $Z_\theta$ desaparece porque $\nabla_\mathbf{x} \log Z_\theta = 0$. Los modelos basados en score aprenden directamente este gradiente, evitando el problema de la constante intratable.

**Score-based → Difusion:**
El denoising score matching a multiples escalas de ruido es equivalente al entrenamiento de un DDPM. Cada escala de ruido $\sigma$ corresponde a un paso $t$ del proceso de difusion. La red $\epsilon_\theta(x_t, t)$ del DDPM es proporcional al score $s_\theta(x_t, t)$. Son dos perspectivas (score matching y modelos probabilisticos) del mismo objeto matematico.

**GAN → Divergencias:**
Con el discriminador optimo, el objetivo del GAN vanilla minimiza la divergencia de Jensen-Shannon. Cambiando la funcion de activacion o las restricciones del discriminador, se pueden minimizar otras divergencias:

| Variante de GAN | Divergencia minimizada |
|---|---|
| GAN vanilla | Jensen-Shannon |
| f-GAN | Cualquier f-divergencia |
| WGAN | Distancia de Wasserstein-1 |

---

## 6. Que modelo elegir?

Arbol de decision segun la aplicacion:

```
Necesitas verosimilitud exacta?
│
├── SI → Necesitas espacio latente?
│        │
│        ├── SI → Flujo normalizante (NICE, RealNVP, MAF)
│        │        Restriccion: dim(z) = dim(x)
│        │
│        └── NO → Modelo autoregresivo (MADE, PixelCNN)
│                 Restriccion: muestreo lento O(n)
│
└── NO → Que es mas importante?
         │
         ├── Calidad de muestras
         │   │
         │   ├── Velocidad de muestreo importa → GAN
         │   │   Riesgo: mode collapse, entrenamiento inestable
         │   │
         │   └── Velocidad no importa → Difusion (DDPM/DDIM)
         │       Estado del arte en calidad + diversidad
         │
         ├── Velocidad de muestreo
         │   │
         │   ├── Necesitas latentes → VAE (una pasada por el decoder)
         │   │
         │   └── No necesitas latentes → GAN (una pasada por el generador)
         │
         ├── Espacio latente interpretable → VAE
         │   Variantes: GMVAE, SSVAE para estructura adicional
         │
         └── Flexibilidad arquitectonica maxima → EBM / Score-based
             Cualquier red como E_θ(x) o s_θ(x)
```

### Resumen de casos de uso

| Caso de uso | Modelo recomendado | Justificacion |
|---|---|---|
| Deteccion de anomalias | Autorregresivo o flujo | Necesitas $p(\mathbf{x})$ exacta para detectar datos improbables |
| Generacion de imagenes fotorrealistas | Difusion o GAN | Estado del arte en calidad perceptual |
| Compresion aprendida | Flujo normalizante | Verosimilitud exacta + representacion latente invertible |
| Sintesis de voz en tiempo real | IAF (Parallel WaveNet) | Muestreo rapido con calidad alta |
| Aprendizaje semi-supervisado | Semi-supervised VAE | Espacio latente con estructura de clases |
| Generacion condicional (texto→imagen) | Difusion (con guia) | Alta calidad y diversidad condicionada |
| Exploracion del espacio latente | VAE | Espacio latente suave e interpretable |

---

## 7. Las tensiones fundamentales

### 7.1 Mode-covering vs mode-seeking

Esta es quiza la tension mas importante en modelado generativo:

```
Distribucion real p_data:       Mode-covering (VAE):        Mode-seeking (GAN):

     ●●                             ●●●●●                       ●●
    ●●●●                           ●●●●●●●                     ●●●●
     ●●              ●●            ●●●●●●●●●         ●●         ●●
                    ●●●●           ●●●●●●●●●        ●●●●
                     ●●             ●●●●●●●           ●●
                                    ●●●●●
  Dos modos                                       Solo un modo,
  separados                     Cubre ambos,      pero nitido
                                pero difuso
```

- **Mode-covering** (minimizar $D_\text{KL}(q \| p)$): el modelo intenta cubrir toda la distribucion. Donde $p_\text{data} > 0$, necesita $q > 0$. Resultado: muestras borrosas que promedian entre modos. Tipico de VAEs.

- **Mode-seeking** (minimizar $D_\text{KL}(p \| q)$): el modelo busca los modos mas probables. Puede ignorar modos enteros sin penalizacion. Resultado: muestras nitidas pero poca diversidad. Tipico de GANs.

Los modelos de difusion logran un buen equilibrio entre ambos extremos.

### 7.2 Verosimilitud vs calidad perceptual

Tener una verosimilitud alta no garantiza muestras de buena calidad perceptual, y viceversa:

| | Verosimilitud alta | Verosimilitud baja |
|---|---|---|
| **Muestras buenas** | Flujos (en teoria ideal) | GANs |
| **Muestras malas** | Autorregresivos (a veces) | — |

Los modelos autorregresivos pueden asignar alta verosimilitud a datos reales y aun asi generar muestras mediocres si el muestreo secuencial acumula errores. Los GANs generan muestras excelentes pero ni siquiera definen $p(\mathbf{x})$.

### 7.3 Flexibilidad vs tratabilidad

```
                    Mas flexible
                         ▲
                         │
                    EBM ●│
                         │
              Score ●    │
                         │
                GAN ●    │
                         │
                VAE ●    │
                         │
              Flujo ●    │
                         │
       Autorregresivo ●  │
                         │
                         └──────────────────────────► Mas tratable
```

A medida que aumenta la flexibilidad arquitectonica, disminuye la tratabilidad (capacidad de calcular $p(\mathbf{x})$ exacta, entrenar eficientemente, muestrear rapidamente). Los EBMs son los mas flexibles pero los menos tratables; los autorregresivos son los mas tratables pero los mas restringidos.

---

## 8. Evaluacion de modelos generativos

Evaluar modelos generativos es fundamentalmente dificil porque no existe una metrica unica que capture todos los aspectos deseables. Diferentes metricas miden cosas distintas, y una puntuacion alta en una no garantiza buena calidad en otra.

### 8.1 Metricas basadas en verosimilitud

Estas metricas evaluan directamente $p_\theta(\mathbf{x})$ en datos de test.

| Metrica | Formula / Idea | Que mide | Limitaciones |
|---------|---------------|----------|--------------|
| **Log-likelihood** | $\frac{1}{N}\sum_i \log p_\theta(\mathbf{x}^{(i)})$ | Que tan probable son los datos reales bajo el modelo | Solo disponible para modelos con likelihood tratable (AR, flujos). Alta likelihood no implica buenas muestras |
| **Bits per dimension** | $-\frac{1}{d}\log_2 p_\theta(\mathbf{x})$ | Log-likelihood normalizada por dimension, en bits | Permite comparar entre modelos con distintas dimensionalidades |
| **Perplexity** | $2^{-\frac{1}{N}\sum_i \log_2 p(\mathbf{x}^{(i)})}$ | Exponencial de la entropia cruzada; cuantas opciones "efectivas" hay | Comun en modelos de lenguaje |
| **KDE** | Kernel Density Estimation sobre muestras | Estimar $p_\theta$ a partir de muestras generadas | Escala mal a dimensiones altas |
| **AIS** | Annealed Importance Sampling | Estimar la log-likelihood marginal cuando es intratable (VAEs, EBMs) | Computacionalmente costoso; da una cota, no el valor exacto |

### 8.2 Metricas de calidad de muestras

Estas metricas evaluan la calidad **perceptual** de las muestras generadas, sin requerir $p_\theta(\mathbf{x})$.

**Inception Score (IS):**

$$\text{IS} = \exp\left(\mathbb{E}_{\mathbf{x} \sim p_G}\left[D_\text{KL}(p(y|\mathbf{x}) \| p(y))\right]\right)$$

| Componente | Que mide | Bueno cuando... |
|------------|---------|-----------------|
| $p(y|\mathbf{x})$ via Inception v3 | **Sharpness**: la imagen se clasifica claramente | La distribucion de clases predicha tiene baja entropia (una clase dominante) |
| $p(y) = \mathbb{E}[p(y|\mathbf{x})]$ | **Diversity**: las muestras cubren muchas clases | La distribucion marginal de clases tiene alta entropia (uniforme) |
| $D_\text{KL}$ entre ambas | Combina ambas | IS alto = muestras nitidas Y diversas |

Limitacion: depende del clasificador Inception pre-entrenado en ImageNet; no mide fidelidad a los datos reales, solo calidad y diversidad de las muestras.

**Frechet Inception Distance (FID):**

$$\text{FID} = \|\mu_r - \mu_g\|^2 + \text{Tr}(\Sigma_r + \Sigma_g - 2(\Sigma_r \Sigma_g)^{1/2})$$

donde $(\mu_r, \Sigma_r)$ y $(\mu_g, \Sigma_g)$ son la media y covarianza de las features de Inception para datos reales y generados, respectivamente.

| Propiedad | Detalle |
|-----------|---------|
| Que mide | Distancia entre distribuciones de features reales y generadas |
| Asume | Que las features de Inception son Gaussianas (aproximacion) |
| Menor es mejor | FID = 0 significa distribuciones identicas en el espacio de features |
| Ventaja sobre IS | Compara con datos reales, no solo evalua calidad interna |

**Kernel Inception Distance (KID / MMD):**

$$\text{KID} = \text{MMD}^2(\{f(\mathbf{x}_r)\}, \{f(\mathbf{x}_g)\})$$

Usa Maximum Mean Discrepancy con un kernel (tipicamente polinomial) sobre features de Inception. Ventaja sobre FID: no asume Gaussianidad, es un estimador insesgado, y no requiere muchas muestras para ser fiable.

**Evaluacion humana (HYPE):**

| Variante | Mecanismo | Que mide |
|----------|-----------|---------|
| HYPE$_\infty$ | Humanos juzgan "real o falso" sin limite de tiempo | Porcentaje de muestras falsa clasificadas como reales |
| HYPE$_t$ | Igual pero con tiempo limitado (e.g., 100ms) | Capacidad de enganar a observadores rapidos |

Limitacion: costoso y lento; dificil de reproducir exactamente.

### 8.3 Metricas de reconstruccion (lossy compression)

Para modelos con espacio latente (VAEs, flujos):

| Metrica | Formula | Que mide |
|---------|---------|---------|
| **MSE** | $\frac{1}{N}\sum_i \|\mathbf{x}_i - \hat{\mathbf{x}}_i\|^2$ | Error cuadratico medio de reconstruccion |
| **PSNR** | $10 \log_{10}(\text{MAX}^2 / \text{MSE})$ | Peak Signal-to-Noise Ratio (en dB); mayor es mejor |
| **SSIM** | Compara luminancia, contraste y estructura | Similaridad estructural percibida; $[-1, 1]$, mayor es mejor |

### 8.4 Metricas de disentanglement

Evaluan si las dimensiones latentes capturan factores independientes y semanticamente significativos:

| Metrica | Idea clave |
|---------|-----------|
| **Beta-VAE metric** | Entrenar un clasificador lineal que predice el factor generativo a partir de diferencias en latentes |
| **Factor-VAE metric** | Variance de cada latente cuando se fija un factor; la dimension mas informativa debe ser unica |
| **SAP** (Separated Attribute Predictability) | Diferencia entre los dos predictores mas informativos para cada factor |
| **DCI** (Disentanglement, Completeness, Informativeness) | Tres puntuaciones que miden distintos aspectos del disentanglement |

### 8.5 Tabla resumen: que metrica para que modelo?

| Familia de modelos | Metricas tipicas | Metricas NO disponibles |
|---|---|---|
| Autorregresivos | Log-likelihood, bits/dim, perplexity | FID (muestreo demasiado lento para generar muchas) |
| VAEs | ELBO, FID, reconstruccion (MSE/SSIM), disentanglement | Log-likelihood exacta |
| Flujos | Log-likelihood exacta, bits/dim, FID | — |
| GANs | **FID**, IS, KID, HYPE | Log-likelihood (no la definen) |
| Difusion | FID, IS, ELBO (via probability flow ODE: log-likelihood) | — |

### 8.6 La tension fundamental de la evaluacion

```
                    Likelihood alta
                         ▲
                         │
     Autorregresivos ●   │
                         │
              Flujos ●   │   ● Difusion (con ODE)
                         │
                VAEs ●   │
                         │
                         │               ● GANs
                         │
                         └──────────────────────────► FID bajo (buenas muestras)
```

Modelos con alta likelihood no siempre generan las mejores muestras (y viceversa). Los modelos de difusion recientes han logrado ser competitivos en ambos ejes.

---

## 9. Cronologia y evolucion

El campo ha evolucionado rapidamente. Esta linea de tiempo muestra los hitos principales:

```
2013 ──── VAE (Kingma & Welling)
  │       Primer modelo de variables latentes con inferencia amortizada
  │
2014 ──── GAN (Goodfellow et al.)
  │       Entrenamiento adversarial sin verosimilitud
  │       NICE (Dinh et al.) — primer flujo con coupling layers
  │
2015 ──── NADE, Pixel RNN/CNN
  │       Modelos autorregresivos para imagenes
  │
2016 ──── RealNVP (Dinh et al.) — flujos con acoplamiento afin
  │       IAF (Kingma et al.) — flujos autorregresivos inversos
  │
2017 ──── MAF (Papamakarios et al.)
  │       WGAN (Arjovsky et al.) — distancia Wasserstein
  │       Parallel WaveNet — MAF+IAF para sintesis de voz
  │
2018 ──── Glow (Kingma & Dhariwal) — flujos a escala de imagenes
  │
2019 ──── Score matching con perturbacion de ruido (Song & Ermon)
  │
2020 ──── DDPM (Ho et al.) — modelos de difusion
  │       Ecuacion diferencial estocastica continua (Song et al.)
  │
2021 ──── DDIM (Song et al.) — muestreo determinista acelerado
  │       Diffusion beats GANs (Dhariwal & Nichol)
  │
2022+ ─── DALL-E 2, Stable Diffusion, Imagen
          Difusion como backbone de generacion text-to-image
```

La tendencia historica: de modelos con verosimilitud tratable (AR, VAE, Flow) a modelos que sacrifican tratabilidad por calidad (GAN), y finalmente a modelos de difusion que logran lo mejor de ambos mundos (a costa de velocidad de muestreo).

---

## 10. Glosario unificado

Terminos que aparecen en multiples familias de modelos:

| Termino | Ingles | Definicion |
|---------|--------|------------|
| Verosimilitud | Likelihood | $p_\theta(\mathbf{x})$: probabilidad de los datos bajo el modelo |
| Verosimilitud marginal | Marginal likelihood | $p(\mathbf{x}) = \int p(\mathbf{x},\mathbf{z})d\mathbf{z}$: verosimilitud tras integrar las latentes |
| Variable latente | Latent variable | Variable oculta $\mathbf{z}$ que captura factores no observados |
| Prior | Prior | Distribucion $p(\mathbf{z})$ antes de observar datos (tipicamente $\mathcal{N}(0,I)$) |
| Posterior | Posterior | $p(\mathbf{z}|\mathbf{x})$: distribucion de $\mathbf{z}$ dado un dato observado |
| ELBO | Evidence Lower Bound | Cota inferior de $\log p(\mathbf{x})$; objetivo de VAEs y DDPM |
| MLE | Maximum Likelihood Estimation | Encontrar $\theta$ que maximice $\sum \log p_\theta(\mathbf{x})$ |
| KL divergence | Kullback-Leibler divergence | $D_\text{KL}(q \| p)$: mide la "distancia" asimetrica entre distribuciones |
| Jensen-Shannon | Jensen-Shannon divergence | Version simetrica de la KL; objetivo del GAN vanilla |
| Wasserstein | Wasserstein distance | Distancia de transporte optimo; objetivo del WGAN |
| f-divergencia | f-divergence | Familia general que incluye KL, JSD y muchas otras |
| Funcion de score | Score function | $\nabla_\mathbf{x} \log p(\mathbf{x})$: gradiente del log de la densidad |
| Fisher divergence | Fisher divergence | $\mathbb{E}[\|s_\theta - \nabla \log p_\text{data}\|^2]$: objetivo de score matching |
| Funcion de energia | Energy function | $E_\theta(\mathbf{x})$: funcion arbitraria que define un EBM |
| Funcion de particion | Partition function | $Z_\theta = \int \exp(-E_\theta(\mathbf{x}))d\mathbf{x}$: normalizacion de un EBM |
| Jacobiano | Jacobian | Matriz de derivadas parciales; clave en flujos normalizantes |
| Reparametrizacion | Reparameterization | Truco que separa aleatoriedad de parametros: $\mathbf{z} = \mu + \sigma \odot \epsilon$ |
| Mode collapse | Mode collapse | Cuando un GAN genera solo unos pocos modos de la distribucion |
| Posterior collapse | Posterior collapse | Cuando un VAE ignora las latentes: $q(\mathbf{z}|\mathbf{x}) \approx p(\mathbf{z})$ |
| Amortizacion | Amortization | Usar una red para predecir parametros variacionales en vez de optimizarlos |
| Acoplamiento | Coupling layer | Capa que transforma la mitad de las variables condicionada en la otra |
| Difusion forward | Forward diffusion | Proceso fijo que anade ruido gradualmente a los datos |
| Difusion reverse | Reverse diffusion | Proceso aprendido que elimina ruido gradualmente |
| MCMC | Markov Chain Monte Carlo | Metodo de muestreo iterativo; necesario para EBMs |
| Langevin dynamics | Langevin dynamics | MCMC basado en el score: $x_{t+1} = x_t + \eta \nabla_x \log p(x_t) + \sqrt{2\eta} \, \epsilon$ |
| Inception Score | Inception Score (IS) | Mide calidad y diversidad de muestras usando un clasificador pre-entrenado |
| FID | Frechet Inception Distance | Distancia entre distribuciones de features reales y generadas; menor es mejor |
| KID | Kernel Inception Distance | MMD sobre features de Inception; estimador insesgado alternativo a FID |
| Bits por dimension | Bits per dimension | Log-likelihood normalizada: $-\frac{1}{d}\log_2 p(\mathbf{x})$ |
| Perplejidad | Perplexity | Exponencial de la entropia cruzada; comun en modelos de lenguaje |
| SSIM | Structural Similarity Index | Mide similaridad estructural percibida entre imagenes |
| Disentanglement | Disentanglement | Grado en que las dimensiones latentes capturan factores independientes |

---

## Referencias cruzadas con otros apuntes

| Archivo | Tema | Relacion con este documento |
|---------|------|-----------------------------|
| [vae.md](vae.md) | Autoencoders variacionales | Seccion 4.2 — explicacion detallada del ELBO y reparametrizacion |
| [flujos_normalizantes.md](flujos_normalizantes.md) | Normalizing flows | Seccion 4.3 — cambio de variables, NICE, RealNVP, MAF, IAF |
| [gans.md](gans.md) | GANs | Seccion 4.4 — juego minimax, f-GAN, WGAN |
| [score_matching.md](score_matching.md) | Score matching | Seccion 4.6 — Fisher divergence, denoising score matching |
| [modelos_difusion.md](modelos_difusion.md) | DDPM / DDIM | Seccion 4.7 — forward/reverse, prediccion de ruido |
| [Modelos-Basados-en-Energia.md](Modelos-Basados-en-Energia.md) | EBMs | Seccion 4.5 — energia, funcion de particion |
| [KL-Divergence.md](KL-Divergence.md) | KL divergence | Seccion 7.1 — mode-covering vs mode-seeking |
| [Divergencia-de-Jensen-Shannon.md](Divergencia-de-Jensen-Shannon.md) | JSD | Seccion 5.2 — conexion GAN-JSD |
| [Distancia-de-Wasserstein.md](Distancia-de-Wasserstein.md) | Wasserstein | Seccion 5.2 — WGAN |
| [f-Divergencias.md](f-Divergencias.md) | f-divergencias | Seccion 5.2 — f-GAN |
| [Funcion-Score.md](Funcion-Score.md) | Score function | Seccion 4.6, 5.2 — conexion EBM-score |
| [MLE-Maximum-Likelihood-Estimation.md](MLE-Maximum-Likelihood-Estimation.md) | MLE | Seccion 1 — el objetivo fundamental |
| [cheat-sheet.md](cheat-sheet.md) | Resumen rapido | Referencia compacta complementaria |
