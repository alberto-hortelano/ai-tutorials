# Ejercicio 3 — Implementing the Importance Weighted Autoencoder (IWAE)

Este documento explica **qué significa cada parte del enunciado**, no cómo resolverlo.

---

## Contexto: ¿Por qué IWAE?

En los ejercicios 1 y 2 entrenamos un VAE y un GMVAE usando el **ELBO** como función objetivo. El ELBO es una **cota inferior** del log de la verosimilitud marginal $\log p_\theta(\mathbf{x})$.

Pero el ELBO puede ser una cota **floja** (loose): si el posterior aproximado $q_\phi(\mathbf{z} \mid \mathbf{x})$ no se parece mucho al posterior real $p_\theta(\mathbf{z} \mid \mathbf{x})$, el ELBO queda lejos del valor verdadero de $\log p_\theta(\mathbf{x})$.

```
log p_θ(x)    ← valor real (lo que queremos maximizar)
    │
    │  gap ← esta diferencia es la KL entre q y p posterior
    │
    ▼
  ELBO    ← lo que realmente optimizamos (cota inferior)
```

La idea del **IWAE** (Importance Weighted Autoencoder) es obtener una cota más **ajustada** (tighter) usando múltiples muestras en lugar de una sola.

---

## Ecuación 12 — El ratio de densidades no normalizado

$$\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})} = \frac{p_\theta(\mathbf{z} \mid \mathbf{x})}{q_\phi(\mathbf{z} \mid \mathbf{x})} \cdot p_\theta(\mathbf{x})$$

donde $\mathbf{z} \sim q_\phi(\mathbf{z} \mid \mathbf{x})$.

### Cómo se lee

> "El cociente entre la conjunta del modelo $p_\theta(\mathbf{x}, \mathbf{z})$ y el posterior aproximado $q_\phi(\mathbf{z} \mid \mathbf{x})$ es igual al cociente entre el posterior real $p_\theta(\mathbf{z} \mid \mathbf{x})$ y el posterior aproximado $q_\phi(\mathbf{z} \mid \mathbf{x})$, multiplicado por la verosimilitud marginal $p_\theta(\mathbf{x})$."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $p_\theta(\mathbf{x}, \mathbf{z})$ | Distribución **conjunta** del modelo. La probabilidad de observar $\mathbf{x}$ **y** que las variables latentes sean $\mathbf{z}$, simultáneamente. Se descompone como $p(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid \mathbf{z})$. |
| $q_\phi(\mathbf{z} \mid \mathbf{x})$ | **Posterior aproximado** (el encoder). Dada una imagen $\mathbf{x}$, devuelve una distribución sobre $\mathbf{z}$. |
| $p_\theta(\mathbf{z} \mid \mathbf{x})$ | **Posterior real** (verdadero). Dado un dato $\mathbf{x}$, la distribución exacta sobre $\mathbf{z}$ según el modelo. Este es intratable — no lo podemos calcular directamente. |
| $p_\theta(\mathbf{x})$ | **Verosimilitud marginal** (evidence). La probabilidad del dato $\mathbf{x}$ según el modelo, integrando sobre todos los posibles $\mathbf{z}$. Este es el valor que queremos maximizar. |
| $\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$ | **Ratio de densidades no normalizado**. Este cociente es el núcleo del ELBO y del IWAE. |

### Intuición: ¿por qué este cociente?

La identidad sale de aplicar la regla de Bayes. Sabemos que:

$$p_\theta(\mathbf{x}, \mathbf{z}) = p_\theta(\mathbf{z} \mid \mathbf{x}) \cdot p_\theta(\mathbf{x})$$

Si dividimos ambos lados por $q_\phi(\mathbf{z} \mid \mathbf{x})$, obtenemos la ecuación 12. El lado izquierdo ($\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$) es **calculable** porque conocemos tanto $p_\theta(\mathbf{x}, \mathbf{z})$ como $q_\phi(\mathbf{z} \mid \mathbf{x})$. El lado derecho contiene $p_\theta(\mathbf{x})$ que es lo que queremos estimar.

