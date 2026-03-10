# Ejercicio 3 — Divergence Minimization

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: Propiedades teoricas de las GANs

En el ejercicio 2 implementamos una GAN con la loss non-saturating. Ahora analizaremos las propiedades teoricas del entrenamiento adversarial: ¿que aprende el discriminador optimo? ¿Que divergencia minimiza realmente el generador?

El enunciado introduce una notacion compacta. En lugar de escribir el generador como una funcion $G_\theta(\mathbf{z})$ que transforma ruido en imagenes, se usa directamente $p_\theta(\mathbf{x})$ para denotar la distribucion inducida por el generador: primero se muestrea $\mathbf{z} \sim \mathcal{N}(\mathbf{0}, I)$ y luego se obtiene $\mathbf{x} = G_\theta(\mathbf{z})$.

```
z ~ N(0, I)  -->  G_theta(z) = x  -->  la distribucion de x se llama p_theta(x)
```

Con esta notacion, el discriminador ve muestras de dos distribuciones y decide si son reales o generadas:

```
p_data(x)   -->  "real"      -->  D quiere asignar D(x) ~ 1
p_theta(x)  -->  "generado"  -->  D quiere asignar D(x) ~ 0
```

---

## Ecuacion 12 — La loss del discriminador (forma compacta)

$$L_D(\phi; \theta) = -\mathbb{E}_{\mathbf{x} \sim p_\text{data}(\mathbf{x})}[\log D_\phi(\mathbf{x})] - \mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[\log(1 - D_\phi(\mathbf{x}))]$$

### Como se lee

> "La loss del discriminador es menos la esperanza del logaritmo de $D_\phi(\mathbf{x})$ bajo datos reales, menos la esperanza del logaritmo de $1 - D_\phi(\mathbf{x})$ bajo datos generados."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $L_D(\phi; \theta)$ | **Loss del discriminador**. Depende de los parametros del discriminador $\phi$ (que queremos optimizar) y de los parametros del generador $\theta$ (que estan fijos durante la optimizacion del discriminador). El punto y coma separa "lo que optimizamos" de "lo que esta fijo". |
| $D_\phi(\mathbf{x})$ | **Salida del discriminador**: un numero entre 0 y 1. Interpretacion: la probabilidad que el discriminador asigna a que $\mathbf{x}$ sea una muestra real. |
| $\mathbb{E}_{\mathbf{x} \sim p_\text{data}(\mathbf{x})}[\cdot]$ | Esperanza sobre datos **reales** del dataset de entrenamiento. |
| $\mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[\cdot]$ | Esperanza sobre datos **generados** por el modelo (muestras del generador). |
| $\log D_\phi(\mathbf{x})$ | Log de la probabilidad asignada a "real". Si $D_\phi(\mathbf{x}) \approx 1$, este valor es cercano a 0. Si $D_\phi(\mathbf{x}) \approx 0$, tiende a $-\infty$. |
| $\log(1 - D_\phi(\mathbf{x}))$ | Log de la probabilidad asignada a "falso". Si $D_\phi(\mathbf{x}) \approx 0$ (correctamente identificado como falso), este valor es cercano a 0. |

### Intuicion

El discriminador **minimiza** $L_D$. Dado que ambos terminos tienen signo negativo, minimizar $L_D$ equivale a **maximizar**:

$$\mathbb{E}_{p_\text{data}}[\log D_\phi(\mathbf{x})] + \mathbb{E}_{p_\theta}[\log(1 - D_\phi(\mathbf{x}))]$$

Es decir, el discriminador quiere:
- Que $D_\phi(\mathbf{x})$ sea grande (cercano a 1) para datos **reales** -> maximiza $\log D_\phi(\mathbf{x})$
- Que $D_\phi(\mathbf{x})$ sea pequeno (cercano a 0) para datos **falsos** -> maximiza $\log(1 - D_\phi(\mathbf{x}))$

---

## Ecuacion 13 — El discriminador optimo

$$D^*(\mathbf{x}) = \frac{p_\text{data}(\mathbf{x})}{p_\theta(\mathbf{x}) + p_\text{data}(\mathbf{x})}$$

### Como se lee

> "$D$ estrella de $\mathbf{x}$ es el cociente entre la densidad de los datos reales y la suma de las densidades real y generada, evaluadas en el punto $\mathbf{x}$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $D^*(\mathbf{x})$ | El **discriminador optimo**: el valor de $D_\phi(\mathbf{x})$ que minimiza $L_D$ para cada punto $\mathbf{x}$. El asterisco $*$ denota "optimo". |
| $p_\text{data}(\mathbf{x})$ | Densidad de la distribucion real en el punto $\mathbf{x}$. |
| $p_\theta(\mathbf{x})$ | Densidad de la distribucion generada en el punto $\mathbf{x}$. |

