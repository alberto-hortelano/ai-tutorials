# Cheat Sheet — Expresiones y Símbolos de XCS236

Recopilatorio de todas las expresiones explicadas en los apuntes del curso.

---

## Parte 1: Expresiones y significados

### Variables y datos

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\mathbf{x}$ | Vector de datos observados (ej: una imagen). En negrita = vector. | `x  # tensor: (batch, dim)` |
| $\mathbf{z}$ | Variables latentes (ocultas, no observadas). Representación comprimida en un espacio de menor dimensión. | `z  # tensor: (batch, z_dim)` |
| $x_i$ | Un valor concreto de la variable $i$-ésima (realización de $X_i$). | `x[:, i]` |
| $\mathbf{x}^{(i)}$ | La $i$-ésima muestra del dataset o mini-batch. El superíndice entre paréntesis es índice de muestra, no potencia. | `x[i]` |
| $\mathbf{z}^{(i)}$ | La $i$-ésima muestra de $\mathbf{z}$. | `z[i]` |
| $y$ | Etiqueta de clase (ej: qué dígito es la imagen). | `y  # tensor: (batch,)` |
| $d$ | Dimensión de $\mathbf{x}$ (número de píxeles). En MNIST, $d = 784$. | `x.shape[-1]  # 784` |
| $k$ | Dimensión del espacio latente (mucho menor que $d$). | `z_dim` |
| $n$ | Número de variables aleatorias, o tamaño del mini-batch (según contexto). | `x.shape[0]  # batch size` |
| $D = \{x_1, \ldots, x_n\}$ | Dataset de muestras i.i.d. de la distribución real. | `DataLoader(dataset, ...)` |
| $\mathbf{X}_\ell$ | Datos etiquetados: pares $(\mathbf{x}, y)$ con etiqueta conocida. Ej: 100 imágenes. | `sup_iter` en `train.py` |
| $\mathbf{X}_u$ | Datos sin etiquetar: solo $\mathbf{x}$, sin $y$. Ej: 59900 imágenes. | `unsup_iter` en `train.py` |

### Espacios

| Expresión | Significado |
|-----------|-------------|
| $\mathcal{X}$ | Espacio de datos (todos los valores posibles de $\mathbf{x}$). |
| $\mathcal{Z}$ | Espacio latente (todos los valores posibles de $\mathbf{z}$). |
| $\mathcal{Y}$ | Espacio de etiquetas/salidas. |
| $\{0, 1\}^d$ | Vector de $d$ componentes binarias (cada píxel es 0 o 1). |
| $\mathbb{R}$ | Números reales. |
| $\mathbb{R}^n$ | Vectores de $n$ números reales. |
| $\mathbb{R}^0$ | Espacio de dimensión cero. Por convención: $\{0\}$ (entrada "vacía"). |
| $\mathbb{R}_{++}$ | Reales estrictamente positivos ($x > 0$). |

*(No se incluye columna PyTorch: los espacios son conceptos teóricos, no se representan como operaciones.)*

### Parámetros

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\theta$ | Parámetros del modelo generativo / decoder (pesos y biases de la red). | `dec.parameters()` |
| $\phi$ | Parámetros del encoder (red de inferencia). | `enc.parameters()` |
| $\lambda$ | Parámetros de la distribución variacional (equivale a $\mu, \sigma^2$ del encoder). | `m, v = enc(x)` |
| $\beta$ | Hiperparámetro del $\beta$-VAE que controla el peso del término KL. | `beta  # escalar` |
| $\alpha$ | Peso de la precisión de clasificación (en SSVAE). | `class_weight` |
| $\Theta$ | Conjunto de todos los valores posibles de $\theta$. | — |
| $\gamma$ | Todos los parámetros del modelo discriminativo ($\{w_1, \ldots, w_k, b_1, \ldots, b_k\}$). | `model.parameters()` |
| $\gamma_w$ | Peso del término generativo $\text{ELBO}(\mathbf{x})$ en el SSVAE. `gw=0` → solo supervisado; `gw=1` → semi-supervisado. | `--gw` flag en `main.py` |

### Distribuciones

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $p(\mathbf{z})$ | **Prior** (distribución a priori): probabilidad de $\mathbf{z}$ *antes* de ver datos. | `log_pz = log_normal(z, z_prior_m, z_prior_v)` |
| $p_\theta(\mathbf{x} \mid \mathbf{z})$ | **Likelihood / Decoder**: probabilidad de $\mathbf{x}$ dado $\mathbf{z}$. | `logits = dec(z)`<br>`log_bernoulli_with_logits(x, logits)` |
| $p_\theta(\mathbf{x})$ | **Verosimilitud marginal** (evidence): probabilidad total de $\mathbf{x}$ integrando sobre todos los $\mathbf{z}$. Intratable. | *(intratable — se aproxima con ELBO/IWAE)* |
| $p_\theta(\mathbf{z} \mid \mathbf{x})$ | **Posterior verdadera**: distribución de $\mathbf{z}$ dado $\mathbf{x}$. Intratable. | *(intratable — se aproxima con $q_\phi$)* |
| $p_\theta(\mathbf{x}, \mathbf{z})$ | **Conjunta**: probabilidad de $\mathbf{x}$ y $\mathbf{z}$ simultáneamente. Se descompone como $p(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid \mathbf{z})$. | `log_pxz = log_pz + log_px_given_z` |
| $q_\phi(\mathbf{z} \mid \mathbf{x})$ | **Posterior aproximada / Encoder**: aproximación a $p(\mathbf{z} \mid \mathbf{x})$. | `m, v = enc(x)`<br>`log_qz = log_normal(z, m, v)` |
| $p_\text{data}$ | Distribución real de los datos (desconocida). | *(el DataLoader es la aprox. empírica)* |
| $\hat{p}(x, y)$ | Distribución empírica conjunta (los datos de entrenamiento). | `for x, y in train_loader` |
| $\hat{p}(x)$ | Marginal empírica sobre las entradas. | `for x, _ in train_loader` |
| $p_\theta(y \mid x)$ | Clasificador probabilístico. | `logits = cls(x)`<br>`F.softmax(logits, dim=-1)` |

### Distribuciones específicas

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\mathcal{N}(\mathbf{z} \mid \mathbf{0}, I)$ | Gaussiana estándar multivariada: media cero, covarianza identidad. | `log_normal(z, torch.zeros(...), torch.ones(...))` |
| $\mathcal{N}(\mathbf{z} \mid \mu, \text{diag}(\sigma^2))$ | Gaussiana multivariada con media $\mu$ y covarianza diagonal $\sigma^2$. | `log_normal(z, m, v)` |
| $\mathcal{N}(x \mid \mu, \sigma^2)$ | Gaussiana univariada con media $\mu$ y varianza $\sigma^2$. | `log_normal(x, m, v)` *(con dim=1)* |
| $\text{Bern}(\mathbf{x} \mid f_\theta(\mathbf{z}))$ | Distribución de Bernoulli: cada componente $x_j$ es 0 o 1 con probabilidad dada por $f_\theta(\mathbf{z})_j$. | `log_bernoulli_with_logits(x, logits)` |
| $\text{Categorical}(y \mid \pi)$ | Distribución categórica: $y$ toma uno de $k$ valores con probabilidades $\pi$. | `F.softmax(logits, dim=-1)` |
| $\pi_y$ | Probabilidad a priori de la clase $y$ (prior categórico). | `torch.ones(10) / 10` |