---

## Ecuación 13 — El ratio normalizado integra a 1

$$E_{q_\phi(\mathbf{z}|\mathbf{x})}\left[\frac{p_\theta(\mathbf{z} \mid \mathbf{x})}{q_\phi(\mathbf{z} \mid \mathbf{x})}\right] = \int q_\phi(\mathbf{z} \mid \mathbf{x}) \frac{p_\theta(\mathbf{z} \mid \mathbf{x})}{q_\phi(\mathbf{z} \mid \mathbf{x})} d\mathbf{z} = \int p_\theta(\mathbf{z} \mid \mathbf{x}) d\mathbf{z} = 1$$

### Cómo se lee

> "La esperanza, bajo $q_\phi$, del cociente $\frac{p_\theta(\mathbf{z} \mid \mathbf{x})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$ es igual a 1. Esto se debe a que al multiplicar y dividir por $q_\phi$ se cancelan, y lo que queda es la integral de $p_\theta(\mathbf{z} \mid \mathbf{x})$ que, al ser una distribución de probabilidad, integra a 1."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $E_{q_\phi(\mathbf{z}\|\mathbf{x})}[\cdot]$ | **Esperanza** (valor esperado) bajo la distribución $q_\phi(\mathbf{z} \mid \mathbf{x})$. "Promedia" la expresión dentro de los corchetes sobre todos los posibles valores de $\mathbf{z}$ según $q_\phi$. |
| $\int q_\phi(\mathbf{z} \mid \mathbf{x}) \cdot (\ldots) \, d\mathbf{z}$ | Definición de esperanza como integral. Multiplicamos la función por la densidad $q_\phi$ e integramos sobre todo el espacio de $\mathbf{z}$. |
| $\int p_\theta(\mathbf{z} \mid \mathbf{x}) \, d\mathbf{z} = 1$ | Propiedad fundamental: toda distribución de probabilidad integra a 1. |

### ¿Por qué importa esto?

El enunciado señala que el ratio $\frac{p_\theta(\mathbf{z} \mid \mathbf{x})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$ está **normalizado** (su esperanza es 1). Pero el ratio que usamos en la práctica es $\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$, que es el anterior multiplicado por $p_\theta(\mathbf{x})$:

$$\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})} = \frac{p_\theta(\mathbf{z} \mid \mathbf{x})}{q_\phi(\mathbf{z} \mid \mathbf{x})} \cdot p_\theta(\mathbf{x})$$

Al multiplicar por $p_\theta(\mathbf{x})$ (una constante respecto a $\mathbf{z}$), el ratio ya **no integra a 1**, sino a $p_\theta(\mathbf{x})$. Por eso se dice que es **no normalizado** (unnormalized).

---

## Ecuación 14 — La cota IWAE

$$\mathcal{L}_m(\mathbf{x}; \theta, \phi) = \mathbb{E}_{\mathbf{z}^{(1)}, \ldots, \mathbf{z}^{(m)} \stackrel{\text{i.i.d.}}{\sim} q_\phi(\mathbf{z}|\mathbf{x})} \left[ \log \frac{1}{m} \sum_{i=1}^{m} \frac{p_\theta\left(\mathbf{x}, \mathbf{z}^{(i)}\right)}{q_\phi\left(\mathbf{z}^{(i)} \mid \mathbf{x}\right)} \right]$$

### Cómo se lee