### Intuicion

El discriminador optimo es una funcion suave que dice "que proporcion de la densidad total en $\mathbf{x}$ corresponde a datos reales":

- Si en el punto $\mathbf{x}$ solo hay datos reales ($p_\text{data} \gg p_\theta$): $D^*(\mathbf{x}) \approx 1$
- Si en el punto $\mathbf{x}$ solo hay datos generados ($p_\theta \gg p_\text{data}$): $D^*(\mathbf{x}) \approx 0$
- Si ambas densidades son iguales ($p_\text{data} = p_\theta$): $D^*(\mathbf{x}) = 0.5$

```
D*(x)
1.0 -- -- -- -- -- -- -- -- -- -- -- -- -- --
         solo real       mixto       solo generado
0.5 -- -- -- -- -- -- -- * -- -- -- -- -- --
                       iguales
0.0 -- -- -- -- -- -- -- -- -- -- -- -- -- --
```

Cuando $p_\theta = p_\text{data}$ (el generador es perfecto), $D^*(\mathbf{x}) = 0.5$ para todo $\mathbf{x}$: el discriminador no puede distinguir nada.

### Pista del enunciado

El enunciado da una pista: para un $\mathbf{x}$ fijo, ¿que $t$ minimiza la funcion $f(t) = -p_\text{data}(\mathbf{x}) \log t - p_\theta(\mathbf{x}) \log(1-t)$?

Esta es la loss del discriminador evaluada en un punto concreto, donde $t = D_\phi(\mathbf{x})$. Minimizar $L_D$ sobre todas las funciones $D_\phi$ equivale a minimizar punto a punto (porque el discriminador puede asignar cualquier valor en cada punto independientemente).

---

## Ecuacion 14 — Los logits del discriminador optimo

$$h_\phi(\mathbf{x}) = \log \frac{p_\text{data}(\mathbf{x})}{p_\theta(\mathbf{x})}$$

### Como se lee

> "Los logits optimos $h_\phi(\mathbf{x})$ son el logaritmo del cociente entre la densidad de los datos reales y la densidad del modelo generativo, evaluados en $\mathbf{x}$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $h_\phi(\mathbf{x})$ | Los **logits** del discriminador: la salida antes de aplicar la sigmoide. Recuerda que $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$. |
| $\log \frac{p_\text{data}(\mathbf{x})}{p_\theta(\mathbf{x})}$ | El **log-ratio de densidades** (log likelihood ratio). Mide cuanto mas probable es $\mathbf{x}$ bajo los datos reales que bajo el modelo. |

### Intuicion

Los logits del discriminador optimo tienen una interpretacion limpia: son el **logaritmo del cociente de densidades**. Esto conecta el discriminador con la estimacion de densidades:

| Situacion | $h^*(\mathbf{x})$ | Interpretacion |
|-----------|-------------------|----------------|
| $p_\text{data} \gg p_\theta$ | Grande y positivo | $\mathbf{x}$ es mucho mas probable bajo datos reales |
| $p_\text{data} = p_\theta$ | $0$ | Ambas distribuciones dan la misma densidad |
| $p_\text{data} \ll p_\theta$ | Grande y negativo | $\mathbf{x}$ es mucho mas probable bajo el modelo |

### ¿Por que logits y no probabilidades?

Recordemos que $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$ donde $\sigma$ es la sigmoide. La relacion inversa es $h_\phi(\mathbf{x}) = \log \frac{D_\phi(\mathbf{x})}{1 - D_\phi(\mathbf{x})}$ (log-odds).

Si sustituimos $D^*(\mathbf{x}) = \frac{p_\text{data}}{p_\text{data} + p_\theta}$, obtenemos $1 - D^*(\mathbf{x}) = \frac{p_\theta}{p_\text{data} + p_\theta}$, y el cociente es $\frac{D^*}{1-D^*} = \frac{p_\text{data}}{p_\theta}$.

---

## Ecuacion 15 — La loss del generador (minimax + non-saturating)

$$L_G(\theta; \phi) = \mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[\log(1 - D_\phi(\mathbf{x}))] - \mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[\log D_\phi(\mathbf{x})]$$

### Como se lee

