# Ejercicio 4 — Conditional GAN with projection discriminator

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: GANs condicionales

Hasta ahora, nuestras GANs generan muestras $\mathbf{x} \sim p_\theta(\mathbf{x})$ sin control sobre que tipo de imagen producen. Pero en muchos datasets (como MNIST o Fashion MNIST) tenemos **etiquetas de clase** $y$ (digitos 0-9, o tipos de ropa).

Una **Conditional GAN** (cGAN) extiende la GAN para generar muestras **condicionadas a una clase**: queremos muestrear $\mathbf{x} \sim p_\theta(\mathbf{x} \mid y)$.

```
GAN incondicional:      z ~ N(0,I)  -->  G_theta(z)     -->  "alguna imagen"

GAN condicional:        z ~ N(0,I)  -+
                        y (clase)   -+-->  G_theta(z, y)  -->  "imagen de clase y"
```

El enfoque mas simple para el generador: codificar la etiqueta $y$ como un vector **one-hot** $\mathbf{y}$, concatenarlo con $\mathbf{z}$, y pasar el resultado por las capas de la red neuronal.

### ¿Que es un vector one-hot?

Un vector one-hot de dimension $m$ para la clase $y$ tiene un 1 en la posicion $y$ y 0 en el resto:

| Clase ($y$) | Vector one-hot $\mathbf{y}$ (para $m=4$ clases) |
|---|---|
| 0 | $(1, 0, 0, 0)$ |
| 1 | $(0, 1, 0, 0)$ |
| 2 | $(0, 0, 1, 0)$ |
| 3 | $(0, 0, 0, 1)$ |

---

## La distribucion conjunta condicional

El enunciado formaliza la distribucion como:

$$p_\theta(\mathbf{x}, y) = p_\theta(\mathbf{x} \mid y) \cdot p_\theta(y)$$

y asume que las distribuciones de clase son uniformes:

$$p_\text{data}(y) = p_\theta(y) = \frac{1}{m}$$

Esto significa que cada clase es igualmente probable, y la distribucion marginal de clases es la misma en los datos reales y en el modelo. La parte interesante es $p_\theta(\mathbf{x} \mid y)$: la distribucion de imagenes dada una clase.

---

## Ecuacion 17 — La loss del discriminador condicional

$$L_D(\phi; \theta) = -\mathbb{E}_{(\mathbf{x},y) \sim p_\text{data}(\mathbf{x}, y)}[\log D_\phi(\mathbf{x}, y)] - \mathbb{E}_{(\mathbf{x},y) \sim p_\theta(\mathbf{x}, y)}[\log(1 - D_\phi(\mathbf{x}, y))]$$

### Como se lee

> "La loss del discriminador condicional es igual a la loss estandar de la GAN, pero ahora el discriminador recibe tanto la imagen $\mathbf{x}$ como la etiqueta de clase $y$."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $D_\phi(\mathbf{x}, y)$ | El **discriminador condicional**: recibe una imagen $\mathbf{x}$ **y** su etiqueta $y$, y devuelve la probabilidad de que el par $(\mathbf{x}, y)$ sea real. |
| $\mathbb{E}_{(\mathbf{x},y) \sim p_\text{data}(\mathbf{x}, y)}$ | Esperanza sobre pares **(imagen, clase)** reales. |
| $\mathbb{E}_{(\mathbf{x},y) \sim p_\theta(\mathbf{x}, y)}$ | Esperanza sobre pares generados. |

### Diferencia con la loss incondicional

En la GAN estandar, el discriminador solo mira la imagen: $D_\phi(\mathbf{x})$. Aqui mira el **par** $(\mathbf{x}, y)$. Esto permite que el discriminador penalice al generador no solo por producir imagenes poco realistas, sino tambien por producir imagenes **que no correspondan a la clase indicada**.

---

## Ecuacion 18 — Loss expandida

$$L_D = -\mathbb{E}_{(\mathbf{x},y) \sim p_\text{data}(\mathbf{x}, y)}[\log D_\phi(\mathbf{x}, y)] - \mathbb{E}_{y \sim p_\theta(y)}[\mathbb{E}_{\mathbf{z} \sim \mathcal{N}(\mathbf{0}, I)}[\log(1 - D_\phi(G_\theta(\mathbf{z}, y), y))]]$$

### Como se lee

> "El segundo termino se ha expandido explicitamente: en lugar de muestrear $\mathbf{x}$ de $p_\theta(\mathbf{x}, y)$, primero se muestrea una clase $y$ de $p_\theta(y)$, luego se muestrea ruido $\mathbf{z}$ y se genera $\mathbf{x} = G_\theta(\mathbf{z}, y)$."

