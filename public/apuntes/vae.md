# Autoencoders Variacionales (VAE)

## Guia de simbolos rapida

Antes de empezar, aqui tienes una tabla con los simbolos que vas a ver una y otra vez. Vuelve aqui siempre que te pierdas.

| Simbolo | Que es | Como se lee |
|---------|--------|-------------|
| **x** | Los datos que observamos (ej: una imagen) | "equis" |
| **z** | Las variables latentes (ocultas, no las vemos) | "zeta" |
| **p(x)** | Probabilidad de observar x | "pe de equis" |
| **p(z)** | Probabilidad del vector latente z | "pe de zeta" |
| **p(x\|z)** | Probabilidad de x dado que sabemos z | "pe de equis dado zeta" |
| **p(z\|x)** | Probabilidad de z dado que observamos x (posterior) | "pe de zeta dado equis" |
| **q(z\|x)** | Aproximacion a p(z\|x) (porque la real es imposible de calcular) | "cu de zeta dado equis" |
| **theta (θ)** | Parametros del modelo generativo (el decodificador) | "zeta" |
| **phi (φ)** | Parametros de la red de inferencia (el codificador) | "fi" |
| **lambda (λ)** | Parametros de la distribucion variacional | "lambda" |
| **E[...]** | Valor esperado (el promedio teorico) | "esperanza de..." |
| **log** | Logaritmo (normalmente natural, base e) | "logaritmo" |
| **integral ∫** | Suma continua sobre todos los valores posibles | "integral" |
| **KL(q \|\| p)** | Divergencia KL: mide lo "diferentes" que son dos distribuciones | "ka-ele de cu con pe" |
| **N(μ, σ²)** | Distribucion normal (gaussiana) con media μ y varianza σ² | "normal de mu, sigma cuadrado" |
| **∇** | Gradiente: la direccion en la que una funcion crece mas rapido | "nabla" o "gradiente" |
| **argmax** | El valor del parametro que maximiza algo | "arg-max" |
| **ε (epsilon)** | Ruido aleatorio auxiliar | "epsilon" |
| **D** | El dataset (conjunto de datos de entrenamiento) | "de" |
| **∼** | "se muestrea de" o "sigue la distribucion" | "se distribuye como" |
| **≥** | Mayor o igual que | "mayor o igual" |
| **:=** | Se define como | "se define como" |

---

## 1. La idea general: que es un VAE?

Imagina que tienes miles de fotos de caras. Cada cara es diferente, pero todas comparten "algo": tienen ojos, nariz, boca, un tono de piel, etc. Un **VAE** intenta descubrir esas **caracteristicas ocultas** (que llamamos **variables latentes**, el vector **z**) que explican como se generan las caras.

**Analogia sencilla:** Piensa en una fabrica de galletas. Tu ves las galletas (los datos **x**), pero no ves la receta ni los ajustes de la maquina (las variables latentes **z**). El VAE intenta:
1. **Codificador (encoder):** Dada una galleta, adivinar que ajustes de maquina la produjeron.
2. **Decodificador (decoder):** Dados unos ajustes de maquina, generar una galleta nueva.

---

## 2. El modelo: como se representa matematicamente

### 2.1 La distribucion conjunta

Un VAE es un **modelo de variables latentes dirigido**. Esto significa que asumimos que los datos se generan en dos pasos:

```
Paso 1: Elegir z (las caracteristicas ocultas)
Paso 2: Generar x a partir de z
```

Matematicamente, esto se escribe como:

$$
p_\theta(\mathbf{x}, \mathbf{z}) = p(\mathbf{x} | \mathbf{z}) \cdot p(\mathbf{z})
$$

**Como leerla:** "La probabilidad conjunta de x y z es igual a la probabilidad de x dado z, multiplicada por la probabilidad de z."

**Que significa cada parte:**

