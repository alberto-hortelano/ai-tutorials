# Ejercicio 1 - PS2: Implementar el Variational Autoencoder (VAE)

## Contexto del ejercicio

El ejercicio pide implementar un **VAE** (Variational Autoencoder) usando PyTorch para
aprender un modelo probabilistico del dataset MNIST (digitos escritos a mano, imagenes
de 28x28 pixeles en blanco y negro).

Los archivos que hay que modificar son:
- `src/submission/utils.py`
- `src/submission/models/vae.py`

---

## Datos del problema

El enunciado define los datos asi:

$$\mathbf{x} \in \{0, 1\}^d$$

### Lectura y significado

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $\mathbf{x}$ | "equis" (en negrita = vector) | Una imagen completa. Es un vector de pixeles. |
| $\{0, 1\}$ | "el conjunto cero, uno" | Cada pixel solo puede valer 0 (negro) o 1 (blanco). |
| $\{0, 1\}^d$ | "cero-uno elevado a $d$" | Un vector de $d$ componentes donde cada una es 0 o 1. |
| $d$ | "de" | La dimension de $\mathbf{x}$: el numero total de pixeles. En MNIST, $d = 28 \times 28 = 784$. |

Ademas define:

$$\mathbf{z} \in \mathbb{R}^k$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $\mathbf{z}$ | "zeta" (en negrita = vector) | Las **variables latentes**: una representacion comprimida de la imagen en un espacio de menor dimension. No se observan directamente. |
| $\mathbb{R}^k$ | "erre elevado a $k$" | Un vector de $k$ numeros reales (pueden tomar cualquier valor, no solo 0 y 1). |
| $k$ | "ka" | La dimension del espacio latente. Es mucho menor que $d$ (por ejemplo $k=10$ vs $d=784$). |

**Idea clave:** $\mathbf{x}$ es lo que observamos (la imagen). $\mathbf{z}$ es una representacion interna oculta que el modelo usa internamente. El objetivo es aprender un modelo $p_\theta(\mathbf{x})$ que asigne alta probabilidad a las imagenes reales.

---

## El proceso generativo del VAE (Ecuaciones 1 y 2)

El enunciado define el VAE mediante dos ecuaciones que describen como el modelo "imagina" que se generan las imagenes:

### Ecuacion (1): El prior

$$p(\mathbf{z}) = \mathcal{N}(\mathbf{z} \mid \mathbf{0}, I)$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $p(\mathbf{z})$ | "pe de zeta" | La **distribucion prior** (previa) sobre las variables latentes. Es la probabilidad que le asignamos a cada posible valor de $\mathbf{z}$ *antes* de ver ningun dato. |
| $\mathcal{N}(\cdots)$ | "normal de..." o "gaussiana de..." | La distribucion normal (gaussiana). La campana de Gauss generalizada a multiples dimensiones. |
| $\mathcal{N}(\mathbf{z} \mid \mathbf{0}, I)$ | "normal de zeta dado media cero y covarianza identidad" | Una gaussiana centrada en el origen, con cada dimension independiente y varianza 1. |
| $\mathbf{0}$ | "cero" (aqui es un vector) | El vector media: todas las componentes son cero. Significa que $\mathbf{z}$ esta centrado en el origen. |
| $I$ | "i mayuscula" o "identidad" | La **matriz identidad**: una matriz con unos en la diagonal y ceros fuera. Como covarianza, significa que cada dimension de $\mathbf{z}$ tiene varianza 1 y no hay correlacion entre dimensiones. |

**En palabras simples:** antes de ver ninguna imagen, asumimos que $\mathbf{z}$ viene de una gaussiana estandar. Es decir, cada componente de $\mathbf{z}$ se distribuye como una campana de Gauss centrada en 0 con dispersion 1, independiente de las demas.

### Ecuacion (2): El decoder (modelo de observacion)

