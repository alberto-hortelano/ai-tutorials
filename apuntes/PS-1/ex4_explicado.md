# Problema 4: Modelos Autorregresivos — Explicación del Enunciado

Este documento explica **qué significa cada parte del enunciado**, no cómo resolverlo.

---

## Frase 1

> *"Consider a set of $n$ univariate continuous real-valued random variables $(X_1, ..., X_n)$."*

**Traducción:** Considera un conjunto de $n$ variables aleatorias $(X_1, ..., X_n)$ que son univariadas, continuas y de valor real.

### ¿Qué es una variable aleatoria?

Es una variable cuyo valor depende del azar. Cada vez que "muestreamos" la variable, puede darnos un valor diferente según una distribución de probabilidad.

**Ejemplo:** La temperatura mañana a las 12:00. No sabemos exactamente cuál será, pero podemos describir una distribución de valores posibles.

### ¿Qué significa "univariate" (univariada)?

Que cada $X_i$ es **un solo número**, no un vector.

| Univariada | Multivariada |
|------------|--------------|
| $X_i = 23.5$ | $X_i = (23.5, 18.2, 30.1)$ |
| Un número | Un vector de números |

### ¿Qué significa "continuous" (continua)?

Que $X_i$ puede tomar **cualquier valor** dentro de un rango, no solo valores específicos.

| Continua | Discreta |
|----------|----------|
| Puede ser $2.0$, $2.001$, $2.0001$, $\pi$... | Solo puede ser $1$, $2$, $3$... |
| Temperatura: $18.3742°C$ | Resultado de un dado: $1, 2, 3, 4, 5, 6$ |

### ¿Qué significa "real-valued" (de valor real)?

Que el valor es un **número real** (pertenece a $\mathbb{R}$).

| Real | No real |
|------|---------|
| $-5$, $0$, $3.14159$, $\sqrt{2}$ | Números complejos como $3 + 2i$ |
| | Categorías como "rojo", "verde", "azul" |

### Resumen de "univariate continuous real-valued"

Cada $X_i$ es **un solo número real que puede tomar cualquier valor**.

**Ejemplo concreto:** $(X_1, X_2, X_3)$ podría ser (temperatura, humedad, presión atmosférica) — tres números reales independientes.

---

## Frase 2

> *"You have access to powerful neural networks $\{\mu_i\}_{i=1}^{n}$ and $\{\sigma_i\}_{i=1}^{n}$..."*

**Traducción:** Tienes acceso a redes neuronales potentes llamadas $\mu_1, \mu_2, ..., \mu_n$ y $\sigma_1, \sigma_2, ..., \sigma_n$.

### ¿Qué es $\{\mu_i\}_{i=1}^{n}$?

Es notación matemática para "el conjunto de elementos $\mu_i$ donde $i$ va desde $1$ hasta $n$".

$$\{\mu_i\}_{i=1}^{n} = \{\mu_1, \mu_2, \mu_3, ..., \mu_n\}$$

### ¿Por qué hay dos familias de redes ($\mu$ y $\sigma$)?

- Las redes $\mu_i$ predicen la **media** (el centro de la distribución)
- Las redes $\sigma_i$ predicen la **desviación estándar** (qué tan dispersa está la distribución)

Juntas, definen una distribución Gaussiana para cada variable.

---

## Frase 3

> *"...that can represent any function $\mu_i : \mathbb{R}^{i-1} \to \mathbb{R}$ and $\sigma_i : \mathbb{R}^{i-1} \to \mathbb{R}_{++}$."*

### ¿Qué significa $\mu_i : \mathbb{R}^{i-1} \to \mathbb{R}$?

Es notación para describir una función:

| Parte | Significado |
|-------|-------------|
| $\mu_i$ | El nombre de la función |
| $:$ | "es una función que..." |
| $\mathbb{R}^{i-1}$ | **Dominio**: recibe $i-1$ números reales como entrada |
| $\to$ | "y devuelve..." |
| $\mathbb{R}$ | **Codominio**: un número real como salida |