### Redes neuronales y funciones

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $f_\theta(\mathbf{z})$ | Red neuronal decoder: toma $\mathbf{z}$ y produce los logits de los $d$ píxeles. | `logits = dec(z)` |
| $\mu_\phi(\mathbf{x})$ | Media que predice el encoder para la imagen $\mathbf{x}$ (vector de $k$ dimensiones). | `m, v = enc(x)  # m es mu` |
| $\sigma_\phi^2(\mathbf{x})$ | Varianza que predice el encoder (vector de $k$ dimensiones). | `m, v = enc(x)  # v es sigma²` |
| $\mu_i : \mathbb{R}^{i-1} \to \mathbb{R}$ | Red que predice la media de $X_i$ dado las variables anteriores (modelo autorregresivo forward). | — |
| $\sigma_i : \mathbb{R}^{i-1} \to \mathbb{R}_{++}$ | Red que predice la desviación estándar de $X_i$ (modelo autorregresivo forward). | — |
| $\hat{\mu}_i, \hat{\sigma}_i$ | Redes del modelo autorregresivo reverse. El sombrero $\hat{}$ distingue del forward. | — |
| $f_\phi(\mathbf{x})$ | Red del clasificador (en SSVAE): toma $\mathbf{x}$ y produce logits sobre clases. | `logits = cls(x)` |

### ELBO y objetivos de optimización

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\text{ELBO}(\mathbf{x}; \theta, \phi)$ | **Evidence Lower BOund**: cota inferior de $\log p_\theta(\mathbf{x})$ que sí se puede calcular y optimizar. | `nelbo, kl, rec = negative_elbo_bound(x)` |
| $\log p_\theta(\mathbf{x}) \geq \text{ELBO}$ | El ELBO siempre está por debajo de la log-verosimilitud real. | — *(desigualdad teórica)* |
| $\mathbb{E}_{q_\phi(\mathbf{z}\mid\mathbf{x})}[\log p_\theta(\mathbf{x} \mid \mathbf{z})]$ | **Término de reconstrucción**: qué tan bien el decoder reconstruye $\mathbf{x}$ a partir de $\mathbf{z}$ muestreado del encoder. | `rec = -log_bernoulli_with_logits(x, dec(z)).mean()` |
| $D_\text{KL}(q_\phi(\mathbf{z} \mid \mathbf{x}) \| p(\mathbf{z}))$ | **Término KL / Regularización**: cuánto se aleja el encoder del prior. | `kl = kl_normal(m, v, prior_m, prior_v).mean()` |
| $-\text{ELBO} = \text{reconstrucción} + \text{KL}$ | El negativo del ELBO es lo que se minimiza en PyTorch. | `nelbo = kl + rec` |
| $\beta \cdot D_\text{KL}(\cdots)$ | Término KL multiplicado por $\beta$ en el $\beta$-VAE. $\beta > 1$ penaliza más la KL. | `nelbo = rec + beta * kl` |
| $\mathcal{L}(\mathbf{x}; \theta, \phi)$ | Otro nombre para el ELBO. | `elbo = -nelbo` |

### IWAE

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\mathcal{L}_m(\mathbf{x}; \theta, \phi)$ | **Cota IWAE** con $m$ muestras. El subíndice $m$ indica cuántas muestras. | `niwae, kl, rec = negative_iwae_bound(x, iw=m)` |
| $\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$ | **Ratio de densidades no normalizado** (importance weight). Núcleo del ELBO y del IWAE. | `log_w = log_pxz - log_qz` |
| $\frac{1}{m} \sum_{i=1}^{m} \frac{p_\theta(\mathbf{x}, \mathbf{z}^{(i)})}{q_\phi(\mathbf{z}^{(i)} \mid \mathbf{x})}$ | Promedio de $m$ importance weights. El IWAE toma el $\log$ de este promedio. | `log_mean_exp(log_w, dim=0)` |
| $\log p_\theta(\mathbf{x}) \geq \mathcal{L}_m(\mathbf{x}) \geq \mathcal{L}_1(\mathbf{x})$ | Cadena de desigualdades: más muestras $\to$ cota más ajustada. $\mathcal{L}_1$ = ELBO. | — *(desigualdad teórica)* |

### GMVAE (Mezcla de Gaussianas VAE)

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $p_\theta(\mathbf{z}) = \sum_{i=1}^{k} \frac{1}{k} \mathcal{N}(\mathbf{z} \mid \mu_i, \text{diag}(\sigma_i^2))$ | Prior del GMVAE: mezcla de $k$ Gaussianas con pesos uniformes. | `log_normal_mixture(z, prior_m, prior_v)` |
| $\mu_i$ | Vector de medias del cluster $i$-ésimo (centro del cluster en el espacio latente). | `prior_m[:, i, :]  # (batch, mix, dim)` |
| $\sigma_i^2$ | Vector de varianzas del cluster $i$-ésimo. | `prior_v[:, i, :]` |
| $\frac{1}{k}$ | Peso uniforme de cada componente de la mezcla. | *(implícito en `log_mean_exp`)* |

### SSVAE (Semi-Supervised VAE)

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $p_\theta(\mathbf{x}, y, \mathbf{z}) = p(y) \cdot p(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid y, \mathbf{z})$ | Conjunta completa del SSVAE: prior sobre etiqueta × prior sobre estilo × decoder condicionado. | `log_pxyz = log_py + log_pz + log_px_given_yz` |
| $p_\theta(\mathbf{x} \mid y, \mathbf{z})$ | Decoder del SSVAE: genera la imagen a partir del dígito $y$ **y** el estilo $\mathbf{z}$ (Bernoulli). | `logits = dec(y, z)` |
| $q_\phi(y, \mathbf{z} \mid \mathbf{x}) = q_\phi(y \mid \mathbf{x}) \cdot q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ | Posterior aproximado factorizado: primero clasificar, luego codificar condicionado a la clase. | — *(se implementa en dos pasos)* |
| $q_\phi(y \mid \mathbf{x})$ | **Clasificador**: red que predice la distribución sobre dígitos dada la imagen. Categórica con 10 clases. Tras entrenar, se usa directamente para clasificar. | `logits = cls(x); probs = F.softmax(logits)` |
| $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ | **Encoder condicionado**: inferencia de $\mathbf{z}$ dado **tanto** $\mathbf{x}$ como $y$ (Gaussiana). A diferencia del VAE estándar, recibe la etiqueta. | `m, v = enc(x, y)` |
| $\mathbf{z}^{(y)}$ | Muestra de $q_\phi(\mathbf{z} \mid \mathbf{x}, y)$ para un valor específico de $y$. Se genera una muestra diferente para cada $y \in \{0, \ldots, 9\}$. | `z_y = sample_gaussian(m_y, v_y)` |

#### Dos ELBOs del SSVAE