$$p_\theta(\mathbf{x} \mid \mathbf{z}) = \text{Bern}(\mathbf{x} \mid f_\theta(\mathbf{z}))$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $p_\theta(\mathbf{x} \mid \mathbf{z})$ | "pe sub theta de equis dado zeta" | La probabilidad de observar la imagen $\mathbf{x}$ *si sabemos* que el codigo latente es $\mathbf{z}$. Es el **decoder**: convierte $\mathbf{z}$ en una imagen. |
| $\theta$ | "theta" (letra griega) | Los **parametros** de la red neuronal del decoder. Son los pesos y biases que se aprenden durante el entrenamiento. |
| $\text{Bern}(\cdots)$ | "Bernoulli de..." | La **distribucion de Bernoulli**: modela variables binarias (0 o 1). Perfecta para pixeles blancos/negros. |
| $\text{Bern}(\mathbf{x} \mid f_\theta(\mathbf{z}))$ | "Bernoulli de equis dado efe sub theta de zeta" | Cada pixel $x_i$ tiene probabilidad $f_\theta(\mathbf{z})_i$ de ser 1 (blanco). |
| $f_\theta(\mathbf{z})$ | "efe sub theta de zeta" | La **red neuronal decoder**. Toma $\mathbf{z}$ como entrada y produce los **logits** para los $d$ pixeles. |

**Que son los logits:** la red neuronal $f_\theta$ no produce probabilidades directamente (numeros entre 0 y 1). Produce logits, que son numeros reales de $-\infty$ a $+\infty$. Para convertir un logit en probabilidad se usa la funcion sigmoide: $p = \frac{1}{1 + e^{-\text{logit}}}$. Un logit de $+3$ da probabilidad $\approx 0.95$ (casi seguro blanco). Un logit de $-3$ da probabilidad $\approx 0.05$ (casi seguro negro).

**El flujo generativo completo:**
1. Muestrear $\mathbf{z}$ de $\mathcal{N}(\mathbf{0}, I)$ -- elegir un punto en el espacio latente
2. Pasar $\mathbf{z}$ por la red neuronal $f_\theta$ para obtener logits
3. Cada pixel se "lanza" como una moneda sesgada con la probabilidad que dio el decoder

---

## La verosimilitud marginal: el problema central

El enunciado escribe:

$$p_\theta(\mathbf{x}) = \int p(\mathbf{z})\, p_\theta(\mathbf{x} \mid \mathbf{z})\, d\mathbf{z}$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $p_\theta(\mathbf{x})$ | "pe sub theta de equis" | La **verosimilitud marginal**: la probabilidad total que el modelo le asigna a la imagen $\mathbf{x}$, considerando todos los posibles valores de $\mathbf{z}$. Es lo que realmente queremos maximizar. |
| $\int \cdots\, d\mathbf{z}$ | "integral con respecto a zeta" | Sumar (integrar) sobre todos los posibles valores de $\mathbf{z}$. Como $\mathbf{z}$ es continuo, es una integral, no una suma. |
| $p(\mathbf{z})\, p_\theta(\mathbf{x} \mid \mathbf{z})$ | "pe de zeta por pe sub theta de equis dado zeta" | Para cada valor posible de $\mathbf{z}$: que tan probable es ese $\mathbf{z}$ (prior) multiplicado por que tan bien genera la imagen $\mathbf{x}$ (decoder). |

**Por que es intratable:** para calcular $p_\theta(\mathbf{x})$ habria que evaluar la red neuronal para *cada posible* valor de $\mathbf{z}$ (un espacio continuo de $k$ dimensiones) y sumar los resultados. Esto es computacionalmente imposible.

---

## La posterior aproximada (Ecuacion 3)

Como no podemos calcular $p(\mathbf{z} \mid \mathbf{x})$ exactamente (la verdadera distribucion de $\mathbf{z}$ dado $\mathbf{x}$), usamos una aproximacion:

$$q_\phi(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}\!\left(\mathbf{z} \mid \mu_\phi(\mathbf{x}),\; \text{diag}\!\left(\sigma_\phi^2(\mathbf{x})\right)\right)$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $q_\phi(\mathbf{z} \mid \mathbf{x})$ | "cu sub fi de zeta dado equis" | La **posterior aproximada**: una distribucion que intenta aproximar la verdadera posterior $p(\mathbf{z} \mid \mathbf{x})$. Es lo que produce el **encoder**. |
| $\phi$ | "fi" (letra griega) | Los **parametros** de la red neuronal del encoder. Son distintos de $\theta$ (los del decoder). |
| $\mu_\phi(\mathbf{x})$ | "mu sub fi de equis" | La **media** que predice el encoder para la imagen $\mathbf{x}$. Es un vector de $k$ componentes: el "centro" en el espacio latente donde el encoder cree que esta la imagen. |
| $\sigma_\phi^2(\mathbf{x})$ | "sigma cuadrado sub fi de equis" | La **varianza** que predice el encoder. Tambien un vector de $k$ componentes. Indica cuanta incertidumbre tiene el encoder sobre la posicion de $\mathbf{z}$. |
| $\text{diag}(\cdots)$ | "diagonal de..." | Construye una **matriz diagonal** a partir de un vector. Significa que las dimensiones de $\mathbf{z}$ son independientes entre si (no hay correlaciones cruzadas). |
| $\mathcal{N}(\mathbf{z} \mid \mu, \text{diag}(\sigma^2))$ | "normal de zeta con media mu y covarianza diagonal sigma cuadrado" | Una gaussiana multivariada donde cada dimension tiene su propia media y varianza, pero son independientes. |

**En palabras simples:** le pasas una imagen al encoder (una red neuronal) y te devuelve dos vectores: $\mu$ (donde cree que esta $\mathbf{z}$) y $\sigma^2$ (cuanto de seguro esta). Juntos definen una "nube" gaussiana en el espacio latente que representa esa imagen.

---

## El ELBO (Ecuacion 4)

$$\log p_\theta(\mathbf{x}) \;\geq\; \text{ELBO}(\mathbf{x};\, \theta, \phi) \;=\; \mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right] - D_\text{KL}\!\left(q_\phi(\mathbf{z} \mid \mathbf{x}) \;\|\; p(\mathbf{z})\right)$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $\log p_\theta(\mathbf{x})$ | "logaritmo de pe sub theta de equis" | La **log-verosimilitud marginal**. Es el logaritmo de la probabilidad del dato. Queremos maximizarla pero no podemos calcularla. |
| $\geq$ | "mayor o igual que" | El ELBO es una **cota inferior**: siempre es menor o igual que $\log p(\mathbf{x})$. |
| $\text{ELBO}(\mathbf{x};\, \theta, \phi)$ | "elbo de equis punto y coma theta, fi" | **Evidence Lower BOund**. Una cantidad que si podemos calcular y que sirve como sustituto de $\log p(\mathbf{x})$. |
| $\mathbb{E}_{q_\phi(\mathbf{z} \mid \mathbf{x})}[\cdots]$ | "esperanza bajo cu sub fi de zeta dado equis de..." | El **valor esperado** (promedio) de la expresion entre corchetes, donde $\mathbf{z}$ se muestrea de la distribucion $q_\phi(\mathbf{z} \mid \mathbf{x})$. |
| $\log p_\theta(\mathbf{x} \mid \mathbf{z})$ | "log de pe sub theta de equis dado zeta" | La **log-verosimilitud de reconstruccion**: que tan probable es la imagen original $\mathbf{x}$ segun el decoder, dado un $\mathbf{z}$ concreto. |
| $D_\text{KL}(\cdots \| \cdots)$ | "divergencia KL de ... respecto a ..." o "de-ka-ele" | La **divergencia de Kullback-Leibler**: mide que tan "diferentes" son dos distribuciones. Siempre es $\geq 0$, y es $0$ solo si las dos distribuciones son identicas. |
| $D_\text{KL}(q_\phi(\mathbf{z} \mid \mathbf{x}) \| p(\mathbf{z}))$ | "KL de cu fi dado equis respecto a pe de zeta" | Mide cuanto se aleja la posterior aproximada (lo que dice el encoder) del prior (la gaussiana estandar). |

### Los dos terminos del ELBO

El enunciado explica que el **negativo** del ELBO se descompone en:

$$-\text{ELBO} = \underbrace{-\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right]}_{\text{reconstruction loss}} + \underbrace{D_\text{KL}\!\left(q_\phi(\mathbf{z} \mid \mathbf{x}) \;\|\; p(\mathbf{z})\right)}_{\text{KL divergence}}$$

1. **Reconstruction loss** (perdida de reconstruccion): $-\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}[\log p_\theta(\mathbf{x} \mid \mathbf{z})]$
   - Mide que tan mal reconstruye el decoder la imagen original.
   - Si el decoder es perfecto, este termino es 0.
   - Cuanto peor la reconstruccion, mas grande (positivo) es.