**Ejemplo:** $\mu_3 : \mathbb{R}^{2} \to \mathbb{R}$ significa que $\mu_3$ recibe 2 números y devuelve 1 número.

$$\mu_3(x_1, x_2) = \text{algún número real}$$

### ¿Qué es $\mathbb{R}^{i-1}$?

El espacio de vectores con $i-1$ componentes reales.

| Espacio | Significado | Ejemplo |
|---------|-------------|---------|
| $\mathbb{R}^0$ | 0 dimensiones (por convención, solo el $\{0\}$) | La entrada "vacía" |
| $\mathbb{R}^1$ | 1 dimensión | Un número: $5.2$ |
| $\mathbb{R}^2$ | 2 dimensiones | Un par: $(3.1, -2.0)$ |
| $\mathbb{R}^3$ | 3 dimensiones | Una terna: $(1, 2, 3)$ |

### ¿Qué es $\mathbb{R}_{++}$?

Los números reales **estrictamente positivos** (mayores que cero).

$$\mathbb{R}_{++} = \{x \in \mathbb{R} : x > 0\}$$

| Pertenece a $\mathbb{R}_{++}$ | NO pertenece a $\mathbb{R}_{++}$ |
|------------------------------|----------------------------------|
| $0.001$, $1$, $100$, $\pi$ | $0$, $-5$, $-0.001$ |

### ¿Por qué $\sigma_i$ devuelve valores en $\mathbb{R}_{++}$?

Porque $\sigma_i$ representa la **desviación estándar**, que mide dispersión. No tiene sentido una dispersión negativa o cero.

### ¿Qué significa "can represent any function"?

Es una suposición teórica: las redes neuronales son **aproximadores universales**. Pueden aprender cualquier función que necesitemos. Esto elimina la limitación de la arquitectura como factor.

---

## Frase 4

> *"We shall, for notational simplicity, define $\mathbb{R}^0 = \{0\}$."*

### ¿Por qué esta convención?

Cuando $i = 1$, la red $\mu_1$ tiene entrada en $\mathbb{R}^{1-1} = \mathbb{R}^0$.

Para que las fórmulas funcionen uniformemente, definimos que $\mathbb{R}^0$ es simplemente el conjunto que contiene solo el número $0$. Así, $\mu_1(0)$ es un número fijo (la red recibe una entrada "vacía" representada por $0$).

---

## Frase 5: El modelo hacia adelante

> *"You choose to build the following Gaussian autoregressive model in the forward direction:"*
>
> $$p_f(x_1, ..., x_n) = \prod_{i=1}^{n} p_f(x_i | x_{<i}) = \prod_{i=1}^{n} \mathcal{N}(x_i | \mu_i(x_{<i}), \sigma_i^2(x_{<i}))$$

### ¿Qué es un modelo autorregresivo?

Un modelo donde cada variable se genera **condicionada en las anteriores**. Es como contar una historia: cada palabra depende de las palabras previas.

### ¿Qué significa $\prod_{i=1}^{n}$?

Es el **productorio** — multiplicar todos los términos desde $i=1$ hasta $i=n$.

$$\prod_{i=1}^{n} a_i = a_1 \times a_2 \times a_3 \times ... \times a_n$$

### ¿Qué es $p_f(x_i | x_{<i})$?

La probabilidad de $x_i$ **dado** (condicionado en) todas las variables anteriores.

| Símbolo | Significado |
|---------|-------------|
| $p_f(...)$ | Probabilidad en el modelo "forward" (hacia adelante) |
| $x_i$ | El valor de la variable $i$ |
| $\|$ | "dado que" o "condicionado en" |
| $x_{<i}$ | Todas las variables con índice menor que $i$ |

### ¿Qué es $x_{<i}$?

$$x_{<i} = \begin{cases} (x_1, ..., x_{i-1})^\top & \text{si } i > 1 \\ 0 & \text{si } i = 1 \end{cases}$$

| $i$ | $x_{<i}$ | Interpretación |
|-----|----------|----------------|
| $1$ | $0$ | No hay variables anteriores |
| $2$ | $(x_1)$ | Solo $x_1$ |
| $3$ | $(x_1, x_2)$ | Las dos primeras |
| $4$ | $(x_1, x_2, x_3)$ | Las tres primeras |