| Parte | Significado | Analogia |
|-------|-------------|----------|
| $p(\mathbf{z})$ | La **prior** (distribucion a priori): que tan probable es cada configuracion latente z antes de ver ningun dato | "Que tan probables son los diferentes ajustes de la maquina de galletas?" |
| $p(\mathbf{x} \| \mathbf{z})$ | La **verosimilitud**: si conozco z, que tan probable es generar este x concreto | "Si se la receta, que galleta sale?" |
| $p_\theta(\mathbf{x}, \mathbf{z})$ | La **conjunta**: la probabilidad de que ocurran z Y x juntos | "Que tan probable es esta combinacion de receta + galleta?" |

### 2.2 El proceso generativo

El proceso de generar datos nuevos es:

$$
\mathbf{z} \sim p(\mathbf{z})
$$

$$
\mathbf{x} \sim p(\mathbf{x} | \mathbf{z})
$$

**Como leerlo:**
- Linea 1: "z se muestrea de la distribucion p(z)" -- es decir, elegimos al azar unas caracteristicas latentes.
- Linea 2: "x se muestrea de p(x dado z)" -- dadas esas caracteristicas, generamos un dato.

**Ejemplo concreto:** Si z = [pelo rubio, ojos grandes, cara redonda], entonces p(x|z) genera una imagen de cara con esas caracteristicas.

### 2.3 VAE como "mezcla infinita de Gaussianas"

Una **mezcla de Gaussianas** (GMM) es el caso mas simple de modelo de variables latentes: z es categorica con K valores, y cada componente es una Gaussiana $p(x|z=k) = \mathcal{N}(\mu_k, \Sigma_k)$. La marginal es $p(x) = \sum_k p(z=k) \mathcal{N}(x; \mu_k, \Sigma_k)$.

Un VAE generaliza esto: z es **continua** ($z \sim \mathcal{N}(0, I)$), y cada valor de z produce una Gaussiana diferente via redes neuronales. La marginal se convierte en una integral: $p(x) = \int p(z) \mathcal{N}(x; \mu_\theta(z), \Sigma_\theta(z)) dz$. Es como una mezcla de **infinitas** Gaussianas, una por cada punto z del espacio latente. Esto hace que $p(x)$ sea mucho mas expresiva que un GMM con K finito.

---

## 3. El problema: por que necesitamos el ELBO?

### 3.1 Lo que queremos hacer

Queremos encontrar los parametros θ del modelo que mejor expliquen nuestros datos. Para eso, queremos **maximizar la verosimilitud marginal** (la probabilidad de los datos bajo nuestro modelo):

$$
\max_{\theta} \sum_{\mathbf{x} \in \mathcal{D}} \log p_\theta(\mathbf{x})
$$

**Como leerla:** "Encontrar el theta que maximice la suma, para cada dato x en el dataset D, del logaritmo de la probabilidad de x."

**Que significa:**
- $\sum_{\mathbf{x} \in \mathcal{D}}$ : sumamos sobre **todos** los datos de nuestro dataset
- $\log p_\theta(\mathbf{x})$ : el log de la probabilidad de cada dato individual
- $\max_\theta$ : queremos encontrar el θ que haga esta suma lo mas grande posible

### 3.2 El problema: la integral intratable

Pero para calcular $p_\theta(\mathbf{x})$ necesitamos integrar sobre **todas** las posibles z:

$$
p_\theta(\mathbf{x}) = \int p_\theta(\mathbf{x}, \mathbf{z}) \, d\mathbf{z}
$$

**Como leerla:** "La probabilidad de x es igual a la integral (la suma continua) de la probabilidad conjunta de x y z, sobre todos los posibles valores de z."

**Por que es un problema?** Imagina que z tiene 100 dimensiones. Tendriamos que sumar sobre **todas** las combinaciones posibles de esas 100 variables. Esto es computacionalmente **imposible** (intratable).

**Analogia:** Es como si para saber la probabilidad de que salga una galleta concreta, tuvieras que probar TODAS las posibles configuraciones de la maquina (infinitas) y sumar. Imposible.

### 3.3 Intento con Monte Carlo (y por que no funciona bien)

Podriamos intentar aproximar esa integral tomando muestras aleatorias:

$$
\log p(\mathbf{x}) \approx \log \frac{1}{k} \sum_{i=1}^{k} p(\mathbf{x} | \mathbf{z}^{(i)}) \quad \text{donde } \mathbf{z}^{(i)} \sim p(\mathbf{z})
$$

