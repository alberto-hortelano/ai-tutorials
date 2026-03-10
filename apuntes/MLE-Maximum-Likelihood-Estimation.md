# MLE (Maximum Likelihood Estimation) y su conexión con KL

## Intuición: ¿Qué es MLE?

Tienes datos reales (por ejemplo, imágenes de caras) y un modelo con parámetros θ que define una distribución p_θ(x). MLE dice:

> Encuentra los parámetros θ que hacen que los datos observados sean lo más probables posible bajo tu modelo.

## Formalmente

Dado un dataset D = {x₁, x₂, ..., xₙ} de muestras i.i.d. de la distribución real p_data:

```
θ_MLE = arg max_θ  Π p_θ(xᵢ)
```

Multiplicar probabilidades es incómodo, así que tomamos logaritmo (que es monótono creciente, así que no cambia el óptimo):

```
θ_MLE = arg max_θ  Σ log p_θ(xᵢ)
```

Dividiendo entre N, esto es equivalente a maximizar el promedio empírico:

```
θ_MLE = arg max_θ  (1/N) Σ log p_θ(xᵢ)
```

Ese promedio empírico aproxima la esperanza bajo p_data:

```
≈ arg max_θ  E_{x ~ p_data} [log p_θ(x)]
```

## La conexión con KL

Ahora viene lo clave. Escribamos la KL Divergence de p_data a p_θ:

```
D_KL(p_data || p_θ) = E_{p_data}[log p_data(x)] - E_{p_data}[log p_θ(x)]
                       ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾   ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
                            -H(p_data)                 -H(p_data, p_θ)
```

El primer término, `E_{p_data}[log p_data(x)]`, es la entropía negativa de los datos. Es una **constante** — no depende de θ.

Entonces al minimizar respecto a θ:

```
arg min_θ  D_KL(p_data || p_θ) = arg min_θ  -E_{p_data}[log p_θ(x)]
                                = arg max_θ   E_{p_data}[log p_θ(x)]
```

Eso es exactamente MLE. Así que:

> **Maximizar la verosimilitud = Minimizar D_KL(p_data || p_θ)**

Son el mismo problema de optimización.

## Analogia: KL como coste de compresion

La KL divergence tiene una interpretacion elegante en teoria de la informacion. Imagina que tienes una moneda sesgada ($P[H] \gg P[T]$). El codigo de compresion optimo asigna secuencias cortas a los resultados frecuentes (como el codigo Morse: E = "·", T = "−").

Si diseñas tu codigo para una distribucion $q$ (por ejemplo, moneda justa: codigos de 1 bit) pero los datos vienen de $p$ (moneda sesgada: caras mucho mas frecuentes), estás desperdiciando bits. $D_{KL}(p \| q)$ mide exactamente esos **bits extra** que desperdicias por usar el codigo de $q$ cuando los datos siguen $p$.

En MLE, $q = p_\theta$ es tu modelo. Al minimizar $D_{KL}(p_{data} \| p_\theta)$, reduces el desperdicio de compresion: tu modelo se acerca al codigo optimo para los datos reales.

## ¿Por qué importa esta conexión?

Te da una interpretación geométrica de MLE: estás buscando, dentro de tu familia de modelos {p_θ}, el que esté más cerca de la distribución real p_data, donde "cercanía" se mide con KL Divergence.

## Un detalle sutil importante

Recuerda que KL no es simétrica. MLE minimiza `D_KL(p_data || p_θ)`, no `D_KL(p_θ || p_data)`. Esto tiene consecuencias prácticas. Te doy una pista para que lo pienses:

- `D_KL(p_data || p_θ)` penaliza fuertemente cuando `p_data(x) > 0` pero `p_θ(x) ≈ 0`. Es decir, tu modelo no puede ignorar regiones donde hay datos.
- ¿Qué crees que esto implica para el comportamiento del modelo? ¿Preferirá cubrir todos los modos de los datos, o concentrarse en los más probables?

Este punto de la asimetría es fundamental cuando más adelante compares MLE (autoregressive models, flows) con GANs, que optimizan divergencias diferentes.

## Bias-Variance Tradeoff en MLE

MLE con la log-verosimilitud empírica puede **sobreajustar** (overfitting): un modelo con demasiada capacidad puede memorizar los datos de entrenamiento pero generalizar mal a datos nuevos.

| Espacio de hipotesis | Problema | Ejemplo |
|----------------------|----------|---------|
| Muy restringido | **Bias alto**: no puede representar $p_{data}$ ni con datos infinitos | Ajustar una recta a datos curvos |
| Muy expresivo | **Varianza alta**: con pocos datos, modelos distintos ajustan datos distintos | Polinomio de grado 20 con 10 puntos |
| Punto justo | **Tradeoff**: suficiente expresividad sin sobreajustar | Polinomio de grado adecuado |

**Estrategias contra el overfitting:**
- **Restriccion dura:** Elegir una familia de modelos menos expresiva (redes mas pequenas, pesos compartidos como en NADE)
- **Regularizacion:** Agregar un termino al objetivo: $\text{objetivo}(\theta) = \text{log-likelihood}(\theta) + R(\theta)$, que penaliza modelos complejos (Occam's Razor)
- **Validacion:** Evaluar en datos no vistos (held-out validation set) para detectar sobreajuste
