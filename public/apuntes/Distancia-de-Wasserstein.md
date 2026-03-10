# Distancia de Wasserstein (Earth Mover's Distance)

## Intuicion: Que problema resuelve?

KL y JSD fallan cuando las distribuciones no se solapan: KL explota a infinito y JSD se satura en $\ln 2$. En ambos casos, los gradientes desaparecen o no son informativos. La distancia de Wasserstein siempre da una distancia **finita y suave**, incluso cuando los soportes son completamente disjuntos. Esto la hace ideal para optimizacion.

## Analogia

Imagina dos montones de arena (dos distribuciones). La distancia de Wasserstein es el **minimo trabajo total** (masa $\times$ distancia) necesario para transformar un monton en el otro. Por eso se llama "Earth Mover's Distance": es el costo del plan de transporte optimo.

## Construyendo la idea paso a paso

### Paso 1: El problema con KL y JSD

Considera dos Gaussianas estrechas: $p = \mathcal{N}(\theta, \epsilon^2)$ y $q = \mathcal{N}(0, \epsilon^2)$.

Cuando $\epsilon \to 0$ (se vuelven masas puntuales):

- $D_\text{KL}(p \| q) = \frac{\theta^2}{2\epsilon^2} \to \infty$ (explota)
- $D_\text{JSD}(p \| q) \to \ln 2$ (constante, sin gradiente util)
- $W_1(p, q) = |\theta|$ (lineal, gradiente perfecto)

Ninguna de las dos primeras le dice al generador **en que direccion moverse** para mejorar.

### Paso 2: Definicion primal (transporte optimo)

$$W_1(p, q) = \inf_{\gamma \in \Pi(p,q)} \mathbb{E}_{(x,y) \sim \gamma}\left[\|x - y\|\right]$$

Como se lee: "El infimo, sobre todos los planes de transporte $\gamma$ que tienen marginales $p$ y $q$, de la distancia esperada entre los puntos acoplados."

Cada plan de transporte $\gamma(x, y)$ describe cuanta masa mover desde $x$ hasta $y$. Buscamos el plan que minimiza el costo total.

### Paso 3: Forma dual (Kantorovich-Rubinstein)

Calcular el infimo sobre todos los planes de transporte es intratable. La dualidad de Kantorovich-Rubinstein nos da una formulacion equivalente:

$$W_1(p, q) = \sup_{\|f\|_L \leq 1} \left(\mathbb{E}_{x \sim p}[f(x)] - \mathbb{E}_{x \sim q}[f(x)]\right)$$

Como se lee: "El supremo sobre todas las funciones 1-Lipschitz $f$ de la diferencia de esperanzas bajo $p$ y bajo $q$."

Una funcion es 1-Lipschitz si $|f(x_1) - f(x_2)| \leq \|x_1 - x_2\|$ para todo $x_1, x_2$. Es decir, su pendiente nunca excede 1.

### Paso 4: Ejemplo numerico

Caso simple: $p = \delta_0$ (masa puntual en 0), $q = \delta_\theta$ (masa puntual en $\theta$).

- $W_1(p, q) = |\theta|$ -- lineal y suave
- $D_\text{KL}(p \| q) = \infty$ (soportes disjuntos)
- $D_\text{JSD}(p \| q) = \ln 2$ (constante)

Wasserstein da un gradiente proporcional a la distancia real entre las distribuciones. Exactamente lo que necesitas para optimizar.

### Paso 5: WGAN-GP (la implementacion practica)

En el WGAN original, el critico (antes "discriminador") aproxima la funcion 1-Lipschitz. WGAN-GP impone la restriccion de Lipschitz con una **penalizacion de gradiente**:

$$\mathcal{L}_\text{critico} = \mathbb{E}_{x \sim p_G}[D(x)] - \mathbb{E}_{x \sim p_\text{data}}[D(x)] + \lambda\, \mathbb{E}_{\hat{x}}\left[(\|\nabla_{\hat{x}} D(\hat{x})\|_2 - 1)^2\right]$$

donde $\hat{x}$ se muestrea uniformemente a lo largo de lineas rectas entre puntos de $p_\text{data}$ y $p_G$.

## Propiedades clave

| Propiedad | Significado |
|---|---|
| $W(p,q) \geq 0$ | No negativa |
| $W(p,q) = 0$ sii $p = q$ | Cero solo si las distribuciones son iguales |
| $W(p,q) = W(q,p)$ | Simetrica |
| Satisface desigualdad triangular | Es una **metrica real** (a diferencia de KL) |
| Continua respecto a parametros | Gradientes suaves -- ideal para optimizacion |
| Finita cuando KL/JSD fallan | Funciona con soportes disjuntos |

## Por que aparece en generative models?

WGAN reemplaza la JSD del GAN original por la distancia de Wasserstein. Resultado: gradientes mas suaves, entrenamiento mas estable, y la perdida del critico se correlaciona con la calidad de las muestras generadas (a diferencia del GAN original donde la perdida del discriminador no es informativa).

Pregunta socratica: Por que necesitamos la restriccion de Lipschitz en la forma dual? Piensa: si permitimos funciones con derivadas arbitrariamente grandes, que pasaria con el supremo? Y como se relaciona esto con la estabilidad del entrenamiento?

Cross-links: [KL-Divergence.md](KL-Divergence.md), [Divergencia-de-Jensen-Shannon.md](Divergencia-de-Jensen-Shannon.md), [f-Divergencias.md](f-Divergencias.md)