> "La cota IWAE con $m$ muestras es la esperanza, sobre $m$ muestras independientes $\mathbf{z}^{(1)}, \ldots, \mathbf{z}^{(m)}$ sacadas del posterior aproximado $q_\phi$, del logaritmo del promedio de los $m$ ratios de densidades no normalizados."

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\mathcal{L}_m(\mathbf{x}; \theta, \phi)$ | La **cota IWAE** con $m$ muestras para el dato $\mathbf{x}$. El subíndice $m$ indica cuántas muestras usamos. Los parámetros del modelo ($\theta$) y del encoder ($\phi$) aparecen después del punto y coma. |
| $\mathbb{E}_{\mathbf{z}^{(1)}, \ldots, \mathbf{z}^{(m)} \stackrel{\text{i.i.d.}}{\sim} q_\phi(\mathbf{z}\|\mathbf{x})}$ | Esperanza sobre $m$ muestras **i.i.d.** (independientes e idénticamente distribuidas) del posterior aproximado $q_\phi(\mathbf{z} \mid \mathbf{x})$. |
| $\stackrel{\text{i.i.d.}}{\sim}$ | "Distribuidas de forma independiente e idéntica según..." Cada muestra $\mathbf{z}^{(i)}$ se genera por separado de la misma distribución. |
| $\mathbf{z}^{(i)}$ | La $i$-ésima muestra del posterior aproximado. El superíndice entre paréntesis $(i)$ indica que es un **índice de muestra**, no una potencia. |
| $\frac{1}{m} \sum_{i=1}^{m}$ | **Promedio** sobre las $m$ muestras. Sumamos los $m$ términos y dividimos por $m$. |
| $\frac{p_\theta(\mathbf{x}, \mathbf{z}^{(i)})}{q_\phi(\mathbf{z}^{(i)} \mid \mathbf{x})}$ | El **ratio de densidades no normalizado** evaluado en la $i$-ésima muestra. Es el mismo ratio de la ecuación 12, pero evaluado en $\mathbf{z}^{(i)}$ concreto. |
| $\log$ | Logaritmo natural. Se aplica al promedio completo, **no** a cada ratio individualmente. |

### Intuición: ¿qué hace IWAE?

La idea es sencilla:

1. **ELBO** (1 muestra): Sacas **una sola** $\mathbf{z}$ del encoder, calculas el ratio $\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$, y tomas su logaritmo.

2. **IWAE** ($m$ muestras): Sacas **$m$ muestras** $\mathbf{z}^{(1)}, \ldots, \mathbf{z}^{(m)}$ del encoder, calculas el ratio para cada una, **promedias** los ratios, y luego tomas el logaritmo del promedio.

```
ELBO (m=1):
   z¹ → ratio₁ → log(ratio₁)

IWAE (m=3):
   z¹ → ratio₁ ─┐
   z² → ratio₂ ─┼→ promedio → log(promedio)
   z³ → ratio₃ ─┘
```

La clave: **el logaritmo del promedio** no es lo mismo que **el promedio del logaritmo**. Al promediar *antes* de aplicar el log, obtenemos una cota más ajustada.

### Caso especial: $m = 1$

Cuando $m = 1$, el IWAE se reduce al ELBO estándar:

$$\mathcal{L}_1 = \mathbb{E}_{\mathbf{z} \sim q_\phi(\mathbf{z}|\mathbf{x})} \left[ \log \frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})} \right]$$

Esto es exactamente la definición del ELBO. Es decir, el ELBO es un caso particular del IWAE con una sola muestra.

---

## ¿Qué es i.i.d.?

**i.i.d.** = **i**ndependent and **i**dentically **d**istributed (independientes e idénticamente distribuidas).

Significa dos cosas:

1. **Idénticamente distribuidas**: Todas las muestras $\mathbf{z}^{(1)}, \ldots, \mathbf{z}^{(m)}$ vienen de la **misma** distribución $q_\phi(\mathbf{z} \mid \mathbf{x})$.

2. **Independientes**: El valor de $\mathbf{z}^{(1)}$ no influye en el valor de $\mathbf{z}^{(2)}$, etc. Cada muestra se genera "desde cero".

**Ejemplo:** Si sacas 5 veces un dado justo, los 5 resultados son i.i.d. — cada tirada usa el mismo dado (idéntica distribución) y ninguna tirada afecta a las demás (independientes).

