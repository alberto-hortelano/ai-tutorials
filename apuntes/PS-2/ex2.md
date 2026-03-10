# Ejercicio 2 — Implementing the Mixture of Gaussians VAE (GMVAE)

## Contexto: ¿Por qué una mezcla de Gaussianas?

En el ejercicio 1 (VAE estándar), la distribución **prior** (a priori) sobre las variables latentes era una única Gaussiana isotrópica:

$$p(\mathbf{z}) = \mathcal{N}(\mathbf{z} \mid 0, I)$$

Esto funciona bien, pero tiene una limitación: asume que el espacio latente tiene **una sola "nube" de puntos** centrada en el origen. En la práctica, los datos (como dígitos escritos a mano) tienen **estructura multi-modal** — hay grupos naturales (los dígitos 0-9). Un prior más expresivo podría capturar mejor esa estructura.

El **GMVAE** (Gaussian Mixture VAE) resuelve esto reemplazando el prior por una **mezcla de $k$ Gaussianas**, cada una representando un posible "cluster" o grupo en el espacio latente.

---

## Ecuación 7 — El prior (distribución a priori)

$$p_\theta(\mathbf{z}) = \sum_{i=1}^{k} \frac{1}{k} \mathcal{N}\left(\mathbf{z} \mid \mu_i, \text{diag}(\sigma_i^2)\right)$$

### Cómo se lee

> "La probabilidad de $\mathbf{z}$ bajo el modelo es la suma, para cada cluster $i$ desde 1 hasta $k$, de un peso $\frac{1}{k}$ multiplicado por la densidad de una Gaussiana evaluada en $\mathbf{z}$ con media $\mu_i$ y covarianza diagonal $\sigma_i^2$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p_\theta(\mathbf{z})$ | Distribución prior sobre las variables latentes $\mathbf{z}$, parametrizada por $\theta$. Es la creencia del modelo sobre qué valores de $\mathbf{z}$ son probables **antes** de ver ningún dato. |
| $\sum_{i=1}^{k}$ | Sumatorio desde $i=1$ hasta $i=k$. Recorre todos los $k$ clusters de la mezcla. |
| $k$ | Número total de componentes (clusters) en la mezcla. Cada componente es una Gaussiana diferente. |
| $\frac{1}{k}$ | Peso de cada componente. Aquí se asumen **pesos uniformes**: cada cluster tiene la misma importancia ($\frac{1}{k}$). Todos suman 1: $\sum_{i=1}^k \frac{1}{k} = 1$. |
| $\mathcal{N}(\mathbf{z} \mid \mu_i, \text{diag}(\sigma_i^2))$ | Distribución Gaussiana (normal) multivariada evaluada en el punto $\mathbf{z}$, con media $\mu_i$ y matriz de covarianza diagonal $\text{diag}(\sigma_i^2)$. |
| $\mu_i$ | Vector de medias del cluster $i$-ésimo. Indica el "centro" de ese cluster en el espacio latente. |
| $\sigma_i^2$ | Vector de varianzas del cluster $i$-ésimo (una varianza por cada dimensión del espacio latente). |
| $\text{diag}(\sigma_i^2)$ | Matriz diagonal construida a partir del vector $\sigma_i^2$. Que sea diagonal significa que las dimensiones latentes son **independientes entre sí** dentro de cada cluster. |
| $\theta$ | Parámetros del modelo generativo. Aquí incluye los parámetros $\{\mu_i, \sigma_i\}_{i=1}^{k}$ de la mezcla y los parámetros del decoder. |

### Intuición

Imagina $k$ "montículos" en el espacio latente. Cada montículo es una Gaussiana con su propio centro ($\mu_i$) y su propia dispersión ($\sigma_i^2$). Para generar un $\mathbf{z}$, primero eliges un montículo al azar (cada uno con probabilidad $\frac{1}{k}$), y luego muestreas un punto de esa Gaussiana.

---

## Ecuaciones 8 y 9 — Encoder y Decoder (idénticos al VAE)

El enunciado indica que, **aparte del prior**, el GMVAE comparte la misma estructura que el VAE estándar:

### Ecuación 8 — El encoder (posterior aproximado)

$$q_\phi(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}\left(\mathbf{z} \mid \mu_\phi(\mathbf{x}), \text{diag}(\sigma_\phi^2(\mathbf{x}))\right)$$

#### Cómo se lee