El símbolo $^\top$ indica que es un vector columna (transpuesto).

### ¿Qué es $\mathcal{N}(x_i | \mu_i(x_{<i}), \sigma_i^2(x_{<i}))$?

Una **distribución Gaussiana** (normal) para $x_i$ con:
- **Media:** $\mu_i(x_{<i})$ — depende de las variables anteriores
- **Varianza:** $\sigma_i^2(x_{<i})$ — también depende de las variables anteriores

```
La Gaussiana es la "campana de Gauss":

          _____
         /     \
        /       \       ← La altura máxima está en la media μ
       /         \
      /           \     ← El ancho depende de σ
    _/             \_
```

### ¿Por qué $\sigma_i^2$ y no $\sigma_i$?

- $\sigma_i$ es la **desviación estándar**
- $\sigma_i^2$ es la **varianza** (el cuadrado de la desviación estándar)

La notación $\mathcal{N}(x | \mu, \sigma^2)$ usa la varianza como segundo parámetro.

### Ejemplo concreto con $n = 3$

$$p_f(x_1, x_2, x_3) = p_f(x_1) \cdot p_f(x_2 | x_1) \cdot p_f(x_3 | x_1, x_2)$$

1. **Generar $x_1$:** Muestrear de $\mathcal{N}(x_1 | \mu_1(0), \sigma_1^2(0))$ — una Gaussiana con parámetros fijos
2. **Generar $x_2$:** Muestrear de $\mathcal{N}(x_2 | \mu_2(x_1), \sigma_2^2(x_1))$ — la media y varianza dependen de $x_1$
3. **Generar $x_3$:** Muestrear de $\mathcal{N}(x_3 | \mu_3(x_1, x_2), \sigma_3^2(x_1, x_2))$

---

## Frase 6: El modelo hacia atrás

> *"Your friend chooses to factor the model in the reverse order using equally powerful neural networks $\{\hat{\mu}_i\}_{i=1}^{n}$ and $\{\hat{\sigma}_i\}_{i=1}^{n}$..."*

### ¿Qué significa el "sombrero" $\hat{}$ en $\hat{\mu}_i$?

Es simplemente notación para distinguir las redes del modelo hacia atrás de las del modelo hacia adelante. No tiene significado matemático especial — son funciones diferentes.

| Modelo hacia adelante | Modelo hacia atrás |
|-----------------------|--------------------|
| $\mu_i$, $\sigma_i$ | $\hat{\mu}_i$, $\hat{\sigma}_i$ |

### ¿Por qué $\hat{\mu}_i : \mathbb{R}^{n-i} \to \mathbb{R}$?

En el modelo hacia atrás, $\hat{\mu}_i$ recibe las variables **posteriores** a $i$, que son $n - i$ variables.

| $i$ | Variables posteriores | Dimensión de entrada |
|-----|-----------------------|----------------------|
| $n$ | Ninguna | $\mathbb{R}^0$ |
| $n-1$ | $(x_n)$ | $\mathbb{R}^1$ |
| $1$ | $(x_2, ..., x_n)$ | $\mathbb{R}^{n-1}$ |

---

## Frase 7: La fórmula del modelo hacia atrás

> $$p_r(x_1, ..., x_n) = \prod_{i=1}^{n} p_r(x_i | x_{>i}) = \prod_{i=1}^{n} \mathcal{N}(x_i | \hat{\mu}_i(x_{>i}), \hat{\sigma}_i^2(x_{>i}))$$

### ¿Qué es $x_{>i}$?

$$x_{>i} = \begin{cases} (x_{i+1}, ..., x_n)^\top & \text{si } i < n \\ 0 & \text{si } i = n \end{cases}$$

| $i$ (con $n=4$) | $x_{>i}$ | Interpretación |
|-----------------|----------|----------------|
| $4$ | $0$ | No hay variables posteriores |
| $3$ | $(x_4)$ | Solo la última |
| $2$ | $(x_3, x_4)$ | Las dos últimas |
| $1$ | $(x_2, x_3, x_4)$ | Todas menos la primera |