**Como leerla:** "Aproximamos el log de p(x) como el logaritmo de: un-k-esimo por la suma de p(x dado z-i) para k muestras de z sacadas de la prior."

**Por que no funciona bien:** Si z tiene muchas dimensiones, la gran mayoria de las z que sacamos al azar NO produciran nada parecido a x. Es como buscar una aguja en un pajar: muestreas millones de recetas al azar pero casi ninguna produce la galleta que quieres. La varianza de este estimador es altisima.

---

## 4. La solucion: el ELBO (Evidence Lower Bound)

### 4.1 La idea clave

Ya que no podemos calcular $\log p_\theta(\mathbf{x})$ directamente, vamos a construir un **limite inferior** (una cota que siempre esta por debajo) que SI podamos calcular y optimizar.

La idea es introducir una **distribucion auxiliar** $q_\lambda(\mathbf{z})$ que aproxime la posterior real $p(\mathbf{z}|\mathbf{x})$.

### 4.2 Derivacion del ELBO (paso a paso)

Partimos del log de la verosimilitud marginal y aplicamos un "truco" algebraico:

**Paso 1: Escribir la integral**

$$
\log p_\theta(\mathbf{x}) = \log \int p_\theta(\mathbf{x}, \mathbf{z}) \, d\mathbf{z}
$$

"El log de p(x) es el log de la integral de la conjunta p(x,z) sobre z."

**Paso 2: Multiplicar y dividir por q (truco!)**

$$
= \log \int \frac{q_\lambda(\mathbf{z})}{q_\lambda(\mathbf{z})} \cdot p_\theta(\mathbf{x}, \mathbf{z}) \, d\mathbf{z}
$$

Esto no cambia nada (es como multiplicar por 1), pero nos permite reescribir la expresion de forma util.

**Paso 3: Aplicar la desigualdad de Jensen**

$$
\geq \int q_\lambda(\mathbf{z}) \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\lambda(\mathbf{z})} \, d\mathbf{z}
$$

La **desigualdad de Jensen** dice que el log de un promedio es mayor o igual al promedio del log. Al aplicarla, el "=" se convierte en "≥" (mayor o igual).

**Importancia:** Esto significa que lo que nos queda a la derecha es un **limite inferior** de lo que queremos optimizar. Si hacemos grande este limite inferior, tambien empujamos hacia arriba la verosimilitud real.

**Paso 4: Reescribir como esperanza**

$$
= \mathbb{E}_{q_\lambda(\mathbf{z})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\lambda(\mathbf{z})} \right]
$$

**Como leerla:** "La esperanza, cuando z se muestrea de q-lambda, del logaritmo de p-theta de (x,z) dividido por q-lambda de z."

**Paso 5: Esto es el ELBO!**

$$
:= \text{ELBO}(\mathbf{x}; \theta, \lambda)
$$

**"Se define como ELBO de x, con parametros theta y lambda."**

### 4.3 Resumen visual del ELBO

```
log p(x)  >=  ELBO(x; θ, λ)
   ^              ^
   |              |
   |              Lo que SI podemos calcular
   |              y optimizar
   |
   Lo que queremos maximizar
   pero NO podemos calcular directamente
```

### 4.4 La brecha: que tan buena es nuestra aproximacion?

La diferencia entre $\log p_\theta(\mathbf{x})$ y el ELBO es exactamente la **divergencia KL** entre nuestra aproximacion $q_\lambda(\mathbf{z})$ y la posterior real $p_\theta(\mathbf{z}|\mathbf{x})$:

$$
\log p_\theta(\mathbf{x}) = \text{ELBO}(\mathbf{x}; \theta, \lambda) + D_{KL}(q_\lambda(\mathbf{z}) \| p_\theta(\mathbf{z} | \mathbf{x}))
$$

**Como leerla:** "El log de p de x es igual al ELBO mas la divergencia KL entre q y la posterior real."

**Que significa:**
- La divergencia KL siempre es ≥ 0.
- Si $q$ fuera exactamente igual a la posterior real, la KL seria 0 y el ELBO seria exactamente $\log p(\mathbf{x})$.
- Cuanto mejor sea nuestra aproximacion q, mas apretado (tight) sera el limite inferior.