> "La distribución aproximada de $\mathbf{z}$ dado que observamos $\mathbf{x}$ es una Gaussiana con media $\mu_\phi(\mathbf{x})$ y covarianza diagonal $\sigma_\phi^2(\mathbf{x})$."

#### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $q_\phi(\mathbf{z} \mid \mathbf{x})$ | Posterior aproximado. Dado un dato $\mathbf{x}$ (una imagen), devuelve una distribución sobre las variables latentes $\mathbf{z}$. Es lo que calcula el **encoder**. |
| $\phi$ | Parámetros de la red neuronal del encoder. |
| $\mu_\phi(\mathbf{x})$ | Función (red neuronal) que toma la imagen $\mathbf{x}$ y devuelve el vector de medias de la distribución latente. |
| $\sigma_\phi^2(\mathbf{x})$ | Función (red neuronal) que toma la imagen $\mathbf{x}$ y devuelve el vector de varianzas. |
| $\mathcal{N}(\mathbf{z} \mid \cdot, \cdot)$ | Gaussiana multivariada. El primer argumento tras la barra es la media; el segundo, la covarianza. |

### Ecuación 9 — El decoder (modelo generativo de los datos)

$$p_\theta(\mathbf{x} \mid \mathbf{z}) = \text{Bern}(\mathbf{x} \mid f_\theta(\mathbf{z}))$$

#### Cómo se lee

> "La probabilidad de los píxeles $\mathbf{x}$ dado un código latente $\mathbf{z}$ es un producto de distribuciones Bernoulli, con probabilidades dadas por $f_\theta(\mathbf{z})$."

#### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p_\theta(\mathbf{x} \mid \mathbf{z})$ | Probabilidad de los datos $\mathbf{x}$ condicionada a las variables latentes $\mathbf{z}$. Es lo que calcula el **decoder**. |
| $\text{Bern}(\mathbf{x} \mid f_\theta(\mathbf{z}))$ | Distribución de Bernoulli. Cada píxel $x_j$ es 0 o 1, y la probabilidad de que sea 1 viene dada por la $j$-ésima componente de $f_\theta(\mathbf{z})$. |
| $f_\theta(\mathbf{z})$ | Red neuronal decoder que toma $\mathbf{z}$ y produce los **logits** de las probabilidades de cada píxel. |

---

## El ELBO del GMVAE

El enunciado señala que el ELBO del GMVAE tiene la **misma forma** que el del VAE:

$$\text{ELBO} = \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right] - D_{\text{KL}}\left(q_\phi(\mathbf{z} \mid \mathbf{x}) \| p_\theta(\mathbf{z})\right)$$

### Cómo se lee

> "El ELBO es igual a la esperanza (bajo el encoder) del log de la verosimilitud del decoder, menos la divergencia KL entre el encoder y el prior."

Los dos términos son:
1. **Reconstrucción**: $\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}[\log p_\theta(\mathbf{x} \mid \mathbf{z})]$ — qué tan bien reconstruye el decoder los datos originales.
2. **Regularización (KL)**: $D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}) \| p_\theta(\mathbf{z}))$ — qué tan cercano es el encoder al prior.

### El problema clave

En el VAE estándar, la KL entre dos Gaussianas ($q_\phi$ y $p(\mathbf{z})=\mathcal{N}(0,I)$) tiene **fórmula cerrada** (se puede calcular exactamente).

En el GMVAE, el prior $p_\theta(\mathbf{z})$ es una **mezcla** de Gaussianas. La KL entre una Gaussiana y una mezcla de Gaussianas **no tiene fórmula cerrada**. Por eso necesitamos estimarla con **muestreo de Monte Carlo**.

---

## Ecuación 10 — Estimación Monte Carlo de la KL

$$D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}) \| p_\theta(\mathbf{z})) \approx \log q_\phi(\mathbf{z}^{(1)} \mid \mathbf{x}) - \log p_\theta(\mathbf{z}^{(1)})$$

### Cómo se lee

