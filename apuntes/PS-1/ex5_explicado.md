# Problema 5: Integración Monte Carlo — Explicación del Enunciado

Este documento explica **qué significa cada parte del enunciado**, no cómo resolverlo.

---

## Frase 1

> *"A latent variable generative model specifies a joint probability distribution $p(x, z)$ between a set of observed variables $x \in \mathcal{X}$ and a set of latent variables $z \in \mathcal{Z}$."*

**Traducción:** Un modelo generativo con variables latentes define una distribución de probabilidad conjunta $p(x, z)$ entre variables observadas $x$ y variables latentes (ocultas) $z$.

### ¿Qué es una variable observada?

Es algo que **puedes medir o ver directamente**.

| Ejemplo | Variable observada $x$ |
|---------|------------------------|
| Reconocimiento de dígitos | Los píxeles de la imagen (784 números) |
| Diagnóstico médico | Síntomas: fiebre, tos, presión arterial |
| Recomendación de películas | Las calificaciones que dio el usuario |

### ¿Qué es una variable latente (oculta)?

Es algo que **existe y causa lo observado**, pero **no puedes medir directamente**.

| Ejemplo | Variable latente $z$ |
|---------|----------------------|
| Reconocimiento de dígitos | Qué dígito quiso escribir la persona (0-9) |
| Diagnóstico médico | La enfermedad real (gripe, COVID, etc.) |
| Recomendación de películas | Los gustos internos del usuario |

### ¿Qué significa $x \in \mathcal{X}$?

| Símbolo | Significado |
|---------|-------------|
| $x$ | Un valor específico de la variable observada |
| $\in$ | "pertenece a" o "es elemento de" |
| $\mathcal{X}$ | El espacio de todos los valores posibles de $x$ |

**Ejemplo:** Si $x$ es una imagen de 28×28 píxeles en escala de grises:
- $\mathcal{X} = [0, 255]^{784}$ — todas las combinaciones posibles de 784 píxeles
- $x \in \mathcal{X}$ significa "esta imagen específica es una imagen válida"

### ¿Qué es una distribución de probabilidad conjunta $p(x, z)$?

Es una función que asigna una probabilidad a **cada combinación** de $x$ y $z$.

**Ejemplo con dígitos:**

| | $z = 0$ | $z = 1$ | ... | $z = 9$ |
|---|---------|---------|-----|---------|
| $x = $ imagen_A | 0.001 | 0.0001 | ... | 0.0002 |
| $x = $ imagen_B | 0.0002 | 0.002 | ... | 0.0001 |

$p(x = \text{imagen\_A}, z = 7) = $ "probabilidad de ver imagen_A **y** que sea un 7"

---

## Frase 2

> *"From the definition of conditional probability, we can express the joint distribution as $p(x, z) = p(z)p(x | z)$."*

**Traducción:** Por la definición de probabilidad condicional, podemos escribir la distribución conjunta como el producto de $p(z)$ y $p(x|z)$.

### ¿Qué es $p(z)$? — El Prior

Es la probabilidad de $z$ **antes de observar nada**.

**Ejemplo:** Si $z$ es el dígito que alguien va a escribir:
- $p(z = 0) = 0.10$ — "10% de probabilidad de que escriba un 0"
- $p(z = 7) = 0.10$ — "10% de probabilidad de que escriba un 7"

Se llama **prior** (a priori) porque es lo que creemos **antes** de ver los datos.

### ¿Qué es $p(x | z)$? — El Likelihood

Es la probabilidad de observar $x$ **dado que** $z$ ya ocurrió.

| Símbolo | Significado |
|---------|-------------|
| $p(x \| z)$ | Probabilidad de $x$ **condicionada** en $z$ |
| $\|$ | "dado que" o "sabiendo que" |

**Ejemplo:**
- $p(\text{imagen\_A} | z = 7)$ = "¿Qué tan probable es esta imagen si sabemos que es un 7?"

Se llama **likelihood** (verosimilitud) porque mide qué tan "verosímil" es ver $x$ si $z$ es verdad.

### ¿Por qué $p(x, z) = p(z) \cdot p(x | z)$?

Es la **regla del producto** de probabilidad:

$$P(\text{A y B}) = P(\text{A}) \times P(\text{B dado A})$$

**Ejemplo numérico:**
- $p(z = 7) = 0.10$ (10% escriben un 7)
- $p(\text{imagen\_A} | z = 7) = 0.001$ (entre los 7s, 0.1% se ven así)
- $p(\text{imagen\_A}, z = 7) = 0.10 \times 0.001 = 0.0001$

---

## Frase 3

> *"Here, $p(z)$ is referred to as the prior distribution over $z$ and $p(x | z)$ is the likelihood of the observed data given the latent variables."*