### Ejemplo concreto con $n = 3$

$$p_r(x_1, x_2, x_3) = p_r(x_3) \cdot p_r(x_2 | x_3) \cdot p_r(x_1 | x_2, x_3)$$

1. **Generar $x_3$:** Muestrear de $\mathcal{N}(x_3 | \hat{\mu}_3(0), \hat{\sigma}_3^2(0))$ — parámetros fijos
2. **Generar $x_2$:** Muestrear de $\mathcal{N}(x_2 | \hat{\mu}_2(x_3), \hat{\sigma}_2^2(x_3))$
3. **Generar $x_1$:** Muestrear de $\mathcal{N}(x_1 | \hat{\mu}_1(x_2, x_3), \hat{\sigma}_1^2(x_2, x_3))$

---

## Frase 8: La pregunta

> *"Do these models cover the same hypothesis space of distributions?"*

### ¿Qué es el "hypothesis space" (espacio de hipótesis)?

Es el **conjunto de todas las distribuciones** que un modelo puede representar.

- **Espacio de hipótesis del modelo forward:** Todas las distribuciones $p_f$ que puedes obtener eligiendo cualquier combinación de funciones $\mu_i$, $\sigma_i$.

- **Espacio de hipótesis del modelo reverse:** Todas las distribuciones $p_r$ que puedes obtener eligiendo cualquier combinación de funciones $\hat{\mu}_i$, $\hat{\sigma}_i$.

### ¿Qué pregunta el problema?

¿Son estos dos conjuntos **iguales**?

Es decir: ¿Cualquier distribución que puedo crear con el modelo forward, también la puedo crear con el modelo reverse (y viceversa)?

---

## Frase 9: Reformulación de la pregunta

> *"In other words, given any choice of $\{\mu_i, \sigma_i\}_{i=1}^{n}$, does there always exist a choice of $\{\hat{\mu}_i, \hat{\sigma}_i\}_{i=1}^{n}$ such that $p_f = p_r$?"*

### Traducción

Si yo construyo una distribución $p_f$ eligiendo ciertas funciones $\mu_1, ..., \mu_n$ y $\sigma_1, ..., \sigma_n$...

¿Siempre puedo encontrar funciones $\hat{\mu}_1, ..., \hat{\mu}_n$ y $\hat{\sigma}_1, ..., \hat{\sigma}_n$ tales que el modelo reverse $p_r$ sea **exactamente igual** a $p_f$?

### ¿Qué significa $p_f = p_r$?

Que para **todos** los valores posibles $(x_1, ..., x_n)$:

$$p_f(x_1, ..., x_n) = p_r(x_1, ..., x_n)$$

Es decir, ambos modelos asignan exactamente la misma probabilidad a cualquier punto.

---

## Frase 10: Qué se pide

> *"If yes, provide a proof. Else, provide a concrete counterexample, including mathematical definitions of the modeled functions, and explain why."*

### ¿Qué es un contraejemplo?

Un **caso específico** que demuestra que la respuesta es "no".

Para dar un contraejemplo, necesitarías:
1. Definir funciones concretas $\mu_i$, $\sigma_i$ para el modelo forward
2. Mostrar que **no existen** funciones $\hat{\mu}_i$, $\hat{\sigma}_i$ que hagan $p_r = p_f$
3. Explicar **por qué** no pueden existir

---

## La pista del problema

> *"Hint: Consider the case where $n = 2$."*

El problema sugiere simplificar a solo dos variables $(X_1, X_2)$.

Con $n = 2$:

**Modelo forward:**
$$p_f(x_1, x_2) = p_f(x_1) \cdot p_f(x_2 | x_1)$$

**Modelo reverse:**
$$p_r(x_1, x_2) = p_r(x_2) \cdot p_r(x_1 | x_2)$$

---

## Conceptos adicionales mencionados en las pistas

### Distribución marginal

Si tienes $p(x_1, x_2)$, la **marginal** de $x_2$ es:

$$p(x_2) = \int_{-\infty}^{\infty} p(x_1, x_2) \, dx_1$$

"Integras" (sumas) sobre todos los valores posibles de $x_1$, quedándote solo con la distribución de $x_2$.

### Mezcla de Gaussianas

Una combinación ponderada de varias Gaussianas:

$$p(x) = w_1 \cdot \mathcal{N}(x | \mu_1, \sigma_1^2) + w_2 \cdot \mathcal{N}(x | \mu_2, \sigma_2^2)$$

donde $w_1 + w_2 = 1$.

**Propiedad clave:** Una mezcla de Gaussianas **NO es una Gaussiana** (puede tener varios picos).

```
Gaussiana simple:          Mezcla de dos Gaussianas:

      ___                       __       __
     /   \                     /  \     /  \
    /     \                   /    \   /    \
   /       \                 /      \_/      \
```

### Gaussiana truncada

Una Gaussiana "cortada" que solo tiene probabilidad en una región.

**Propiedad clave:** Una Gaussiana truncada **NO es una Gaussiana** (la Gaussiana tiene soporte en todo $\mathbb{R}$).

---

## Ejemplo concreto: Altura y Peso

Para entender mejor los modelos forward y reverse, usemos un ejemplo con dos variables reales:

- $X_1$ = altura (cm)
- $X_2$ = peso (kg)

### ¿Qué es la distribución marginal?

Si tienes datos de personas con altura y peso, la distribución **conjunta** $p(x_1, x_2)$ te dice la probabilidad de cada combinación.

| | Peso 60kg | Peso 70kg | Peso 80kg | **Marginal de $X_1$** |
|---|-----------|-----------|-----------|----------------------|
| **Altura 160cm** | 0.15 | 0.10 | 0.05 | **0.30** |
| **Altura 170cm** | 0.10 | 0.20 | 0.10 | **0.40** |
| **Altura 180cm** | 0.05 | 0.10 | 0.15 | **0.30** |
| **Marginal de $X_2$** | **0.30** | **0.40** | **0.30** | |

La **marginal de $X_2$** (peso) es la distribución del peso **ignorando la altura**. Se obtiene sumando cada columna.

Se llama "marginal" porque históricamente se escribía en el **margen** de la tabla.

### Modelo Forward: primero altura, luego peso

$$p_f(x_1, x_2) = p_f(x_1) \cdot p_f(x_2 | x_1)$$

**¿Cómo se genera una persona?**

```
Paso 1: Generar altura
   ┌─────────────────────────┐
   │  p_f(x_1) = Gaussiana   │
   │  μ = 170cm, σ = 10cm    │
   └───────────┬─────────────┘
               │
               ▼
         altura = 180cm
               │
               ▼
Paso 2: Generar peso DADO que la altura es 180cm
   ┌─────────────────────────────────────┐
   │  p_f(x_2 | x_1=180) = Gaussiana     │
   │  μ = función(180), σ = función(180) │
   │                                     │
   │  Por ejemplo: μ = 0.8 × 180 - 64    │
   │               μ = 80kg              │
   └───────────┬─────────────────────────┘
               │
               ▼
         peso = 78kg
```

**Intuición:** "Primero decido qué tan alta es la persona, y **luego** decido su peso sabiendo su altura."

La red neuronal $\mu_2(x_1)$ aprende la relación altura → peso esperado:

```
Si altura = 160cm → peso esperado ≈ 60kg
Si altura = 170cm → peso esperado ≈ 70kg
Si altura = 180cm → peso esperado ≈ 80kg
```

### Modelo Reverse: primero peso, luego altura

$$p_r(x_1, x_2) = p_r(x_2) \cdot p_r(x_1 | x_2)$$

**¿Cómo se genera una persona?**

```
Paso 1: Generar peso
   ┌─────────────────────────┐
   │  p_r(x_2) = Gaussiana   │
   │  μ = 70kg, σ = 10kg     │
   └───────────┬─────────────┘
               │
               ▼
         peso = 78kg
               │
               ▼
Paso 2: Generar altura DADO que el peso es 78kg
   ┌─────────────────────────────────────┐
   │  p_r(x_1 | x_2=78) = Gaussiana      │
   │  μ = función(78), σ = función(78)   │
   └───────────┬─────────────────────────┘
               │
               ▼
         altura = 180cm
```