> "La divergencia KL entre el encoder y el prior se aproxima como: el log de la densidad del encoder evaluada en una muestra $\mathbf{z}^{(1)}$, menos el log de la densidad del prior evaluada en esa misma muestra."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $D_{\text{KL}}(\cdot \| \cdot)$ | Divergencia de Kullback-Leibler. Mide cuánto difiere una distribución de otra. Siempre es $\geq 0$, y es 0 solo cuando las dos distribuciones son idénticas. |
| $\approx$ | "Aproximadamente igual a". La igualdad exacta requeriría infinitas muestras; aquí usamos solo una. |
| $\mathbf{z}^{(1)}$ | Una muestra concreta extraída de $q_\phi(\mathbf{z} \mid \mathbf{x})$ usando el truco de reparametrización. El superíndice $(1)$ indica que es la primera (y única) muestra. |
| $\log q_\phi(\mathbf{z}^{(1)} \mid \mathbf{x})$ | Log-densidad del encoder evaluada en el punto $\mathbf{z}^{(1)}$. Responde a: "¿Cuánta probabilidad le asigna el encoder a este punto concreto?" |
| $\log p_\theta(\mathbf{z}^{(1)})$ | Log-densidad del prior (mezcla de Gaussianas) evaluada en $\mathbf{z}^{(1)}$. Responde a: "¿Cuánta probabilidad le asigna el prior a este punto?" |

### Intuición

La KL mide cuánto "extra" de información necesita el encoder respecto al prior. Si el encoder asigna mucha probabilidad a un punto ($\log q$ alto) pero el prior asigna poca ($\log p$ bajo), la diferencia es grande y la KL es alta. Si ambos coinciden, la KL es cercana a cero.

Con Monte Carlo, en vez de calcular la integral exacta, simplemente evaluamos la diferencia $\log q - \log p$ en un punto muestreado y usamos eso como estimación.

---

## Ecuación 11 — Forma expandida (las funciones a implementar)

$$\log \mathcal{N}(\mathbf{z}^{(1)} \mid \mu_\phi(\mathbf{x}), \text{diag}(\sigma_\phi^2(\mathbf{x}))) - \log \sum_{i=1}^{k} \frac{1}{k} \mathcal{N}(\mathbf{z}^{(1)} \mid \mu_i, \text{diag}(\sigma_i^2))$$

El enunciado identifica dos partes con llaves debajo:

### Primera parte: `log_normal`

$$\underbrace{\log \mathcal{N}(\mathbf{z}^{(1)} \mid \mu_\phi(\mathbf{x}), \text{diag}(\sigma_\phi^2(\mathbf{x})))}_{\texttt{log\_normal}}$$

Es el **logaritmo de la densidad de una Gaussiana** evaluada en el punto $\mathbf{z}^{(1)}$. Corresponde al término $\log q_\phi(\mathbf{z}^{(1)} \mid \mathbf{x})$ de la ecuación 10.

**¿Qué calcula?** Dado un punto $\mathbf{z}$, una media $\mu$ y una varianza $\sigma^2$, calcula el logaritmo de la función de densidad Gaussiana multivariada:

$$\log \mathcal{N}(\mathbf{z} \mid \mu, \text{diag}(\sigma^2)) = -\frac{d}{2}\log(2\pi) - \frac{1}{2}\sum_{j=1}^{d}\log(\sigma_j^2) - \frac{1}{2}\sum_{j=1}^{d}\frac{(z_j - \mu_j)^2}{\sigma_j^2}$$

donde $d$ es la dimensionalidad de $\mathbf{z}$.

| Término | Significado |
|---------|-------------|
| $-\frac{d}{2}\log(2\pi)$ | Constante de normalización (depende solo de la dimensión). |
| $-\frac{1}{2}\sum_j \log(\sigma_j^2)$ | Penalización por la dispersión: varianzas grandes reducen la densidad máxima. |
| $-\frac{1}{2}\sum_j \frac{(z_j - \mu_j)^2}{\sigma_j^2}$ | Distancia de Mahalanobis al cuadrado: cuánto se aleja $\mathbf{z}$ de la media, normalizada por la varianza. |

### Segunda parte: `log_normal_mixture`

$$\underbrace{\log \sum_{i=1}^{k} \frac{1}{k} \mathcal{N}(\mathbf{z}^{(1)} \mid \mu_i, \text{diag}(\sigma_i^2))}_{\texttt{log\_normal\_mixture}}$$

Es el **logaritmo de la densidad de la mezcla de Gaussianas** evaluada en el punto $\mathbf{z}^{(1)}$. Corresponde al término $\log p_\theta(\mathbf{z}^{(1)})$ de la ecuación 10.

**¿Qué calcula?** Primero evalúa la densidad de cada una de las $k$ Gaussianas en el punto $\mathbf{z}^{(1)}$, pondera cada una por $\frac{1}{k}$, las suma, y luego toma el logaritmo del resultado.