> "La loss del generador es la esperanza bajo la distribucion generada de $\log(1 - D_\phi(\mathbf{x}))$ menos la esperanza bajo la distribucion generada de $\log D_\phi(\mathbf{x})$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $L_G(\theta; \phi)$ | **Loss del generador**. Depende de los parametros del generador $\theta$ (que optimizamos) y del discriminador $\phi$ (que esta fijo). |
| $\mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[\log(1 - D_\phi(\mathbf{x}))]$ | **Termino minimax**: el primer termino del objetivo original. El generador quiere minimizarlo (hacer que $D$ asigne alta probabilidad a sus muestras). |
| $-\mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[\log D_\phi(\mathbf{x})]$ | **Termino non-saturating**: en lugar de minimizar $\log(1-D)$, maximizamos $\log D$ (equivalente a minimizar $-\log D$). |

### Intuicion

Esta loss combina **ambos** objetivos del generador (minimax y non-saturating) en una sola expresion. Se puede reescribir como:

$$L_G = \mathbb{E}_{p_\theta}\left[\log \frac{1 - D_\phi(\mathbf{x})}{D_\phi(\mathbf{x})}\right]$$

---

## Ecuacion 16 — Conexion con KL divergence

$$L_G(\theta; \phi) = \text{KL}(p_\theta(\mathbf{x}) \| p_\text{data}(\mathbf{x}))$$

### Como se lee

> "Cuando el discriminador es optimo ($D_\phi = D^*$), la loss del generador es exactamente la divergencia KL de $p_\theta$ respecto a $p_\text{data}$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\text{KL}(p_\theta(\mathbf{x}) \| p_\text{data}(\mathbf{x}))$ | **Divergencia de Kullback-Leibler** de $p_\theta$ respecto a $p_\text{data}$. Mide cuanta "informacion se pierde" al usar $p_\text{data}$ para aproximar $p_\theta$. |

### Intuicion: ¿que direccion de KL?

Fijate en la direccion: es $\text{KL}(p_\theta \| p_\text{data})$, **no** $\text{KL}(p_\text{data} \| p_\theta)$.

La direccion importa mucho:

| Divergencia | Comportamiento | Consecuencia para el generador |
|-------------|---------------|-------------------------------|
| $\text{KL}(p_\text{data} \| p_\theta)$ | Penaliza si $p_\text{data} > 0$ pero $p_\theta \approx 0$ | **Mode-covering**: el generador intenta cubrir todo el soporte de los datos |
| $\text{KL}(p_\theta \| p_\text{data})$ | Penaliza si $p_\theta > 0$ pero $p_\text{data} \approx 0$ | **Mode-seeking**: el generador evita generar donde no hay datos reales |

El hecho de que la GAN (con esta loss) minimice $\text{KL}(p_\theta \| p_\text{data})$ explica por que las GANs tienden a producir muestras muy nitidas pero pueden sufrir **mode collapse** (pierden diversidad): prefieren generar pocas muestras muy buenas a cubrir toda la distribucion.

---

## Apartado (a) — [3 puntos, Escrito]

> *"Show that $L_D$ is minimized when $D_\phi = D^*$, where..."*

### ¿Que pide?

Demostrar que la loss del discriminador (ecuacion 12) alcanza su minimo cuando $D_\phi(\mathbf{x}) = D^*(\mathbf{x}) = \frac{p_\text{data}(\mathbf{x})}{p_\theta(\mathbf{x}) + p_\text{data}(\mathbf{x})}$.

### ¿Que conceptos necesitas?

- La loss es una integral (esperanza) sobre $\mathbf{x}$
- Para minimizar una integral, puedes minimizar el integrando punto a punto
- En cada punto $\mathbf{x}$, la loss es una funcion de $t = D_\phi(\mathbf{x}) \in (0,1)$
- Necesitas encontrar el $t$ que minimiza $f(t) = -a \log t - b \log(1-t)$ donde $a = p_\text{data}(\mathbf{x})$ y $b = p_\theta(\mathbf{x})$

---

## Apartado (b) — [1.5 puntos, Escrito]

> *"Recall that $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$. Show that the logits $h_\phi(\mathbf{x})$ of the discriminator estimate the log of the likelihood ratio..."*

### ¿Que pide?

Mostrar que si $D_\phi = D^*$, entonces los logits son $h_\phi(\mathbf{x}) = \log \frac{p_\text{data}(\mathbf{x})}{p_\theta(\mathbf{x})}$.

### ¿Que conceptos necesitas?

- La relacion entre la sigmoide y los logits: $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x})) = \frac{1}{1 + e^{-h_\phi(\mathbf{x})}}$
- La definicion de $D^*$ del apartado (a)
- Invertir la sigmoide para despejar $h_\phi$

---

## Apartado (c) — [1.5 puntos, Escrito]