---

## Apartado (a) — [7 puntos, Escrito]

> *"Prove that IWAE is a valid lower bound of the log-likelihood, and that the ELBO lower bounds IWAE"*
>
> $$\log p_\theta(\mathbf{x}) \geq \mathcal{L}_m(\mathbf{x}) \geq \mathcal{L}_1(\mathbf{x})$$
>
> *"for any $m \geq 1$."*
>
> *"Hint: consider Jensen's Inequality"*

### ¿Qué pide?

Te pide demostrar una **cadena de desigualdades**:

$$\underbrace{\log p_\theta(\mathbf{x})}_{\text{log-verosimilitud real}} \geq \underbrace{\mathcal{L}_m(\mathbf{x})}_{\text{cota IWAE con } m \text{ muestras}} \geq \underbrace{\mathcal{L}_1(\mathbf{x})}_{\text{ELBO}}$$

Esto dice tres cosas:

1. **$\log p_\theta(\mathbf{x}) \geq \mathcal{L}_m(\mathbf{x})$**: El IWAE es una **cota inferior** válida del log de la verosimilitud (para cualquier $m$).
2. **$\mathcal{L}_m(\mathbf{x}) \geq \mathcal{L}_1(\mathbf{x})$**: El IWAE siempre es **al menos tan bueno** como el ELBO (con más muestras, la cota es más ajustada).
3. **Combinando**: La cota IWAE está "atrapada" entre el ELBO y el valor real.

```
log p_θ(x)    ← valor real
    │
    │  gap pequeño (se reduce con más muestras)
    │
    ▼
  𝓛_m(x) ← IWAE con m muestras
    │
    │  gap adicional
    │
    ▼
  𝓛_1(x) ← ELBO (caso m=1)
```

### Símbolo por símbolo

| Símbolo | Significado |
|---------|-------------|
| $\log p_\theta(\mathbf{x})$ | **Log-verosimilitud marginal**. El logaritmo de la probabilidad del dato $\mathbf{x}$ bajo el modelo. Es lo que queremos maximizar pero no podemos calcular directamente. |
| $\geq$ | "Es mayor o igual que". Indica una **cota inferior**: el lado izquierdo siempre es al menos tan grande como el derecho. |
| $\mathcal{L}_m(\mathbf{x})$ | La cota IWAE con $m$ muestras (ecuación 14). |
| $\mathcal{L}_1(\mathbf{x})$ | La cota IWAE con $m=1$ muestra, que es equivalente al ELBO. |
| $m \geq 1$ | La desigualdad se cumple para **cualquier** número de muestras $m$ mayor o igual a 1. |

### ¿Qué es la Desigualdad de Jensen?

La **pista** del problema menciona la Desigualdad de Jensen. Esta es una propiedad fundamental de las funciones cóncavas.

Una función $f$ es **cóncava** si su curva está "hacia abajo" (como una montaña). El logaritmo $\log(x)$ es una función cóncava.

La Desigualdad de Jensen dice que para una función cóncava $f$:

$$f\left(\mathbb{E}[X]\right) \geq \mathbb{E}\left[f(X)\right]$$

> "Aplicar la función al promedio da un resultado **mayor o igual** que promediar la función aplicada a cada valor."

```
Función cóncava (como log):

f(x)
  │╱‾‾‾‾‾‾╲
  │   ╱╲
  │  ╱•A ╲    A = f(E[X])  ← la función del promedio
  │ ╱   •B ╲  B = E[f(X)]  ← el promedio de la función
  │╱    ╲
  └──────────────────────── x
    E[X]

  A ≥ B  (la función del promedio está arriba)
```

**Ejemplo numérico con $\log$:**

$$\log\left(\frac{3 + 5}{2}\right) = \log(4) \approx 1.386$$

