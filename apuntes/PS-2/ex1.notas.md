# Ejercicio 1: Implementar el Variational Autoencoder (VAE)

## De que va este ejercicio

El ejercicio 1 te pide implementar un VAE completo en PyTorch para generar imagenes de digitos escritos a mano (dataset MNIST). Tiene **4 partes**: tres de codigo y una escrita.

Los archivos que tocaras son:
- `src/submission/utils.py` (funciones matematicas auxiliares)
- `src/submission/models/vae.py` (el modelo VAE propiamente dicho)

---

## Conceptos que necesitas entender

Antes de tocar codigo, asegurate de tener claros estos conceptos. Cada uno aparece directamente en el ejercicio.

### El modelo generativo del VAE

El VAE define como se "generan" los datos en dos pasos:

$$1.\quad \mathbf{z} \sim \mathcal{N}(\mathbf{0}, I)$$
$$2.\quad \mathbf{x} \sim \text{Bernoulli}(f_\theta(\mathbf{z}))$$

**Lo que esto dice en palabras simples:** primero eliges un punto al azar en un espacio latente (paso 1), y luego una red neuronal convierte ese punto en una imagen (paso 2).

**Ejemplo concreto:** imagina que $\mathbf{z}$ tiene 2 dimensiones. Un valor como $\mathbf{z} = [0.5, -1.2]$ podria corresponder a "un 7 ligeramente inclinado". Otro valor $\mathbf{z} = [-0.3, 0.8]$ podria ser "un 3 redondeado". El decoder (la red neuronal $f_\theta$) toma ese $\mathbf{z}$ y produce los 784 pixeles de una imagen de 28x28.

### Que es la distribucion de Bernoulli aqui

Cada pixel de MNIST es blanco o negro (0 o 1). La distribucion de Bernoulli modela exactamente eso: un evento que puede ser 0 o 1, con cierta probabilidad $p$.

$$x_i \sim \text{Bernoulli}(p_i)$$

Donde $p_i$ es la probabilidad de que el pixel $i$ sea blanco.

El decoder no produce directamente probabilidades (entre 0 y 1). Produce **logits** (numeros reales de $-\infty$ a $+\infty$) que luego se convierten en probabilidades con la funcion sigmoide.

**Ejemplo:** si el logit para un pixel es 2.0, la probabilidad de que ese pixel sea blanco es $\text{sigmoid}(2.0) = 0.88$. Si el logit es $-3.0$, $\text{sigmoid}(-3.0) = 0.05$ (casi seguro negro).

### La verosimilitud marginal y por que es un problema

Lo que realmente queremos maximizar es la probabilidad de los datos bajo nuestro modelo:

$$p(\mathbf{x}) = \int p(\mathbf{x} \mid \mathbf{z}) \, p(\mathbf{z}) \, d\mathbf{z}$$

Esto dice: "para calcular la probabilidad de una imagen $\mathbf{x}$, tengo que considerar TODOS los posibles valores de $\mathbf{z}$, ver que tan probable es cada $\mathbf{z}$, y que tan bien genera $\mathbf{x}$." Es una integral sobre todas las posibles configuraciones latentes.

**El problema:** esta integral no se puede calcular. El espacio de $\mathbf{z}$ es continuo y de alta dimension. Tendrias que evaluar la red neuronal para infinitos valores de $\mathbf{z}$ y sumar los resultados. No es factible.

**Ejemplo numerico para verlo:** si $\mathbf{z}$ tiene 10 dimensiones y quisieras aproximar la integral evaluando en una cuadricula con 100 puntos por dimension, necesitarias $100^{10} = 10^{20}$ evaluaciones. Imposible.

### El ELBO: la solucion practica

Como no podemos calcular $\log p(\mathbf{x})$ directamente, usamos una **cota inferior** llamada ELBO (Evidence Lower Bound):

$$\log p(\mathbf{x}) \;\geq\; \text{ELBO}(\mathbf{x};\, \theta, \phi)$$

Esto significa que el ELBO siempre es menor o igual que $\log p(\mathbf{x})$. Si maximizamos el ELBO, estamos empujando $\log p(\mathbf{x})$ hacia arriba indirectamente.

El ELBO se descompone en dos terminos:

$$\text{ELBO} = \underbrace{\mathbb{E}_{q}[\log p(\mathbf{x} \mid \mathbf{z})]}_{\text{Reconstruccion}} - \underbrace{D_\text{KL}(q(\mathbf{z} \mid \mathbf{x}) \;\|\; p(\mathbf{z}))}_{\text{Regularizacion}}$$

**Termino de reconstruccion:** mide que tan bien el decoder reconstruye la imagen original $\mathbf{x}$ a partir de $\mathbf{z}$. Cuanto mas alta, mejor reconstruye.

**Termino KL:** mide que tan diferente es la distribucion aproximada $q(\mathbf{z} \mid \mathbf{x})$ respecto al prior $p(\mathbf{z}) = \mathcal{N}(\mathbf{0}, I)$. Cuanto mas baja, mas "ordenado" es el espacio latente.

### Equivalencia entre formulas matematicas y encoder/decoder

| Simbolo matematico | Que es | En el codigo |
|---------------------|--------|--------------|
| $q_\phi(\mathbf{z} \mid \mathbf{x})$ | La posterior aproximada: dada una imagen, ¿de donde vino en el espacio latente? | **El encoder** (`self.enc`). Recibe $\mathbf{x}$ y produce $\mu_\phi$ y $\sigma^2_\phi$ |
| $p_\theta(\mathbf{x} \mid \mathbf{z})$ | La verosimilitud: dado un punto latente, ¿que imagen genera? Es una Bernoulli sobre los pixeles | **El decoder** (`self.dec`). Recibe $\mathbf{z}$ y produce logits (que se convierten en probabilidades con sigmoid) |
| $p(\mathbf{z})$ | El prior sobre las variables latentes: $\mathcal{N}(\mathbf{0}, I)$ | `self.z_prior_m` (media = 0) y `self.z_prior_v` (varianza = 1) |
| $\mathbb{E}_{q}[\log p(\mathbf{x} \mid \mathbf{z})]$ | Termino de reconstruccion: ¿que tan bien el decoder reconstruye $\mathbf{x}$ a partir de $\mathbf{z}$ muestreado del encoder? | Log-probabilidad de Bernoulli de los pixeles originales dados los logits del decoder |
| $D_\text{KL}(q \;\|\; p(\mathbf{z}))$ | Termino KL: ¿que tan lejos esta la distribucion del encoder del prior? | KL entre la Gaussiana del encoder y la Gaussiana $\mathcal{N}(\mathbf{0}, I)$ |

**Ejemplo intuitivo:** piensa en un estudiante que hace resumenes de libros (el encoder) y otro que intenta reconstruir el libro a partir del resumen (el decoder).
- Si el resumen es muy detallado (KL alta), la reconstruccion sera buena, pero el resumen no sigue un formato estandar.
- Si obligas a que el resumen siga un formato muy rigido (KL baja), la reconstruccion sera peor, pero los resumenes son comparables entre si.
- El ELBO busca el equilibrio entre ambos.

### La posterior aproximada $q_\phi(\mathbf{z} \mid \mathbf{x})$

No podemos calcular la posterior real $p(\mathbf{z} \mid \mathbf{x})$ (la distribucion de $\mathbf{z}$ dado que observamos $\mathbf{x}$). Asi que usamos una red neuronal (el encoder) para aproximarla:

$$q_\phi(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}\!\left(\mathbf{z} \mid \mu_\phi(\mathbf{x}),\; \text{diag}\!\left(\sigma_\phi^2(\mathbf{x})\right)\right)$$

**Que dice esto:** dada una imagen $\mathbf{x}$, el encoder produce dos cosas:
- **$\mu$ (media):** el "centro" de donde probablemente vino esa imagen en el espacio latente
- **$\sigma^2$ (varianza):** cuanta incertidumbre hay sobre ese centro

La distribucion es una Gaussiana multivariada con covarianza diagonal, lo que significa que cada dimension de $\mathbf{z}$ es independiente (no hay correlaciones entre dimensiones).

**Ejemplo:** para una imagen del digito "7", el encoder podria producir $\mu = [1.2, -0.5]$ y $\sigma^2 = [0.3, 0.1]$. Esto dice "creo que el $\mathbf{z}$ que genero este 7 esta por la zona $[1.2, -0.5]$, con algo de incertidumbre."

