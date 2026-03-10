# Independencia Condicional

## Intuicion: Que problema resuelve?

Una distribucion conjunta sobre n variables binarias necesita $2^n - 1$ parametros. Con n=100, eso es mas parametros que atomos en el universo. Las suposiciones de independencia condicional permiten reducir esto drasticamente, haciendo que los modelos sean tratables.

## Analogia

Piensa en el clima, un aspersor y el cesped mojado. Si ya sabes que llovio, saber que el aspersor estaba encendido no cambia tu creencia sobre si el cesped esta mojado. El aspersor y la lluvia son condicionalmente independientes dado el estado del cesped. Esto es exactamente lo que captura la **d-separacion** en redes bayesianas.

## Construyendo la idea paso a paso

### Paso 1: Independencia (no condicional)

$$
X \perp Y \iff p(X, Y) = p(X) \cdot p(Y)
$$

**Como leerla:** "X es independiente de Y si y solo si la conjunta se factoriza como el producto de las marginales."

Saber X no te dice nada sobre Y. Ejemplo: el resultado de lanzar dos dados diferentes.

### Paso 2: Independencia condicional

$$
X \perp Y \mid Z \iff p(X, Y \mid Z) = p(X \mid Z) \cdot p(Y \mid Z)
$$

**Como leerla:** "X es condicionalmente independiente de Y dado Z si y solo si, una vez que conoces Z, la conjunta de X e Y se factoriza."

Una vez que conoces Z, saber X no anade informacion sobre Y. Ejemplo: dos estudiantes (X, Y) que sacan notas independientes dado que ambos estudiaron el mismo material (Z).

### Paso 3: Redes bayesianas

Una red bayesiana es un **grafo dirigido aciclico (DAG)** que codifica las relaciones de independencia condicional:

$$
p(x_1, \ldots, x_n) = \prod_{i=1}^{n} p(x_i \mid \text{padres}(x_i))
$$

**Como leerla:** "La conjunta se factoriza como el producto de cada variable condicionada solo en sus padres en el grafo."

Cada variable solo depende de sus padres directos, no de todos los demas nodos.

### Paso 4: d-separacion (intuicion)

Tres estructuras canonicas determinan cuando hay independencia condicional:

```
Cadena:   A --> B --> C       A _||_ C | B   (observar B bloquea)
Fork:     A <-- B --> C       A _||_ C | B   (observar B bloquea)
Collider: A --> B <-- C       A _||_ C       (pero NO si observas B!)
```

- **Cadena:** Si observas B, A y C se desconectan. La informacion no fluye a traves de B.
- **Fork:** B es causa comun de A y C. Observar B explica la correlacion y los separa.
- **Collider:** A y C son independientes... pero si observas B (el efecto comun), se vuelven dependientes! Esto se llama "explaining away".

### Paso 5: La maldición de la dimensionalidad

Sin estructura, modelar la distribución conjunta de $n$ variables binarias requiere $2^n - 1$ parámetros libres. La escala se vuelve absurda rápidamente:

| $n$ | Parámetros ($2^n - 1$) | Contexto |
|-----|------------------------|----------|
| 10 | 1,023 | Tratable |
| 30 | ~$10^9$ | Más que la memoria de un ordenador |
| 100 | ~$10^{30}$ | Más que las estrellas en el universo |
| 784 | ~$10^{236}$ | Imagen MNIST (28x28 binarizada) |

Para imágenes RGB de un teléfono (980K píxeles × 3 canales × 256 valores), el espacio tiene $256^{2{,}940{,}000} \approx 10^{7{,}000{,}000}$ configuraciones posibles. La independencia condicional reduce estas cifras a algo manejable.

### Paso 6: Reduccion de parametros con estructura

Ejemplo concreto: 4 variables binarias con estructura Naive Bayes.

```
       Y (clase)
      / | \
     v  v  v
    X1  X2  X3
```

- **Sin suposiciones:** $2^4 - 1 = 15$ parametros
- **Con Naive Bayes:** p(Y) + p(X1|Y) + p(X2|Y) + p(X3|Y) = 1 + 2 + 2 + 2 = **7 parametros**

La estructura del grafo reduce los parametros de exponencial a lineal.

## Propiedades clave

| Propiedad | Significado |
|-----------|-------------|
| Simetria | Si X _\|\|_ Y \| Z, entonces Y _\|\|_ X \| Z |
| Descomposicion | Si X _\|\|_ (Y, W) \| Z, entonces X _\|\|_ Y \| Z |
| Union debil | Si X _\|\|_ Y \| Z y X _\|\|_ W \| (Y, Z), entonces X _\|\|_ (Y, W) \| Z |
| Contraccion | Si X _\|\|_ W \| (Y, Z) y X _\|\|_ Y \| Z, entonces X _\|\|_ (Y, W) \| Z |
| No transitividad | X _\|\|_ Y y Y _\|\|_ Z NO implica X _\|\|_ Z |

## Pregunta socratica

En un modelo autoregresivo $p(x_1, \ldots, x_n) = \prod_i p(x_i \mid x_{<i})$, cada condicional depende de TODAS las variables anteriores. Hay alguna suposicion de independencia condicional? O es completamente general?

(Pista: piensa en que dice la regla de la cadena por si sola, sin restricciones adicionales.)

---

**Cross-links:** [modelos_autoregresivos.md](modelos_autoregresivos.md) | [KL-Divergence.md](KL-Divergence.md)