**Traducción:** Aquí, $p(z)$ se llama la distribución **prior** sobre $z$, y $p(x|z)$ es el **likelihood** de los datos observados dados los valores de las variables latentes.

Esta frase solo nombra los términos que ya explicamos arriba.

---

## Frase 4

> *"One natural objective for learning a latent variable model is to maximize the marginal likelihood of the observed data given by:"*
>
> $$p(x) = \int_z p(x, z) \, dz \tag{12}$$

**Traducción:** Un objetivo natural para entrenar un modelo con variables latentes es maximizar la verosimilitud marginal de los datos observados.

### ¿Qué es la verosimilitud marginal $p(x)$?

Es la probabilidad de observar $x$ **considerando todas las posibles $z$**.

"Marginal" viene de **marginalizar**: eliminar una variable sumando (o integrando) sobre todos sus valores posibles.

### ¿Qué significa $\int_z$?

| Símbolo | Significado |
|---------|-------------|
| $\int$ | Integral — una "suma continua" |
| $\int_z$ | Integrar sobre todos los valores posibles de $z$ |
| $dz$ | Indica que integramos respecto a $z$ |

### Caso discreto vs continuo

**Si $z$ es discreta** (como dígitos 0-9), la integral se convierte en suma:

$$p(x) = \sum_{z=0}^{9} p(x, z) = \sum_{z=0}^{9} p(z) \cdot p(x | z)$$

**Ejemplo numérico:**
```
p(imagen_A) = p(z=0)·p(img|0) + p(z=1)·p(img|1) + ... + p(z=9)·p(img|9)
            = 0.1·0.0001 + 0.1·0.0002 + ... + 0.1·0.001 + ...
            = 0.00015  (algún número)
```

**Si $z$ es continua** (como un vector de números reales), usamos integral:

$$p(x) = \int_{-\infty}^{\infty} p(x, z) \, dz$$

### ¿Por qué queremos maximizar $p(x)$?

**Maximum Likelihood Estimation (MLE):** Queremos encontrar los parámetros del modelo que hacen que los datos observados sean lo más probables posible.

Si tenemos datos $x_1, x_2, ..., x_N$, queremos maximizar:

$$\prod_{i=1}^{N} p(x_i) \quad \text{o equivalentemente} \quad \sum_{i=1}^{N} \log p(x_i)$$

---

## Frase 5

> *"When $z$ is high dimensional, evaluation of the marginal likelihood is computationally intractable even if we can tractably evaluate the prior and the conditional likelihood for any given $x$ and $z$."*

**Traducción:** Cuando $z$ tiene muchas dimensiones, calcular la verosimilitud marginal es computacionalmente intratable, incluso si podemos evaluar fácilmente el prior y el likelihood para cualquier $x$ y $z$ específicos.

### ¿Qué significa "high dimensional" (alta dimensionalidad)?

Que $z$ tiene muchos componentes.

| Dimensión de $z$ | Ejemplo |
|------------------|---------|
| Baja (1-10) | $z = (\text{dígito})$ — solo 10 valores |
| Alta (100+) | $z = (z_1, z_2, ..., z_{100})$ — vector de 100 números |

### ¿Por qué es intratable la integral?

**Problema:** Si $z$ tiene $d$ dimensiones y cada una tiene $k$ valores, hay $k^d$ combinaciones.

| Dimensiones | Valores por dim | Total de combinaciones |
|-------------|-----------------|------------------------|
| 2 | 100 | 10,000 |
| 10 | 100 | $10^{20}$ |
| 100 | 100 | $10^{200}$ |

Con 100 dimensiones, **no hay computador que pueda sumar $10^{200}$ términos**.

### ¿Qué significa "tractable" vs "intractable"?

| Término | Significado |
|---------|-------------|
| **Tractable** | Se puede calcular en tiempo razonable |
| **Intractable** | Imposible de calcular exactamente (tomaría años/siglos) |

La frase dice: "Podemos calcular $p(z)$ y $p(x|z)$ fácilmente para valores específicos, pero sumar sobre TODOS los $z$ posibles es imposible."

---

## Frase 6

> *"We can however use Monte Carlo to estimate the above integral. To do so, we sample $k$ samples from the prior $p(z)$ and our estimate is given as:"*
>
> $$A(z^{(1)}, ..., z^{(k)}) = \frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)}), \text{ where } z^{(i)} \sim p(z) \tag{13}$$

**Traducción:** Sin embargo, podemos usar Monte Carlo para **estimar** la integral. Tomamos $k$ muestras del prior $p(z)$ y nuestro estimador es el promedio de los likelihoods.

### ¿Qué es Monte Carlo?