---

## 5. Descomposicion del ELBO: las dos fuerzas

El ELBO se puede descomponer en dos terminos muy intuitivos:

$$
\text{ELBO}(\mathbf{x}; \theta, \lambda) = \underbrace{\mathbb{E}_{q_\lambda(\mathbf{z})}[\log p_\theta(\mathbf{x} | \mathbf{z})]}_{\text{Reconstruccion}} - \underbrace{D_{KL}(q_\lambda(\mathbf{z}) \| p(\mathbf{z}))}_{\text{Regularizacion}}
$$

**Como leerla:** "El ELBO es igual a la esperanza de log p(x dado z) bajo q, menos la divergencia KL entre q(z) y la prior p(z)."

### Termino 1: Reconstruccion

$$
\mathbb{E}_{q_\lambda(\mathbf{z})}[\log p_\theta(\mathbf{x} | \mathbf{z})]
$$

- **Que hace:** Mide lo bien que el decodificador reconstruye x a partir de z.
- **Analogia:** "Si codifico esta galleta como una receta (z) y luego uso esa receta para hacer una nueva galleta, se parece a la original?"
- **Queremos:** Que sea lo **mas grande** posible (buena reconstruccion).

### Termino 2: Regularizacion (KL)

$$
D_{KL}(q_\lambda(\mathbf{z}) \| p(\mathbf{z}))
$$

- **Que hace:** Penaliza la distribucion q(z) si se aleja mucho de la prior p(z).
- **Analogia:** "No dejes que las recetas codificadas sean demasiado raras o extremas; que se parezcan a recetas 'normales'."
- **Queremos:** Que sea lo **mas pequena** posible.

### El equilibrio

Hay una **tension** entre los dos terminos:
- Si solo optimizaras reconstruccion, q(z) podria ser una distribucion muy rara que "memoriza" cada dato.
- Si solo optimizaras la KL, q(z) seria exactamente la prior pero no reconstruiria nada.
- El ELBO encuentra el **equilibrio** entre ambos.

---

## 6. El objetivo de optimizacion

El objetivo completo del entrenamiento del VAE es:

$$
\max_{\theta} \sum_{\mathbf{x} \in \mathcal{D}} \max_{\lambda} \mathbb{E}_{q_\lambda(\mathbf{z})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\lambda(\mathbf{z})} \right]
$$

**Como leerla:** "Encontrar el theta que maximice la suma, sobre todos los datos x del dataset, del maximo sobre lambda de la esperanza bajo q del log del cociente p/q."

**En palabras simples:** Para cada dato x, encontramos la mejor aproximacion q (mejor lambda), y luego ajustamos el modelo (theta) para que el ELBO total sea lo mas grande posible.

---

## 7. Estimacion del ELBO con Monte Carlo

En la practica, no podemos calcular la esperanza exacta del ELBO, asi que la **aproximamos** con muestras:

$$
\text{ELBO} \approx \frac{1}{k} \sum_{i=1}^{k} \log \frac{p_\theta(\mathbf{x}, \mathbf{z}^{(i)})}{q_\lambda(\mathbf{z}^{(i)})} \quad \text{donde } \mathbf{z}^{(i)} \sim q_\lambda(\mathbf{z})
$$

**Como leerla:** "El ELBO se aproxima como el promedio de k muestras del log del cociente p/q, donde cada z-i se muestrea de q."

**Que significa cada parte:**
- $\frac{1}{k}$ : dividimos por k (hacemos un promedio)
- $\sum_{i=1}^{k}$ : sumamos k terminos
- $\mathbf{z}^{(i)} \sim q_\lambda(\mathbf{z})$ : las z se sacan de q (no de la prior p(z)), lo cual es mucho mas eficiente porque q esta "enfocada" en las z relevantes para este x concreto

**En la practica**, muchas veces se usa k=1 (una sola muestra!) y funciona sorprendentemente bien.

---

## 8. El problema del gradiente y el truco de reparametrizacion

### 8.1 El problema