### Intuicion

Esta es simplemente la ecuacion 17 con la expectativa sobre $p_\theta(\mathbf{x}, y)$ descompuesta en sus partes. Es la forma que se usa en la implementacion:

```
Para datos reales: tomar (x, y) del dataset  -->  D(x, y)  -->  log D(x, y)
Para datos falsos: tomar y, z ~ N(0,I)  -->  G(z, y) = x_fake  -->  D(x_fake, y)  -->  log(1 - D(x_fake, y))
```

---

## Ecuacion 19 — Supuesto de mezcla de Gaussianas

$$\frac{p_\text{data}(\mathbf{x} \mid y)}{p_\theta(\mathbf{x} \mid y)} = \frac{\mathcal{N}(\varphi(\mathbf{x}) \mid \boldsymbol{\mu}_y, I)}{\mathcal{N}(\varphi(\mathbf{x}) \mid \tilde{\boldsymbol{\mu}}_y, I)}$$

### Como se lee

> "El cociente de las densidades condicionales de datos reales y generados (dada la clase $y$) es igual al cociente de dos Gaussianas en el espacio de features $\varphi(\mathbf{x})$, con medias $\boldsymbol{\mu}_y$ (datos reales) y $\tilde{\boldsymbol{\mu}}_y$ (generados), y ambas con varianza identidad."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\varphi(\mathbf{x})$ | Una **funcion de features** (feature mapping): transforma la imagen $\mathbf{x}$ en un vector de representacion. En la practica, es la parte de la red neuronal del discriminador hasta la penultima capa. |
| $\boldsymbol{\mu}_y$ | La **media** de la Gaussiana para la clase $y$ en los datos **reales**, en el espacio de features. |
| $\tilde{\boldsymbol{\mu}}_y$ | La **media** de la Gaussiana para la clase $y$ en los datos **generados**, en el espacio de features. |
| $\mathcal{N}(\varphi(\mathbf{x}) \mid \boldsymbol{\mu}_y, I)$ | Densidad Gaussiana con media $\boldsymbol{\mu}_y$ y covarianza identidad $I$, evaluada en $\varphi(\mathbf{x})$. |

### Intuicion: ¿por que este supuesto?

Este es un supuesto simplificador para derivar la forma del discriminador optimo. Se asume que en el espacio de features (la representacion aprendida por el discriminador), los datos de cada clase siguen distribuciones Gaussianas. Bajo este supuesto, el discriminador optimo tiene una forma cerrada elegante.

```
Espacio de features phi(x):

     Clase 0          Clase 1          Clase 2
    +--------+       +--------+       +--------+
    |  mu_0  |       |  mu_1  |       |  mu_2  |    <-- datos reales
    +--------+       +--------+       +--------+
    +--------+       +--------+       +--------+
    | mu~_0  |       | mu~_1  |       | mu~_2  |    <-- datos generados
    +--------+       +--------+       +--------+
```

---

## Ecuacion 20 — El projection discriminator

$$h^*(\mathbf{x}, y) = \mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$$

### Como se lee

> "Los logits optimos del discriminador condicional son el producto interno del vector one-hot $\mathbf{y}$ con la transformacion afin $A\varphi(\mathbf{x}) + \mathbf{b}$ aplicada a las features."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $h^*(\mathbf{x}, y)$ | Los **logits optimos** del discriminador condicional. La salida del discriminador antes de la sigmoide: $D^*(\mathbf{x}, y) = \sigma(h^*(\mathbf{x}, y))$. |
| $\mathbf{y}$ | Vector **one-hot** de dimension $m$ que codifica la clase $y$. |
| $\mathbf{y}^T$ | La **transpuesta** del vector one-hot (un vector fila). |
| $A$ | Una **matriz** de dimension $m \times d$, donde $d$ es la dimension de $\varphi(\mathbf{x})$. Cada fila de $A$ contiene los pesos para una clase. |
| $\varphi(\mathbf{x})$ | El **vector de features** extraido de la imagen por la red neuronal del discriminador. Dimension $d$. |
| $\mathbf{b}$ | Un **vector bias** de dimension $m$. |
| $A\varphi(\mathbf{x}) + \mathbf{b}$ | **Transformacion afin**: multiplica las features por $A$ y suma el bias. Produce un vector de dimension $m$ (una puntuacion por clase). |
| $\mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$ | **Projection**: al multiplicar por el one-hot $\mathbf{y}$, se **selecciona** la puntuacion correspondiente a la clase $y$. Es un **producto interno** entre $\mathbf{y}$ y el vector de puntuaciones. |