| Expresión | Significado | ¿Cuándo? |
|-----------|-------------|----------|
| $\text{ELBO}(\mathbf{x}, y; \theta, \phi) = \mathbb{E}_{q_\phi(\mathbf{z} \mid \mathbf{x}, y)} \left[ \log \frac{p_\theta(\mathbf{x}, y, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x}, y)} \right]$ | ELBO para datos **etiquetados**. Solo marginaliza sobre $\mathbf{z}$ (porque $y$ es conocido). | Datos de $\mathbf{X}_\ell$ |
| $\text{ELBO}(\mathbf{x}; \theta, \phi) = \mathbb{E}_{q_\phi(y, \mathbf{z} \mid \mathbf{x})} \left[ \log \frac{p_\theta(\mathbf{x}, y, \mathbf{z})}{q_\phi(y, \mathbf{z} \mid \mathbf{x})} \right]$ | ELBO para datos **sin etiquetar**. Marginaliza sobre $y$ (suma exacta de 10 términos) y $\mathbf{z}$ (Monte Carlo). | Datos de $\mathbf{X}_u$ |

#### Descomposición del $-\text{ELBO}(\mathbf{x})$ sin etiqueta (Eq. 30-31)

$$-\text{ELBO}(\mathbf{x}) = \underbrace{D_{\text{KL}}(q_\phi(y \mid \mathbf{x}) \| p(y))}_{\text{KL}_y} + \underbrace{\sum_y q_\phi(y \mid \mathbf{x}) \cdot D_{\text{KL}}(q_\phi(\mathbf{z} \mid \mathbf{x}, y) \| p(\mathbf{z}))}_{\text{KL}_z} + \underbrace{\sum_y q_\phi(y \mid \mathbf{x}) \cdot [-\log p_\theta(\mathbf{x} \mid \mathbf{z}^{(y)}, y)]}_{\text{Reconstrucción}}$$

| Término | ¿Qué mide? | PyTorch |
|---------|-------------|---------|
| $\text{KL}_y$ | Cuánto difiere el clasificador del prior uniforme $\frac{1}{10}$. Penaliza predicciones muy seguras. | `kl_cat(probs, log_probs, log_prior)` |
| $\text{KL}_z$ | Media ponderada (por $q(y \mid \mathbf{x})$) de la KL del encoder al prior $\mathcal{N}(0, I)$, evaluada para cada $y$. | `(probs * kl_normal(m, v, 0, 1)).sum(-1)` |
| Reconstrucción | Media ponderada de la pérdida de reconstrucción, con una muestra $\mathbf{z}^{(y)}$ distinta por cada $y$. | `(probs * (-log_bernoulli(...))).sum(-1)` |

#### Objetivo combinado (Eq. 28)

$$\max_{\theta, \phi} \; \gamma_w \sum_{\mathbf{x} \in \mathbf{X}} \text{ELBO}(\mathbf{x}) + \alpha \sum_{\mathbf{x}, y \in \mathbf{X}_\ell} \log q_\phi(y \mid \mathbf{x})$$

| Término | Rol |
|---------|-----|
| $\gamma_w \cdot \text{ELBO}(\mathbf{x})$ | Señal **generativa**: aprende la estructura de los datos (etiquetados y no). `gw=0` la desactiva. |
| $\alpha \cdot \log q_\phi(y \mid \mathbf{x})$ | Señal **discriminativa**: entrena el clasificador directamente con las etiquetas. |

### Teoría de la información

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $I(x) = -\log p(x)$ | **Información** de un evento: cuánta sorpresa da que ocurra $x$. | `-torch.log(p_x)` |
| $H(P) = -\sum p(x) \log p(x)$ | **Entropía**: sorpresa promedio bajo la distribución $P$. | `-(p * torch.log(p)).sum(-1)` |
| $H(P) = \mathbb{E}_{x \sim P}[-\log p(x)]$ | Entropía como valor esperado de la información. | *(misma fórmula, forma de esperanza)* |
| $H(P, Q) = -\sum p(x) \log q(x)$ | **Entropía cruzada**: sorpresa promedio si los datos vienen de $P$ pero mides con $Q$. | `F.cross_entropy(logits_q, target)` |
| $D_\text{KL}(P \| Q) = H(P, Q) - H(P)$ | **KL Divergence**: la sorpresa *extra* por usar el modelo $Q$ en vez de $P$. | `cross_entropy - entropy` |
| $D_\text{KL}(P \| Q) = \sum p(x) \log \frac{p(x)}{q(x)}$ | KL en forma de suma. | `kl_normal(qm, qv, pm, pv)` *(Gaussiana)*<br>`kl_cat(q, log_q, log_p)` *(categórica)* |
| $D_\text{KL}(P \| Q) \geq 0$ | Siempre no negativa (desigualdad de Gibbs). | — *(propiedad teórica)* |
| $D_\text{KL}(P \| Q) \neq D_\text{KL}(Q \| P)$ | **No es simétrica** — no es una distancia real. | — *(propiedad teórica)* |
| $H(P, Q) \geq H(P)$ | Usar el modelo equivocado nunca reduce la sorpresa. | — *(propiedad teórica)* |

### MLE (Maximum Likelihood Estimation)

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\theta_\text{MLE} = \arg\max_\theta \sum \log p_\theta(x_i)$ | Los parámetros que hacen los datos lo más probables posible. | `optimizer.step()` *(minimizando -log_prob)* |
| $\frac{1}{N} \sum \log p_\theta(x_i)$ | Promedio empírico de la log-verosimilitud. | `log_prob.mean()` |
| $\mathbb{E}_{x \sim p_\text{data}}[\log p_\theta(x)]$ | Lo que el promedio empírico aproxima cuando $N \to \infty$. | *(iterando sobre el DataLoader)* |
| $\arg\min_\theta D_\text{KL}(p_\text{data} \| p_\theta)$ | MLE equivale a minimizar la KL entre datos y modelo. | *(equivalencia teórica con MLE)* |

### Modelos autorregresivos

| Expresión | Significado |
|-----------|-------------|
| $p_f(x_1, \ldots, x_n) = \prod_{i=1}^{n} p_f(x_i \mid x_{<i})$ | Modelo autorregresivo forward: cada variable condicionada en las anteriores. |
| $p_r(x_1, \ldots, x_n) = \prod_{i=1}^{n} p_r(x_i \mid x_{>i})$ | Modelo autorregresivo reverse: cada variable condicionada en las posteriores. |
| $x_{<i}$ | Todas las variables con índice menor que $i$: $(x_1, \ldots, x_{i-1})$. |
| $x_{>i}$ | Todas las variables con índice mayor que $i$: $(x_{i+1}, \ldots, x_n)$. |

*(No se incluye columna PyTorch: los modelos autorregresivos tienen arquitectura propia.)*

### Modelos de lenguaje (GPT-2)

| Expresión | Significado |
|-----------|-------------|
| $x_i$ | Token (palabra/subpalabra) en posición $i$. |
| $e_{x_i}$ | Embedding entrenado del token $x_i$ (vector de 768 dimensiones). |
| $h_i$ | Estado oculto de GPT-2 en posición $i$ (768 dimensiones). |
| $l_i$ | Logits en posición $i$ (vector de 50257 dimensiones, uno por token del vocabulario). |
| $p(x_{i+1} \mid x_0, \ldots, x_i)$ | Probabilidad condicional del siguiente token dado todo el contexto previo. |
| $V$ | Tamaño del vocabulario (50257 tokens en GPT-2). |
| $T$ | Temperatura: hiperparámetro que controla la aleatoriedad del muestreo. $T<1$ más determinista, $T>1$ más aleatorio. |
| $E \in \mathbb{R}^{V \times 768}$ | Matriz de embeddings. |
| $W \in \mathbb{R}^{V \times 768}$ | Matriz de pesos de la capa fully-connected final. |