> *"Consider a generator loss defined by the sum of the minimax loss and the non-saturating loss... Show that if $D_\phi = D^*$, then $L_G(\theta; \phi) = \text{KL}(p_\theta(\mathbf{x}) \| p_\text{data}(\mathbf{x}))$"*

### ¿Que pide?

Mostrar que la loss del generador definida en la ecuacion 15, cuando el discriminador es optimo, se reduce a la divergencia KL de $p_\theta$ respecto a $p_\text{data}$.

### ¿Que conceptos necesitas?

- El resultado del apartado (b): que los logits optimos son $h^*(\mathbf{x}) = \log \frac{p_\text{data}}{p_\theta}$
- La relacion $\log \frac{1-D}{D} = -h$ (inversa de la sigmoide)
- La definicion de la divergencia KL: $\text{KL}(p \| q) = \mathbb{E}_{p}\left[\log \frac{p}{q}\right]$

---

## Apartado (d) — [1.5 puntos, Escrito]

> *"Show that the negative log likelihood, $-\mathbb{E}_{\mathbf{x} \sim p_\text{data}(\mathbf{x})}[\log p_\theta(\mathbf{x})]$, can be written as a KL divergence plus an additional term that is constant with respect to $\theta$."*

### ¿Que pide?

Dos cosas:

1. Descomponer $-\mathbb{E}_{p_\text{data}}[\log p_\theta(\mathbf{x})]$ como la suma de una KL mas una constante (respecto a $\theta$).

2. Determinar si esa KL es la misma que $L_G$ del apartado (c), y por tanto si un VAE (que minimiza $-\mathbb{E}[\log p_\theta(\mathbf{x})]$ via ELBO) y una GAN (que minimiza $L_G$) aprenden lo mismo.

### ¿Que conceptos necesitas?

- La definicion de la negative log-likelihood (NLL): $-\mathbb{E}_{p_\text{data}}[\log p_\theta(\mathbf{x})]$
- La definicion de KL divergence
- La entropia de $p_\text{data}$: $H(p_\text{data}) = -\mathbb{E}_{p_\text{data}}[\log p_\text{data}(\mathbf{x})]$ es constante respecto a $\theta$

### Intuicion: ¿VAE y GAN optimizan lo mismo?

La NLL se puede escribir como:

$$-\mathbb{E}_{p_\text{data}}[\log p_\theta(\mathbf{x})] = \text{KL}(p_\text{data} \| p_\theta) + H(p_\text{data})$$

Fijate: la KL aqui es $\text{KL}(p_\text{data} \| p_\theta)$ — es decir, la direccion **contraria** a la del apartado (c). La GAN minimiza $\text{KL}(p_\theta \| p_\text{data})$ y el VAE minimiza (indirectamente) $\text{KL}(p_\text{data} \| p_\theta)$.

La pregunta final te pide reflexionar sobre que implica esta diferencia de direccion.

---

## Resumen del ejercicio 3

| Apartado | Tipo | Puntos | ¿Que demostrar? |
|----------|------|--------|-----------------|
| (a) | Escrito | 3 | $D^*(\mathbf{x}) = \frac{p_\text{data}}{p_\theta + p_\text{data}}$ minimiza $L_D$ |
| (b) | Escrito | 1.5 | $h^*(\mathbf{x}) = \log \frac{p_\text{data}}{p_\theta}$ (logits = log-ratio de densidades) |
| (c) | Escrito | 1.5 | $L_G = \text{KL}(p_\theta \| p_\text{data})$ cuando $D = D^*$ |
| (d) | Escrito | 1.5 | $-\mathbb{E}[\log p_\theta] = \text{KL}(p_\text{data} \| p_\theta) + \text{const}$ (y comparar con GAN) |
| **Total** | | **7.5** | |

### Conceptos clave del ejercicio

1. El **discriminador optimo** es un ratio de densidades: $D^*(\mathbf{x}) = \frac{p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x}) + p_\theta(\mathbf{x})}$
2. Los **logits optimos** estiman el log likelihood ratio: $h^*(\mathbf{x}) = \log \frac{p_\text{data}(\mathbf{x})}{p_\theta(\mathbf{x})}$
3. La loss del generador (con discriminador optimo) minimiza $\text{KL}(p_\theta \| p_\text{data})$ — direccion **mode-seeking**
4. La NLL (que los VAEs minimizan) contiene $\text{KL}(p_\text{data} \| p_\theta)$ — direccion **mode-covering**
5. GAN y VAE optimizan distintas divergencias, lo que explica sus diferentes comportamientos
