# Metodos de Monte Carlo

## Intuicion: Que problema resuelve?

Muchas cantidades en modelos generativos involucran integrales o esperanzas que no se pueden calcular de forma cerrada. Por ejemplo: la verosimilitud marginal $p(x) = \int p(x,z) dz$ en un VAE, o la esperanza de una funcion bajo una distribucion complicada. Los metodos de Monte Carlo aproximan estas cantidades usando **muestras aleatorias**.

## Analogia

Imagina que quieres estimar el area de un lago en un mapa. No tienes una formula geometrica porque la forma es irregular. Pero puedes lanzar dardos al azar sobre el mapa y contar que fraccion cae dentro del lago. Cuantos mas dardos lances, mejor sera tu estimacion. Eso es Monte Carlo: usar aleatoriedad para aproximar cantidades deterministas.

## Construyendo la idea paso a paso

### Paso 1: El estimador Monte Carlo basico

$$
\mathbb{E}_{x \sim p}[f(x)] \approx \frac{1}{N} \sum_{i=1}^{N} f(x^{(i)}), \quad x^{(i)} \sim p(x)
$$

**Como leerla:** "La esperanza de f(x) cuando x sigue la distribucion p se aproxima como el promedio de f evaluada en N muestras sacadas de p."

**Que significa:** En vez de calcular la integral exacta, sacamos N muestras de p, evaluamos f en cada una, y promediamos. Es la version continua de "probar muchas veces y sacar la media."

### Paso 2: Propiedades del estimador

El estimador Monte Carlo $\hat{\mu} = \frac{1}{N}\sum_{i=1}^N f(x^{(i)})$ tiene propiedades muy buenas:

| Propiedad | Significado |
|-----------|-------------|
| Insesgado | $\mathbb{E}[\hat{\mu}] = \mu$ (en promedio, da el valor correcto) |
| Varianza $O(1/N)$ | La varianza decrece como $\text{Var}(f)/N$; duplicar N reduce la varianza a la mitad |
| Convergencia | Por la ley de grandes numeros: $\hat{\mu} \to \mu$ cuando $N \to \infty$ |
| Independiente de dimension | La tasa $O(1/N)$ no depende de la dimensionalidad de x |

La ultima propiedad es crucial: para integrales en espacios de alta dimension, los metodos de cuadratura clasicos escalan exponencialmente, pero Monte Carlo mantiene $O(1/N)$ sin importar la dimension.

### Paso 3: Importance Sampling

Que pasa si no podemos muestrear directamente de p? O si hacerlo es ineficiente porque la mayor parte de las muestras caen en regiones donde f(x) es pequena?

La idea: muestrear de una distribucion **propuesta** q y corregir con pesos:

$$
\mathbb{E}_{x \sim p}[f(x)] = \mathbb{E}_{x \sim q}\left[f(x) \frac{p(x)}{q(x)}\right] \approx \frac{1}{N}\sum_{i=1}^{N} f(x^{(i)}) \frac{p(x^{(i)})}{q(x^{(i)})}, \quad x^{(i)} \sim q(x)
$$

**Como leerla:** "La esperanza bajo p se puede reescribir como una esperanza bajo q del producto de f(x) por el cociente p(x)/q(x). Se aproxima promediando sobre muestras de q."

**Que significa cada parte:**

| Parte | Significado |
|-------|-------------|
| $q(x)$ | La distribucion propuesta, de la que SI sabemos muestrear |
| $w(x) = p(x)/q(x)$ | El **peso de importancia**: corrige el sesgo de usar q en vez de p |
| $f(x) \cdot w(x)$ | La funcion ponderada: cada muestra contribuye segun lo "sorprendente" que es bajo p vs q |

**Cuando funciona bien:** Si q se parece a p (especialmente en las regiones donde $|f(x)| \cdot p(x)$ es grande), los pesos son cercanos a 1 y la varianza es baja.

**Cuando funciona mal:** Si q y p son muy diferentes, algunos pesos seran enormes y otros casi cero. Unas pocas muestras dominan la estimacion, haciendo la varianza altisima.