### Estimación Monte Carlo

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $z^{(i)} \sim p(z)$ | La $i$-ésima muestra sacada de la distribución $p(z)$. | `z = sample_gaussian(m, v)` |
| $A = \frac{1}{k} \sum_{i=1}^{k} p(x \mid z^{(i)})$ | Estimador Monte Carlo de $p(x)$ con $k$ muestras del prior. | `values.mean(dim=0)` |
| $\mathbb{E}[\hat{\theta}] = \theta$ | **Insesgado**: en promedio, el estimador acierta el valor real. | — *(propiedad teórica)* |
| $\mathbb{E}[\hat{\theta}] \neq \theta$ | **Sesgado**: en promedio, el estimador se desvía del valor real. | — *(propiedad teórica)* |
| $\hat{\theta}$ | Estimación de $\theta$ (el sombrero indica "estimado"). | — |

### Truco de reparametrización

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $\boldsymbol{\varepsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})$ | Ruido aleatorio de una normal estándar (no depende de parámetros). | `e = torch.randn_like(m)` |
| $\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\varepsilon}$ | $\mathbf{z}$ se construye como la media más la desviación típica por el ruido. Permite calcular gradientes. | `z = m + torch.sqrt(v) * e` |
| $\odot$ | Multiplicación elemento a elemento (Hadamard product). | `*` *(operador de Python entre tensores)* |
| $T(\boldsymbol{\varepsilon}; \lambda) = \boldsymbol{\mu} + \boldsymbol{\Sigma}^{1/2} \boldsymbol{\varepsilon}$ | Forma general del truco: transformación determinista del ruido. | `sample_gaussian(m, v)` |

### Conteo de parámetros (modelos discretos)

| Expresión | Significado |
|-----------|-------------|
| Variable con $k$ valores | Necesita $k - 1$ parámetros independientes. |
| Conjunta sin suposiciones | $\prod k_i - 1$ parámetros. |
| Variables independientes | $\sum (k_i - 1)$ parámetros. |
| Condicional $p(X \mid \text{padres})$ | $(\prod k_\text{padres}) \times (k_X - 1)$ parámetros. |

### Log-densidad Gaussiana (componentes)

| Expresión | Significado | PyTorch |
|-----------|-------------|---------|
| $-\frac{d}{2}\log(2\pi)$ | Constante de normalización (depende solo de la dimensión $d$). | `-d/2 * torch.log(torch.tensor(2*np.pi))` |
| $-\frac{1}{2}\sum_j \log(\sigma_j^2)$ | Penalización por dispersión: varianzas grandes reducen la densidad máxima. | `-0.5 * torch.log(v).sum(-1)` |
| $-\frac{1}{2}\sum_j \frac{(z_j - \mu_j)^2}{\sigma_j^2}$ | Distancia de Mahalanobis: cuánto se aleja $\mathbf{z}$ de la media, normalizado por la varianza. | `-0.5 * ((z - m).pow(2) / v).sum(-1)` |

Las tres líneas sumadas forman `log_normal(z, m, v)`.

---

## Parte 2: Símbolos matemáticos

Referencia rápida de los símbolos de notación matemática que aparecen en los apuntes.

### Operadores

| Símbolo | Nombre | Significado | PyTorch |
|---------|--------|-------------|---------|
| $\sum$ | Sumatorio | Suma de una serie de términos. $\sum_{i=1}^{n} a_i = a_1 + a_2 + \cdots + a_n$ | `torch.sum(a, dim)` o `.sum(dim)` |
| $\prod$ | Productorio | Producto de una serie de términos. $\prod_{i=1}^{n} a_i = a_1 \times a_2 \times \cdots \times a_n$ | `torch.prod(a, dim)` |
| $\int$ | Integral | "Suma continua" sobre todos los valores posibles. | *(se aproxima con Monte Carlo: `.mean()`)* |
| $\mathbb{E}[\cdot]$ | Esperanza | Valor esperado (promedio teórico ponderado por probabilidad). | `values.mean(dim)` |
| $\mathbb{E}_{p}[\cdot]$ | Esperanza bajo $p$ | Promedio donde las muestras se sacan de la distribución $p$. | `f(sample_gaussian(m, v)).mean()` |
| $D_\text{KL}(\cdot \| \cdot)$ | Divergencia KL | Mide cuánto difieren dos distribuciones. Siempre $\geq 0$, no simétrica. | `kl_normal(...)` / `kl_cat(...)` |
| $\arg\max_\theta$ | Argmax | "El valor de $\theta$ que maximiza..." | `optimizer.step()` *(minimizando -objetivo)* |
| $\arg\min_\theta$ | Argmin | "El valor de $\theta$ que minimiza..." | `loss.backward(); optimizer.step()` |
| $\log$ | Logaritmo natural | Base $e$. Convierte productos en sumas. | `torch.log(x)` |
| $\nabla$ | Gradiente | Vector de derivadas parciales. La dirección de mayor crecimiento. | `loss.backward()` *(autograd)* |
| $\nabla_\phi$ | Gradiente respecto a $\phi$ | Derivadas parciales respecto a los parámetros $\phi$. | `p.grad for p in model.parameters()` |

### Relaciones y comparaciones

| Símbolo | Nombre | Significado |
|---------|--------|-------------|
| $=$ | Igual | Igualdad exacta. |
| $\approx$ | Aproximadamente igual | Igualdad aproximada (ej: estimación Monte Carlo). |
| $\geq$ | Mayor o igual | Indica una cota inferior. |
| $\neq$ | Distinto de | No son iguales. |
| $:=$ | Se define como | Definición (el lado izquierdo se define como el derecho). |
| $\propto$ | Proporcional a | Igualdad salvo una constante multiplicativa. |

### Pertenencia y distribuciones

| Símbolo | Nombre | Significado |
|---------|--------|-------------|
| $\in$ | Pertenece a | "$x \in S$" = "$x$ es elemento del conjunto $S$". |
| $\sim$ | Se distribuye según | "$z \sim p(z)$" = "$z$ se muestrea de la distribución $p(z)$". |
| $\stackrel{\text{i.i.d.}}{\sim}$ | i.i.d. | Independientes e idénticamente distribuidas. |
| $\mid$ | Dado que | Condicionamiento: $p(x \mid z)$ = "probabilidad de $x$ dado $z$". |
| $\|$ | (en KL) | Separa las dos distribuciones en $D_\text{KL}(p \| q)$. |

### Conjuntos numéricos

| Símbolo | Nombre | Significado |
|---------|--------|-------------|
| $\mathbb{R}$ | Reales | Todos los números reales. |
| $\mathbb{R}^n$ | Reales $n$-dimensionales | Vectores de $n$ números reales. |
| $\mathbb{R}_{++}$ | Reales positivos | Números reales estrictamente mayores que cero. |
| $\mathbb{R}^0$ | Cero dimensiones | Por convención: $\{0\}$. |

### Letras griegas