### La funcion negative_elbo_bound y por que negativo

En el ejercicio te piden implementar el **negativo** del ELBO. Esto es porque PyTorch esta disenado para **minimizar** funciones de perdida, no para maximizarlas. Maximizar el ELBO equivale a minimizar $-\text{ELBO}$:

$$\text{perdida} = -\text{ELBO} = \underbrace{-\mathbb{E}_{q}[\log p(\mathbf{x} \mid \mathbf{z})]}_{\text{reconstruccion\_loss}} + \underbrace{D_\text{KL}(q(\mathbf{z} \mid \mathbf{x}) \;\|\; p(\mathbf{z}))}_{\text{kl\_divergence}}$$

Ademas, como trabajamos con mini-batches (grupos de imagenes), el ejercicio te pide calcular el **promedio** sobre el batch.

---

## Parte (a): El truco de reparametrizacion (2 pts, codigo)

### Que te piden

Implementar la funcion `sample_gaussian(m, v)` en `utils.py`. Esta funcion recibe la media `m` y la varianza `v` de una Gaussiana, y debe devolver una muestra $\mathbf{z}$.

### El concepto: por que no puedes muestrear directamente

Si simplemente muestreas $\mathbf{z} \sim \mathcal{N}(\mu, \sigma^2)$, el muestreo es una operacion **aleatoria** que no tiene gradiente. PyTorch no puede calcular derivadas a traves de una operacion aleatoria, asi que no podria entrenar el encoder.

### El truco de reparametrizacion

La idea es separar la aleatoriedad de los parametros:

En vez de hacer directamente $\mathbf{z} \sim \mathcal{N}(\mu, \sigma^2)$ (no diferenciable), hacemos:

$$\epsilon \sim \mathcal{N}(\mathbf{0}, I) \qquad \text{(aleatorio, no depende de parametros)}$$
$$\mathbf{z} = \mu + \sigma \cdot \epsilon \qquad \text{(operacion determinista, diferenciable)}$$

El resultado es el mismo ($\mathbf{z}$ sigue siendo una muestra de $\mathcal{N}(\mu, \sigma^2)$), pero ahora el gradiente puede fluir a traves de $\mu$ y $\sigma$.

**Ejemplo numerico:**

$$\mu = 2.0, \quad \sigma = 0.5, \quad \epsilon = 1.3 \;\text{(muestreado de } \mathcal{N}(0,1)\text{)}$$
$$\mathbf{z} = 2.0 + 0.5 \times 1.3 = 2.65$$

Si $\mu$ cambia a 2.1, $\mathbf{z}$ cambiaria a 2.75. Esa relacion es diferenciable.

### Nota sobre varianza vs desviacion estandar

La funcion recibe la **varianza** `v` ($= \sigma^2$), no $\sigma$ directamente. Para usarla en el truco de reparametrizacion necesitas la desviacion estandar, que es la raiz cuadrada de la varianza:

$$\sigma = \sqrt{v}$$
$$\mathbf{z} = m + \sqrt{v} \cdot \epsilon$$

### torch.sqrt vs np.sqrt: por que importa cual uses

- **`np.sqrt(tensor)`**: convierte el tensor a NumPy, calcula la raiz, y devuelve un valor **desconectado** del grafo computacional. Los gradientes no pueden fluir a traves de esta operacion.
- **`torch.sqrt(tensor)`**: opera directamente sobre el tensor y **registra la operacion** en el grafo de autograd. Los gradientes fluyen correctamente: `loss -> z -> s -> v -> parametros del encoder`.

```
v (parametro del encoder)
│
├── torch.sqrt(v) → s → z → loss   ✓ gradientes fluyen
├── np.sqrt(v)    → s → z → loss   ✗ gradientes se cortan en s
```

Esto es critico porque `v` sale del encoder. Si el gradiente no fluye a traves de `v`, el encoder no puede aprender a ajustar la varianza de $q_\phi(\mathbf{z} \mid \mathbf{x})$.