2. **KL term** (termino de regularizacion): $D_\text{KL}(q_\phi(\mathbf{z} \mid \mathbf{x}) \| p(\mathbf{z}))$
   - Mide cuanto se desvia la posterior aproximada del prior.
   - Si $q$ es exactamente igual al prior $\mathcal{N}(\mathbf{0}, I)$, este termino es 0.
   - Actua como **regularizador**: evita que el encoder ponga cada imagen en un punto aislado del espacio latente.

---

## Relacion con la formulacion de clase

El enunciado tambien muestra la formulacion que se vio en clase:

$$\log p(\mathbf{x};\theta) \;\geq\; \sum_{\mathbf{z}} q(\mathbf{z};\phi) \log p(\mathbf{z}, \mathbf{x};\theta) + H(q(\mathbf{z};\phi)) \;=\; \mathcal{L}(\mathbf{x};\theta,\phi)$$

$$\log p(\mathbf{x};\theta) \;=\; \mathcal{L}(\mathbf{x};\theta,\phi) + D_\text{KL}\!\left(q(\mathbf{z};\phi) \;\|\; p(\mathbf{z} \mid \mathbf{x};\theta)\right)$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $\mathcal{L}(\mathbf{x};\theta,\phi)$ | "ele de equis punto y coma theta fi" | Es otro nombre para el ELBO. |
| $H(q(\mathbf{z};\phi))$ | "hache de cu de zeta punto y coma fi" | La **entropia** de la distribucion $q$. Mide cuanta "incertidumbre" o "aleatoriedad" tiene $q$. |
| $\sum_{\mathbf{z}}$ | "suma sobre zeta" | Sumar sobre todos los posibles valores de $\mathbf{z}$ (en el caso discreto; para continuo seria $\int d\mathbf{z}$). |
| $q(\mathbf{z};\phi)$ | "cu de zeta punto y coma fi" | La distribucion aproximada (equivale a $q_\phi(\mathbf{z} \mid \mathbf{x})$ cuando se condiciona en un $\mathbf{x}$ concreto). |
| $\log p(\mathbf{z}, \mathbf{x};\theta)$ | "log de pe de zeta coma equis punto y coma theta" | La **log-probabilidad conjunta** de $\mathbf{z}$ y $\mathbf{x}$ bajo el modelo. |
| $p(\mathbf{z} \mid \mathbf{x};\theta)$ | "pe de zeta dado equis punto y coma theta" | La **posterior verdadera**: la distribucion real de $\mathbf{z}$ dado $\mathbf{x}$. No la podemos calcular. |

**Observacion clave del enunciado:** la segunda linea muestra que $\log p(\mathbf{x})$ es *exactamente* igual al ELBO mas la KL entre $q$ y la posterior verdadera. Como la KL siempre es $\geq 0$, el ELBO siempre es $\leq \log p(\mathbf{x})$. Cuanto mejor sea $q$ como aproximacion de la posterior real, mas se acerca el ELBO a $\log p(\mathbf{x})$.

---

## Apartado (a): El truco de reparametrizacion [2 puntos, codigo]

**Que te piden:** implementar la funcion `sample_gaussian(m, v)` en `utils.py`.

**Que debe hacer la funcion:**
- Recibe `m` (media) y `v` (varianza) de una gaussiana $q_\phi(\mathbf{z} \mid \mathbf{x})$
- Debe devolver una muestra $\mathbf{z} \sim q_\phi(\mathbf{z} \mid \mathbf{x})$

**Concepto clave -- el truco de reparametrizacion:** el muestreo directo $\mathbf{z} \sim \mathcal{N}(\mathbf{m}, \mathbf{v})$ no es diferenciable (no se pueden calcular gradientes respecto a $\mathbf{m}$ y $\mathbf{v}$ a traves de una operacion aleatoria). El truco de reparametrizacion resuelve esto separando la parte aleatoria de los parametros.

---

## Apartado (b): Implementar negative_elbo_bound [3.5 puntos, codigo]

**Que te piden:** implementar `negative_elbo_bound` en `vae.py`.

**Que debe hacer la funcion:**
- Recibe un mini-batch de imagenes $\mathbf{x}$
- Debe calcular el **negativo del ELBO promediado** sobre el batch

