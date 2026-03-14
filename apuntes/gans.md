# Redes Generativas Adversarias (GANs)

Estos apuntes explican la teoria de las **redes generativas adversarias** (Generative Adversarial Networks), una familia de modelos generativos profundos que aprenden a generar datos **sin maximizar la verosimilitud directamente**, usando en su lugar un juego entre dos redes neuronales.

Basados en las notas del curso: [deepgenerativemodels.github.io/notes/gan](https://deepgenerativemodels.github.io/notes/gan/).

---

## Guía rápida de símbolos

| Simbolo | Nombre | Significado |
|---------|--------|-------------|
| $G_\theta$ | Generador | Red neuronal que transforma ruido $\mathbf{z}$ en datos falsos $G_\theta(\mathbf{z})$ |
| $D_\phi$ | Discriminador | Red neuronal que clasifica datos como reales (1) o falsos (0) |
| $h_\phi(\mathbf{x})$ | Logits del discriminador | Activacion **antes** de la sigmoid: $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$ |
| $p_G$ / $p_\theta$ | Distribucion del generador | Distribucion implicita de las muestras que produce $G_\theta$ |
| $p_{\text{data}}$ | Distribucion real | Distribucion verdadera de los datos de entrenamiento |
| $V(G, D)$ | Objetivo minimax | Funcion de valor del juego entre $G$ y $D$ |
| $\sigma$ | Sigmoid | $\sigma(x) = \frac{1}{1 + e^{-x}}$, mapea numeros reales a $(0, 1)$ |
| $\mathbf{z}$ | Ruido latente | Vector aleatorio de entrada al generador |
| $p(\mathbf{z})$ | Prior del ruido | Distribucion del ruido, tipicamente $\mathcal{N}(\mathbf{0}, I)$ |
| $D_\text{JSD}$ | Jensen-Shannon | Divergencia simetrica entre dos distribuciones |
| $f^*$ | Conjugada de Fenchel | Dual convexa usada en f-divergencias |
| $W(p, q)$ | Distancia Wasserstein | "Earth Mover's distance": coste minimo de transporte |
| $\lambda$ | Coeficiente gradient penalty | Peso de la penalizacion de gradiente en WGAN-GP ($\lambda = 10$) |
| $m$ | Batch size | Numero de muestras por mini-batch |
| $y$ | Etiqueta de clase | Indice de clase (codificado como one-hot) en GANs condicionales |

---

## 1. El contexto -- aprendizaje libre de verosimilitud

### 1.1 Por que ir mas alla de MLE?

Hasta ahora hemos entrenado modelos generativos maximizando la verosimilitud (MLE):

- **Modelos autorregresivos**: $p_\theta(\mathbf{x}) = \prod_i p_\theta(x_i \mid \mathbf{x}_{<i})$
- **VAEs**: maximizamos el ELBO, una cota inferior de $\log p_\theta(\mathbf{x})$
- **Flujos normalizantes**: $\log p_X(\mathbf{x}) = \log p_Z(f^{-1}(\mathbf{x})) + \log|\det J|$

Pero hay un problema fundamental: **alta verosimilitud no garantiza alta calidad de muestras**. Un modelo puede asignar alta probabilidad a los datos reales y aun asi generar muestras borrosas o poco realistas. El caso extremo es un modelo que simplemente memoriza el dataset -- verosimilitud perfecta, pero generalizacion nula.

Para mas detalle sobre MLE y KL, consulta [`KL-Divergence.md`](KL-Divergence.md) y [`MLE-Maximum-Likelihood-Estimation.md`](MLE-Maximum-Likelihood-Estimation.md).

### 1.2 La idea del two-sample test

La intuicion es sencilla: en lugar de medir la verosimilitud, preguntamos directamente **"se pueden distinguir las muestras generadas de las reales?"**

Dado:
- $S_1 = \{\mathbf{x} \sim p_\text{data}\}$ (muestras reales del dataset)
- $S_2 = \{\mathbf{x} \sim p_\theta\}$ (muestras del generador)

Si un clasificador **no puede distinguirlas**, entonces $p_\theta \approx p_\text{data}$.

### 1.3 Del test estadistico al entrenamiento adversario

El problema es que los tests de dos muestras clasicos no escalan bien a dimensiones altas (imagenes, audio, etc.). La idea de los GANs es usar una **red neuronal** como test estadistico y entrenarla junto con el generador:

```
Enfoque clasico (MLE):           Enfoque GAN:

  Datos ──► modelo ──► max p(x)    Datos reales ──┐
                                                    ├──► D ──► "real o falso?"
                                   Generador ──────┘
                                      ▲
                                      │
                                   ajustar G para
                                   enganar a D
```

**Analogia:** Piensa en un falsificador de billetes (el generador) y un detective (el discriminador). El falsificador intenta hacer billetes indistinguibles de los reales. El detective intenta detectar los falsos. Ambos mejoran con el tiempo, y al final el falsificador produce billetes perfectos.

---

## 2. El juego minimax

### 2.1 La función objetivo

El corazon de las GANs es el **juego minimax** entre el generador $G_\theta$ y el discriminador $D_\phi$:

$$\min_\theta \max_\phi V(G_\theta, D_\phi) = \mathbb{E}_{\mathbf{x} \sim p_\text{data}}[\log D_\phi(\mathbf{x})] + \mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log(1 - D_\phi(G_\theta(\mathbf{z})))]$$

#### Como se lee

> "Encontrar el theta que minimice, y el phi que maximice, el valor esperado de log D(x) cuando x viene de los datos reales, mas el valor esperado de log(1 - D(G(z))) cuando z viene de la prior del ruido."

#### Que significa