| Símbolo | Nombre | Uso en el curso |
|---------|--------|-----------------|
| $\theta$ | theta | Parámetros del modelo generativo / decoder. |
| $\phi$ | fi | Parámetros del encoder. |
| $\lambda$ | lambda | Parámetros variacionales (general). |
| $\mu$ | mu | Media de una distribución. |
| $\sigma$ | sigma | Desviación estándar. $\sigma^2$ = varianza. |
| $\pi$ | pi | Probabilidades a priori de clases / pesos de mezcla. |
| $\beta$ | beta | Hiperparámetro del $\beta$-VAE. |
| $\alpha$ | alfa | Peso del término de clasificación (SSVAE). |
| $\varepsilon$ | épsilon | Ruido aleatorio (truco de reparametrización). |
| $\gamma$ | gamma | Parámetros del modelo discriminativo. |
| $\gamma_w$ | gamma w | Peso generativo en el SSVAE (`gw` flag). |

### Notación sobre variables

| Símbolo | Nombre | Significado |
|---------|--------|-------------|
| $\hat{x}$ | Sombrero | "Estimado" o "del modelo reverse". Ej: $\hat{\theta}$ = estimación de $\theta$. |
| $x_{<i}$ | Subíndice menor | Variables con índice menor que $i$: $(x_1, \ldots, x_{i-1})$. |
| $x_{>i}$ | Subíndice mayor | Variables con índice mayor que $i$: $(x_{i+1}, \ldots, x_n)$. |
| $x^{(i)}$ | Superíndice entre paréntesis | $i$-ésima muestra (NO es una potencia). |
| $x^\top$ | Transpuesta | Vector columna transpuesto a fila (o viceversa). |
| $\mathbf{x}$ | Negrita | Indica que es un vector (no un escalar). |
| $p_\theta(\cdot)$ | Subíndice $\theta$ | Distribución parametrizada por $\theta$ (se aprende). |
| $\hat{p}(\cdot)$ | Sombrero sobre $p$ | Distribución empírica (de los datos, fija). |
| $q_\phi(\cdot)$ | $q$ con subíndice $\phi$ | Distribución aproximada / variacional, parametrizada por $\phi$. |

### Matrices y operaciones

| Símbolo | Nombre | Significado | PyTorch |
|---------|--------|-------------|---------|
| $I$ | Matriz identidad | Unos en la diagonal, ceros fuera. | `torch.eye(n)` |
| $\text{diag}(\sigma^2)$ | Matriz diagonal | Matriz con $\sigma^2$ en la diagonal. Indica dimensiones independientes. | `torch.diag(sigma2)` *(en la práctica se usa `v` como vector directamente)* |
| $\Sigma^{1/2}$ | Raíz de covarianza | Descomposición de Cholesky de la matriz de covarianza. | `torch.sqrt(v)` *(caso diagonal)* |
| $\odot$ | Producto de Hadamard | Multiplicación elemento a elemento entre vectores. | `a * b` |
| $x^\top w$ | Producto punto | Producto escalar: $\sum_j x_j w_j$. | `(x * w).sum(-1)` o `torch.matmul(x, w)` |

### Funciones y distribuciones

| Símbolo | Nombre | Significado | PyTorch |
|---------|--------|-------------|---------|
| $\mathcal{N}(\cdot \mid \mu, \sigma^2)$ | Gaussiana | Distribución normal con media $\mu$ y varianza $\sigma^2$. | `log_normal(x, m, v)` |
| $\text{Bern}(\cdot \mid p)$ | Bernoulli | Distribución binaria: 1 con probabilidad $p$, 0 con probabilidad $1-p$. | `log_bernoulli_with_logits(x, logits)` |
| $\text{Categorical}(\cdot \mid \pi)$ | Categórica | Distribución sobre $k$ valores discretos con probabilidades $\pi$. | `F.softmax(logits, dim=-1)` |
| $\exp(x)$ | Exponencial | $e^x$. | `torch.exp(x)` |
| $\log(x)$ | Logaritmo natural | Inversa de $\exp$. Base $e$. | `torch.log(x)` |

### Notación de funciones

| Símbolo | Significado |
|---------|-------------|
| $f : A \to B$ | $f$ es una función con dominio $A$ y codominio $B$. |
| $:$ | "Es una función que..." |
| $\to$ | "Y devuelve un valor en..." |

---

## Parte 3: Referencia de funciones PyTorch del curso

Funciones definidas en `utils.py` y los modelos del curso. Cada nombre enlaza la expresión matemática con su implementación.

### Funciones de `utils.py`