$$\frac{\log(3) + \log(5)}{2} = \frac{1.099 + 1.609}{2} \approx 1.354$$

Efectivamente: $1.386 \geq 1.354$.

---

## Apartado (b) — [3 puntos, Código]

> *"Implement IWAE for VAE in the `negative_iwae_bound` function in `vae.py`. The functions `duplicate` and `log_mean_exp` defined in `utils.py` will be helpful."*

### ¿Qué pide?

Implementar la cota IWAE negativa (porque PyTorch **minimiza**) para el VAE estándar en la función `negative_iwae_bound` del archivo `vae.py`.

### Funciones auxiliares mencionadas

| Función | Archivo | ¿Qué hace? |
|---------|---------|-------------|
| `duplicate` | `utils.py` | Duplica un tensor para crear $m$ copias de cada dato. Si tienes un batch de $n$ datos, produce $n \times m$ copias para poder evaluar $m$ muestras de $\mathbf{z}$ por cada dato. |
| `log_mean_exp` | `utils.py` | Calcula $\log \frac{1}{m} \sum_{i=1}^{m} e^{a_i}$ de forma **numéricamente estable**. Esto es exactamente la operación "$\log$ del promedio" que necesita IWAE. |

### ¿Por qué `log_mean_exp`?

En la práctica, trabajamos en **escala logarítmica** para evitar problemas numéricos (números demasiado grandes o pequeños). Si ya tienes calculado $\log w_i$ donde $w_i = \frac{p_\theta(\mathbf{x}, \mathbf{z}^{(i)})}{q_\phi(\mathbf{z}^{(i)} \mid \mathbf{x})}$, necesitas calcular:

$$\log \frac{1}{m} \sum_{i=1}^{m} w_i = \log \frac{1}{m} \sum_{i=1}^{m} e^{\log w_i}$$

Esto es precisamente `log_mean_exp` aplicado a los $\log w_i$.

### Notas: 

El problema es que tú no tienes $p_\theta(\mathbf{x}, \mathbf{z})$ ni $q_\phi(\mathbf{z} \mid \mathbf{x})$ directamente.  
  Lo que tienes es sus logaritmos: 

  - log_pxz = $\log p_\theta(\mathbf{x}, \mathbf{z})$
  - log_qz = $\log q_\phi(\mathbf{z} \mid \mathbf{x})$ 

  ¿Por qué? Porque log_normal y log_bernoulli_with_logits devuelven log-probabilidades, no probabilidades.

  Entonces cuando tú escribes:

  torch.divide(log_pxz, log_qz)

  Estás calculando $\frac{\log p}{\log q}$, que no tiene significado. Tú quieres $\frac{p}{q}$, que en log-space es $\log p - \log q$.

  Ahora, podrías pensar: "¿y si hago torch.exp para recuperar $p$ y $q$ y luego divido?" El problema es numérico: estas probabilidades son
  números extremadamente pequeños (estamos en dimensión 784). Hacerles exp da 0.0 por underflow y tu código explota.

  Por eso se trabaja siempre en log-space, y por eso existe log_mean_exp: calcula $\log \frac{1}{m} \sum e^{x_i}$ sin salirse nunca del
  espacio logarítmico.

Ya tienes $\log w_i = \log p_\theta(\mathbf{x}, \mathbf{z}^{(i)}) - \log q_\phi(\mathbf{z}^{(i)} \mid \mathbf{x})$. La fórmula IWAE es:   

$$\mathcal{L}m = \mathbb{E}\left[\log \frac{1}{m} \sum_{i=1}^{m} e^{\log w_i}\right]$$


  ¿Ves cómo encaja ahora log_mean_exp?



torch.divide(log_pxz, log_qz)   # ← esto calcula log(p) / log(q)

  Tú quieres el ratio $\frac{p(\mathbf{x}, \mathbf{z})}{q(\mathbf{z} \mid \mathbf{x})}$. En escala logarítmica, ¿qué operación convierte un cociente en algo más simple? Recuerda: $\log \frac{a}{b} = ;$?
