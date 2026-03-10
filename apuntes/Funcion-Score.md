# Funcion Score (Score Function)

## Intuicion: Que problema resuelve?

Muchos modelos generativos necesitan evaluar $p(x)$, lo cual requiere conocer la constante de normalizacion $Z$. La funcion score $\nabla_x \log p(x)$ evita este problema por completo, porque el gradiente del logaritmo elimina la constante.

La pregunta motivadora es: si no puedes calcular $p(x)$ directamente, puedes al menos saber hacia donde crece?

## Analogia

Imagina que estas con los ojos vendados en un paisaje montanoso (la distribucion de probabilidad). No puedes ver la altura absoluta (la densidad $p(x)$), pero SI puedes sentir en que direccion va cuesta arriba (el gradiente). La funcion score es como tu sentido de "hacia donde sube el terreno" -- te dice la direccion hacia mayor probabilidad sin necesidad de conocer las alturas reales.

## Construyendo la idea paso a paso

### Paso 1: El problema de la constante de normalizacion

Para un modelo basado en energia tenemos:

$$p_\theta(x) = \frac{1}{Z_\theta} \exp(-E_\theta(x))$$

Calcular $Z_\theta = \int \exp(-E_\theta(x)) \, dx$ es intratable en dimensiones altas. Esta integral sobre todo el espacio hace que evaluar $p_\theta(x)$ directamente sea imposible en la practica.

### Paso 2: El truco del logaritmo y el gradiente

Observa que pasa cuando tomamos el gradiente del logaritmo:

$$\nabla_x \log p_\theta(x) = \nabla_x \log \frac{\exp(-E_\theta(x))}{Z_\theta} = -\nabla_x E_\theta(x) - \nabla_x \log Z_\theta = -\nabla_x E_\theta(x)$$

El termino $\log Z_\theta$ desaparece porque $Z_\theta$ no depende de $x$. Esto es clave: podemos calcular el score sin conocer la constante de normalizacion.

### Paso 3: Definicion formal

$$s(x) = \nabla_x \log p(x)$$

Como se lee: "s de x es el gradiente respecto a x del logaritmo de p de x."

Que significa: es un **vector** que apunta en la direccion donde la densidad $p(x)$ crece mas rapido. Su magnitud indica que tan rapido crece.

### Paso 4: Ejemplo con Gaussiana 1D

Sea $p(x) = \mathcal{N}(x \mid \mu, \sigma^2)$. Entonces:

$$\log p(x) = -\frac{1}{2}\log(2\pi\sigma^2) - \frac{(x-\mu)^2}{2\sigma^2}$$

$$s(x) = \nabla_x \log p(x) = -\frac{x - \mu}{\sigma^2}$$

Interpretacion:
- El score siempre apunta hacia la media $\mu$.
- Si $x > \mu$, el score es negativo (ve a la izquierda).
- Si $x < \mu$, el score es positivo (ve a la derecha).
- La magnitud es inversamente proporcional a la varianza: distribucion estrecha = score mas fuerte.

### Paso 5: Campo vectorial del score

Para una mezcla de Gaussianas en 2D, el campo del score muestra flechas apuntando hacia el modo mas cercano. Cada punto del espacio tiene una flecha que dice "la probabilidad crece en esta direccion." Este campo vectorial es la base del muestreo por dinamica de Langevin.

```
Mezcla de dos Gaussianas 1D:

  p(x)                               s(x) = d/dx log p(x)
   ^                                    ^
   |    *         *                     |  +
   |   ***       ***                    | +++  ↘    ↗  +++
   |  *****     *****                   |++++    ↘↗    ++++
   | ******* *********                  |         ↕
   └──────────────────► x               └──────────────────► x
      μ₁        μ₂                        μ₁   (cero)  μ₂
                                           ↑     aqui     ↑
  Densidad: dos picos               Score: apunta hacia
                                     el modo mas cercano.
                                     Cruza por cero en los modos.
```

### Paso 6: Formula de Tweedie

Si corrompemos un dato $x$ con ruido gaussiano ($\tilde{x} = x + \sigma\epsilon$), la formula de Tweedie nos dice que la mejor estimacion del dato limpio es:

$$\mathbb{E}[x \mid \tilde{x}] = \tilde{x} + \sigma^2 \nabla_{\tilde{x}} \log q_\sigma(\tilde{x})$$

Es decir: para "limpiar" un dato ruidoso, basta con dar un paso en la direccion del score, escalado por la varianza del ruido $\sigma^2$. Esto conecta directamente la funcion score con denoising y con la prediccion de $x_0$ en modelos de difusion.

## Propiedades clave

| Propiedad | Significado |
|---|---|
| $s(x) = \nabla_x \log p(x)$ | Es un vector, no un escalar |
| No depende de $Z$ | Permite trabajar con densidades no normalizadas |
| $s(x) = 0$ en los modos | En los maximos de $p(x)$, el gradiente es cero |
| $\mathbb{E}_{p(x)}[s(x)] = 0$ | El score promedio bajo la distribucion es cero (identidad de Stein) |
| Dimension: misma que $x$ | Si $x \in \mathbb{R}^d$, entonces $s(x) \in \mathbb{R}^d$ |
| Tweedie | $\mathbb{E}[x|\tilde{x}] = \tilde{x} + \sigma^2 s(\tilde{x})$: el score permite denoising optimo |

## Por que aparece en generative models?

En este curso, la funcion score aparece constantemente porque:

1. **Score matching**: Aprender un modelo $s_\theta(x) \approx \nabla_x \log p_\text{data}(x)$ sin necesidad de conocer $p_\text{data}$ directamente.
2. **Dinamica de Langevin**: Muestrear de $p(x)$ usando solamente el score (sin necesitar $Z$).
3. **Modelos de difusion**: La red de prediccion de ruido $\epsilon_\theta$ esta directamente relacionada con el score.

Te pregunto: si el score es cero en los modos de la distribucion, como puede un campo de scores distinguir entre un maximo local (modo) y un punto de silla? Pista: piensa en la segunda derivada -- el Hessiano de $\log p(x)$.

## Cross-links

- [score_matching.md](score_matching.md)
- [modelos_difusion.md](modelos_difusion.md)
- [Modelos-Basados-en-Energia.md](Modelos-Basados-en-Energia.md)
