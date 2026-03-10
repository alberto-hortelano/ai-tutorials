# Entropía Cruzada H(P, Q)

La entropía mide la sorpresa promedio cuando usas la distribución correcta P. La entropía cruzada pregunta:

> ¿Cuánta sorpresa promedio tienes si los datos vienen de P, pero mides la sorpresa con Q?

```
H(P, Q) = E_{x~P}[-log q(x)] = -Σ p(x) log q(x)
```

La diferencia con H(P) es sutil pero importante:

|  | Muestreas de | Mides sorpresa con |
|---|---|---|
| H(P) | P | P |
| H(P, Q) | P | Q |

## Ejemplo concreto

Supón que la realidad es una moneda justa y tu modelo dice que cara tiene probabilidad 0.9:

```
P: p(cara) = 0.5,  p(cruz) = 0.5
Q: q(cara) = 0.9,  q(cruz) = 0.1
```

**Entropía (modelo perfecto):**

```
H(P) = -0.5·log₂(0.5) - 0.5·log₂(0.5) = 1 bit
```

**Entropía cruzada (modelo equivocado):**

```
H(P,Q) = -0.5·log₂(0.9) - 0.5·log₂(0.1)
       = -0.5·(-0.152) - 0.5·(-3.322)
       = 0.076 + 1.661
       = 1.737 bits
```

Tu modelo Q necesita 0.737 bits extra en promedio. ¿Por qué? Porque Q asigna solo 0.1 a cruz, pero cruz ocurre el 50% del tiempo — así que Q se "sorprende" mucho cada vez que sale cruz.

## La propiedad fundamental

Siempre se cumple:

```
H(P, Q) ≥ H(P)
```

Usar el modelo equivocado nunca mejora las cosas. La igualdad solo ocurre cuando `Q = P`.

## Pregunta para ti

¿Cuánto vale `H(P, Q) - H(P)` en el ejemplo de arriba, y qué nombre tiene esa cantidad?

> La KL Divergence, 0.737 bits