z sale de z = ut.sample_gaussian(m, v)?

El log de 1/m por el sumatorio es lo mismo que el log de 1 - log del sumatorio?

● No exactamente. $\log \frac{1}{m} \sum w_i$ no es $\log(1) - \log(\sum w_i)$.

  $$\log \left(\frac{1}{m} \cdot \sum w_i\right) = \log\left(\sum w_i\right) - \log(m)$$
  Pero ese no es el problema principal. El problema es que tú ya tienes $\log w_i$ (no $w_i$), y necesitas calcular:
  $$\log \frac{1}{m} \sum_{i} e^{\log w_i}$$

  ¿Ves por qué necesitas la exponencial? Tú tienes los logs, pero la suma es sobre los valores originales, no sobre los logs. ¿Qué función
  de utils.py hace exactamente esta operación?



● Exacto. Y recuerda que para IWAE necesitas iw muestras de $\mathbf{z}$ por cada $\mathbf{x}$. ¿Qué tendrías que hacer con x antes de pasarlo por el encoder para conseguir eso?

❯ duplicate(x, iw)?

● Sí. Entonces el flujo sería:
 
  1. duplicate de x
  2. enc para sacar m, v
  3. sample_gaussian para obtener z

  Así cada x del batch tiene iw muestras distintas de z. ¿Y ahora, en tus cálculos de log_pz, log_px_given_z y log_qz, qué variable deberías usar donde antes tenías x?

---

## Apartado (c) — [6 puntos, Código]

> *"Run the command below to evaluate your implementation against the test subset:"*
>
> `python main.py --model vae --iwae`

### ¿Qué pide?

Ejecutar la evaluación IWAE sobre el VAE ya entrenado (del ejercicio 1) con diferentes valores de $m = \{1, 10, 100, 1000\}$.

### ¿Qué se espera ver?

Que a medida que $m$ crece, la cota IWAE se acerque más al valor real de $\log p_\theta(\mathbf{x})$:

| $m$ | Cota IWAE | Relación con log-verosimilitud |
|-----|-----------|-------------------------------|
| 1 | $\mathcal{L}_1$ (= ELBO) | Cota más floja |
| 10 | $\mathcal{L}_{10}$ | Más ajustada |
| 100 | $\mathcal{L}_{100}$ | Aún más ajustada |
| 1000 | $\mathcal{L}_{1000}$ | La más ajustada |

Los resultados se guardan en:
- `submission/VAE_iwae_1.pkl`
- `submission/VAE_iwae_10.pkl`
- `submission/VAE_iwae_100.pkl`
- `submission/VAE_iwae_1000.pkl`

Y se verifican con:
```
python grader.py 3c-0-basic
python grader.py 3c-1-basic
python grader.py 3c-2-basic
python grader.py 3c-3-basic
```

**Nota:** El IWAE-1 (con $m=1$) debería ser **consistente** con el ELBO reportado en el ejercicio 1, ya que son la misma cosa.

---

## Apartado (d) — [9 puntos, Código]

> *"As IWAE only requires the averaging of multiple unnormalized density ratios, the IWAE bound is also applicable to the GMVAE model. Repeat parts 2 and 3 for the GMVAE by implementing the `negative_iwae_bound` function in `gmvae.py`."*

### ¿Qué pide?

Dos cosas, que corresponden a "repetir" los apartados (b) y (c) pero para el GMVAE:

1. **Implementar** la función `negative_iwae_bound` en `gmvae.py` (análogo al apartado b, pero para el modelo GMVAE del ejercicio 2).
2. **Ejecutar y evaluar** el IWAE sobre el GMVAE ya entrenado con $m \in \{1, 10, 100, 1000\}$ (análogo al apartado c).

### ¿Por qué funciona IWAE también para GMVAE?

Recuerda la fórmula IWAE (ecuación 14):

