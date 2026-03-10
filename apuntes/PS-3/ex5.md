# Ejercicio 5 — Wasserstein GAN

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: El problema de las divergencias

En el ejercicio 3 vimos que el generador de una GAN (con discriminador optimo y loss non-saturating) minimiza $\text{KL}(p_\theta \| p_\text{data})$. Pero ¿que pasa cuando las distribuciones tienen soportes disjuntos o casi disjuntos?

El problema central: en la practica, los datos reales viven en un manifold de baja dimension dentro de un espacio de alta dimension (como imagenes de 784 pixeles). La distribucion generada tambien. Si estos manifolds no se solapan, la KL divergence puede ser infinita o tener gradiente cero — haciendo imposible entrenar el generador por descenso de gradiente.

Este ejercicio usa un caso simple (Gaussianas 1D estrechas) para ilustrar el problema y motivar la solucion: la **distancia Wasserstein**.

### Nota importante del enunciado

Para los apartados (a)-(d), $x$ es escalar (no boldface), porque trabajamos con distribuciones 1D.

---

## Ecuacion 21 — KL entre Gaussianas estrechas

$$\text{KL}(p_\theta(x) \| p_\text{data}(x)) = \frac{(\theta - \theta_0)^2}{2\epsilon^2}$$

donde $p_\theta(x) = \mathcal{N}(x \mid \theta, \epsilon^2)$ y $p_\text{data}(x) = \mathcal{N}(x \mid \theta_0, \epsilon^2)$.

### Como se lee

> "La divergencia KL entre dos Gaussianas con la misma varianza $\epsilon^2$ centradas en $\theta$ y $\theta_0$ es el cuadrado de la distancia entre sus medias, dividido por dos veces la varianza."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $p_\theta(x) = \mathcal{N}(x \mid \theta, \epsilon^2)$ | Gaussiana centrada en $\theta$ con desviacion estandar $\epsilon$. Esta es la distribucion del **modelo** (generador). |
| $p_\text{data}(x) = \mathcal{N}(x \mid \theta_0, \epsilon^2)$ | Gaussiana centrada en $\theta_0$ con la misma desviacion estandar $\epsilon$. Esta es la distribucion **real** (datos). |
| $\theta - \theta_0$ | La **distancia entre las medias** de ambas distribuciones. |
| $\epsilon$ | La **desviacion estandar** (ancho) de ambas Gaussianas. |
| $\frac{(\theta - \theta_0)^2}{2\epsilon^2}$ | La KL es proporcional al cuadrado de la distancia entre medias e **inversamente** proporcional a la varianza. |

### Intuicion

Cuando $\epsilon$ es grande (Gaussianas anchas), las distribuciones se solapan mucho y la KL es moderada. Cuando $\epsilon$ es pequeno (Gaussianas estrechas), el solapamiento disminuye y la KL crece rapidamente.

```
eps grande (solapamiento):       eps pequeno (poco solapamiento):

    /---\   /---\                         |\ |\
   /     \ /     \                        | \| \
  /    /\  /\    \                        |  |  \
 /   /    \   \   \                       |  |   \
-----------------------               ----  ----  ---
   theta_0    theta                     theta_0  theta
   KL = moderada                       KL = muy alta
```

---

## Apartado (a) — [2 puntos, Escrito]

> *"Show that $\text{KL}(p_\theta(x) \| p_\text{data}(x)) = \frac{(\theta - \theta_0)^2}{2\epsilon^2}$"*

### ¿Que pide?

Demostrar la formula de la KL entre dos Gaussianas 1D con la misma varianza pero medias distintas.

### ¿Que conceptos necesitas?

- La definicion de KL divergence: $\text{KL}(p \| q) = \mathbb{E}_p\left[\log \frac{p(x)}{q(x)}\right]$
- La densidad de una Gaussiana 1D: $\mathcal{N}(x \mid \mu, \sigma^2) = \frac{1}{\sigma\sqrt{2\pi}} \exp\left(-\frac{(x-\mu)^2}{2\sigma^2}\right)$
- Que el log del cociente de dos Gaussianas con la misma varianza simplifica la constante de normalizacion

---

## Apartado (b) — [1.5 puntos, Escrito]

> *"Consider the limit $\epsilon \to 0$. What happens to $\text{KL}(p_\theta(x) \| p_\text{data}(x))$ and its derivative with respect to $\theta$?"*

