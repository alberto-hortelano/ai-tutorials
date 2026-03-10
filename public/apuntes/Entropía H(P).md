# Entropía H(P)

Ya sabes que `I(x) = -log p(x)` mide la información de un evento particular. La entropía responde una pregunta distinta:

> En promedio, ¿cuánta información esperas recibir al observar un evento de la distribución P?

Es simplemente el valor esperado de I(x):

```
H(P) = E_{x~P}[I(x)] = E_{x~P}[-log p(x)] = -Σ p(x) log p(x)
```

Cada término `p(x) log p(x)` pondera la información de cada evento por su probabilidad de ocurrir.

## Ejemplo: moneda con sesgo

Una moneda con `p(cara) = q` y `p(cruz) = 1-q`:

```
H(P) = -q·log₂(q) - (1-q)·log₂(1-q)
```

| q (prob. cara) | H(P) |
|---|---|
| 0.5 | 1 bit |
| 0.9 | 0.47 bits |
| 1.0 | 0 bits |

¿Ves el patrón? La entropía es máxima cuando hay máxima incertidumbre (q=0.5) y es cero cuando el resultado es determinista (q=1).

## ¿Qué mide realmente?

- **Alta entropía**: la distribución es "dispersa", difícil de predecir, necesitas muchos bits para codificar el resultado.
- **Baja entropía**: la distribución está concentrada, el resultado es predecible, necesitas pocos bits.

De hecho, la entropía tiene una interpretación operacional precisa: es el mínimo número promedio de bits que necesitas para comunicar muestras de P (teorema de codificación de fuente de Shannon).

## Un caso que vale la pena verificar

Para el dado justo (p(x) = 1/6 para cada cara):

```
H(P) = -6 · (1/6) · log₂(1/6) = log₂(6) ≈ 2.58 bits
```

Nota que coincide con `I(x)` para cualquier cara individual. Esto tiene sentido — cuando todos los eventos son equiprobables, no hay sorpresas: cada evento te da exactamente la información promedio.

## Pregunta para ti

¿Para qué distribución discreta con N posibles valores se maximiza la entropía, y cuánto vale ese máximo?

> La distribución uniforme, `H = log₂(N)`