| Función | Firma | Qué calcula | Expresión |
|---------|-------|-------------|-----------|
| `sample_gaussian` | `(m, v) → z` | Truco de reparametrización: $\mathbf{z} = \mu + \sqrt{v} \odot \varepsilon$ | $\mathbf{z} \sim \mathcal{N}(\mu, \text{diag}(v))$ |
| `log_normal` | `(x, m, v) → scalar_per_batch` | Log-densidad Gaussiana, suma sobre última dim | $\log \mathcal{N}(\mathbf{x} \mid \mu, \text{diag}(v))$ |
| `log_normal_mixture` | `(z, m, v) → scalar_per_batch` | Log-densidad de mezcla uniforme de Gaussianas | $\log \sum_i \frac{1}{k} \mathcal{N}(\mathbf{z} \mid \mu_i, \text{diag}(\sigma_i^2))$ |
| `log_bernoulli_with_logits` | `(x, logits) → scalar_per_batch` | Log-prob Bernoulli (usa BCE con logits) | $\log \text{Bern}(\mathbf{x} \mid \sigma(f_\theta(\mathbf{z})))$ |
| `kl_normal` | `(qm, qv, pm, pv) → scalar_per_batch` | KL analítica entre dos Gaussianas diagonales | $D_\text{KL}(\mathcal{N}(q_\mu, q_v) \| \mathcal{N}(p_\mu, p_v))$ |
| `kl_cat` | `(q, log_q, log_p) → scalar_per_batch` | KL entre dos distribuciones categóricas | $D_\text{KL}(\text{Cat}(q) \| \text{Cat}(p))$ |
| `gaussian_parameters` | `(h) → (m, v)` | Separa un tensor en media y varianza (softplus) | $h \to (\mu, \text{softplus}(h') + \epsilon)$ |
| `duplicate` | `(x, rep) → x_rep` | Replica cada dato `rep` veces en dim 0 | $(n, \ldots) \to (n \times m, \ldots)$ para IWAE |
| `log_mean_exp` | `(x, dim) → result` | $\log \frac{1}{m} \sum e^{x_i}$ numéricamente estable | $\log \frac{1}{m} \sum_{i=1}^{m} w_i$ *(para IWAE)* |
| `log_sum_exp` | `(x, dim) → result` | $\log \sum e^{x_i}$ numéricamente estable | *(base de `log_mean_exp`)* |

### Funciones de los modelos

| Modelo | Función | Qué calcula | Retorna |
|--------|---------|-------------|---------|
| VAE | `negative_elbo_bound(x)` | $-\text{ELBO} = D_\text{KL}(q \| p) + \text{rec}$ | `(nelbo, kl, rec)` |
| VAE | `negative_iwae_bound(x, iw)` | $-\mathcal{L}_m$ con `iw` muestras | `(niwae, kl, rec)` |
| GMVAE | `negative_elbo_bound(x)` | ELBO con prior mezcla de Gaussianas | `(nelbo, kl, rec)` |
| GMVAE | `negative_iwae_bound(x, iw)` | IWAE con prior mezcla de Gaussianas | `(niwae, kl, rec)` |
| SSVAE | `negative_elbo_bound(x)` | ELBO semi-supervisado (marginaliza $y$) | `(nelbo, kl_z, kl_y, rec)` |

### Patrón típico: del math al código

```python
# Matemática:  -ELBO = D_KL(q_φ(z|x) || p(z)) + E_q[-log p_θ(x|z)]

# 1. Encoder: q_φ(z|x)
m, v = enc(x)                           # μ_φ(x), σ²_φ(x)

# 2. Muestrear: z ~ q_φ(z|x)
z = sample_gaussian(m, v)               # z = μ + σ·ε

# 3. Decoder: log p_θ(x|z)
logits = dec(z)                          # f_θ(z)
rec = -log_bernoulli_with_logits(x, logits).mean()

# 4. KL: D_KL(q_φ(z|x) || p(z))
kl = kl_normal(m, v, prior_m, prior_v).mean()

# 5. -ELBO
nelbo = kl + rec
```

```python
# Matemática:  -𝓛_m = -E[log 1/m Σ p_θ(x,z⁽ⁱ⁾)/q_φ(z⁽ⁱ⁾|x)]

# 1. Duplicar x para m muestras
x_dup = duplicate(x, iw)                # (batch*iw, dim)

# 2. Encoder + muestrear m veces
m, v = enc(x_dup)
z = sample_gaussian(m, v)

# 3. Calcular log-weights: log w_i = log p(x,z) - log q(z|x)
log_pxz = log_pz + log_px_given_z       # log p_θ(x,z)
log_qz  = log_normal(z, m, v)           # log q_φ(z|x)
log_w   = log_pxz - log_qz              # log w_i

# 4. Reshape y log-mean-exp sobre muestras
log_w = log_w.reshape(iw, -1)           # (iw, batch)
niwae = -log_mean_exp(log_w, dim=0).mean()
```

---

## Parte 4: Flujos Normalizantes y GANs

### Flujos normalizantes (MAF)

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $f: \mathbb{R}^n \to \mathbb{R}^n$ | Transformacion invertible que mapea $\mathbf{z} \to \mathbf{x}$. | — *(la red `MADE` + `MAF`)* |
| $p_X(\mathbf{x}) = p_Z(f^{-1}(\mathbf{x})) \cdot \|\det J\|$ | Formula del cambio de variables: densidad de x = densidad base en z por correccion Jacobiana. | `log_probs` en `flow_network.py` |
| $\log p(\mathbf{x}) = \log p_Z(f^{-1}(\mathbf{x})) + \sum_j \log\|\det J_j\|$ | Log-verosimilitud con $k$ capas de flujo compuestas. | `log_prob = log_pz + sum(log_det_j)` |
| $x_i = \mu_i + z_i \cdot \exp(\alpha_i)$ | Forward de MAF: mapeo afin autorregresivo. $\mu_i, \alpha_i$ dependen de $x_{<i}$. | `forward` en `MADE` |
| $z_i = (x_i - \mu_i) / \exp(\alpha_i)$ | Inverse de MAF: la transformacion inversa es paralela. | `inverse` en `MADE` |
| $\log\|\det J^{-1}\| = -\sum_i \alpha_i$ | Log-determinante del Jacobiano de MAF: suma de los log-scales. | `-alpha.sum(dim=-1)` |

### GANs: simbolos y arquitectura

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $G_\theta: \mathbb{R}^k \to \mathbb{R}^n$ | **Generador**: red neuronal que mapea ruido $\mathbf{z}$ a datos $\mathbf{x}$. | `gen(z)` |
| $D_\phi: \mathbb{R}^n \to (0, 1)$ | **Discriminador**: red que clasifica datos como reales (1) o falsos (0). | `disc(x)` |
| $h_\phi(\mathbf{x})$ | **Logits** del discriminador (antes de sigmoid). $D_\phi(\mathbf{x}) = \sigma(h_\phi(\mathbf{x}))$. | `disc.forward(x)` *(sin sigmoid)* |
| $\sigma(x) = \frac{1}{1+e^{-x}}$ | Funcion sigmoid. Convierte logits a probabilidades. | `torch.sigmoid(x)` |
| $p_G$ o $p_\theta$ | Distribucion implicita del generador: $\mathbf{x} = G_\theta(\mathbf{z})$, $\mathbf{z} \sim \mathcal{N}(0,I)$. | `gen(torch.randn(batch, z_dim))` |
| $\mathbf{z} \sim \mathcal{N}(0, I)$ | Ruido latente del generador. | `z = torch.randn(batch, z_dim)` |

### GANs: funciones de perdida

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $V(G, D) = \mathbb{E}_{p_\text{data}}[\log D(\mathbf{x})] + \mathbb{E}_{p_z}[\log(1 - D(G(\mathbf{z})))]$ | Objetivo minimax original. D maximiza, G minimiza. | — *(forma teorica)* |
| $L_D = -\mathbb{E}[\log D(\mathbf{x})] - \mathbb{E}[\log(1 - D(G(\mathbf{z})))]$ | Perdida del discriminador (se minimiza). | `loss_nonsaturating_d` |
| $L_G^\text{non-sat} = -\mathbb{E}[\log D(G(\mathbf{z}))]$ | Perdida non-saturating del generador. Evita gradientes que se desvanecen. | `loss_nonsaturating_g` |
| $D^*(\mathbf{x}) = \frac{p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x}) + p_G(\mathbf{x})}$ | Discriminador optimo para G fijo. | — *(resultado teorico)* |
| $h^*_\phi(\mathbf{x}) = \log \frac{p_\text{data}(\mathbf{x})}{p_G(\mathbf{x})}$ | Logits optimos: log-ratio de densidades. | — *(resultado teórico)* |

### Divergencias en GANs

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $D_\text{JSD}(p \| q) = \frac{1}{2}D_\text{KL}(p \| M) + \frac{1}{2}D_\text{KL}(q \| M)$ | Jensen-Shannon: KL simetrica. $M = (p+q)/2$. El GAN original minimiza JSD. | — |
| $D_f(p \| q) = \mathbb{E}_q[f(p/q)]$ | f-divergencia general. KL, JSD, TV son casos especiales. | — |
| $W_1(p, q) = \sup_{\|D\|_L \leq 1} \mathbb{E}_p[D] - \mathbb{E}_q[D]$ | Distancia Wasserstein-1 (forma dual). Funciona con soportes disjuntos. | — |

### GANs condicionales

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $G_\theta(\mathbf{z}, y)$ | Generador condicional: recibe ruido + etiqueta de clase $y$ (one-hot). | `gen(z, y)` |
| $D_\phi(\mathbf{x}, y)$ | Discriminador condicional: evalua realismo dado la clase. | `disc(x, y)` |
| $h^*(\mathbf{x}, y) = \mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$ | Projection discriminator optimo. $\varphi$ = features, $A$/$\mathbf{b}$ = parametros aprendidos. | `conditional_loss_*` en `gan.py` |