### ¿Que pide?

Analizar que ocurre cuando las Gaussianas se vuelven cada vez mas estrechas (tienden a deltas de Dirac), asumiendo $\theta \neq \theta_0$:

1. ¿Que le pasa al valor de la KL?
2. ¿Que le pasa al gradiente $\frac{\partial}{\partial\theta} \text{KL}$?
3. ¿Por que esto es problematico para entrenar una GAN con $L_G = \text{KL}(p_\theta \| p_\text{data})$?

### Intuicion

Piensa en la formula $\frac{(\theta - \theta_0)^2}{2\epsilon^2}$ cuando $\epsilon \to 0$ con $\theta \neq \theta_0$:

| $\epsilon$ | KL | $\frac{\partial \text{KL}}{\partial \theta}$ | ¿El gradiente ayuda? |
|---|---|---|---|
| 1.0 | $\frac{(\theta-\theta_0)^2}{2}$ | $\theta - \theta_0$ | Si, gradiente finito |
| 0.1 | $\frac{(\theta-\theta_0)^2}{0.02}$ | $\frac{\theta-\theta_0}{0.01}$ | Gradiente enorme |
| $\to 0$ | $\to \infty$ | $\to \pm\infty$ | Gradiente explota |

Cuando las distribuciones tienen soportes disjuntos (el caso limite), la KL diverge y el gradiente no da informacion util para el descenso de gradiente.

---

## Ecuaciones 22-23 — Objetivos alternativos (sin sigmoide)

$$L_D(\phi; \theta) = \mathbb{E}_{x \sim p_\theta(x)}[D_\phi(x)] - \mathbb{E}_{x \sim p_\text{data}(x)}[D_\phi(x)]$$

$$L_G(\theta; \phi) = -\mathbb{E}_{x \sim p_\theta(x)}[D_\phi(x)]$$

### Como se lee

> "La loss del discriminador es la diferencia entre la salida media del discriminador en datos generados y en datos reales. La loss del generador es menos la salida media del discriminador en datos generados."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $D_\phi(x)$ | Ya **no** es una probabilidad entre 0 y 1. Ahora $D_\phi$ puede devolver **cualquier numero real** (no hay sigmoide al final). A veces se le llama **critico** (critic) en lugar de discriminador. |
| $\mathbb{E}_{p_\theta}[D_\phi(x)]$ | Promedio de las puntuaciones del critico sobre datos **generados**. |
| $\mathbb{E}_{p_\text{data}}[D_\phi(x)]$ | Promedio de las puntuaciones del critico sobre datos **reales**. |

### Intuicion

El discriminador (critico) intenta **minimizar** $L_D$, es decir:
- **Aumentar** $\mathbb{E}_{p_\text{data}}[D_\phi(x)]$ --> dar puntuaciones **altas** a datos reales
- **Disminuir** $\mathbb{E}_{p_\theta}[D_\phi(x)]$ --> dar puntuaciones **bajas** a datos generados

El generador intenta **minimizar** $L_G = -\mathbb{E}_{p_\theta}[D_\phi(x)]$, es decir, **maximizar** la puntuacion que el critico da a sus muestras.

---

## Apartado (c) — [1.5 puntos, Escrito]

> *"Again consider the limit $\epsilon \to 0$... Why is there no discriminator $D_\phi$ that minimizes this new objective $L_D$?"*

### ¿Que pide?

Explicar por que, con distribuciones puntuales (deltas de Dirac) y sin restriccion sobre $D_\phi$, no existe un $D_\phi$ que minimice $L_D$.

### Intuicion

Si $p_\theta = \delta_\theta$ y $p_\text{data} = \delta_{\theta_0}$ con $\theta \neq \theta_0$:

$$L_D = D_\phi(\theta) - D_\phi(\theta_0)$$

El discriminador quiere hacer $D_\phi(\theta_0)$ lo mas grande posible y $D_\phi(\theta)$ lo mas pequeno posible. Como $D_\phi$ no tiene restriccion, puede hacer la diferencia **arbitrariamente negativa**: $D_\phi(\theta_0) \to +\infty$ y $D_\phi(\theta) \to -\infty$. No hay minimo finito.

---

## Apartado (d) — [1.5 puntos, Escrito]