**Por que negativo:** PyTorch minimiza funciones de perdida. Como queremos *maximizar* el ELBO, minimizamos $-\text{ELBO}$.

**Por que el promedio:** como trabajamos con un mini-batch de $n$ imagenes $\{\mathbf{x}^{(i)}\}_{i=1}^{n}$, la funcion debe devolver:

$$-\frac{1}{n} \sum_{i=1}^{n} \text{ELBO}(\mathbf{x}^{(i)};\, \theta, \phi)$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $n$ | "ene" | El numero de imagenes en el mini-batch. |
| $\mathbf{x}^{(i)}$ | "equis superindice i" o "equis i-esima" | La $i$-esima imagen del mini-batch. |
| $\sum_{i=1}^{n}$ | "sumatorio de $i$ igual 1 a $n$" | Sumar el valor para cada imagen del batch. |
| $\frac{1}{n} \sum$ | "uno sobre ene por la suma" | El **promedio** aritmetico sobre el batch. |

### Aproximacion Monte Carlo del termino de reconstruccion (Ecuacion 5)

El enunciado indica que el termino de reconstruccion se debe aproximar con una sola muestra:

$$-\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right] \;\approx\; -\log p_\theta(\mathbf{x} \mid \mathbf{z}^{(1)})$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $\mathbf{z}^{(1)}$ | "zeta superindice uno" | Una unica muestra de $\mathbf{z}$ obtenida de $q_\phi(\mathbf{z} \mid \mathbf{x})$ usando el truco de reparametrizacion. |
| $\approx$ | "aproximadamente igual a" | La esperanza se reemplaza por el valor en una sola muestra. Es una estimacion ruidosa pero insesgada. |

**Por que una sola muestra es suficiente:** aunque una muestra da una estimacion ruidosa, al promediar sobre muchos mini-batches durante el entrenamiento, los gradientes convergen igualmente. Es el mismo principio por el que SGD (descenso de gradiente estocastico) funciona con mini-batches en vez de necesitar todo el dataset.

### Que debe devolver la funcion

La funcion debe devolver **tres valores**, todos promediados sobre el batch:
1. **nelbo**: el ELBO negativo promedio
2. **kl**: la divergencia KL promedio
3. **rec**: la perdida de reconstruccion promedio

---

## Apartado (c): Entrenar el VAE [3 puntos, codigo]

**Que te piden:** entrenar el modelo ejecutando los scripts proporcionados y verificar que los resultados son correctos.

**Comandos:**
- `python main.py --model vae --train` para entrenar (o con `--device gpu`)
- `python grader.py 1c-0-basic` para verificar los valores
- `python main.py --model vae` para generar muestras visuales

**Que produce el entrenamiento:**
- 20,000 iteraciones (~7 minutos)
- Reporta tres metricas en un subset de test: NELBO promedio, KL promedio, reconstruccion promedio
- Los valores se guardan en `submission/VAE.pkl`

**Referencia:** el NELBO en el test subset deberia estar alrededor de 100.

---

## Apartado (d): El $\beta$-VAE [3 puntos, escrito]

**Que te piden:** dar una interpretacion intuitiva del parametro $\beta$ en el $\beta$-VAE.

### El objetivo del $\beta$-VAE (Ecuacion 6)

$$\mathbb{E}_{q_\phi(\mathbf{z}|\mathbf{x})}\!\left[\log p_\theta(\mathbf{x} \mid \mathbf{z})\right] - \beta\, D_\text{KL}\!\left(q_\phi(\mathbf{z} \mid \mathbf{x}) \;\|\; p(\mathbf{z})\right)$$

| Simbolo | Como se lee | Que significa |
|---------|-------------|---------------|
| $\beta$ | "beta" (letra griega) | Un **hiperparametro** (numero real positivo) que controla el peso relativo del termino KL respecto al termino de reconstruccion. |
| $\beta \cdot D_\text{KL}(\cdots)$ | "beta por de-ka-ele de..." | La divergencia KL multiplicada por $\beta$. Si $\beta > 1$, el termino KL pesa mas. Si $\beta < 1$, pesa menos. |

**Lo que pide la pregunta concretamente:**
1. Que pasa cuando $\beta = 1$?
2. Que pasa cuando $\beta$ se incrementa por encima de 1?
3. Basta con una descripcion cualitativa (no hace falta formula ni demostracion).