Para entrenar el VAE con descenso por gradiente, necesitamos calcular el gradiente del ELBO respecto a los parametros λ (los del codificador). Pero el ELBO es una esperanza bajo $q_\lambda(\mathbf{z})$, y **lambda aparece en la distribucion de la que muestreamos**. No podemos simplemente "pasar el gradiente" por dentro.

### 8.2 Intento 1: el truco REINFORCE (alta varianza)

Una opcion es usar la identidad del log-derivada (truco REINFORCE):

$$
\nabla_\lambda \mathbb{E}_{q_\lambda(\mathbf{z})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\lambda(\mathbf{z})} \right] = \mathbb{E}_{q_\lambda(\mathbf{z})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\lambda(\mathbf{z})} \cdot \nabla_\lambda \log q_\lambda(\mathbf{z}) \right]
$$

**Como leerla:** "El gradiente respecto a lambda de la esperanza es igual a la esperanza del producto: (el log del cociente) por (el gradiente del log de q)."

**El problema:** Este estimador tiene **varianza muy alta** en la practica. Es decir, cada estimacion del gradiente puede ser muy diferente de la siguiente, lo que hace el entrenamiento inestable.

### 8.3 Intento 2: el truco de reparametrizacion (la solucion)

Esta es una de las **contribuciones clave** del paper del VAE. La idea es ingeniosa:

**En vez de muestrear directamente de q_λ(z), hacemos esto:**

**Paso 1:** Muestrear ruido de una distribucion fija (que no depende de λ):

$$
\boldsymbol{\varepsilon} \sim p(\boldsymbol{\varepsilon})
$$

"epsilon se muestrea de p(epsilon)" -- por ejemplo, una normal estandar N(0, I).

**Paso 2:** Transformar ese ruido usando una funcion determinista que SI depende de λ:

$$
\mathbf{z} = T(\boldsymbol{\varepsilon}; \lambda)
$$

"z es igual a T de epsilon con parametros lambda" -- una transformacion determinista del ruido.

**Ejemplo concreto** (cuando q es una gaussiana):

$$
\boldsymbol{\varepsilon} \sim \mathcal{N}(\mathbf{0}, \mathbf{I})
$$

$$
\mathbf{z} = \boldsymbol{\mu} + \boldsymbol{\sigma} \odot \boldsymbol{\varepsilon}
$$

Donde:
- $\boldsymbol{\varepsilon}$ : ruido aleatorio de una normal estandar (media 0, varianza 1)
- $\boldsymbol{\mu}$ : la media que predice el codificador (depende de λ)
- $\boldsymbol{\sigma}$ : la desviacion tipica que predice el codificador (depende de λ)
- $\odot$ : multiplicacion elemento a elemento

**Por que funciona?** Ahora toda la aleatoriedad esta en ε, que no depende de λ. El gradiente puede fluir a traves de la funcion T sin problemas:

$$
\nabla_\lambda \mathbb{E}_{q_\lambda(\mathbf{z})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\lambda(\mathbf{z})} \right] = \mathbb{E}_{p(\boldsymbol{\varepsilon})} \left[ \nabla_\lambda \log \frac{p_\theta(\mathbf{x}, T(\boldsymbol{\varepsilon}; \lambda))}{q_\lambda(T(\boldsymbol{\varepsilon}; \lambda))} \right]
$$

**Como leerla:** "El gradiente respecto a lambda de la esperanza bajo q es igual a la esperanza bajo p(epsilon) del gradiente respecto a lambda del log del cociente, donde z se ha reemplazado por T(epsilon; lambda)."

**La clave:** Ahora el gradiente $\nabla_\lambda$ esta **dentro** de la esperanza y opera sobre funciones deterministas de λ. Esto permite usar backpropagation normal.

**Analogia:** Es como si en vez de preguntar "como cambia el resultado si cambio la distribucion de la que muestreo" (dificil), preguntamos "como cambia el resultado si cambio la transformacion que le aplico al ruido" (facil, es una funcion diferenciable normal).

### 8.4 Comparación: estimador score function vs reparametrización