| Parte | Significado | Quien la controla |
|-------|-------------|-------------------|
| $\min_\theta$ | El generador quiere **minimizar** V | Generador |
| $\max_\phi$ | El discriminador quiere **maximizar** V | Discriminador |
| $\mathbb{E}_{\mathbf{x} \sim p_\text{data}}[\log D_\phi(\mathbf{x})]$ | "Que tan bien clasifica D los datos **reales** como reales" | Discriminador |
| $\mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log(1 - D_\phi(G_\theta(\mathbf{z})))]$ | "Que tan bien clasifica D los datos **falsos** como falsos" | Ambos |
| $D_\phi(\mathbf{x}) \in (0, 1)$ | Probabilidad que D asigna a que x sea real | Discriminador |
| $G_\theta(\mathbf{z})$ | Dato generado a partir del ruido z | Generador |

### 2.2 Que optimiza cada jugador

**El discriminador** ($\max_\phi$) hace clasificacion binaria:
- Para datos reales $\mathbf{x}$: quiere $D_\phi(\mathbf{x}) \to 1$ (asi $\log D_\phi(\mathbf{x}) \to 0$, el maximo)
- Para datos falsos $G_\theta(\mathbf{z})$: quiere $D_\phi(G_\theta(\mathbf{z})) \to 0$ (asi $\log(1 - 0) \to 0$, el maximo)

**El generador** ($\min_\theta$) quiere enganar a D:
- Quiere que $D_\phi(G_\theta(\mathbf{z})) \to 1$ (asi $\log(1 - 1) \to -\infty$, el minimo de V)
- No controla el primer termino (no depende de $\theta$)

### 2.3 Diagrama de la arquitectura GAN

```
                         ┌─────────────────────────────────────────────┐
                         │            GENERADOR G_θ                    │
                         │                                             │
  z ~ N(0, I) ─────────►│  Red neuronal (MLP, ConvNet, etc.)          │──► x_falso = G_θ(z)
  (ruido latente)        │  Transforma ruido en datos                  │        │
                         └─────────────────────────────────────────────┘        │
                                                                                │
                                                                                ▼
                         ┌─────────────────────────────────────────────┐
  x_real ~ p_data ──────►│           DISCRIMINADOR D_φ                 │──► D_φ(x) ∈ (0, 1)
  (datos reales)         │                                             │    "real o falso?"
                         │  Red neuronal ──► h_φ(x) ──► σ(h) = D(x)  │
                         └─────────────────────────────────────────────┘
                                     │                    │
                                     ▼                    ▼
                              Gradiente a φ         Gradiente a θ
                              (mejorar D)           (mejorar G)
```

### 2.4 Ejemplo intuitivo en 1D

Imagina que $p_\text{data}$ es una Gaussiana centrada en 5, y el generador empieza produciendo muestras centradas en 0:

```
Epoca 0:   p_data          p_G
            ·                ·
           ···              ···
          ·····            ·····
         ·······          ·······
    ─────┼───────┼────────┼───────── x
         0       2.5      5
                 ▲
         D dice: "izquierda = falso, derecha = real"

Epoca 100: p_data    p_G
              ·       ·
             ···     ···
            ····· ·····
           ··············
    ─────┼───────┼───────┼────────── x
         0       3.5     5
         G se ha movido hacia p_data

Epoca N:   p_data ≈ p_G
                ··
              ······
            ··········
           ············
    ─────┼───────┼───────┼────────── x
         0       5       10
         D ya no puede distinguir: D(x) = 0.5 para todo x
```

---

## 3. El discriminador óptimo

### 3.1 La formula

Para un generador $G$ fijo, el discriminador optimo es:

$$D^*_G(\mathbf{x}) = \frac{p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x}) + p_G(\mathbf{x})}$$

#### Como se lee

> "D estrella de x es igual a la densidad de los datos reales en x, dividida por la suma de la densidad real mas la densidad del generador en x."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $D^*_G(\mathbf{x})$ | La mejor respuesta del discriminador dado un generador fijo |
| $p_\text{data}(\mathbf{x})$ | Que tan probable es x bajo la distribucion real |
| $p_G(\mathbf{x})$ | Que tan probable es x bajo la distribucion del generador |
| $p_\text{data} + p_G$ | La "mezcla" de ambas distribuciones |

**Intuicion:** Cuando x proviene de una region donde solo hay datos reales ($p_G \approx 0$), $D^* \approx 1$. Cuando x proviene de una region con solo datos falsos ($p_\text{data} \approx 0$), $D^* \approx 0$. Cuando ambas distribuciones coinciden ($p_\text{data} = p_G$), $D^* = 0.5$ (moneda al aire).

### 3.2 Los logits estiman el ratio de densidades

Recordemos que $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$, donde $h_\phi$ son los **logits** (la activacion antes de la sigmoid). Si el discriminador es optimo ($D_\phi = D^*$), entonces:

$$h_\phi(\mathbf{x}) = \log \frac{p_\text{data}(\mathbf{x})}{p_G(\mathbf{x})}$$

#### Como se lee

> "Los logits del discriminador optimo en x son iguales al logaritmo del cociente entre la densidad real y la densidad del generador."

#### Que significa

Esto es el **log-ratio de verosimilitudes**. Si $h_\phi(\mathbf{x}) > 0$, el dato es mas probable bajo $p_\text{data}$ que bajo $p_G$ (es decir, probablemente es real). Si $h_\phi(\mathbf{x}) < 0$, es mas probable que sea falso.

**Nota:** Este resultado es fundamental para conectar GANs con medidas de divergencia.

---

## 4. Jensen-Shannon Divergence

### 4.1 Sustituyendo D* en V