**Nota conceptual:** las funciones de PyTorch **no son puras** en el sentido de programacion funcional — tienen el efecto secundario de registrar operaciones en el grafo computacional (cuando `requires_grad=True`). Esto es parte del diseno "define-by-run" de autograd.

---

## Parte (b): Implementar el ELBO negativo (3.5 pts, codigo)

### Que te piden

Implementar `negative_elbo_bound(self, x)` en `vae.py`. El parametro `x` es un mini-batch de imagenes MNIST aplanadas: un tensor de forma `(batch, 784)`, donde cada fila es una imagen de 28x28 = 784 pixeles binarios (valores en {0, 1}). Es la $\mathbf{x}$ observada que aparece en la formula del ELBO.

Esta funcion debe:
1. Pasar $\mathbf{x}$ por el encoder para obtener $\mu$ y $\sigma^2$
2. Muestrear $\mathbf{z}$ usando el truco de reparametrizacion
3. Pasar $\mathbf{z}$ por el decoder para obtener los logits de reconstruccion
4. Calcular los dos terminos del ELBO (reconstruccion y KL)
5. Devolver el promedio del ELBO negativo sobre el batch

### El termino de reconstruccion y Monte Carlo

El termino de reconstruccion es una esperanza:

$$\mathbb{E}_{q}[\log p(\mathbf{x} \mid \mathbf{z})]$$

Como no podemos calcular esa esperanza exactamente (requeriria infinitas muestras de $q$), la aproximamos con **una sola muestra** (estimacion de Monte Carlo):

$$\mathbb{E}_{q}[\log p(\mathbf{x} \mid \mathbf{z})] \;\approx\; \log p(\mathbf{x} \mid \mathbf{z}^{(1)})$$

donde $\mathbf{z}^{(1)}$ es una muestra de $q(\mathbf{z} \mid \mathbf{x})$.

**Ejemplo de Monte Carlo:** imagina que quieres saber la altura media de la gente en una ciudad. En vez de medir a todos (la esperanza exacta), mides a 1 persona al azar (una muestra). Es una estimacion ruidosa, pero **en promedio** (si lo haces muchas veces) acertaras. Para entrenar redes neuronales, una sola muestra por paso de gradiente funciona sorprendentemente bien porque los gradientes se promedian a lo largo de muchos pasos.

### El termino KL entre dos Gaussianas

La KL entre $q(\mathbf{z} \mid \mathbf{x}) = \mathcal{N}(\mu_q, \sigma_q^2)$ y $p(\mathbf{z}) = \mathcal{N}(\mathbf{0}, I)$ tiene **formula cerrada** (no necesitas Monte Carlo). La funcion `kl_normal` en `utils.py` ya esta implementada y la puedes usar.

### Funciones auxiliares disponibles

El ejercicio menciona varias funciones en `utils.py` que ya estan implementadas y que te seran utiles:

| Funcion | Que hace |
|---------|----------|
| `gaussian_parameters(h)` | Toma la salida del encoder y la divide en media y varianza |
| `log_bernoulli_with_logits(x, logits)` | Calcula $\log p(\mathbf{x} \mid \mathbf{z})$ asumiendo distribucion de Bernoulli |
| `kl_normal(qm, qv, pm, pv)` | Calcula $D_\text{KL}(q \;\|\; p)$ entre dos Gaussianas |
| `sample_gaussian(m, v)` | La funcion que implementaste en la parte (a) |

### La nota sobre promedios

El ejercicio enfatiza que `negative_elbo_bound` debe devolver no solo el NELBO total sino tambien los **promedios** del termino KL y del termino de reconstruccion por separado. Es decir, tres cosas: `(nelbo, kl, rec)`, todas promediadas sobre el batch.

---

## Parte (c): Entrenar el VAE (3 pts, codigo)

### Que te piden

Entrenar el modelo con los scripts proporcionados y verificar que los valores de salida son correctos.

### Comandos

```bash
# Entrenar (CPU)
python main.py --model vae --train

# Entrenar (GPU, mas rapido)
python main.py --model vae --train --device gpu

# Verificar con autograder
python grader.py 1c-0-basic

# Generar muestras visuales
python main.py --model vae
```

### Que esperar