| Propiedad | Score function (REINFORCE) | Reparametrización |
|-----------|---------------------------|-------------------|
| Varianza del gradiente | **Alta** | **Baja** |
| Requiere q diferenciable | No (solo necesita $\log q$) | Sí (necesita $T$ diferenciable) |
| Aplicabilidad | Cualquier $q$ (incluso discreta) | Solo $q$ continuas con $T$ conocida |
| Usado en la práctica para VAEs | Raramente | **Siempre** |

La baja varianza del estimador de reparametrización es la razón por la que los VAEs funcionan bien en la práctica. Con REINFORCE, el entrenamiento sería extremadamente lento e inestable.

---

## 9. Arquitectura del VAE con redes neuronales

### 9.1 La prior p(z)

La distribucion a priori de las variables latentes se elige normalmente como una **normal estandar**:

$$
p(\mathbf{z}) = \mathcal{N}(\mathbf{z} | \mathbf{0}, \mathbf{I})
$$

**Como leerla:** "p de z es una distribucion normal con media cero e identidad como matriz de covarianza."

**Que significa:**
- $\mathbf{0}$ : vector de ceros (la media es cero en todas las dimensiones)
- $\mathbf{I}$ : la matriz identidad (cada dimension tiene varianza 1 y no hay correlaciones entre dimensiones)

**En palabras simples:** Asumimos que "antes de ver ningun dato", las variables latentes estan repartidas como una campana de Gauss centrada en cero.

### 9.2 El decodificador p(x|z) -- la red generativa

El decodificador es una **red neuronal** $g_\theta$ que toma z y produce los parametros de una distribucion sobre x:

$$
p_\theta(\mathbf{x} | \mathbf{z}) = p_\omega(\mathbf{x}) \quad \text{donde } \omega = g_\theta(\mathbf{z})
$$

**En el caso gaussiano:**

$$
p_\theta(\mathbf{x} | \mathbf{z}) = \mathcal{N}(\mathbf{x} | \mu_\theta(\mathbf{z}), \Sigma_\theta(\mathbf{z}))
$$

**Como leerla:** "p de x dado z es una normal con media mu-theta-de-z y covarianza sigma-theta-de-z."

**Que significa:**
- $\mu_\theta(\mathbf{z})$ : una red neuronal que recibe z y produce la **media** de la imagen reconstruida
- $\Sigma_\theta(\mathbf{z})$ : una red neuronal que recibe z y produce la **varianza** de cada pixel

**Analogia:** La red neuronal mira la receta (z) y dice: "esta galleta deberia tener mas o menos esta forma (media) con esta incertidumbre (varianza)."

### 9.3 El codificador q(z|x) -- la red de inferencia

El codificador es otra **red neuronal** $f_\phi$ que toma x y produce los parametros de q:

$$
q_\phi(\mathbf{z} | \mathbf{x}) = \mathcal{N}(\mathbf{z} | \mu_\phi(\mathbf{x}), \Sigma_\phi(\mathbf{x}))
$$

**Como leerla:** "q de z dado x es una normal con media mu-phi-de-x y covarianza sigma-phi-de-x."

**Que significa:**
- $\mu_\phi(\mathbf{x})$ : una red neuronal que recibe la imagen x y produce la **media** del vector latente
- $\Sigma_\phi(\mathbf{x})$ : una red neuronal que recibe la imagen x y produce la **varianza** del vector latente

**En la practica**, la covarianza se restringe a ser **diagonal** (cada dimension de z es independiente), lo que simplifica mucho el calculo.

**Parametros del truco de reparametrizacion para q gaussiana:**

$$
\lambda = (\boldsymbol{\mu}, \boldsymbol{\Sigma})
$$

$$
q_\lambda(\mathbf{z}) = \mathcal{N}(\mathbf{z} | \boldsymbol{\mu}, \boldsymbol{\Sigma})
$$

$$
p(\boldsymbol{\varepsilon}) = \mathcal{N}(\boldsymbol{\varepsilon} | \mathbf{0}, \mathbf{I})
$$

$$
T(\boldsymbol{\varepsilon}; \lambda) = \boldsymbol{\mu} + \boldsymbol{\Sigma}^{1/2} \boldsymbol{\varepsilon}
$$