Cuando sustituimos el discriminador optimo $D^*_G$ en el objetivo $V$, obtenemos:

$$V(G, D^*_G) = 2 \cdot D_\text{JSD}[p_\text{data}, p_G] - \log 4$$

#### Como se lee

> "El valor del juego con el discriminador optimo es dos veces la divergencia de Jensen-Shannon entre los datos reales y el generador, menos log de 4."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $V(G, D^*_G)$ | El valor del juego cuando D juega de forma optima |
| $D_\text{JSD}[p_\text{data}, p_G]$ | La divergencia JSD entre la distribucion real y la del generador |
| $2 \cdot (\ldots)$ | Factor de escala |
| $- \log 4$ | Constante (el valor minimo posible) |

### 4.2 Que es la JSD?

$$D_\text{JSD}[p, q] = \frac{1}{2}\left(D_\text{KL}\left[p \middle\| \frac{p+q}{2}\right] + D_\text{KL}\left[q \middle\| \frac{p+q}{2}\right]\right)$$

#### Como se lee

> "La divergencia JSD entre p y q es la media de la KL de p con la mezcla (p+q)/2, mas la KL de q con la mezcla (p+q)/2."

#### Que significa

- La JSD mide la "distancia" entre dos distribuciones, pero a diferencia de la KL, es **simetrica**: $D_\text{JSD}[p, q] = D_\text{JSD}[q, p]$
- Siempre esta acotada: $0 \leq D_\text{JSD} \leq \log 2$
- $D_\text{JSD} = 0$ si y solo si $p = q$

Para una explicacion detallada, consulta [`Divergencia-de-Jensen-Shannon.md`](Divergencia-de-Jensen-Shannon.md) y [`KL-Divergence.md`](KL-Divergence.md).

### 4.3 El generador optimo

Si el generador logra $p_G = p_\text{data}$, entonces:
- $D_\text{JSD}[p_\text{data}, p_G] = 0$
- $V(G^*, D^*) = -\log 4 \approx -1.386$
- $D^*(\mathbf{x}) = 0.5$ para todo $\mathbf{x}$ (el discriminador no puede distinguir)

```
Resumen del equilibrio optimo:

  p_G = p_data  ──►  JSD = 0  ──►  V = -log 4  ──►  D*(x) = 0.5  ∀x
       │                                                    │
       └───── "el generador ha aprendido               ────┘
               perfectamente la distribucion real"
```

---

## 5. Pérdida non-saturating

### 5.1 El problema: gradientes que se desvanecen

La perdida minimax del generador es:

$$L_G^\text{minimax} = \mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log(1 - D_\phi(G_\theta(\mathbf{z})))]$$

Reescribiendola en terminos de los logits ($D = \sigma(h)$, asi que $1 - D = \sigma(-h)$):

$$L_G^\text{minimax} = \mathbb{E}_{\mathbf{z}}[\log(1 - \sigma(h_\phi(G_\theta(\mathbf{z}))))]$$

Cuando el discriminador es bueno y rechaza todas las muestras falsas, $D(G(\mathbf{z})) \approx 0$, lo que equivale a $h_\phi(G(\mathbf{z})) \ll 0$. Calculando la derivada:

$$\frac{\partial L_G^\text{minimax}}{\partial \theta} = \mathbb{E}_{\mathbf{z}} \left[ -\frac{\sigma'(h_\phi(G_\theta(\mathbf{z})))}{1 - \sigma(h_\phi(G_\theta(\mathbf{z})))} \cdot \frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z})) \right]$$

Usando que $\sigma'(x) = \sigma(x)(1 - \sigma(x))$, esto se simplifica a:

$$= \mathbb{E}_{\mathbf{z}} \left[ -\sigma(h_\phi(G_\theta(\mathbf{z}))) \cdot \frac{\partial}{\partial \theta} h_\phi(G_\theta(\mathbf{z})) \right]$$

Cuando $D(G(\mathbf{z})) = \sigma(h) \approx 0$, el **gradiente se desvanece**: $\sigma(h) \approx 0 \implies$ gradiente $\approx 0$. El generador no recibe senal para mejorar precisamente cuando mas la necesita.

```
Magnitud del gradiente de L_G^minimax:

  |grad|
    ▲
    │
    │  ·
    │   ···
    │      ·····
    │           ··········
    │                     ····················
    └──────────────────────────────────────────► D(G(z))
    0                   0.5                    1
         ▲                                    ▲
  D rechaza todo                       D acepta todo
  (grad ≈ 0!)                         (grad grande)
  "justo cuando G mas
   necesita aprender"
```

### 5.2 La solucion: non-saturating loss

La perdida non-saturating reemplaza "minimizar $\log(1 - D)$" por "maximizar $\log D$":

$$L_G^\text{non-saturating} = -\mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log D_\phi(G_\theta(\mathbf{z}))]$$

#### Como se lee

> "La perdida non-saturating del generador es el negativo de la esperanza de log D evaluado en las muestras generadas."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $-\mathbb{E}[\ldots]$ | Signo negativo porque minimizamos la perdida (equivale a maximizar $\log D$) |
| $\log D_\phi(G_\theta(\mathbf{z}))$ | Log de la probabilidad que D asigna a que la muestra falsa sea "real" |
| Objetivo del generador | Hacer que D crea que las muestras falsas son reales |

**Por que funciona?** Cuando $D(G(\mathbf{z})) \approx 0$, ahora $\log D(G(\mathbf{z})) \to -\infty$, asi que la perdida es grande y el gradiente es fuerte. El generador recibe una senal clara de "necesitas mejorar mucho".

**En la practica**, ambas perdidas tienen los mismos puntos criticos, pero la non-saturating tiene gradientes mucho mas fuertes al inicio del entrenamiento, cuando D domina a G.

---

## 6. Algoritmo de entrenamiento

### 6.1 Paso a paso

Para cada epoca, repetir:

**Paso 1:** Muestrear un mini-batch de datos reales:

$$\mathbf{x}^{(1)}, \ldots, \mathbf{x}^{(m)} \sim p_\text{data}$$

**Paso 2:** Muestrear un mini-batch de ruido:

$$\mathbf{z}^{(1)}, \ldots, \mathbf{z}^{(m)} \sim p(\mathbf{z}) = \mathcal{N}(\mathbf{0}, I)$$

**Paso 3:** Actualizar el **discriminador** con gradient ascent sobre $\phi$:

$$\nabla_\phi \frac{1}{m} \sum_{i=1}^{m} \left[ \log D_\phi(\mathbf{x}^{(i)}) + \log(1 - D_\phi(G_\theta(\mathbf{z}^{(i)}))) \right]$$

**Paso 4:** Actualizar el **generador** con gradient descent sobre $\theta$ (usando non-saturating loss):

$$\nabla_\theta \left( -\frac{1}{m} \sum_{i=1}^{m} \log D_\phi(G_\theta(\mathbf{z}^{(i)})) \right)$$

#### Como se lee cada paso

- Paso 3: "Calcular el gradiente respecto a phi de la media sobre el batch de log D(x-real) mas log(1 - D(G(z)))." Esto es una estimacion Monte Carlo de la esperanza.
- Paso 4: "Calcular el gradiente respecto a theta de la media negativa de log D(G(z))."

### 6.2 Diagrama del flujo de entrenamiento

```
┌─── Inicio de epoca ───────────────────────────────────────────────┐
│                                                                   │
│  1. Muestrear x^(1)...x^(m) del dataset                          │
│  2. Muestrear z^(1)...z^(m) de N(0, I)                           │
│  3. Forward pass: generar G_θ(z^(i)) para cada i                 │
│                                                                   │
│  ┌─── Actualizar D ─────────────────────────────────────────┐     │
│  │  D intenta:                                              │     │
│  │    - dar probabilidad ALTA a x_real                      │     │
│  │    - dar probabilidad BAJA a G(z)                        │     │
│  │  φ ← φ + α · ∇_φ V     (gradient ASCENT)                │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌─── Actualizar G ─────────────────────────────────────────┐     │
│  │  G intenta:                                              │     │
│  │    - que D de probabilidad ALTA a G(z)                   │     │
│  │  θ ← θ - α · ∇_θ L_G   (gradient DESCENT)               │     │
│  └──────────────────────────────────────────────────────────┘     │
│                                                                   │
└─── Repetir ───────────────────────────────────────────────────────┘
```

---

## 7. Problemas del entrenamiento

### 7.1 Mode collapse (colapso de modos)

El generador puede aprender a producir solo unas pocas muestras que enganar al discriminador, ignorando la diversidad de los datos reales.

```
Distribucion real (multimodal):     Generador con mode collapse:

    ·           ·           ·                     ···
   ···         ···         ···                   ·····
  ·····       ·····       ·····                 ·······
──┼─────────┼─────────┼──────── x     ────────┼──────────── x
  modo 1    modo 2    modo 3           solo genera
                                       modo 2!
```

**Analogia:** El falsificador descubre que un tipo especifico de billete engana al detective, y solo fabrica ese tipo una y otra vez, en lugar de aprender a fabricar todos los tipos de billetes.

### 7.2 Oscilacion del entrenamiento

A diferencia de MLE (donde la perdida disminuye monotonamente), en GANs las perdidas de G y D **oscilan**. No hay un criterio claro de convergencia. Esto hace dificil saber cuando parar el entrenamiento.

### 7.3 Dificultad de evaluacion

Como no calculamos la verosimilitud, no hay una metrica unica para evaluar la calidad del modelo durante el entrenamiento. En la practica se usan metricas como FID (Frechet Inception Distance) e IS (Inception Score), pero estas tienen sus propias limitaciones.

---

## 8. KL forward vs reverse -- GANs vs VAEs

### 8.1 Dos direcciones de la KL

Recordemos de [`KL-Divergence.md`](KL-Divergence.md) que la KL no es simetrica: $D_\text{KL}[p \| q] \neq D_\text{KL}[q \| p]$.

**KL forward** (mode-covering): $D_\text{KL}[p_\text{data} \| p_\theta]$
- Penaliza si $p_\theta$ asigna probabilidad **baja** donde $p_\text{data}$ asigna probabilidad **alta**
- Resultado: $p_\theta$ intenta "cubrir" todos los modos de $p_\text{data}$, aunque meta probabilidad en zonas vacias
- **VAEs** minimizan esta (a traves del ELBO)

**KL reverse** (mode-seeking): $D_\text{KL}[p_\theta \| p_\text{data}]$
- Penaliza si $p_\theta$ asigna probabilidad **alta** donde $p_\text{data}$ asigna probabilidad **baja**
- Resultado: $p_\theta$ se "concentra" en un subconjunto de modos, pero no genera basura
- **GANs** (con non-saturating loss + D optimo) minimizan esta

### 8.2 Resultado

Cuando el discriminador es optimo y usamos la perdida combinada (minimax + non-saturating), el generador minimiza:

$$L_G(\theta; \phi) = D_\text{KL}(p_\theta(\mathbf{x}) \| p_\text{data}(\mathbf{x}))$$

#### Como se lee

> "La perdida del generador con discriminador optimo es la KL divergencia de la distribucion del generador con respecto a la distribucion de los datos."

### 8.3 Tabla comparativa

| Propiedad | VAE (KL forward) | GAN (KL reverse) |
|-----------|-------------------|-------------------|
| Minimiza | $D_\text{KL}[p_\text{data} \| p_\theta]$ | $D_\text{KL}[p_\theta \| p_\text{data}]$ |
| Comportamiento | Mode-covering | Mode-seeking |
| Muestras | Borrosas pero diversas | Nitidas pero menos diversas |
| Riesgo | Genera en zonas "vacias" | Mode collapse |
| Evaluacion | ELBO (cota de verosimilitud) | Sin metrica directa |

### 8.4 Conexión con VAEs

La negative log-likelihood (NLL) que minimizan los VAEs se puede descomponer como:

$$-\mathbb{E}_{\mathbf{x} \sim p_\text{data}}[\log p_\theta(\mathbf{x})] = D_\text{KL}(p_\text{data}(\mathbf{x}) \| p_\theta(\mathbf{x})) + \text{const}$$

donde la constante es $-H(p_\text{data})$ (la entropía de los datos, que no depende de $\theta$).

Esto significa que un VAE (minimizando NLL vía ELBO) y un GAN (minimizando $D_\text{KL}(p_\theta \| p_\text{data})$) **no** optimizan el mismo objetivo:

| Modelo | Minimiza respecto a $\theta$ | Dirección de la KL |
|--------|------------------------------|---------------------|
| VAE (ELBO → NLL) | $D_\text{KL}(p_\text{data} \| p_\theta)$ | Forward (mode-covering) |
| GAN ($L_G$) | $D_\text{KL}(p_\theta \| p_\text{data})$ | Reverse (mode-seeking) |

La dirección de la KL es opuesta, lo que explica las diferencias en calidad de muestras (GANs más nítidas, VAEs más diversas).

Para más detalle sobre VAEs, consulta [`vae.md`](vae.md).

```
KL forward (VAE):                    KL reverse (GAN):

  p_data     p_θ                       p_data     p_θ
    ·        ····                         ·          ·
   ···    ··········                     ···        ···
  ·····  ·············                  ·····      ·····
  modo 1    cubre TODO                 modo 1    solo modo 1
     ·       (incluso zonas vacias)       ·       (pero preciso)
    ···                                  ···
   ·····                                ·····
   modo 2                               modo 2   (ignorado)
```

---

## 9. f-Divergencias y f-GANs

### 9.1 La familia general de f-divergencias

La JSD usada por los GANs originales es solo **un caso particular** de una familia mucho mas amplia: las f-divergencias.

$$D_f(p, q) = \mathbb{E}_{\mathbf{x} \sim q}\left[f\left(\frac{p(\mathbf{x})}{q(\mathbf{x})}\right)\right]$$

#### Como se lee

> "La f-divergencia de p respecto a q es la esperanza bajo q de f aplicada al cociente de densidades p/q."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $D_f(p, q)$ | Medida de discrepancia entre p y q |
| $f$ | Funcion convexa con $f(1) = 0$ (el "generador" de la divergencia) |
| $\frac{p(\mathbf{x})}{q(\mathbf{x})}$ | Cociente de densidades (density ratio) |
| $\mathbb{E}_q[\ldots]$ | La esperanza se toma bajo q |

### 9.2 Tabla de f-divergencias comunes

| Divergencia | $f(t)$ | $f^*(u)$ |
|-------------|--------|----------|
| KL forward | $t \log t$ | $e^{u-1}$ |
| KL reverse | $-\log t$ | $-1 - \log(-u)$ |
| Jensen-Shannon | $-(1+t)\log\frac{1+t}{2} + t\log t$ | $-\log(2 - e^u)$ |
| Total variation | $\frac{1}{2}|t - 1|$ | $u$ (con $u \in [-\frac{1}{2}, \frac{1}{2}]$) |
| $\chi^2$ (Pearson) | $(t-1)^2$ | $\frac{u^2}{4} + u$ |

### 9.3 Cota inferior con la conjugada de Fenchel

Como no conocemos las densidades $p$ y $q$ directamente, necesitamos una forma de **estimar** $D_f$ usando solo muestras. La conjugada de Fenchel nos da una cota inferior:

$$D_f(p, q) \geq \sup_{T \in \mathcal{T}}\left(\mathbb{E}_{\mathbf{x} \sim p}[T(\mathbf{x})] - \mathbb{E}_{\mathbf{x} \sim q}[f^*(T(\mathbf{x}))]\right)$$

#### Como se lee

> "La f-divergencia es mayor o igual al supremo sobre todas las funciones T de: la esperanza bajo p de T(x), menos la esperanza bajo q de la conjugada f-estrella de T(x)."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\sup_{T \in \mathcal{T}}$ | Buscar la funcion T que haga la cota lo mas apretada posible |
| $\mathbb{E}_p[T(\mathbf{x})]$ | Promedio de T sobre datos reales |
| $\mathbb{E}_q[f^*(T(\mathbf{x}))]$ | Promedio de $f^*$ de T sobre datos del modelo |
| $f^*$ | Conjugada convexa (dual de Fenchel) de f |

### 9.4 El objetivo f-GAN

Hacemos $p = p_\text{data}$, $q = p_G$, parametrizamos $T$ con $\phi$ y $G$ con $\theta$:

$$\min_\theta \max_\phi F(\theta, \phi) = \mathbb{E}_{\mathbf{x} \sim p_\text{data}}[T_\phi(\mathbf{x})] - \mathbb{E}_{\mathbf{x} \sim p_{G_\theta}}[f^*(T_\phi(\mathbf{x}))]$$

Esto generaliza los GANs: eligiendo diferentes funciones $f$, obtenemos diferentes objetivos de entrenamiento.

Para mas detalle sobre f-divergencias, consulta [`f-Divergencias.md`](f-Divergencias.md).

---

## 10. GANs condicionales

### 10.1 Motivacion

A veces no solo queremos generar datos, sino generar datos **de una clase especifica**. Por ejemplo: generar una imagen de un "zapato" o de una "camiseta" en Fashion MNIST.

Un GAN **incondicional** aprende $p_\theta(\mathbf{x})$. Un GAN **condicional** (CGAN) aprende $p_\theta(\mathbf{x} | y)$, donde $y$ es la etiqueta de clase.

### 10.2 La funcion objetivo condicional

La perdida del discriminador condicional es:

$$L_D = -\mathbb{E}_{(\mathbf{x},y) \sim p_\text{data}}[\log D_\phi(\mathbf{x}, y)] - \mathbb{E}_{y \sim p(y)}\left[\mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log(1 - D_\phi(G_\theta(\mathbf{z}, y), y))]\right]$$

