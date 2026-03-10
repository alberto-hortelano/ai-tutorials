# I(x) = -log p(x) — Información de un evento

La pregunta es: ¿por qué esta fórmula y no otra? No es arbitraria. Sale de exigir que la "información" cumpla propiedades que intuitivamente tienen sentido.

## Los axiomas

Queremos una función I(x) que mida cuánta información obtienes al saber que ocurrió el evento x, que tiene probabilidad p(x). Pedimos tres cosas razonables:

1. **I depende solo de la probabilidad**: `I(x) = f(p(x))` para alguna función f.
2. **Monotonicidad**: Si `p(x) < p(y)`, entonces `I(x) > I(y)`. Eventos más raros dan más información.
3. **Aditividad**: Si x e y son eventos independientes, la información de observar ambos es la suma: `I(x, y) = I(x) + I(y)`

## ¿Por qué el logaritmo?

La aditividad es la condición clave. Si x e y son independientes:

```
p(x, y) = p(x) · p(y)
```

Y necesitamos:

```
f(p(x, y)) = f(p(x)) + f(p(y))
f(p(x) · p(y)) = f(p(x)) + f(p(y))
```

¿Qué función convierte un producto en una suma? El logaritmo. Es la única función continua que satisface `f(ab) = f(a) + f(b)`.

Entonces `I(x) = log p(x)`. Pero como `0 < p(x) ≤ 1`, el logaritmo es negativo o cero. Para que la información sea no-negativa, ponemos el signo menos:

```
I(x) = -log p(x)
```

## Verificando las propiedades

| Propiedad | ¿Se cumple? |
|---|---|
| Evento seguro (p=1) | `I = -log(1) = 0` — no aprendes nada |
| Evento imposible (p→0) | `I → ∞` — información infinita |
| Evento raro < probable | `-log(0.01) > -log(0.5)` — más información |
| Independencia | `-log(p·q) = -log p + (-log q)` — se suman |

## Ejemplo concreto

Lanzas una moneda justa. Sale cara (p = 0.5):

```
I(cara) = -log₂(0.5) = -(-1) = 1 bit
```

Un bit — que es exactamente lo que esperarías de un evento binario equiprobable.

Ahora un dado justo, sale 3 (p = 1/6):

```
I(3) = -log₂(1/6) ≈ 2.58 bits
```

Más información, porque era menos predecible.

**Ejercicio:** Suma los dos ejemplos anteriores
```
I(cara, 3) = -log₂(0.5) -log₂(1/6) = 3.58 bits
```