---

### Solucion:

Beta balancea la importancia que se da a la reconstruccion del dato frente a la distribucion normal de los datos.
Cuanto mas alto mas se parece el espacio latente a la gaussiana Normal y menos se parece a los datos de entrenamiento y cuanto mas bajo mas se parece a los datos pero el espacio latente queda menos estructurado
Cuando Beta es 1 no afecta a la ecuacion y pasa a ser una VAE normal

$q_\phi(\mathbf{z} \mid \mathbf{x})$

---

## Resumen de toda la notacion del ejercicio

### Distribuciones y modelos

| Notacion | Nombre | Descripcion |
|----------|--------|-------------|
| $p(\mathbf{z}) = \mathcal{N}(\mathbf{z} \mid \mathbf{0}, I)$ | Prior | Distribucion previa sobre $\mathbf{z}$. Gaussiana estandar. |
| $p_\theta(\mathbf{x} \mid \mathbf{z}) = \text{Bern}(\mathbf{x} \mid f_\theta(\mathbf{z}))$ | Decoder / Likelihood | Probabilidad de la imagen dado $\mathbf{z}$. Red neuronal + Bernoulli. |
| $p_\theta(\mathbf{x}) = \int p(\mathbf{z})\, p_\theta(\mathbf{x} \mid \mathbf{z})\, d\mathbf{z}$ | Verosimilitud marginal | Probabilidad total de la imagen. Intratable. |
| $q_\phi(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}(\mathbf{z} \mid \mu_\phi, \text{diag}(\sigma_\phi^2))$ | Encoder / Posterior aproximada | Aproximacion a la posterior verdadera. Red neuronal que da $\mu$ y $\sigma^2$. |
| $p(\mathbf{z} \mid \mathbf{x})$ | Posterior verdadera | La distribucion real de $\mathbf{z}$ dado $\mathbf{x}$. No se puede calcular. |

### Funciones y cantidades

| Notacion | Nombre | Descripcion |
|----------|--------|-------------|
| $f_\theta(\mathbf{z})$ | Red decoder | Toma $\mathbf{z}$ y produce los logits de los $d$ pixeles. |
| $\mu_\phi(\mathbf{x})$ | Media del encoder | Vector de $k$ dimensiones: el centro predicho por el encoder. |
| $\sigma_\phi^2(\mathbf{x})$ | Varianza del encoder | Vector de $k$ dimensiones: la incertidumbre predicha por el encoder. |
| $\text{ELBO}(\mathbf{x};\, \theta, \phi)$ | Evidence Lower Bound | Cota inferior de $\log p(\mathbf{x})$. Lo que se optimiza en la practica. |
| $D_\text{KL}(q \| p)$ | Divergencia KL | Mide la "distancia" (asimetrica) entre dos distribuciones. |
| $\mathbb{E}_{q}[\cdots]$ | Esperanza bajo $q$ | Valor medio de la expresion cuando $\mathbf{z} \sim q$. |
| $\log$ | Logaritmo natural | Base $e$ (no base 10). Muy usado en probabilidad porque convierte productos en sumas. |

### Parametros

| Simbolo | Que parametriza |
|---------|-----------------|
| $\theta$ | El decoder (red neuronal que va de $\mathbf{z}$ a $\mathbf{x}$) |
| $\phi$ | El encoder (red neuronal que va de $\mathbf{x}$ a $\mathbf{z}$) |
| $\beta$ | Peso del termino KL en el $\beta$-VAE (hiperparametro, no se aprende) |

### Subindices y superindices comunes

| Notacion | Significado |
|----------|-------------|
| $\mathbf{x}^{(i)}$ | La $i$-esima imagen del mini-batch |
| $\mathbf{z}^{(1)}$ | Una muestra de $\mathbf{z}$ (el superindice indica que es la primera muestra) |
| $p_\theta$ | Distribucion parametrizada por $\theta$ |
| $q_\phi$ | Distribucion parametrizada por $\phi$ |

---

## Puntuacion

| Apartado | Tipo | Puntos |
|----------|------|--------|
| (a) | Codigo | 2 |
| (b) | Codigo | 3.5 |
| (c) | Codigo | 3 |
| (d) | Escrito | 3 |
| **Total** | | **11.5** |