### Nota importante sobre estabilidad numérica

El enunciado menciona que la función `log_mean_exp` de `utils.py` será útil. Esto es porque calcular $\log \sum_i \frac{1}{k} \exp(\log \mathcal{N}_i)$ directamente puede causar **overflow o underflow numérico**. El truco `log-sum-exp` evita este problema.

---

## Notas: 
Caso general:

$$\log \mathcal{N}(\mathbf{x} \mid \boldsymbol{\mu}, \Sigma) = -\frac{d}{2}\log(2\pi) - \frac{1}{2}\log|\Sigma| - \frac{1}{2}(\mathbf{x} - \boldsymbol{\mu})^T \Sigma^{-1} (\mathbf{x} - \boldsymbol{\mu})$$

Cuando la varianza es una diagonal:

$$\log \mathcal{N}(\mathbf{z} \mid \mu, \text{diag}(\sigma^2)) = \underbrace{-\frac{d}{2}\log(2\pi)}_{\text{constante}} - \underbrace{\frac{1}{2}\sum_j \log(\sigma_j^2)}_{\text{dispersión}} - \underbrace{\frac{1}{2}\sum_j \frac{(z_j - \mu_j)^2}{\sigma_j^2}}_{\text{distancia}}$$

$$D_{\text{KL}} \approx \log q_\phi(\mathbf{z}^{(1)} \mid \mathbf{x}) - \log p_\theta(\mathbf{z}^{(1)})$$

- $\log q_\phi(\mathbf{z} \mid \mathbf{x})$: el log de la densidad de una Gaussiana evaluada en z, con media y varianza que ya tienes en m
   y v (línea 63). ¿Qué función calcula eso?
- $\log p_\theta(\mathbf{z})$: el log de la densidad de una mezcla de Gaussianas evaluada en z, con parámetros del prior (línea 60). ¿Qué
función calcula eso?


---

## Apartado (a) — [5 puntos, Coding]

**Qué pide:** Implementar tres funciones:

1. **`log_normal`** en `utils.py` — Calcula $\log \mathcal{N}(\mathbf{z} \mid \mu, \sigma^2)$, el logaritmo de la densidad Gaussiana.

2. **`log_normal_mixture`** en `utils.py` — Calcula $\log \sum_{i=1}^{k} \frac{1}{k} \mathcal{N}(\mathbf{z} \mid \mu_i, \sigma_i^2)$, el logaritmo de la densidad de la mezcla.


3. **`negative_elbo_bound`** en `gmvae.py` — Calcula el **negativo** del ELBO (porque PyTorch minimiza, y nosotros queremos maximizar el ELBO, así que minimizamos $-\text{ELBO}$).

**Nota del enunciado:** `negative_elbo_bound` debe devolver el **promedio** del negative ELBO, el promedio de la loss de reconstrucción, y el promedio de la divergencia KL sobre el mini-batch.

---

## Apartado (b) — [3 puntos, Coding]

**Qué pide:** Entrenar el GMVAE ejecutando:

```bash
python main.py --model gmvae --train
```

(o con `--device gpu` para usar GPU)

Tras 20000 iteraciones, el modelo reporta:
1. Negative ELBO promedio
2. Término KL promedio
3. Loss de reconstrucción promedio

Los resultados se guardan en `submission/GMVAE.pkl`.

**Pista del enunciado:** El negative ELBO en el test set debería estar alrededor de **97-99**. Si no, revisar la implementación de `sample_gaussian` del ejercicio 1.

Para verificar: `python grader.py 2b-0-basic`

Para visualizar 200 dígitos generados: `python main.py --model gmvae`

Las muestras se guardan en `model=gmvae_z=10_run=0000.png`.

---

## Resumen visual: VAE vs GMVAE

```
VAE estándar:
  Prior:   p(z) = N(0, I)              ← una sola Gaussiana
  KL:      fórmula cerrada             ← se calcula exactamente

GMVAE:
  Prior:   p(z) = Σ (1/k) N(μᵢ, σᵢ²)  ← mezcla de k Gaussianas
  KL:      sin fórmula cerrada         ← se estima con Monte Carlo
```

Lo único que cambia entre el VAE y el GMVAE es el **prior**. El encoder y decoder son idénticos. Pero este cambio en el prior requiere una forma diferente de calcular (estimar) la divergencia KL.
