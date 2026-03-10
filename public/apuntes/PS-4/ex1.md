# Ejercicio 1 — Score Matching

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: La funcion score

En modelos generativos basados en score, no modelamos la densidad $p(x)$ directamente, sino su **funcion score**: el gradiente del logaritmo de la densidad respecto a $x$.

$$s(x) = \nabla_x \log p(x)$$

La ventaja es que el score no depende de la constante de normalizacion $Z$ (que suele ser intratable). Si $p(x) = \frac{\tilde{p}(x)}{Z}$, entonces $\nabla_x \log p(x) = \nabla_x \log \tilde{p}(x)$ porque $\log Z$ es constante respecto a $x$.

### Configuracion del ejercicio

Trabajamos con una Gaussiana univariante $p(x) = \mathcal{N}(x \mid \mu, \sigma^2)$ como distribucion real, y un modelo $q_\theta(x) = \mathcal{N}(x \mid \mu_\theta, \sigma_\theta^2)$ que queremos ajustar.

---

## Ecuacion 1 — Score Matching Loss

$$L(\theta) = \mathbb{E}_{p(x)} \left[ \frac{1}{2} \| \nabla_x \log p(x) - \nabla_x \log q_\theta(x) \|^2 \right]$$

### Como se lee

> "La loss de score matching es la esperanza, bajo la distribucion real $p(x)$, de la mitad del cuadrado de la diferencia entre el score real y el score del modelo."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $L(\theta)$ | La **loss** (funcion de coste) que depende de los parametros $\theta$ del modelo. Queremos minimizarla. |
| $\mathbb{E}_{p(x)}[\cdot]$ | **Esperanza** bajo la distribucion real $p(x)$. En la practica, se aproxima con muestras del dataset. |
| $\nabla_x \log p(x)$ | **Score real**: el gradiente de $\log p(x)$ respecto a $x$. Indica la direccion en que la log-densidad crece mas rapido. |
| $\nabla_x \log q_\theta(x)$ | **Score del modelo**: el gradiente de $\log q_\theta(x)$ respecto a $x$. Es lo que nuestro modelo predice. |
| $\|\cdot\|^2$ | **Norma al cuadrado** de la diferencia entre ambos scores. En 1D es simplemente el cuadrado de la diferencia. |

### Intuicion

El score matching busca que el modelo "apunte en la misma direccion" que la distribucion real en cada punto del espacio. Si el score real dice "la densidad crece hacia la derecha" y el modelo dice lo mismo, la loss es baja.

```
Score real s_p(x):          Score del modelo s_q(x):
  <---  x  --->               <---  x  --->
      |                            |
   mu_real                      mu_modelo

Si mu_modelo != mu_real, los scores difieren --> loss alta
Si mu_modelo ~= mu_real, los scores coinciden --> loss baja
```

---

## Apartado (a) — [2 puntos, Escrito]

> *"Derive the score function for the univariate Gaussian distribution."*

### ¿Que pide?

Calcular $\nabla_x \log p(x)$ donde $p(x) = \mathcal{N}(x \mid \mu, \sigma^2)$.

### ¿Que conceptos necesitas?

- La densidad de la Gaussiana univariante: $\mathcal{N}(x \mid \mu, \sigma^2) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$
- Que $\log p(x) = -\frac{(x-\mu)^2}{2\sigma^2} + \text{constante}$ (los terminos que no dependen de $x$ desaparecen al derivar)
- La derivada de $\log p(x)$ respecto a $x$

### ¿Que es el score geometricamente?

Para una Gaussiana, el score en un punto $x$ apunta hacia la media $\mu$:
- Si $x > \mu$: el score es negativo (la densidad decrece, "vuelve" hacia $\mu$)
- Si $x < \mu$: el score es positivo (la densidad crece hacia $\mu$)
- Si $x = \mu$: el score es cero (estamos en el maximo)

---

## Apartado (b) — [4 puntos, Escrito]

> *"Compute the score matching loss for the univariate Gaussian model, assuming $p(x) = \mathcal{N}(x \mid \mu, \sigma^2)$ and $q_\theta(x) = \mathcal{N}(x \mid \mu_\theta, \sigma_\theta^2)$. We are looking for a final derivation $A^2(\mu^2 + \sigma^2) + 2AB\mu + B^2$."*

### ¿Que pide?

Sustituir los scores de ambas Gaussianas en la ecuacion 1 y calcular la esperanza. El resultado debe tener la forma $A^2(\mu^2 + \sigma^2) + 2AB\mu + B^2$ donde $A$ y $B$ se expresan en terminos de $\sigma$, $\mu$, $\mu_\theta$ y $\sigma_\theta$.

### ¿Que conceptos necesitas?

- El score de una Gaussiana (calculado en el apartado a)
- Propiedades de la esperanza bajo $p(x) = \mathcal{N}(\mu, \sigma^2)$:
  - $\mathbb{E}[x] = \mu$
  - $\mathbb{E}[x^2] = \mu^2 + \sigma^2$
- Algebra: expandir el cuadrado de la diferencia de scores y agrupar terminos

### Estructura de la respuesta

El enunciado pide identificar $A$ y $B$ tales que:

$$L(\theta) = A^2(\mu^2 + \sigma^2) + 2AB\mu + B^2$$

Esto es simplemente $\mathbb{E}_{p(x)}[(Ax + B)^2]$ expandido, lo que sugiere que la diferencia de scores tiene la forma lineal $Ax + B$.

---

## Apartado (c) — [2 puntos, Extra Credit, Escrito]

> *"Extend the result of part b. to a multivariate Gaussian distribution $p(\mathbf{x}) = \mathcal{N}(\mathbf{x} \mid \boldsymbol{\mu}, \boldsymbol{\Sigma})$. Derive the expression for the score matching loss for the multivariate case, and explain the challenges posed by the covariance matrix $\boldsymbol{\Sigma}$ in higher dimensions."*

### ¿Que pide?

1. Generalizar el score de una Gaussiana 1D a una Gaussiana multivariante (el score ahora es un vector)
2. Derivar la loss de score matching multivariante
3. Explicar por que la matriz de covarianza $\boldsymbol{\Sigma}$ causa problemas computacionales en alta dimension

### ¿Que conceptos necesitas?

- El score de una Gaussiana multivariante: $\nabla_\mathbf{x} \log \mathcal{N}(\mathbf{x} \mid \boldsymbol{\mu}, \boldsymbol{\Sigma}) = -\boldsymbol{\Sigma}^{-1}(\mathbf{x} - \boldsymbol{\mu})$
- La norma al cuadrado de un vector: $\|\mathbf{v}\|^2 = \mathbf{v}^\top \mathbf{v}$
- El coste computacional de invertir $\boldsymbol{\Sigma}$ (es $O(d^3)$ para dimension $d$)

---

## Resumen del ejercicio 1

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 2 | Derivar el score de una Gaussiana 1D |
| (b) | Escrito | 4 | Calcular la loss de score matching entre dos Gaussianas 1D |
| (c) | Escrito (EC) | 2 | Extender a Gaussiana multivariante y discutir problemas de escalabilidad |
| **Total** | | **6 + 2 EC** | |

### Conceptos clave del ejercicio

1. La **funcion score** $\nabla_x \log p(x)$ es el gradiente de la log-densidad, no la densidad misma
2. Para una Gaussiana, el score apunta hacia la media y su magnitud depende inversamente de la varianza
3. La **score matching loss** mide la distancia al cuadrado entre el score real y el del modelo
4. En alta dimension, el score involucra la inversa de la matriz de covarianza, que es costosa de calcular