- El entrenamiento dura unas 20,000 iteraciones (~7 minutos)
- Al terminar, imprime tres metricas: NELBO promedio, KL promedio, y loss de reconstruccion promedio
- El NELBO deberia estar **alrededor de 100** en el subset de test
- Las muestras generadas deberian verse como digitos reconocibles (aunque borrosos, eso es normal en VAEs)

### Si algo sale mal

Si el NELBO es muy diferente de 100 (por ejemplo, 500 o 50), lo mas probable es que haya un error en `sample_gaussian`. Los errores comunes son:
- Usar $\sigma$ en vez de $\sqrt{v}$ (o al reves)
- No usar `torch.randn_like` (que crea un path diferenciable)

---

## Parte (d): El $\beta$-VAE (3 pts, escrita)

### Que te piden

Explicar de forma intuitiva que hace el parametro $\beta$ en el $\beta$-VAE, que usa este objetivo:

$$\text{ELBO}_\beta = \mathbb{E}_{q}[\log p(\mathbf{x} \mid \mathbf{z})] - \beta \, D_\text{KL}(q(\mathbf{z} \mid \mathbf{x}) \;\|\; p(\mathbf{z}))$$

La pregunta pide: que pasa cuando $\beta = 1$? Y cuando $\beta > 1$?

### El concepto: $\beta$ como "perilla de equilibrio"

El ELBO normal tiene dos terminos en tension. El parametro $\beta$ es un peso extra que controla cuanto nos importa uno vs el otro.

**Ejemplo intuitivo:** imagina que estas comprimiendo fotos para enviarlas por internet.
- **$\beta = 1$:** el balance natural del ELBO. Es el VAE estandar.
- **$\beta > 1$ (ej: $\beta = 5$):** le das 5 veces mas importancia a que $q$ se parezca al prior. Esto fuerza al modelo a comprimir mas, haciendo que el espacio latente sea mas "regular" y "desmarannado", pero las reconstrucciones seran peores (mas borrosas).
- **$\beta < 1$ (ej: $\beta = 0.1$):** le das menos importancia al prior. Las reconstrucciones son mejores, pero el espacio latente puede ser caotico.

**Analogia:** es como el volumen en un ecualizador de musica. El $\beta$ sube o baja el "volumen" del termino de regularizacion. Si lo subes mucho, el espacio latente es limpio pero pierdes detalle. Si lo bajas, ganas detalle pero el espacio latente pierde estructura.

---

## Resumen visual del flujo del VAE

```
Imagen x (784 pixeles)
     |
     v
  [ENCODER]  (red neuronal, parametros phi)
     |
     v
  mu, sigma^2  (parametros de q(z|x))
     |
     v
  z = mu + sigma * epsilon   (truco de reparametrizacion)
     |
     v
  [DECODER]  (red neuronal, parametros theta)
     |
     v
  logits (784 valores)
     |
     v
  Reconstruccion de x  (con Bernoulli)
```

**La perdida que se optimiza:**

$$\text{perdida} = -\text{ELBO} = \text{reconstruccion\_loss} + D_\text{KL}(q \;\|\; \text{prior})$$

El encoder y el decoder se entrenan juntos, minimizando esta perdida.

---

## Glosario rapido de funciones del codigo

| Funcion | Archivo | Que hace |
|---------|---------|----------|
| `sample_gaussian(m, v)` | utils.py | Muestrea de $\mathcal{N}(m, v)$ con reparametrizacion |
| `negative_elbo_bound(x)` | vae.py | Calcula $-\text{ELBO}$, KL, y loss de reconstruccion |
| `log_normal(x, m, v)` | utils.py | Log-probabilidad de $\mathbf{x}$ bajo $\mathcal{N}(m, v)$, sumada en la ultima dim |
| `log_bernoulli_with_logits(x, logits)` | utils.py | Log-probabilidad de $\mathbf{x}$ bajo $\text{Bernoulli}(\text{sigmoid}(\text{logits}))$ |
| `kl_normal(qm, qv, pm, pv)` | utils.py | $D_\text{KL}(\mathcal{N}(qm, qv) \;\|\; \mathcal{N}(pm, pv))$ en forma cerrada |
| `gaussian_parameters(h)` | utils.py | Divide la salida del encoder en media y varianza |