> *"Suppose that $D_\phi$ is restricted to differentiable functions whose derivative with respect to $x$ is always between -1 and 1."*

### ¿Que pide?

Analizar que pasa si restringimos $D_\phi$ a funciones **1-Lipschitz** (cuya derivada esta acotada entre -1 y 1). ¿Ahora existe un optimo? ¿Que forma tiene?

### ¿Que es una funcion Lipschitz?

Una funcion $f$ es **$K$-Lipschitz** si:

$$|f(x) - f(y)| \leq K |x - y| \quad \text{para todo } x, y$$

Para $K = 1$ (1-Lipschitz), la funcion no puede cambiar mas rapido que con pendiente 1 (o -1):

```
1-Lipschitz:                     NO 1-Lipschitz:

      /--                                 /
    /                                   /
  /                                   /
/                                   /
   pendiente in [-1, 1]         pendiente > 1 en algun punto
```

### Conexion con la distancia Wasserstein

La **dualidad de Kantorovich-Rubinstein** establece que:

$$W_1(p, q) = \sup_{\|D\|_L \leq 1} \left\{\mathbb{E}_{p}[D(x)] - \mathbb{E}_{q}[D(x)]\right\}$$

donde el supremo se toma sobre todas las funciones 1-Lipschitz $D$. Es decir, la distancia Wasserstein-1 es exactamente el valor de $-L_D$ evaluado en el discriminador optimo:

$$W_1(p_\text{data}, p_\theta) = \mathbb{E}_{p_\text{data}}[D^*(x)] - \mathbb{E}_{p_\theta}[D^*(x)]$$

---

## Ecuaciones 24-25 — WGAN con Gradient Penalty (WGAN-GP)

$$L_D(\phi; \theta) = \mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[D_\phi(\mathbf{x})] - \mathbb{E}_{\mathbf{x} \sim p_\text{data}(\mathbf{x})}[D_\phi(\mathbf{x})] + \lambda \mathbb{E}_{\mathbf{x} \sim r_\theta(\mathbf{x})}[(\|\nabla D_\phi(\mathbf{x})\|_2 - 1)^2]$$

$$L_G(\theta; \phi) = -\mathbb{E}_{\mathbf{x} \sim p_\theta(\mathbf{x})}[D_\phi(\mathbf{x})]$$

### Como se lee

> "La loss del discriminador es la misma que antes (puntuacion media generada menos real) mas un **termino de penalizacion** que castiga al discriminador si el gradiente de su salida respecto a la entrada se desvia de norma 1."

### Simbolo por simbolo

| Simbolo | Significado |
|---------|-------------|
| $\lambda$ | **Hiperparametro de penalizacion**. Controla cuanto se penaliza al discriminador por violar la restriccion Lipschitz. El valor usual es $\lambda = 10$. |
| $r_\theta(\mathbf{x})$ | **Distribucion de interpolacion**. Se construye muestreando $\alpha \sim \text{Uniform}(0, 1)$, $\mathbf{x}_1 \sim p_\theta(\mathbf{x})$, $\mathbf{x}_2 \sim p_\text{data}(\mathbf{x})$, y tomando $\mathbf{x} = \alpha \mathbf{x}_1 + (1-\alpha) \mathbf{x}_2$. Son puntos "entre" datos reales y generados. |
| $\nabla D_\phi(\mathbf{x})$ | El **gradiente** de la salida del discriminador respecto a la **entrada** $\mathbf{x}$. Es un vector de la misma dimension que $\mathbf{x}$. |
| $\|\nabla D_\phi(\mathbf{x})\|_2$ | La **norma L2** (norma de Frobenius) del gradiente. Mide "cuanto cambia" la salida del discriminador cuando se perturba la entrada. |
| $(\|\nabla D_\phi(\mathbf{x})\|_2 - 1)^2$ | **Gradient penalty**: penaliza cuadraticamente la desviacion de la norma del gradiente respecto a 1. Si el gradiente tiene norma exactamente 1, la penalizacion es 0. |

### Intuicion: ¿por que penalizar el gradiente?

En los apartados (c)-(d) vimos que:
- Sin restriccion, no existe discriminador optimo (diverge a infinito)
- Con restriccion 1-Lipschitz, si existe y la loss estima la distancia Wasserstein