$$\mathcal{L}_m(\mathbf{x}) = \mathbb{E}\left[ \log \frac{1}{m} \sum_{i=1}^{m} \frac{p_\theta(\mathbf{x}, \mathbf{z}^{(i)})}{q_\phi(\mathbf{z}^{(i)} \mid \mathbf{x})} \right]$$

Lo único que necesita es el **ratio de densidades no normalizado** $\frac{p_\theta(\mathbf{x}, \mathbf{z})}{q_\phi(\mathbf{z} \mid \mathbf{x})}$. Tanto el VAE como el GMVAE pueden calcular este ratio — la única diferencia es cómo se calcula el numerador $p_\theta(\mathbf{x}, \mathbf{z})$:

| Modelo | $p_\theta(\mathbf{x}, \mathbf{z})$ | Prior $p_\theta(\mathbf{z})$ |
|--------|-------------------------------------|----------------------|
| VAE | $p(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid \mathbf{z})$ | Gaussiana simple $\mathcal{N}(\mathbf{z} \mid 0, I)$ |
| GMVAE | $p_\theta(\mathbf{z}) \cdot p_\theta(\mathbf{x} \mid \mathbf{z})$ | Mezcla de Gaussianas $\sum_{i=1}^k \frac{1}{k} \mathcal{N}(\mathbf{z} \mid \mu_i, \text{diag}(\sigma_i^2))$ |

La estructura del IWAE es la misma — solo cambia cómo calculas $\log p_\theta(\mathbf{z})$ en el numerador del ratio.

```
VAE IWAE:          log w_i = log p(z) + log p(x|z) - log q(z|x)
                              ^^^^^^^^
                              Gaussiana simple N(0, I)
                              → usa log_normal(z, 0, I)

GMVAE IWAE:        log w_i = log p_θ(z) + log p(x|z) - log q(z|x)
                              ^^^^^^^^^^
                              Mezcla de Gaussianas
                              → usa log_normal_mixture(z, μ_i, σ²_i)
```

### La función `negative_iwae_bound` en `gmvae.py`

```python
def negative_iwae_bound(self, x, iw):
```

| Parámetro | Tipo | Shape | Significado |
|-----------|------|-------|-------------|
| `x` | tensor | `(batch, dim)` | Mini-batch de imágenes (784 píxeles cada una) |
| `iw` | int | escalar | Número de muestras de importance weighting ($m$) |

| Retorno | Tipo | Significado |
|---------|------|-------------|
| `niwae` | tensor escalar | IWAE **negativo** (promediado sobre el batch) |
| `kl` | tensor escalar | Divergencia KL del ELBO (promediada) |
| `rec` | tensor escalar | Pérdida de reconstrucción del ELBO (promediada) |

### El objeto `prior` que te proporcionan

A diferencia del VAE (donde el prior es fijo: $\mathcal{N}(\mathbf{0}, I)$), en el GMVAE el prior es una **mezcla de Gaussianas aprendible**. El código te lo da ya hecho:

```python
prior = ut.gaussian_parameters(self.z_pre, dim=1)
```

Esto devuelve una tupla `(m_mixture, v_mixture)` con las medias y varianzas de las $k$ componentes de la mezcla:

| Variable | Shape | Significado |
|----------|-------|-------------|
| `m_mixture` | `(1, k, z_dim)` | Las $k$ medias $\mu_1, \ldots, \mu_k$ de la mezcla |
| `v_mixture` | `(1, k, z_dim)` | Las $k$ varianzas $\sigma_1^2, \ldots, \sigma_k^2$ de la mezcla |

Recuerda que ya usaste este mismo objeto `prior` en el ejercicio 2 cuando implementaste `negative_elbo_bound` para el GMVAE. Allí calculabas la KL por Monte Carlo usando `log_normal` y `log_normal_mixture` (ecuaciones 10-11). Aquí necesitas los mismos ingredientes.