### Wasserstein GAN con Gradient Penalty (WGAN-GP)

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $L_D = \mathbb{E}_{p_\theta}[D(\mathbf{x})] - \mathbb{E}_{p_\text{data}}[D(\mathbf{x})] + \lambda \mathbb{E}_r[(\|\nabla D\|_2 - 1)^2]$ | Perdida WGAN-GP del discriminador. El tercer termino es la gradient penalty. | `loss_wasserstein_gp_d` |
| $L_G = -\mathbb{E}_{p_\theta}[D(G(\mathbf{z}))]$ | Perdida WGAN-GP del generador. | `loss_wasserstein_gp_g` |
| $r_\theta(\mathbf{x}) = \alpha \mathbf{x}_\text{real} + (1-\alpha)\mathbf{x}_\text{fake}$ | Interpolacion para gradient penalty. $\alpha \sim \text{Uniform}(0,1)$. | `alpha * x_real + (1-alpha) * x_fake` |
| $\lambda = 10$ | Coeficiente de la gradient penalty (valor estandar). | `gp_lambda = 10` |
| $\|\nabla D(\mathbf{x})\|_2$ | Norma de Frobenius del gradiente del discriminador. | `torch.autograd.grad(...)` |

### Patron tipico: GAN non-saturating

```python
# Matematica: L_D = -E[log D(x)] - E[log(1 - D(G(z)))]
#             L_G = -E[log D(G(z))]

# 1. Muestras reales y ruido
x_real = next(data_iter)                # x ~ p_data
z = torch.randn(batch, z_dim)          # z ~ N(0, I)

# 2. Generar muestras falsas
x_fake = gen(z)                         # G_θ(z)

# 3. Discriminador evalua ambas
d_real = disc(x_real)                   # D_φ(x_real)
d_fake = disc(x_fake.detach())          # D_φ(G_θ(z)), detach para no actualizar G

# 4. Perdida del discriminador
loss_d = -torch.log(d_real).mean() - torch.log(1 - d_fake).mean()

# 5. Perdida del generador (non-saturating)
d_fake_for_g = disc(x_fake)            # sin detach: gradientes fluyen a G
loss_g = -torch.log(d_fake_for_g).mean()
```

### Patron tipico: WGAN-GP

```python
# 1. Perdida base Wasserstein
loss_d_base = disc(x_fake).mean() - disc(x_real).mean()

# 2. Gradient penalty
alpha = torch.rand(batch, 1)
x_interp = (alpha * x_real + (1-alpha) * x_fake).requires_grad_(True)
d_interp = disc(x_interp)
grad = torch.autograd.grad(d_interp.sum(), x_interp, create_graph=True)[0]
gp = ((grad.norm(2, dim=1) - 1) ** 2).mean()

# 3. Perdida total del discriminador
loss_d = loss_d_base + 10 * gp

# 4. Perdida del generador
loss_g = -disc(gen(z)).mean()
```

---

## Parte 5: Score Matching y Modelos de Difusion

### Funcion score

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $s(\mathbf{x}) = \nabla_\mathbf{x} \log p(\mathbf{x})$ | **Funcion score**: gradiente del log de la densidad. Vector que apunta hacia mayor densidad. | `torch.autograd.grad(log_p.sum(), x)` |
| $s_\theta(\mathbf{x})$ | Red neuronal que aproxima el score verdadero $\nabla_\mathbf{x} \log p_\text{data}(\mathbf{x})$. | `score_model(x)` |
| $\nabla_x \log p(x) = -\nabla_x E_\theta(x)$ | Para EBMs, el score no depende de $Z_\theta$ (la constante se cancela). | `compute_score(x)` en `score_matching_utils.py` |

### Score matching losses

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $\mathcal{J}(\theta) = \frac{1}{2}\mathbb{E}_{p_\text{data}}[\|s_\theta(x) - \nabla_x \log p_\text{data}(x)\|^2]$ | **Fisher divergence**: distancia cuadratica entre scores. Queremos minimizarla pero no conocemos el score verdadero. | — *(no se puede evaluar directamente)* |
| $\mathcal{J}(\theta) = \mathbb{E}_{p_\text{data}}\left[\frac{1}{2}\|s_\theta(x)\|^2 + \text{Tr}(\nabla_x s_\theta(x))\right] + C$ | **Objetivo de Hyvarinen**: el score verdadero desaparece via integracion por partes. Solo depende de $s_\theta$. | `score_matching_objective` en `score_matching.py` |
| $\text{Tr}(\nabla_x s_\theta(x)) = \sum_i \frac{\partial [s_\theta(x)]_i}{\partial x_i}$ | Traza del Jacobiano del score: suma de derivadas parciales diagonales. | `compute_l2norm_squared` + `trace` |
| $\text{Tr}(A) \approx \frac{1}{m}\sum_j \mathbf{z}_j^\top A \mathbf{z}_j$ | **Estimador de Hutchinson**: aproxima la traza con vectores aleatorios. | `(z * (A @ z)).sum()` |
| $\mathcal{L}_\text{DSM} = \mathbb{E}_{x, z}\left[\|s_\theta(x+z) + z/\sigma^2\|^2\right]$ | **Denoising Score Matching**: entrena el score prediciendo $-z/\sigma^2$ del dato ruidoso. | `denoising_score_matching_objective` |

### Score matching en PyTorch

| Funcion | Firma | Que calcula |
|---------|-------|-------------|
| `log_p_theta` | `(x, theta) → scalar` | $\log p_\theta(x)$: log-densidad (sin normalizar) del modelo. |
| `compute_score` | `(x, theta) → (batch, dim)` | $s_\theta(x) = \nabla_x \log p_\theta(x)$: score via autograd. |
| `compute_l2norm_squared` | `(score) → scalar_per_batch` | $\|s_\theta(x)\|^2$: norma cuadrada del score. |
| `score_matching_objective` | `(x, theta) → scalar` | Objetivo de Hyvarinen: $\frac{1}{2}\|s\|^2 + \text{Tr}(\nabla s)$. |
| `add_noise` | `(x, sigma) → noisy_x` | $\tilde{x} = x + z$, $z \sim \mathcal{N}(0, \sigma^2 I)$. |
| `compute_gaussian_score` | `(x, sigma) → score` | Score de la gaussiana: $-z/\sigma^2$. |
| `compute_target_score` | `(x, noisy_x, sigma) → target` | Target para DSM: $-(noisy\_x - x)/\sigma^2$. |
| `denoising_score_matching_objective` | `(x, theta, sigma) → scalar` | $\|s_\theta(\tilde{x}) + z/\sigma^2\|^2$. |

### Concrete Score Matching (datos discretos)

| Expresion | Significado |
|-----------|-------------|
| $\mathcal{X} = \{0, 1\}^d$ | Espacio de datos discretos binarios. |
| $\mathcal{N}(\mathbf{x}) = \{\mathbf{x}' : \text{Hamming}(\mathbf{x}, \mathbf{x}') = 1\}$ | Vecindario: vectores que difieren en exactamente 1 bit. Tamano $= d$. |
| $c_p(\mathbf{x}; \mathcal{N}) = \left[\frac{p(\mathbf{x}_{n_i}) - p(\mathbf{x})}{p(\mathbf{x})}\right]$ | **Concrete score**: analogo discreto del score continuo. |
| $\mathcal{L}_\text{CSM}(\theta) = \sum_\mathbf{x} p_\text{data}(\mathbf{x}) \|c_\theta(\mathbf{x}) - c_{p_\text{data}}(\mathbf{x})\|^2$ | Objective CSM: minimizar distancia entre concrete scores. |