**Intuición:** "Primero decido cuánto pesa la persona, y **luego** decido su altura sabiendo su peso."

### La diferencia clave entre los modelos

| Aspecto | Modelo Forward | Modelo Reverse |
|---------|----------------|----------------|
| Orden | altura → peso | peso → altura |
| ¿Qué es $p(x_1)$? | Se **define** directamente | Se **calcula** integrando |
| Forma de $p(x_1)$ | Siempre es una Gaussiana | Puede ser compleja |
| ¿Qué es $p(x_2)$? | Se **calcula** integrando | Se **define** directamente |
| Forma de $p(x_2)$ | Puede ser compleja | Siempre es una Gaussiana |

**Observación:** Es simétrico. En cada modelo, la **primera variable** que generas tiene marginal Gaussiana (la defines), pero la **segunda variable** tiene una marginal que se calcula y puede ser compleja.

**En el modelo Forward:**

$$p_f(x_2) = \int p_f(x_1) \cdot p_f(x_2 | x_1) \, dx_1$$

La marginal del peso se **calcula** integrando sobre todas las alturas posibles. Dependiendo de cómo definamos $\mu_2(x_1)$, puede tener cualquier forma.

**En el modelo Reverse:**

$$p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$$

La marginal del peso se **define directamente** como una Gaussiana. Siempre tiene un solo pico.

### Un caso donde los modelos difieren

**Modelo Forward "extraño":**

Definimos:
- $p_f(x_1) = \mathcal{N}(x_1 | 170, 10^2)$ — altura centrada en 170cm

- $\mu_2(x_1) = \begin{cases} 60\text{kg} & \text{si } x_1 < 170\text{cm} \\ 80\text{kg} & \text{si } x_1 \geq 170\text{cm} \end{cases}$

Es decir: "las personas bajas pesan ~60kg, las altas pesan ~80kg, sin término medio".

**¿Qué forma tiene la marginal $p_f(x_2)$?**

```
                    La marginal del peso es BIMODAL

Probabilidad
     │
     │   __          __
     │  /  \        /  \
     │ /    \      /    \
     │/      \____/      \
     └─────────────────────── Peso
          60kg    70kg   80kg

     Dos picos: uno en 60kg, otro en 80kg
```

**¿Puede el modelo Reverse representar esto?**

**No.** En el modelo reverse, $p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$ siempre es una sola Gaussiana, que **siempre tiene un solo pico**.

```
Lo mejor que puede hacer el reverse:

Probabilidad
     │
     │        ____
     │       /    \
     │      /      \
     │     /        \
     └─────────────────────── Peso
          60kg    70kg   80kg

     Un solo pico en 70kg (el promedio)
```

### Resumen del ejemplo

| Aspecto | Forward | Reverse |
|---------|---------|---------|
| Orden de generación | altura → peso | peso → altura |
| ¿Qué es $p(x_2)$? | Se **calcula** (puede ser compleja) | Se **define** (siempre Gaussiana) |
| ¿Puede $p(x_2)$ ser bimodal? | **Sí** | **No** |

Esta es la esencia de por qué los dos modelos pueden representar distribuciones diferentes cuando restringimos las condicionales a ser Gaussianas.

---

## Resumen: ¿Qué pide el problema?

1. **Entender** los dos modelos (forward y reverse)
2. **Determinar** si pueden representar las mismas distribuciones
3. **Demostrar** tu respuesta (con prueba o contraejemplo)

La intuición clave está en pensar qué formas pueden tener las **distribuciones marginales** y **condicionales** en cada modelo.

En el modelo Forward la condicional es:

$$p_f(x_2 | x_1) = \mathcal{N}(x_2 | \mu_2(x_1), \sigma_2^2(x_1))$$

Aquí $\mu_2(x_1)$ es una función de $x_1$.

Cuando calculas la marginal:

$$p_f(x_2) = \int p_f(x_1) \cdot p_f(x_2 | x_1) , dx_1$$

Expandiendo:

$$p_f(x_2) = \int \underbrace{\mathcal{N}(x_1 | \mu_1, \sigma_1^2)}{p_f(x_1)} \cdot \underbrace{\mathcal{N}(x_2 | \mu_2(x_1),             
\sigma_2^2(x_1))}{p_f(x_2|x_1)} , dx_1$$

$\mu_2(x_1)$ está DENTRO del integrando. Afecta el resultado de la integral.

En el modelo Reverse

$$p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$$

Aquí $\hat{\mu}_2$ es una constante (un número fijo), no una función.

La diferencia clave

| Modelo | Símbolo | ¿Qué es? |
|---|---|---|
| Forward | $\mu_2(x_1)$  | Una función — dentro de la integral |
| Reverse | $\hat{\mu}_2$ | Una constante — parámetro fijo |

La forma de $\mu_2(x_1)$ determina qué forma tiene $p_f(x_2)$ después de integrar. Si $\mu_2(x_1)$ es una función escalón, la integral da 
una mezcla de Gaussianas (bimodal).
                                                                                                   
La integral
$$p_f(x_2) = \int_{-\infty}^{\infty} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | \mu_2(x_1), \epsilon) , dx_1$$

Con la función escalón:
$$\mu_2(x_1) = \begin{cases} 0 & \text{si } x_1 \leq 0 \ 1 & \text{si } x_1 > 0 \end{cases}$$

Paso 1: Dividir la integral

Como $\mu_2(x_1)$ tiene dos "trozos", dividimos la integral en dos partes:

$$p_f(x_2) = \underbrace{\int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | 0, \epsilon) , dx_1}{\text{región donde } x_1 

\leq 0} + \underbrace{\int{0}^{\infty} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | 1, \epsilon) , dx_1}_{\text{región donde } x_1 >   
0}$$

Paso 2: Sacar lo que no depende de $x_1$

En la primera integral, $\mathcal{N}(x_2 | 0, \epsilon)$ no depende de $x_1$, así que sale fuera:

$$= \mathcal{N}(x_2 | 0, \epsilon) \cdot \int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) , dx_1 + \mathcal{N}(x_2 | 1, \epsilon) \cdot     

\int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) , dx_1$$

Paso 3: Calcular las integrales restantes

Las integrales que quedan son simplemente probabilidades acumuladas de la Gaussiana estándar:

$$\int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) , dx_1 = P(X_1 \leq 0) = 0.5$$
$$\int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) , dx_1 = P(X_1 > 0) = 0.5$$

(Porque la Gaussiana estándar es simétrica alrededor de 0)

Paso 4: Resultado final

$$p_f(x_2) = 0.5 \cdot \mathcal{N}(x_2 | 0, \epsilon) + 0.5 \cdot \mathcal{N}(x_2 | 1, \epsilon)$$


----



The integrals are the probability of $x_1$ being in each region:

$$w_1 = \int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) dx_1 = P(x_1 \leq 0) > 0$$

$$w_2 = \int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) dx_1 = P(x_1 > 0) > 0$$

Both weights are strictly positive (neither region has zero probability).

Therefore:

$$p_f(x_2) = w_1 \cdot \mathcal{N}(x_2 | 0, \epsilon) + w_2 \cdot \mathcal{N}(x_2 | 1, \epsilon)$$

This is a **mixture of two Gaussians** (bimodal distribution).

On the other hand, in the reverse model:

$$p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$$

This is a **single Gaussian** (unimodal distribution).

## Conclusion

A mixture of two Gaussians with positive weights ($w_1, w_2 > 0$) centered at different means (0 and 1) is **bimodal** — it has two peaks.

A single Gaussian is **unimodal** — it always has exactly one peak.

**A bimodal distribution can never equal a unimodal distribution.**

Therefore, $p_f(x_2) \neq p_r(x_2)$, which means $p_f \neq p_r$.

**The forward and reverse Gaussian autoregressive models do NOT cover the same hypothesis space.**