Es una técnica para **aproximar** cálculos difíciles usando **muestras aleatorias**.

**Analogía:** Para estimar el área de un lago irregular:
1. Lanza 1000 dardos aleatorios sobre un mapa
2. Cuenta cuántos cayeron en el lago (digamos 230)
3. Estima: área del lago ≈ 23% del área total del mapa

### ¿Qué significa $z^{(i)} \sim p(z)$?

| Símbolo | Significado |
|---------|-------------|
| $z^{(i)}$ | La $i$-ésima muestra de $z$ |
| $\sim$ | "se muestrea de" o "se distribuye según" |
| $p(z)$ | La distribución de donde sacamos muestras |

**Ejemplo:** Si $p(z)$ es una Gaussiana estándar, podríamos obtener:
- $z^{(1)} = 0.52$
- $z^{(2)} = -1.34$
- $z^{(3)} = 0.87$
- ...

### ¿Qué es $\sum_{i=1}^{k}$?

Es el **sumatorio** — suma desde $i=1$ hasta $i=k$:

$$\sum_{i=1}^{k} a_i = a_1 + a_2 + a_3 + ... + a_k$$

### ¿Qué es $\frac{1}{k} \sum_{i=1}^{k}$?

Es el **promedio** de $k$ valores:

$$\frac{1}{k} \sum_{i=1}^{k} a_i = \frac{a_1 + a_2 + ... + a_k}{k}$$

### ¿Qué calcula $A$?

El estimador $A$ calcula el **promedio de los likelihoods** $p(x | z^{(i)})$ sobre $k$ muestras aleatorias.

### Ejemplo concreto con $k = 3$

Supongamos que queremos estimar $p(\text{imagen\_A})$ y $z$ es continua.

**Paso 1:** Muestrear 3 valores de $z$ del prior:
- $z^{(1)} = 0.5$
- $z^{(2)} = -0.3$
- $z^{(3)} = 1.2$

**Paso 2:** Calcular el likelihood para cada muestra:
- $p(\text{imagen\_A} | z^{(1)} = 0.5) = 0.02$
- $p(\text{imagen\_A} | z^{(2)} = -0.3) = 0.01$
- $p(\text{imagen\_A} | z^{(3)} = 1.2) = 0.03$

**Paso 3:** Promediar:

$$A = \frac{1}{3}(0.02 + 0.01 + 0.03) = \frac{0.06}{3} = 0.02$$

**Conclusión:** Estimamos que $p(\text{imagen\_A}) \approx 0.02$

---

## Parte (a)

> *"An estimator $\hat{\theta}$ is an unbiased estimator of $\theta$ if and only if $\mathbb{E}[\hat{\theta}] = \theta$. Show that $A$ is an unbiased estimator of $p(x)$."*

**Traducción:** Un estimador $\hat{\theta}$ es **insesgado** si y solo si su valor esperado es igual al valor verdadero. Demuestra que $A$ es un estimador insesgado de $p(x)$.

### ¿Qué es un estimador?

Es una **aproximación calculable** de algo que no podemos calcular exactamente.

| Lo que queremos | El estimador |
|-----------------|--------------|
| $p(x)$ (intratable) | $A$ (calculable) |
| Altura promedio de toda la población | Promedio de 100 personas medidas |

### ¿Qué significa $\hat{\theta}$ (theta con sombrero)?

El "sombrero" indica que es una **estimación** o **aproximación** del valor verdadero $\theta$.

| Símbolo | Significado |
|---------|-------------|
| $\theta$ | Valor verdadero (desconocido o intratable) |
| $\hat{\theta}$ | Estimación de $\theta$ |

### ¿Qué es $\mathbb{E}[\cdot]$? — El valor esperado

Es el **promedio a largo plazo** si repitiéramos el experimento infinitas veces.

**Ejemplo:** Si lanzas un dado muchas veces:
- $\mathbb{E}[\text{resultado}] = \frac{1+2+3+4+5+6}{6} = 3.5$

No obtienes 3.5 en ningún lanzamiento individual, pero es el promedio de muchos lanzamientos.

### ¿Qué significa "unbiased" (insesgado)?

Que **en promedio**, el estimador da el valor correcto.

$$\mathbb{E}[\hat{\theta}] = \theta$$

**Ejemplo:**
- $\theta = $ altura promedio real = 170 cm
- $\hat{\theta} = $ promedio de 10 personas = 168 cm (una muestra específica)
- Si repetimos con muchas muestras diferentes, $\mathbb{E}[\hat{\theta}] = 170$ cm

Un estimador **sesgado** sistemáticamente sobreestima o subestima.

### ¿Qué pide la parte (a)?

Demostrar que:

$$\mathbb{E}[A] = p(x)$$