#### Como se lee

> "La perdida del discriminador condicional es: menos la esperanza sobre datos reales (x, y) de log D(x, y), menos la esperanza sobre clases y de la esperanza sobre ruido z de log(1 - D(G(z, y), y))."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $D_\phi(\mathbf{x}, y)$ | Probabilidad de que x sea real **dado** que es de clase y |
| $G_\theta(\mathbf{z}, y)$ | Dato generado a partir de ruido z **condicionado** a la clase y |
| $\mathbb{E}_{(\mathbf{x},y) \sim p_\text{data}}$ | Promedio sobre pares (dato, etiqueta) reales |
| $\mathbb{E}_{y \sim p(y)}$ | Promedio sobre clases (uniforme: $p(y) = 1/m$) |

### 10.3 Implementacion del generador

El generador $G_\theta(\mathbf{z}, y)$ recibe dos entradas:
- $\mathbf{z} \sim \mathcal{N}(\mathbf{0}, I)$: el ruido latente
- $\mathbf{y}$: la etiqueta de clase codificada como vector **one-hot**

La forma mas simple: **concatenar** el one-hot con z y pasarlo por la red neuronal.

### 10.4 Projection discriminator

Bajo ciertas suposiciones (las features $\varphi(\mathbf{x})$ siguen mezclas de Gaussianas por clase), el discriminador optimo tiene la forma:

$$h^*(\mathbf{x}, y) = \mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$$

#### Como se lee

> "Los logits optimos del discriminador condicional son el producto interno del vector one-hot y con la transformacion afin A por phi de x mas b."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\varphi(\mathbf{x})$ | Features extraidas por la red neuronal |
| $A$ | Matriz de pesos aprendida |
| $\mathbf{b}$ | Vector de sesgo aprendido |
| $\mathbf{y}^T(\ldots)$ | El one-hot selecciona la fila de $A$ correspondiente a la clase y |

En la practica, $\varphi$, $A$ y $\mathbf{b}$ se parametrizan con una red neuronal seguida de una capa lineal final.

### 10.5 BiGAN: inferencia de representaciones latentes

Un GAN estándar solo tiene un generador $G: \mathbf{z} \to \mathbf{x}$. No hay forma directa de ir de $\mathbf{x}$ a $\mathbf{z}$ (no tiene encoder). **BiGAN** (Bidirectional GAN) resuelve esto añadiendo un **encoder** $E: \mathbf{x} \to \mathbf{z}$ al framework GAN.

El discriminador en BiGAN no solo juzga si un dato es real o falso, sino que juzga **pares (dato, latente)**:

- Pares "reales": $(\mathbf{x}, E(\mathbf{x}))$ — dato real con su representación latente inferida
- Pares "falsos": $(G(\mathbf{z}), \mathbf{z})$ — dato generado con su ruido original

$$\min_{G, E} \max_D V(D, E, G) = \mathbb{E}_{\mathbf{x} \sim p_\text{data}}[\log D(\mathbf{x}, E(\mathbf{x}))] + \mathbb{E}_{\mathbf{z} \sim p(\mathbf{z})}[\log(1 - D(G(\mathbf{z}), \mathbf{z}))]$$

**Por qué importa:** BiGAN permite que los GANs aprendan representaciones latentes útiles para tareas downstream (clasificación, clustering), algo que los GANs estándar no pueden hacer por no tener un mapeo $\mathbf{x} \to \mathbf{z}$.

### 10.6 CycleGAN: traducción de imágenes no pareadas

CycleGAN resuelve el problema de traducir imágenes entre dos dominios $\mathcal{X} \leftrightarrow \mathcal{Y}$ (por ejemplo, fotos a pinturas) **sin datos pareados** — es decir, no necesitamos pares (foto, pintura) del mismo contenido.

Se aprenden dos generadores: $G: \mathcal{X} \to \mathcal{Y}$ y $F: \mathcal{Y} \to \mathcal{X}$, con discriminadores $D_\mathcal{Y}$ y $D_\mathcal{X}$ respectivos.

La idea clave es la **consistencia cíclica** (cycle consistency): si traducimos una imagen del dominio $\mathcal{X}$ al dominio $\mathcal{Y}$ con $G$, y luego la traducimos de vuelta con $F$, deberíamos obtener la imagen original:

$$\mathcal{L}_\text{cyc}(G, F) = \mathbb{E}_{\mathbf{x}}[\|F(G(\mathbf{x})) - \mathbf{x}\|_1] + \mathbb{E}_{\mathbf{y}}[\|G(F(\mathbf{y})) - \mathbf{y}\|_1]$$