La **gradient penalty** (GP) es una forma *soft* de imponer la restriccion Lipschitz: en lugar de restringir la arquitectura de la red, anadimos un termino a la loss que penaliza si $\|\nabla D_\phi\| \neq 1$.

Se evalua en puntos interpolados $r_\theta(\mathbf{x})$ porque la restriccion es mas importante a lo largo del "camino" entre datos reales y generados.

```
Datos reales (x_2)  ---- interpolacion ----  Datos generados (x_1)
                          x = alpha*x_1 + (1-alpha)*x_2
                                   |
                    Aqui se evalua ||grad D||_2 ~ 1
```

### ¿Que es la norma de Frobenius?

En este contexto, $\|\nabla D_\phi(\mathbf{x})\|_2$ es la norma L2 del vector gradiente. Si la imagen tiene dimension $d$ (por ejemplo, 784 para MNIST 28x28), el gradiente es un vector de dimension $d$, y su norma es:

$$\|\nabla D_\phi(\mathbf{x})\|_2 = \sqrt{\sum_{i=1}^{d} \left(\frac{\partial D_\phi(\mathbf{x})}{\partial x_i}\right)^2}$$

---

## Apartado (e) — [7 puntos, Codigo]

> *"Implement and train WGAN-GP for one epoch on Fashion MNIST."*

### ¿Que pide?

Implementar las funciones `loss_wasserstein_gp_g` y `loss_wasserstein_gp_d` en `submission/gan.py`.

### Funciones a implementar

| Funcion | ¿Que calcula? |
|---------|---------------|
| `loss_wasserstein_gp_d` | La loss del discriminador (ecuacion 24): termino Wasserstein + gradient penalty |
| `loss_wasserstein_gp_g` | La loss del generador (ecuacion 25): $-\mathbb{E}[D_\phi(\mathbf{x})]$ |

### La gradient penalty en detalle

El paso mas desafiante es calcular la gradient penalty. El enunciado da una pista importante sobre como vectorizarlo eficientemente.

Para calcular $\nabla D_\phi(\mathbf{x})$ (el gradiente de la salida del discriminador respecto a la entrada) en PyTorch, necesitas `torch.autograd.grad`. El truco del enunciado muestra que puedes calcular todos los gradientes del batch a la vez:

1. Construir los puntos interpolados: $\mathbf{x}_\text{interp} = \alpha \mathbf{x}_\text{fake} + (1-\alpha) \mathbf{x}_\text{real}$
2. Calcular $D_\phi(\mathbf{x}_\text{interp})$ para todo el batch
3. Usar `torch.autograd.grad` con `create_graph=True` para obtener $\nabla D_\phi(\mathbf{x}_\text{interp})$
4. Calcular la norma de cada gradiente: $\|\nabla D_\phi(\mathbf{x}^{(i)})\|_2$
5. Aplicar la penalizacion: $\lambda \cdot \text{mean}[(\|\nabla D_\phi\|_2 - 1)^2]$

### Ejecucion

```
python main.py --model gan --out_dir gan_wass_gp --loss_type wasserstein_gp
```

---

## Resumen del ejercicio 5

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 2 | Demostrar KL entre Gaussianas con misma varianza |
| (b) | Escrito | 1.5 | Analizar limite $\epsilon \to 0$: KL y gradiente divergen |
| (c) | Escrito | 1.5 | Explicar por que no hay $D^*$ optimo sin restriccion |
| (d) | Escrito | 1.5 | Describir $D^*$ con restriccion Lipschitz |
| (e) | Codigo | 7 | Implementar WGAN-GP (gradient penalty) |
| **Total** | | **13.5** | |

### Conceptos clave del ejercicio

1. La **KL divergence** entre Gaussianas estrechas crece como $1/\epsilon^2$: diverge cuando los soportes se separan
2. En el limite de soportes disjuntos, KL y JSD dan **gradientes inutiles** (infinitos o cero)
3. Sin restriccion, el discriminador de la WGAN no tiene optimo (puede hacer la loss arbitrariamente negativa)
4. La restriccion **1-Lipschitz** (pendiente acotada) garantiza un optimo y conecta con la **distancia Wasserstein**
5. La **gradient penalty** impone la restriccion Lipschitz de forma soft, penalizando $(\|\nabla D\|_2 - 1)^2$
6. La distancia Wasserstein da **gradientes utiles** incluso cuando las distribuciones no se solapan