### Variables de difusion

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $\beta_t$ | **Noise schedule**: cuanto ruido se anade en el paso $t$. Tipico: lineal de $10^{-4}$ a $0.02$. | `betas[t]` |
| $\alpha_t = 1 - \beta_t$ | Complemento del ruido. | `alphas[t]` |
| $\bar{\alpha}_t = \prod_{s=1}^{t} \alpha_s$ | **Producto acumulado**: cuanta senal queda en el paso $t$. | `alphas_cumprod[t]` |
| $q(x_t \mid x_{t-1}) = \mathcal{N}(x_t; \sqrt{\alpha_t} x_{t-1}, (1-\alpha_t)I)$ | **Proceso forward** (un paso): escalar + anadir ruido. | — |
| $q(x_t \mid x_0) = \mathcal{N}(x_t; \sqrt{\bar{\alpha}_t} x_0, (1-\bar{\alpha}_t)I)$ | **Marginal cerrada**: saltar desde $x_0$ hasta cualquier $t$ directamente. | `x_t = sqrt(a_cum) * x0 + sqrt(1-a_cum) * eps` |
| $x_t = \sqrt{\bar{\alpha}_t} \, x_0 + \sqrt{1 - \bar{\alpha}_t} \, \epsilon$ | Formula para generar $x_t$ desde $x_0$. $\epsilon \sim \mathcal{N}(0, I)$. | `add_forward_tnoise(x0, t)` en `inpaint.py` |

### DDPM y DDIM

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $\epsilon_\theta(x_t, t)$ | Red neuronal (UNet) que predice el ruido $\epsilon$ anadido a $x_t$. | `model(x_t, t)` |
| $\hat{x}_0 = \frac{x_t - \sqrt{1-\bar{\alpha}_t}\,\epsilon_\theta}{\sqrt{\bar{\alpha}_t}}$ | Estimacion de la imagen limpia a partir de $x_t$ y el ruido predicho. | `predict_x0(x_t, t, eps)` en `sample.py` |
| $\tilde{\mu}_t = \frac{\sqrt{\bar{\alpha}_{t-1}}\beta_t}{1-\bar{\alpha}_t} x_0 + \frac{\sqrt{\alpha_t}(1-\bar{\alpha}_{t-1})}{1-\bar{\alpha}_t} x_t$ | Media de la posterior forward $q(x_{t-1} \mid x_t, x_0)$. | `compute_forward_posterior_mean` |
| $\tilde{\beta}_t = \frac{1-\bar{\alpha}_{t-1}}{1-\bar{\alpha}_t}\beta_t$ | Varianza de la posterior forward. | `compute_forward_posterior_variance` |
| $x_{t-1} = \tilde{\mu}_t + \sqrt{\tilde{\beta}_t} \, z$ | **DDPM update**: muestreo estocastico ($z \sim \mathcal{N}(0,I)$, excepto $t=1$). | DDPM sampling loop |
| $x_{t-1} = \sqrt{\bar{\alpha}_{t-1}}\hat{x}_0 + \sqrt{1-\bar{\alpha}_{t-1}-\sigma_t^2}\,\epsilon_\theta + \sigma_t z$ | **DDIM update** general con parametro $\eta$. | DDIM sampling loop |
| $\sigma_t = \eta \sqrt{\frac{1-\bar{\alpha}_{t-1}}{1-\bar{\alpha}_t}} \sqrt{\beta_t}$ | Desviacion estandar del termino estocastico. $\eta=0$: determinista. $\eta=1$: DDPM. | `get_stochasticity_std` |
| $\sqrt{1-\bar{\alpha}_{t-1}-\sigma_t^2}\,\epsilon_\theta$ | **predict_sample_direction**: componente determinista de la prediccion. | `predict_sample_direction` |

### DDPM vs DDIM

| Propiedad | DDPM | DDIM ($\eta=0$) |
|-----------|------|-----------------|
| Proceso reverse | Estocastico | Determinista |
| Pasos tipicos | 1000 | 10-50 |
| Calidad con pocos pasos | Mala | Buena |
| Misma semilla → mismo resultado | No | Si |
| Parametro $\eta$ | 1.0 (implicito) | 0.0 |

### Inpainting

| Expresion | Significado | PyTorch |
|-----------|-------------|---------|
| $m$ | **Mascara binaria**: $m=0$ para pixeles conocidos, $m=1$ para pixeles a rellenar. | `get_mask()` en `inpaint.py` |
| $x_\text{orig\_noisy} = \sqrt{\bar{\alpha}_t} \, x_\text{orig} + \sqrt{1-\bar{\alpha}_t}\,\epsilon$ | Imagen original con ruido anadido al nivel $t$ (forward process). | `add_forward_tnoise(x_orig, t)` |
| $x_t = m \cdot x_t^\text{denoise} + (1-m) \cdot x_\text{orig\_noisy}$ | **Blending**: pixeles conocidos vienen de $x_\text{orig}$ ruidoso, pixeles desconocidos del modelo. | `apply_inpainting_mask` |

### Patron tipico: DDPM sampling

```python
# Matematica: x_{t-1} = μ̃_t + √β̃_t · z

# 1. Empezar con ruido puro
x = torch.randn(batch, channels, H, W)     # x_T ~ N(0, I)

# 2. Reverse process
for t in reversed(range(1, T+1)):
    eps_pred = model(x, t)                   # ε_θ(x_t, t)
    x0_hat = predict_x0(x, t, eps_pred)      # x̂_0
    mu = compute_forward_posterior_mean(x0_hat, x, t)  # μ̃_t
    var = compute_forward_posterior_variance(t)          # β̃_t
    z = torch.randn_like(x) if t > 1 else 0
    x = mu + torch.sqrt(var) * z              # x_{t-1}
```

### Patron tipico: DDIM sampling

```python
# Matematica: x_{t-1} = √ᾱ_{t-1} · x̂_0 + √(1-ᾱ_{t-1}-σ²) · ε_θ + σ_t · z

timesteps = get_timesteps(num_steps, T)       # subsequencia uniforme

x = torch.randn(batch, channels, H, W)

for t in reversed(timesteps):
    eps_pred = model(x, t)
    x0_hat = predict_x0(x, t, eps_pred)
    sigma = get_stochasticity_std(t, eta)
    direction = predict_sample_direction(x0_hat, t, sigma)
    noise = stochasticity_term(sigma)          # sigma_t * z
    x = torch.sqrt(alphas_cumprod[t-1]) * x0_hat + direction + noise
```

### Conexion score ↔ difusion

| Expresion | Significado |
|-----------|-------------|
| $\nabla_{x_t} \log q(x_t) \approx -\frac{\epsilon_\theta(x_t, t)}{\sqrt{1-\bar{\alpha}_t}}$ | El predictor de ruido $\epsilon_\theta$ es proporcional al score (con signo negativo). |
| Entrenar $\epsilon_\theta$ | $\equiv$ entrenar un score model multi-escala (un $\sigma$ por cada $t$). |
| DDPM reverse step | $\equiv$ un paso de Langevin dynamics con el score estimado. |