**Como leer la ultima linea:** "T de epsilon con parametros lambda es igual a mu mas la raiz cuadrada de sigma por epsilon."

Donde $\Sigma^{1/2}$ es la **descomposicion de Cholesky** de Σ (piensa en ello como la "raiz cuadrada" de la matriz de covarianza).

---

## 10. Inferencia variacional amortizada

### 10.1 El problema de BBVI

El algoritmo basico (Black-Box Variational Inference) tiene un problema: para cada dato $\mathbf{x}^{(i)}$ del mini-batch, necesita ejecutar un bucle de optimizacion completo para encontrar el mejor λ. Esto es **muy lento**.

### 10.2 La solucion: amortizar con una red neuronal

La idea clave es: en vez de optimizar λ por separado para cada dato x, **aprendemos una funcion** que directamente predice λ a partir de x:

$$
f_\phi: \mathcal{X} \to \Lambda
$$

"f-phi es una funcion que va del espacio de datos X al espacio de parametros Lambda."

Esta funcion $f_\phi$ es el **codificador** (encoder), y es una red neuronal con parametros φ.

### 10.3 El ELBO amortizado

Con la inferencia amortizada, el ELBO se reescribe como:

$$
\text{ELBO}(\mathbf{x}; \theta, \phi) = \mathbb{E}_{q_\phi(\mathbf{z} | \mathbf{x})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} | \mathbf{x})} \right]
$$

**Como leerla:** "El ELBO de x con parametros theta y phi es la esperanza bajo q-phi-de-z-dado-x del log del cociente entre p-theta-de-x-z y q-phi-de-z-dado-x."

**Lo importante:** Ahora q depende de x a traves del codificador $f_\phi$, y phi se comparte entre todos los datos.

### 10.4 El entrenamiento final

Para cada mini-batch $\mathcal{B} = \{\mathbf{x}^{(1)}, \ldots, \mathbf{x}^{(m)}\}$, actualizamos **ambos** parametros a la vez:

$$
\phi \gets \phi + \tilde{\nabla}_\phi \sum_{\mathbf{x} \in \mathcal{B}} \text{ELBO}(\mathbf{x}; \theta, \phi)
$$

$$
\theta \gets \theta + \tilde{\nabla}_\theta \sum_{\mathbf{x} \in \mathcal{B}} \text{ELBO}(\mathbf{x}; \theta, \phi)
$$

**Como leerlas:**
- Linea 1: "phi se actualiza sumandole el gradiente estimado del ELBO respecto a phi" (actualizamos el codificador)
- Linea 2: "theta se actualiza sumandole el gradiente estimado del ELBO respecto a theta" (actualizamos el decodificador)

**En la practica esto es simplemente backpropagation!** Gracias al truco de reparametrizacion, los gradientes fluyen a traves de todo el sistema.

---

## 11. Diagrama completo del VAE

```
                    CODIFICADOR (encoder)               DECODIFICADOR (decoder)
                    Red neuronal f_φ                    Red neuronal g_θ

                    ┌─────────────┐                     ┌─────────────┐
                    │             │                     │             │
    Imagen x ──────►│  Produce    │──── μ, σ ──┐       │  Produce    │──────► Imagen
    (dato real)     │  μ_φ(x)    │             │       │  μ_θ(z)    │        reconstruida
                    │  σ_φ(x)    │         z = μ + σ·ε │  Σ_θ(z)    │
                    │             │             ▲       │             │
                    └─────────────┘             │       └─────────────┘
                                                │
                                          ε ~ N(0, I)
                                          (ruido aleatorio)

    ◄──────────────────────────── ELBO ────────────────────────────►

    Termino KL:                              Termino de reconstruccion:
    q_φ(z|x) no se aleje                    x reconstruido se
    mucho de N(0,I)                          parezca al x original
```

### 11.1 Perspectiva de compresion (analogia Alice-Bob)

Otra forma de entender el ELBO es como un problema de **compresion**:

- **Alice** esta en una mision espacial y necesita enviar imagenes $x$ a **Bob**. El canal de comunicacion es limitado.
- Alice usa el encoder $q_\phi(z|x)$ para comprimir la imagen en un mensaje $\hat{z}$, y lo envia a Bob.
- Bob usa el decoder $p_\theta(x|\hat{z})$ para reconstruir la imagen.

Los dos terminos del ELBO corresponden a:
- **Reconstruccion** $\mathbb{E}_q[\log p(x|z)]$: "Bob reconstruye bien la imagen a partir del mensaje?"
- **KL** $D_{KL}(q(z|x) \| p(z))$: "Los mensajes siguen la distribucion p(z)?" Si si, Bob puede generar mensajes realistas $\hat{z} \sim p(z)$ y las imagenes correspondientes, como si los hubiera recibido de Alice.

---

## 12. Resumen: que hemos aprendido?

| Concepto | Que es | Formula clave |
|----------|--------|---------------|
| **Modelo generativo** | z genera x | $p(\mathbf{x},\mathbf{z}) = p(\mathbf{x}\|\mathbf{z})p(\mathbf{z})$ |
| **Problema** | $p(\mathbf{x}) = \int p(\mathbf{x},\mathbf{z})d\mathbf{z}$ es intratable | No podemos calcular la integral |
| **Solucion: ELBO** | Un limite inferior que SI podemos optimizar | $\text{ELBO} = \mathbb{E}_q[\log p/q] \leq \log p(\mathbf{x})$ |
| **Brecha** | La diferencia entre log p(x) y ELBO | $= D_{KL}(q \| p(\mathbf{z}\|\mathbf{x}))$ |
| **Reparametrizacion** | Truquito para poder usar backprop | $\mathbf{z} = \mu + \sigma \odot \varepsilon$ |
| **Codificador** | Red neuronal que va de x a z | $q_\phi(\mathbf{z}\|\mathbf{x})$ |
| **Decodificador** | Red neuronal que va de z a x | $p_\theta(\mathbf{x}\|\mathbf{z})$ |
| **Amortizacion** | En vez de optimizar λ por cada dato, usamos una red | $f_\phi: \mathbf{x} \mapsto \lambda^*$ |

---

## 13. Glosario final

- **Latente:** Oculto, no observado. Las variables latentes z son las "causas ocultas" de los datos.
- **Prior (a priori):** Lo que creemos sobre z antes de ver ningun dato. Normalmente N(0, I).
- **Posterior:** Lo que creemos sobre z DESPUES de ver un dato x. Es $p(\mathbf{z}|\mathbf{x})$.
- **Variacional:** Se refiere a la aproximacion q que usamos porque la posterior real es intratable.
- **ELBO:** Evidence Lower BOund. Un limite inferior de log p(x) que podemos optimizar.
- **KL divergence:** Una medida de lo "diferentes" que son dos distribuciones. Siempre ≥ 0.
- **Reparametrizacion:** Truco que separa la aleatoriedad (ε) de los parametros (λ) para poder calcular gradientes.
- **Amortizacion:** Usar una red neuronal para predecir directamente los parametros variacionales, en vez de optimizarlos uno por uno para cada dato.
- **Intratable:** Imposible de calcular exactamente en un tiempo razonable.
- **Verosimilitud (likelihood):** Probabilidad de los datos observados bajo el modelo: p(x|θ).
- **Marginal:** Cuando "integramos" (sumamos) sobre las variables que no nos interesan.

---

## Visualizaciones interactivas

- [ELBO Interactivo](/interactives/elbo_interactivo.html) — Explora como cambian la reconstruccion y la KL al variar los parametros del encoder/decoder
- [Truco de Reparametrizacion](/interactives/reparametrizacion.html) — Visualiza como se separa la aleatoriedad de los parametros para permitir backpropagation
- [Mezcla de Gaussianas](/interactives/mezcla_gaussianas.html) — Intuicion sobre mezclas de Gaussianas (prior del GMVAE)
- [Semi-Supervised VAE](/interactives/ssvae_semi_supervisado.html) — Clustering semi-supervisado con EM, base del SSVAE
- [IWAE: Multiples Muestras](/interactives/iwae_muestras.html) — Visualiza como K muestras de importance weighting mejoran la cota ELBO