### Intuicion: ¿por que se llama "projection discriminator"?

El truco es que multiplicar por un vector one-hot $\mathbf{y}$ es lo mismo que **seleccionar una fila** de la matriz:

$$\mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b}) = (A\varphi(\mathbf{x}) + \mathbf{b})_y$$

Es decir, el discriminador calcula un vector de $m$ puntuaciones (una por clase) y luego **proyecta** (selecciona) la puntuacion de la clase $y$.

```
phi(x) in R^d
    |
    v
+-------------------+
| A * phi(x) + b    |  -->  vector de m puntuaciones (una por clase)
+--------+----------+
         |
         v
[score_0, score_1, ..., score_{m-1}]
         |
         |  y^T *   (seleccionar clase y)
         v
       score_y = h*(x, y)    -->  logit para la clase y
```

---

## Apartado (a) — [3 puntos, Escrito]

> *"Suppose that when $(\mathbf{x}, y) \sim p_\text{data}(\mathbf{x}, y)$, there exists a feature mapping $\varphi$ under which $\varphi(\mathbf{x})$ becomes a mixture of $m$ unit Gaussians... Show that $h^*(\mathbf{x}, y) = \mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$"*

### ¿Que pide?

Demostrar que bajo el supuesto Gaussiano (ecuacion 19), los logits del discriminador optimo tienen la forma de la ecuacion 20.

### ¿Que conceptos necesitas?

- El resultado del ejercicio 3(b): los logits optimos son $h^*(\mathbf{x}, y) = \log \frac{p_\text{data}(\mathbf{x}, y)}{p_\theta(\mathbf{x}, y)}$
- La factorizacion $p(\mathbf{x}, y) = p(\mathbf{x} \mid y) \cdot p(y)$ y el supuesto $p_\text{data}(y) = p_\theta(y) = \frac{1}{m}$
- La densidad de una Gaussiana multivariante con covarianza identidad
- Que $\mathbf{y}$ es un vector one-hot, y como expresar $\boldsymbol{\mu}_y - \tilde{\boldsymbol{\mu}}_y$ como multiplicacion de matrices

---

## Apartado (b) — [6 puntos, Codigo]

> *"Implement and train a conditional GAN on Fashion MNIST for one epoch."*

### ¿Que pide?

Implementar las funciones `conditional_loss_nonsaturating_g` y `conditional_loss_nonsaturating_d` en `submission/gan.py`.

### Funciones a implementar

| Funcion | ¿Que calcula? |
|---------|---------------|
| `conditional_loss_nonsaturating_d` | La loss del discriminador (ecuacion 17) para la GAN condicional |
| `conditional_loss_nonsaturating_g` | La loss non-saturating del generador: $L_G = -\mathbb{E}[\log D_\phi(G_\theta(\mathbf{z}, y), y)]$ |

### Notas de implementacion

El discriminador ya tiene la estructura de projection discriminator descrita arriba ($\varphi$, $A$, y $\mathbf{b}$ parametrizados por una red neuronal con una capa lineal final). El generador acepta la concatenacion de $\mathbf{z}$ y el one-hot $\mathbf{y}$.

Las funciones reciben:
- `g`: el generador
- `d`: el discriminador
- `x`: batch de imagenes reales
- `y`: batch de etiquetas de clase
- `device`: dispositivo (cpu/gpu)

### Ejecucion

```
python main.py --model cgan --out_dir gan_nonsat_conditional
```

---

## Resumen del ejercicio 4

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 3 | Derivar $h^*(\mathbf{x}, y) = \mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$ bajo supuesto Gaussiano |
| (b) | Codigo | 6 | Implementar las losses de cGAN en `gan.py` |
| **Total** | | **9** | |

### Conceptos clave del ejercicio

1. Una **cGAN** condiciona tanto el generador como el discriminador en la etiqueta de clase $y$
2. El **projection discriminator** estructura $h(\mathbf{x}, y)$ como $\mathbf{y}^T(A\varphi(\mathbf{x}) + \mathbf{b})$: un producto interno que selecciona la puntuacion de la clase correcta
3. Esta forma se justifica teoricamente bajo un supuesto de mezcla de Gaussianas en el espacio de features
4. Separar features ($\varphi$) de clasificacion ($\mathbf{y}^T \cdot$) es mas eficiente que concatenar $y$ en la entrada