**Cómo leerla:** "La pérdida de consistencia cíclica es la norma L1 de $F(G(\mathbf{x}))$ menos $\mathbf{x}$, más la norma L1 de $G(F(\mathbf{y}))$ menos $\mathbf{y}$."

La pérdida total combina los objetivos GAN estándar con la consistencia cíclica:

$$\mathcal{L}_\text{total} = \mathcal{L}_\text{GAN}(G, D_\mathcal{Y}) + \mathcal{L}_\text{GAN}(F, D_\mathcal{X}) + \lambda \cdot \mathcal{L}_\text{cyc}(G, F)$$

**Analogía:** Si traduzco un caballo a cebra y luego de vuelta a caballo, debería obtener el mismo caballo. Esta restricción previene que los generadores aprendan mapeos degenerados.

---

## 11. Wasserstein GANs

### 11.1 El problema con JSD/KL y soportes disjuntos

Cuando las distribuciones $p_\theta$ y $p_\text{data}$ tienen **soportes que no se solapan** (lo cual es comun en la practica, ya que los datos reales viven en una variedad de baja dimension):

- $D_\text{KL}[p_\theta \| p_\text{data}] \to \infty$
- $D_\text{JSD}[p_\theta, p_\text{data}] = \log 2$ (constante)

En ambos casos, **el gradiente respecto a $\theta$ es cero o inutilizable**: el generador no recibe senal de aprendizaje.

```
Soportes disjuntos:

  p_data          p_θ                   JSD = log 2 (constante)
    ·               ·                   KL = infinito
   ···             ···                  ──► ¡Gradiente = 0!
  ·····           ·····                      No hay senal para
────┼───────gap──┼──────── x                 mover p_θ hacia p_data
    θ_0           θ

No importa cuanto acerques θ a θ_0:
mientras los soportes no se toquen, JSD es constante
```

Para mas detalle sobre este problema, consulta [`Distancia-de-Wasserstein.md`](Distancia-de-Wasserstein.md).

### 11.2 La distancia Wasserstein (Earth Mover's)

La distancia Wasserstein-1 mide el **coste minimo de transporte** para transformar una distribucion en otra:

$$W(p, q) = \inf_{\gamma \in \Pi(p,q)} \mathbb{E}_{(x,y) \sim \gamma}[\|x - y\|]$$

#### Como se lee

> "La distancia Wasserstein entre p y q es el infimo, sobre todos los acoplamientos gamma de p y q, de la esperanza de la distancia entre x e y."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $W(p, q)$ | Coste minimo de mover la "masa" de p hasta q |
| $\Pi(p, q)$ | Conjunto de todas las distribuciones conjuntas con marginales p y q |
| $\gamma$ | Un "plan de transporte" especifico |
| $\|x - y\|$ | La distancia que hay que mover cada unidad de masa |
| $\inf$ | El plan de transporte optimo (minimo coste) |

**Analogia:** Imagina que p y q son dos montones de arena con la misma cantidad total. La distancia Wasserstein es el minimo esfuerzo necesario para reconfigurar el primer monton hasta que tenga la forma del segundo.

**La ventaja crucial:** A diferencia de JSD y KL, la distancia Wasserstein **varia suavemente** incluso cuando los soportes no se solapan. Si acercas $p_\theta$ a $p_\text{data}$, W disminuye, y el gradiente apunta en la direccion correcta.

### 11.3 Dual de Kantorovich-Rubinstein

La formulacion primal es intratable (requiere optimizar sobre todos los acoplamientos). La dualidad nos da una formula util:

$$W(p, q) = \sup_{\|D\|_L \leq 1} \left( \mathbb{E}_{\mathbf{x} \sim p}[D(\mathbf{x})] - \mathbb{E}_{\mathbf{x} \sim q}[D(\mathbf{x})] \right)$$

#### Como se lee

> "La distancia Wasserstein es el supremo, sobre todas las funciones D que son 1-Lipschitz, de la esperanza de D bajo p menos la esperanza de D bajo q."

#### Que significa

| Parte | Significado |
|-------|-------------|
| $\sup_{\|D\|_L \leq 1}$ | Buscar la funcion D con gradiente acotado ($\|\nabla D\| \leq 1$) que maximice la diferencia |
| $\mathbb{E}_p[D(\mathbf{x})]$ | Puntuacion promedio de D sobre datos reales |
| $\mathbb{E}_q[D(\mathbf{x})]$ | Puntuacion promedio de D sobre datos generados |
| 1-Lipschitz | La funcion no puede cambiar mas rapido que pendiente 1 |

**Nota importante:** Aqui $D$ ya **no** es una probabilidad en $(0, 1)$. Es un **critico** que puede dar cualquier numero real. La restriccion de Lipschitz reemplaza a la sigmoid.

### 11.4 WGAN-GP (Gradient Penalty)

La forma practica de imponer la restriccion de Lipschitz es anadiendo una **penalizacion sobre la norma del gradiente**:

$$L_D = \mathbb{E}_{\mathbf{x} \sim p_\theta}[D_\phi(\mathbf{x})] - \mathbb{E}_{\mathbf{x} \sim p_\text{data}}[D_\phi(\mathbf{x})] + \lambda \mathbb{E}_{\mathbf{x} \sim r_\theta}[(\|\nabla D_\phi(\mathbf{x})\|_2 - 1)^2]$$

$$L_G = -\mathbb{E}_{\mathbf{x} \sim p_\theta}[D_\phi(\mathbf{x})]$$

#### Como se lee

> "La perdida del discriminador WGAN-GP es: la esperanza de D sobre datos generados, menos la esperanza de D sobre datos reales, mas lambda por la esperanza de (norma del gradiente de D menos 1) al cuadrado, evaluada en puntos interpolados."

#### Simbolo por simbolo