### Paso 4: Ejemplo numerico

Queremos estimar $\mathbb{E}_{x \sim \mathcal{N}(0,1)}[x^2]$. La respuesta exacta es 1 (la varianza de una normal estandar).

```
N=10 muestras:  x = [-0.3, 1.2, 0.5, -0.8, 0.1, -1.5, 0.7, 0.3, -0.6, 1.1]
x^2 =           [0.09, 1.44, 0.25, 0.64, 0.01, 2.25, 0.49, 0.09, 0.36, 1.21]
Promedio = 0.683   (lejos del 1 real)

N=100 muestras:   Promedio ≈ 0.95
N=1000 muestras:  Promedio ≈ 1.01
N=10000 muestras: Promedio ≈ 0.998
```

A medida que N crece, la estimacion converge al valor real. Con pocas muestras, la estimacion puede estar bastante lejos.

### Paso 5: Conexion con el curso

Los metodos de Monte Carlo aparecen en casi todos los modelos del curso:

| Modelo / Concepto | Donde aparece Monte Carlo |
|-------------------|---------------------------|
| **VAE (ELBO)** | La esperanza en el ELBO se estima con k muestras de q(z\|x). Normalmente k=1. |
| **IWAE** | Importance weighted autoencoder: usa m muestras con importance sampling para una cota mas apretada que el ELBO. |
| **Difusion** | Durante el entrenamiento, se muestrea un timestep t aleatorio (MC sobre timesteps) y un ruido epsilon aleatorio. |
| **GANs** | La esperanza sobre datos reales y generados se estima con minibatches. |
| **Score matching** | La esperanza sobre datos perturbados se aproxima con muestras. |

## Propiedades clave

| Propiedad | Detalle |
|-----------|---------|
| Insesgado | El estimador MC basico y el de importance sampling son insesgados |
| Tasa de convergencia | $O(1/\sqrt{N})$ para el error estandar (independiente de la dimension) |
| Variance reduction | Importance sampling puede reducir o aumentar la varianza segun la eleccion de q |
| Ley de grandes numeros | Garantiza convergencia casi segura cuando N tiende a infinito |
| Teorema central del limite | La distribucion del estimador es aproximadamente normal para N grande |

### Paso 6: Monte Carlo y SGD (mini-batches como estimador MC)

El gradiente exacto de la log-verosimilitud sobre todo el dataset es:

$$\nabla_\theta \ell(\theta) = \sum_{j=1}^{m} \nabla_\theta \log p_\theta(\mathbf{x}^{(j)})$$

Con $m$ grande (millones de datos), esto es caro. SGD lo aproxima con un **mini-batch** de $B$ muestras:

$$\nabla_\theta \ell(\theta) \approx m \cdot \frac{1}{B} \sum_{j=1}^{B} \nabla_\theta \log p_\theta(\mathbf{x}^{(j)}), \quad \mathbf{x}^{(j)} \sim \mathcal{D}$$

Esto es exactamente un estimador Monte Carlo: muestreamos $B$ datos del dataset, evaluamos el gradiente en cada uno, y promediamos. Es insesgado (en esperanza da el gradiente real) y su varianza decrece como $O(1/B)$. Por eso mini-batches mas grandes dan gradientes mas estables.

**Conexion con el Paso 2:** Las propiedades del estimador MC (insesgadez, varianza $O(1/N)$) son exactamente lo que hace que SGD funcione: no necesitamos gradientes exactos, solo gradientes que en promedio apunten en la direccion correcta.

## Pregunta socratica

En el VAE usamos k=1 (una sola muestra) para estimar el ELBO. Eso deberia dar una varianza altisima... por que funciona a pesar de todo?

(Pista: piensa en que papel juega el **minibatch** y la **optimizacion estocastica** (SGD). No necesitamos que cada estimacion individual sea precisa. Necesitamos que el gradiente apunte, en promedio, en la direccion correcta.)

---

**Cross-links:** [vae.md](vae.md) | [MLE-Maximum-Likelihood-Estimation.md](MLE-Maximum-Likelihood-Estimation.md)
