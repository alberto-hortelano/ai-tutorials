# KL Divergence (Divergencia de Kullback-Leibler)

## Intuición: ¿Qué problema resuelve?

Imagina que tienes dos distribuciones de probabilidad:

- **P**: la distribución "real" de los datos (la verdad)
- **Q**: una distribución que tú propones como aproximación

La pregunta natural es: ¿qué tan diferente es Q de P? La KL Divergence es una forma de medir esa diferencia.

## Analogía

Piensa en un dado justo (P) vs. un dado cargado (Q). Si alguien te da datos generados por el dado justo, pero tú crees que vienen del dado cargado, ¿qué tan "sorprendido" estarías en promedio? Esa "sorpresa extra" es la KL Divergence.

## Construyendo la idea paso a paso

### Paso 1: Información de un evento

Si un evento tiene probabilidad p, la "sorpresa" o información que te da es:

```
I(x) = -log p(x)
```
[I(x)-Informacion-de-un-evento.md](I(x)-Informacion-de-un-evento.md)

Evento muy probable → poca sorpresa. Evento raro → mucha sorpresa.

### Paso 2: Entropía

La entropía es la sorpresa promedio bajo la distribución P:

```
H(P) = E_P[-log p(x)] = -Σ p(x) log p(x)
```

Es la cantidad de información que esperas recibir si los datos siguen P.

### Paso 3: Entropía cruzada

Ahora, ¿qué pasa si los datos vienen de P, pero tú mides la sorpresa usando Q? Eso es la entropía cruzada:

```
H(P, Q) = E_P[-log q(x)] = -Σ p(x) log q(x)
```

Usas P para ponderar, pero Q para medir sorpresa. Siempre se cumple que `H(P, Q) >= H(P)` — usar el modelo equivocado nunca reduce la sorpresa promedio.

### Paso 4: KL Divergence

La KL Divergence es exactamente esa sorpresa extra — la diferencia entre la entropía cruzada y la entropía:

```
D_KL(P || Q) = H(P, Q) - H(P)
             = -Σ p(x) log q(x) - (-Σ p(x) log p(x))
             = Σ p(x) log [p(x) / q(x)]
```

## Propiedades clave

| Propiedad | Significado |
|---|---|
| `D_KL(P \|\| Q) >= 0` | Siempre es no-negativa (desigualdad de Gibbs) |
| `D_KL(P \|\| Q) = 0` sii `P = Q` | Es cero solo cuando las distribuciones son idénticas |
| `D_KL(P \|\| Q) ≠ D_KL(Q \|\| P)` | No es simétrica — no es una distancia real |

La asimetría es importante. Te pregunto: ¿por qué crees que importa cuál distribución va primero? Piensa en qué pasa si P le da probabilidad a una región pero Q no, vs. el caso contrario.

## ¿Por qué aparece en generative models?

En este curso, la KL Divergence aparece constantemente porque:

1. **MLE = minimizar KL**: Maximizar la log-verosimilitud de tus datos es equivalente a minimizar `D_KL(p_data || p_modelo)`. Es decir, estás haciendo que tu modelo se parezca lo más posible a la distribución real.
2. **VAEs**: El ELBO contiene un término KL que mide qué tan lejos está tu posterior aproximado `q(z|x)` del prior `p(z)`.
3. **GANs**: Diferentes formulaciones de GANs minimizan diferentes divergencias (incluyendo KL, reverse-KL, Jensen-Shannon).