| Parte | Significado |
|-------|-------------|
| $\mathbb{E}_{p_\theta}[D(\mathbf{x})]$ | Puntuacion media de las muestras generadas (D quiere que sea **baja**) |
| $-\mathbb{E}_{p_\text{data}}[D(\mathbf{x})]$ | Negativo de la puntuacion media de los reales (D quiere que sea **alta**) |
| $\lambda$ | Peso de la penalizacion ($\lambda = 10$ en la practica) |
| $r_\theta$ | Distribucion de puntos **interpolados**: $\hat{\mathbf{x}} = \alpha \mathbf{x}_\text{real} + (1 - \alpha) \mathbf{x}_\text{falso}$ con $\alpha \sim \text{Uniform}(0, 1)$ |
| $\|\nabla D_\phi(\mathbf{x})\|_2$ | Norma del gradiente de D respecto a x (queremos que sea $\approx 1$) |
| $(\ldots - 1)^2$ | Penaliza desviaciones de la condicion de Lipschitz |

```
Interpolacion para gradient penalty:

  x_real ●────────────────────● x_falso = G(z)
                │
          x_hat = α·x_real + (1-α)·x_falso
                │
          Evaluar ‖∇D(x_hat)‖₂ ≈ 1?
          Si no, penalizar
```

---

## 12. Tabla comparativa de variantes

| Variante | Divergencia | Perdida G | Perdida D | Estabilidad |
|----------|-------------|-----------|-----------|-------------|
| **GAN original** (minimax) | JSD | $\mathbb{E}[\log(1 - D(G(z)))]$ | $-\mathbb{E}[\log D(x)] - \mathbb{E}[\log(1-D(G(z)))]$ | Baja (grad vanishing) |
| **Non-saturating** | JSD (aprox.) | $-\mathbb{E}[\log D(G(z))]$ | Igual que original | Media |
| **f-GAN** | Cualquier f-div | $-\mathbb{E}[f^*(T(G(z)))]$ | $-\mathbb{E}[T(x)] + \mathbb{E}[f^*(T(G(z)))]$ | Depende de f |
| **CGAN** | JSD condicional | $-\mathbb{E}[\log D(G(z,y), y)]$ | Igual pero condicionado en y | Media |
| **WGAN-GP** | Wasserstein-1 | $-\mathbb{E}[D(G(z))]$ | $\mathbb{E}[D(G(z))] - \mathbb{E}[D(x)] + \lambda\,\text{GP}$ | **Alta** |

### Comparacion con otros modelos generativos

| Propiedad | Autorregresivos | VAEs | Flujos | GANs |
|-----------|----------------|------|--------|------|
| Verosimilitud exacta | Si | No (ELBO) | Si | No |
| Calidad de muestras | Media | Borrosa | Media | **Alta** |
| Diversidad de muestras | Alta | **Alta** | Alta | Riesgo mode collapse |
| Muestreo rapido | No (secuencial) | **Si** | Depende | **Si** |
| Entrenamiento estable | **Si** | **Si** | **Si** | No (adversario) |
| Espacio latente | No | Si | Si | Si (implicito) |

Para la comparacion con flujos normalizantes, consulta [`flujos_normalizantes.md`](flujos_normalizantes.md).

---

## 13. Glosario

| Castellano | Ingles | Definicion breve |
|------------|--------|------------------|
| Red generativa adversaria | Generative Adversarial Network (GAN) | Modelo generativo basado en un juego entre generador y discriminador |
| Generador | Generator | Red neuronal que transforma ruido en datos |
| Discriminador | Discriminator | Red neuronal que clasifica datos como reales o falsos |
| Critico | Critic | Nombre del discriminador en WGAN (ya no da probabilidades) |
| Logits | Logits | Activacion antes de la sigmoid: $h_\phi(\mathbf{x})$ |
| Juego minimax | Minimax game | Optimizacion donde un jugador minimiza y otro maximiza |
| Perdida non-saturating | Non-saturating loss | Perdida alternativa para G que evita gradientes que desaparecen |
| Colapso de modos | Mode collapse | El generador produce solo un subconjunto de los modos de la distribucion real |
| Mode-covering | Mode-covering | Comportamiento de la KL forward: cubrir todos los modos aunque sea difusamente |
| Mode-seeking | Mode-seeking | Comportamiento de la KL reverse: concentrarse en pocos modos pero con precision |
| f-divergencia | f-divergence | Familia general de medidas de discrepancia parametrizadas por una funcion convexa f |
| Conjugada de Fenchel | Fenchel conjugate | Dual convexa de f, usada para obtener cotas inferiores de la f-divergencia |
| Distancia Wasserstein | Wasserstein distance | Coste minimo de transporte entre dos distribuciones |
| Penalizacion de gradiente | Gradient penalty | Termino que fuerza al discriminador a ser 1-Lipschitz |
| GAN condicional | Conditional GAN | GAN que genera datos condicionados a una etiqueta de clase |
| Projection discriminator | Projection discriminator | Discriminador condicional con forma $\mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$ |
| Jensen-Shannon | Jensen-Shannon divergence | Divergencia simetrica, caso especial de f-divergencia |
| Lipschitz | Lipschitz | Funcion cuya derivada esta acotada: $\|f(x) - f(y)\| \leq K\|x - y\|$ |
| Two-sample test | Two-sample test | Test estadistico que determina si dos conjuntos de muestras vienen de la misma distribucion |
| Ratio de densidades | Density ratio | Cociente $p(x)/q(x)$, estimado por los logits del discriminador optimo |
| Interpolacion | Interpolation | Punto intermedio $\hat{x} = \alpha x_1 + (1-\alpha)x_2$ usado en gradient penalty |