Es decir, que si repitieras el proceso de Monte Carlo muchas veces (con diferentes muestras $z^{(i)}$), **en promedio** obtendrías el valor exacto de $p(x)$.

---

## Parte (b)

> *"Is $\log A$ an unbiased estimator of $\log p(x)$? Prove why or why not."*
>
> *"Hint: The proof is short, estimator of $p(x)$ using the definition of an unbiased estimator and Jensen's Inequality"*

**Traducción:** ¿Es $\log A$ un estimador insesgado de $\log p(x)$? Demuestra por qué sí o por qué no.

### ¿Por qué nos importa $\log p(x)$?

En machine learning, típicamente maximizamos la **log-verosimilitud** en lugar de la verosimilitud:

$$\log p(x_1, x_2, ..., x_N) = \sum_{i=1}^{N} \log p(x_i)$$

Esto convierte productos en sumas, lo cual es numéricamente más estable.

### ¿Qué es el logaritmo $\log$?

Es la función inversa de la exponencial. Si $e^y = x$, entonces $\log x = y$.

| $x$ | $\log x$ (natural) |
|-----|-------------------|
| 1 | 0 |
| 2.718... ($e$) | 1 |
| 10 | 2.303 |
| 0.5 | -0.693 |

**Propiedades clave:**
- $\log(a \cdot b) = \log a + \log b$ — convierte productos en sumas
- $\log$ es una función **cóncava** (curva hacia abajo)

### ¿Qué es la Desigualdad de Jensen?

Para una función **cóncava** $f$ (como $\log$):

$$f(\mathbb{E}[X]) \geq \mathbb{E}[f(X)]$$

**En palabras:** "La función del promedio es mayor o igual que el promedio de la función."

**Para el logaritmo:**

$$\log(\mathbb{E}[X]) \geq \mathbb{E}[\log X]$$

### ¿Por qué es relevante aquí?

Si $A$ es insesgado para $p(x)$, entonces $\mathbb{E}[A] = p(x)$.

Por Jensen:
$$\log(\mathbb{E}[A]) \geq \mathbb{E}[\log A]$$
$$\log(p(x)) \geq \mathbb{E}[\log A]$$

Esto sugiere que $\mathbb{E}[\log A] \neq \log p(x)$ en general (hay desigualdad, no igualdad).

### ¿Qué pide la parte (b)?

Demostrar formalmente si:

$$\mathbb{E}[\log A] = \log p(x) \quad \text{¿Verdadero o falso?}$$

La pista sugiere usar Jensen para mostrar que **no es igual** (el logaritmo introduce sesgo).

---

## Resumen visual del problema

```
┌───────────────────────────────────────────────────────────────────┐
│  QUEREMOS CALCULAR: p(x) = ∫ p(x,z) dz                            │
│                            ↑                                      │
│                     Integral intratable                           │
│                            │                                      │
│                            ▼                                      │
│  APROXIMAMOS CON: A = (1/k) Σ p(x|z⁽ⁱ⁾)                           │
│                              donde z⁽ⁱ⁾ ~ p(z)                    │
│                                                                   │
│  PREGUNTAS:                                                       │
│  (a) ¿𝔼[A] = p(x)?        → ¿A es insesgado para p(x)?            │
│  (b) ¿𝔼[log A] = log p(x)? → ¿log A es insesgado para log p(x)?   │
└───────────────────────────────────────────────────────────────────┘
```

---

## Conceptos adicionales

### Diferencia entre $p(x)$ y $p(x|z)$

| Expresión | Nombre | ¿Qué mide? |
|-----------|--------|------------|
| $p(x)$ | Marginal | Prob. de $x$ considerando todas las $z$ posibles |
| $p(x \| z)$ | Likelihood condicional | Prob. de $x$ dado un $z$ específico |

### ¿Por qué funciona Monte Carlo?

La integral que queremos es:

$$p(x) = \int_z p(z) \cdot p(x|z) \, dz = \mathbb{E}_{z \sim p(z)}[p(x|z)]$$

Monte Carlo aproxima esta esperanza con un promedio de muestras:

$$\mathbb{E}_{z \sim p(z)}[p(x|z)] \approx \frac{1}{k} \sum_{i=1}^{k} p(x|z^{(i)})$$

Por la **Ley de los Grandes Números**, cuando $k \to \infty$, el promedio converge al valor esperado.

### Varianza del estimador

Aunque $A$ sea insesgado, **cada estimación individual puede estar lejos** del valor verdadero. La **varianza** mide cuánto varían las estimaciones:

- **Alta varianza:** Las estimaciones saltan mucho (poco confiables)
- **Baja varianza:** Las estimaciones son consistentes

Aumentar $k$ (más muestras) reduce la varianza.