### Conexión con lo que ya hiciste

En el ejercicio 2, en `negative_elbo_bound` del GMVAE, ya calculaste:

- $\log q_\phi(\mathbf{z}^{(1)} \mid \mathbf{x})$ → usando `log_normal` (la densidad del encoder)
- $\log p_\theta(\mathbf{z}^{(1)})$ → usando `log_normal_mixture` (la densidad del prior mezcla)
- $\log p_\theta(\mathbf{x} \mid \mathbf{z})$ → usando `log_bernoulli_with_logits` (la reconstrucción)

Para el IWAE necesitas las **mismas tres cantidades**, pero evaluadas sobre $m$ muestras de $\mathbf{z}$ por cada $\mathbf{x}$, y combinadas de forma diferente (promediando los ratios antes del log, no después).

### Funciones auxiliares relevantes

| Función | ¿Qué hace? | ¿Por qué la necesitas? |
|---------|-------------|----------------------|
| `duplicate` | Crea $m$ copias de cada dato del batch | Para tener $m$ muestras de $\mathbf{z}$ por cada $\mathbf{x}$ |
| `log_mean_exp` | Calcula $\log \frac{1}{m} \sum e^{a_i}$ de forma estable | Es la operación "$\log$ del promedio" del IWAE |
| `log_normal` | Log-densidad de una Gaussiana | Para $\log q_\phi(\mathbf{z} \mid \mathbf{x})$ |
| `log_normal_mixture` | Log-densidad de una mezcla de Gaussianas | Para $\log p_\theta(\mathbf{z})$ (el prior mezcla) |
| `log_bernoulli_with_logits` | Log-densidad de Bernoulli | Para $\log p_\theta(\mathbf{x} \mid \mathbf{z})$ |

### Ejecución y evaluación

Se ejecuta con:
```
python main.py --model gmvae --iwae
```

Los resultados se guardan en:
- `submission/GMVAE_iwae_1.pkl`
- `submission/GMVAE_iwae_10.pkl`
- `submission/GMVAE_iwae_100.pkl`
- `submission/GMVAE_iwae_1000.pkl`

Y se verifican con:
```
python grader.py 3d-0-basic
python grader.py 3d-1-basic
python grader.py 3d-2-basic
python grader.py 3d-3-basic
```

### ¿Qué se espera ver?

Al igual que en el apartado (c) para el VAE, a medida que $m$ crece la cota IWAE debería ser más ajustada (el negativo IWAE más pequeño). Además, el IWAE-1 ($m=1$) debería coincidir con el ELBO que reportaste al entrenar el GMVAE en el ejercicio 2.

---

## Resumen del ejercicio 3

| Apartado | Tipo | Puntos | ¿Qué hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 7 | Demostrar que $\log p_\theta(\mathbf{x}) \geq \mathcal{L}_m(\mathbf{x}) \geq \mathcal{L}_1(\mathbf{x})$ |
| (b) | Código | 3 | Implementar `negative_iwae_bound` en `vae.py` |
| (c) | Código | 6 | Ejecutar y evaluar IWAE para VAE con $m \in \{1, 10, 100, 1000\}$ |
| (d) | Código | 9 | Implementar y evaluar `negative_iwae_bound` en `gmvae.py` |
| **Total** | | **25** | |

### Conceptos clave del ejercicio

1. **Ratio de importance weights**: $w_i = \frac{p_\theta(\mathbf{x}, \mathbf{z}^{(i)})}{q_\phi(\mathbf{z}^{(i)} \mid \mathbf{x})}$ — cuánto "pesa" cada muestra
2. **Promediar antes del log** da una cota más ajustada que **tomar el log de cada uno y promediar**
3. **Más muestras $m$** → cota más ajustada → mejor estimación de $\log p_\theta(\mathbf{x})$
4. **$m=1$** → se recupera el ELBO estándar
5. La Desigualdad de Jensen es la herramienta teórica que conecta todo
