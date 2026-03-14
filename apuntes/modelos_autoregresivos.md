# Modelos Autoregresivos

## Guia de simbolos rapida

Antes de empezar, aqui tienes los simbolos que aparecen una y otra vez. Vuelve aqui cuando te pierdas.

| Simbolo | Que es | Como se lee |
|---------|--------|-------------|
| **x** | Los datos que observamos (ej: una imagen, una oracion) | "equis" |
| **x_i** | La i-esima variable o dimension de x | "equis sub i" |
| **x_{<i}** | Todas las variables anteriores a la i-esima: x_1, x_2, ..., x_{i-1} | "equis menor que i" |
| **p(x_i \| x_{<i})** | Probabilidad de x_i condicionada en todas las anteriores | "pe de equis-i dado equis-menor-que-i" |
| **n** | Numero total de variables (dimensiones de x) | "ene" |
| **mu_i** | Media de la distribucion condicional para x_i | "mu sub i" |
| **sigma_i** | Desviacion tipica de la distribucion condicional para x_i | "sigma sub i" |
| **alpha_i** | Log de la desviacion tipica (parametrizacion alternativa) | "alfa sub i" |
| **W** | Matriz de pesos de la red neuronal | "doble-u" |
| **c** | Vector de sesgo (bias) de la capa oculta | "ce" |
| **h_i** | Activacion de la capa oculta al procesar x_i | "hache sub i" |
| **sigma(.)** | Funcion sigmoide: sigma(a) = 1/(1+exp(-a)) | "sigma de..." |
| **M** | Mascara binaria (en MADE) que impone la estructura autoregresiva | "eme" |
| **d** | Numero de unidades ocultas en la red | "de" |
| **theta** | Parametros del modelo (pesos, sesgos) | "zeta" |
| **prod** | Productoria: multiplicacion de muchos terminos | "productoria" |

---

## 1. La regla de la cadena como modelo generativo

### 1.1 La ecuacion fundamental

$$
p(x_1, x_2, \ldots, x_n) = \prod_{i=1}^{n} p(x_i \mid x_{<i})
$$

**Como leerla:** "La probabilidad conjunta de x-1 hasta x-n es igual a la productoria, para i desde 1 hasta n, de la probabilidad de x-i condicionada en todas las variables anteriores."

**Que significa:** Cualquier distribucion conjunta se puede descomponer como un producto de condicionales. Esto NO es una aproximacion ni requiere suposiciones. Es un hecho matematico que sale directamente de la **regla de la cadena de probabilidad**.

### 1.2 Desglose de los primeros terminos

Para entenderlo mejor, expandimos el producto:

```
p(x_1, x_2, x_3, x_4) = p(x_1) · p(x_2 | x_1) · p(x_3 | x_1, x_2) · p(x_4 | x_1, x_2, x_3)
```

- p(x_1): no tiene condicion (es la primera variable)
- p(x_2 | x_1): depende solo de x_1
- p(x_3 | x_1, x_2): depende de las dos primeras
- p(x_4 | x_1, x_2, x_3): depende de todas las anteriores

### 1.3 El orden importa

Diferentes ordenes de las variables dan factorizaciones diferentes. Para 3 variables podemos factorizar como:

```
Orden 1-2-3:  p(x_1) · p(x_2|x_1) · p(x_3|x_1,x_2)
Orden 3-1-2:  p(x_3) · p(x_1|x_3) · p(x_2|x_3,x_1)
Orden 2-3-1:  p(x_2) · p(x_3|x_2) · p(x_1|x_2,x_3)
```

Todas representan la MISMA distribucion conjunta, pero los modelos que aprendan cada condicional seran diferentes.

### 1.4 Analogia: escribir una oracion palabra por palabra

Piensa en un modelo de lenguaje que genera texto:

```
p("El gato duerme") = p("El") · p("gato" | "El") · p("duerme" | "El gato")
```

Cada palabra esta condicionada en todas las anteriores. Un modelo autoregresivo hace exactamente esto, pero con cualquier tipo de dato: pixeles de una imagen, valores binarios, etc.

---

## 2. FVSBN (Fully Visible Sigmoid Belief Network)

### 2.1 La idea

Es el modelo autoregresivo mas simple para **datos binarios** (cada x_i es 0 o 1). Cada condicional es una **regresion logistica** sobre las variables anteriores.

### 2.2 La ecuacion

$$
p(x_i = 1 \mid x_{<i}) = \sigma\left(\alpha_i + \mathbf{w}_i^\top \mathbf{x}_{<i}\right)
$$

**Como leerla:** "La probabilidad de que x-i sea 1, dadas las anteriores, es la sigmoide de alfa-i mas el producto interno de w-i con x-menor-que-i."

**Que significa cada parte:**

| Parte | Significado |
|-------|-------------|
| sigma(.) | La funcion sigmoide: convierte cualquier numero real en un valor entre 0 y 1 |
| alpha_i | Un sesgo (bias) para la i-esima variable |
| w_i | Un vector de pesos de dimension i-1 |
| x_{<i} | El vector de las i-1 variables anteriores |

### 2.3 Contando parametros

- Para x_1: 1 parametro (solo alpha_1)
- Para x_2: 2 parametros (alpha_2 y un peso w)
- Para x_i: i parametros (alpha_i y i-1 pesos)
- Total: 1 + 2 + 3 + ... + n = **n(n+1)/2 = O(n^2)**

### 2.4 Limitacion

Cada condicional es una regresion logistica: solo puede modelar fronteras de decision lineales. Si la relacion real entre x_i y x_{<i} es no lineal, FVSBN no puede capturarla.

---

## 3. NADE (Neural Autoregressive Density Estimator)

### 3.1 La idea clave

Reemplazar la regresion logistica de FVSBN con una **red neuronal con una capa oculta**. Esto permite modelar relaciones no lineales. La innovacion principal: **compartir parametros** entre las condicionales.

### 3.2 Las ecuaciones

**Capa oculta:**

$$
\mathbf{h}_i = \sigma\left(\mathbf{W}_{<i} \mathbf{x}_{<i} + \mathbf{c}\right)
$$

**Como leerla:** "h-i es la sigmoide de W-menor-que-i por x-menor-que-i mas c."

**Que significa:** Tomamos las primeras i-1 columnas de la matriz W, las multiplicamos por las i-1 variables anteriores, sumamos el sesgo c, y aplicamos la sigmoide. El resultado h_i es un vector de d dimensiones (d = numero de neuronas ocultas).

**Salida (probabilidad condicional):**

$$
p(x_i = 1 \mid \mathbf{x}_{<i}) = \sigma\left(\alpha_i + \mathbf{V}_i \cdot \mathbf{h}_i\right)
$$

**Como leerla:** "La probabilidad de que x-i sea 1 es la sigmoide de alfa-i mas V-i por h-i."

### 3.3 El diagrama

```
  x_1  x_2  ...  x_{i-1}      (las i-1 variables anteriores)
   |    |         |
   v    v         v
  ┌──────────────────┐
  │  W_{<i} · x_{<i} + c  │    (capa oculta compartida)
  └──────────────────┘
           |
           v
        h_i  (d neuronas)
           |
           v
  ┌──────────────────┐
  │  alpha_i + V_i · h_i   │    (capa de salida)
  └──────────────────┘
           |
           v
      p(x_i = 1 | x_{<i})
```

### 3.4 Parametros compartidos: por que importa

La W y el c son los MISMOS para todas las condicionales. Solo se usan mas o menos columnas de W segun cuantas variables anteriores hay. Esto significa:

- Menos parametros totales: O(n·d) en vez de O(n^2·d)
- Mejor generalizacion (menos sobreajuste)
- Truco computacional: h_i se puede calcular incrementalmente a partir de h_{i-1} (ver 3.4b)

### 3.4b El cálculo recursivo de las activaciones ocultas

La clave computacional de NADE es que las activaciones pre-sigmoide se acumulan de forma recursiva:

$$a_1 = \mathbf{c}$$

$$a_{i+1} = a_i + \mathbf{W}_{\cdot,i} \cdot x_i$$

$$\mathbf{h}_i = \sigma(a_i)$$

**Cómo leerla:** "$a_1$ es simplemente el sesgo $\mathbf{c}$. Para obtener $a_{i+1}$, sumamos a $a_i$ la columna $i$ de $W$ multiplicada por el valor de $x_i$. La activación oculta $\mathbf{h}_i$ es la sigmoide de $a_i$."

**Qué significa:** En vez de recalcular el producto completo $\mathbf{W}_{<i} \cdot \mathbf{x}_{<i} + \mathbf{c}$ desde cero para cada condicional (que costaría $O(id)$ por cada $i$), reutilizamos el cálculo anterior y solo sumamos un vector. Cada paso incremental cuesta $O(d)$, y hay $n$ pasos, dando un coste total de $O(nd)$.

**Reducción de complejidad:** Sin el truco recursivo, calcular cada $\mathbf{h}_i$ independientemente requeriría $O(id)$ operaciones, y sumar sobre las $n$ condicionales daría $O(n^2 d)$ en total. Con la actualización incremental, la complejidad total se reduce a **$O(nd)$** — un factor $n$ de mejora.

### 3.5 Teacher forcing

Durante el entrenamiento, usamos los **valores reales** de x para condicionar (no las predicciones del modelo):

```
Entrenamiento: p(x_3 | x_1=dato_real, x_2=dato_real)   <-- usa datos reales
Generacion:    p(x_3 | x_1=generado, x_2=generado)      <-- usa sus propias predicciones
```

Esto permite calcular TODAS las condicionales en paralelo durante el entrenamiento.

### 3.6 Complejidad

| Operacion | Complejidad | Paralelizable? |
|-----------|-------------|----------------|
| Evaluacion de densidad | O(n·d) | Si (todas las condicionales a la vez) |
| Muestreo (generacion) | O(n·d) | No (secuencial: x_1, luego x_2, ...) |
| Entrenamiento (un paso) | O(n·d) | Si (teacher forcing) |

### 3.7 Extensiones de NADE

**RNADE (Real-valued NADE):** La versión original de NADE modela datos binarios ($x_i \in \{0,1\}$). RNADE extiende el modelo a datos reales (continuos) reemplazando la salida sigmoide por una **mezcla de Gaussianas** para cada condicional:

$$p(x_i \mid \mathbf{x}_{<i}) = \sum_{k=1}^{K} \pi_k(\mathbf{h}_i) \cdot \mathcal{N}(x_i \mid \mu_k(\mathbf{h}_i), \sigma_k^2(\mathbf{h}_i))$$

donde las medias $\mu_k$, varianzas $\sigma_k^2$ y pesos de mezcla $\pi_k$ dependen de las activaciones ocultas $\mathbf{h}_i$.

**EoNADE (Ensemble of NADEs):** Como la regla de la cadena es válida para cualquier orden de las variables (Sección 1.3), podemos entrenar múltiples modelos NADE con órdenes diferentes y promediar sus densidades. Esto da un modelo más robusto que no depende de una elección particular del orden. EoNADE se conecta con la idea de "order agnostic" training de MADE (Sección 4.5).

---

## 4. MADE (Masked Autoencoder for Distribution Estimation)

### 4.1 La idea

Tomar un autoencoder estandar y aplicar **mascaras** a las matrices de pesos para que la salida i solo dependa de las entradas < i. Resultado: un solo forward pass produce TODAS las condicionales simultaneamente.

### 4.2 Como funcionan las mascaras

Cada capa del autoencoder tiene una matriz de pesos. MADE multiplica esas matrices elemento a elemento por matrices de mascaras binarias M:

$$
\tilde{W}^{(l)} = M^{(l)} \odot W^{(l)}
$$

**Como leerla:** "W-tilde de la capa l es la mascara M de la capa l multiplicada elemento a elemento por los pesos W de la capa l."

### 4.3 Asignacion de numeros

El truco esta en asignar un numero m(k) a cada neurona oculta k:

```
Entrada:   neurona i tiene numero i (de 1 a n)
Oculta:    neurona k tiene numero m(k) aleatorio entre 1 y n-1
Salida:    neurona i tiene numero i (de 1 a n)
```

La regla de la mascara: una conexion de neurona a a neurona b solo se permite si m(a) < m(b) para la salida, o m(a) <= m(b) para capas ocultas. Esto garantiza que la salida i solo "ve" entradas estrictamente menores que i.

### 4.4 Diagrama de ejemplo (n=3)

```
Entradas:     x_1 [1]     x_2 [2]     x_3 [3]
                \   |   X   |   /
                 \  | /   \ |  /
Ocultas:      h_1 [2]    h_2 [1]           (numeros asignados)
                |   \     / |
                |    \   /  |
Salidas:    p(x_1|.) [1]  p(x_2|.) [2]  p(x_3|.) [3]
```

Conexiones permitidas:
- h_1 [2] recibe de x_1 [1] y x_2 [2] (entradas <= 2)
- h_2 [1] recibe de x_1 [1] (entradas <= 1)
- Salida x_1 [1] recibe de... nada con numero < 1 (solo depende de si misma: p(x_1))
- Salida x_2 [2] recibe de h_2 [1] (numero 1 < 2)
- Salida x_3 [3] recibe de h_1 [2] y h_2 [1] (numeros < 3)

### 4.5 Ventaja sobre NADE

| Aspecto | NADE | MADE |
|---------|------|------|
| Forward pass | n pases (uno por condicional) | 1 solo pase |
| Profundidad | 1 capa oculta | Cualquier profundidad |
| Orden | Fijo | Se puede aleatorizar (order agnostic) |
| Usado en | Estimacion de densidad | MAF (normalizing flows) |

---

## 5. PixelRNN y PixelCNN

### 5.1 El contexto: imagenes como secuencias

Una imagen de 28x28 pixeles tiene n = 784 dimensiones. Para aplicar un modelo autoregresivo, definimos un **orden** sobre los pixeles. El mas comun es el **raster scan** (de izquierda a derecha, de arriba a abajo):

```
Pixel 1  →  Pixel 2  →  Pixel 3  → ...
Pixel 29 →  Pixel 30 →  Pixel 31 → ...
...
```

### 5.2 PixelRNN

Usa una red recurrente **LSTM** que procesa los pixeles en orden raster scan:

```
p(pixel_i | pixel_1, ..., pixel_{i-1}) = LSTM(estado_oculto_{i-1}, pixel_{i-1})
```

- El estado oculto acumula informacion de todos los pixeles anteriores
- Puede capturar dependencias a larga distancia
- Variantes: Row LSTM (procesa filas), Diagonal BiLSTM (procesa en diagonal)
- **Desventaja:** El entrenamiento es secuencial y lento

**Factorizacion RGB:** Cada pixel tiene 3 canales de color, y cada canal es una variable categorica con 256 valores posibles. PixelRNN factoriza cada pixel como:

$$p(x_t \mid x_{1:t-1}) = p(x_t^{red} \mid x_{1:t-1}) \cdot p(x_t^{green} \mid x_{1:t-1}, x_t^{red}) \cdot p(x_t^{blue} \mid x_{1:t-1}, x_t^{red}, x_t^{green})$$

Es decir, primero genera el canal rojo, luego el verde condicionado en el rojo, y finalmente el azul condicionado en los otros dos. La regla de la cadena dentro de cada pixel.

### 5.3 PixelCNN

Reemplaza la LSTM por **convoluciones enmascaradas**:

```
Mascara de convolucion (kernel 5x5):

  1  1  1  1  1
  1  1  1  1  1
  1  1  0  0  0      <-- el pixel actual (centro) y los futuros estan enmascarados
  0  0  0  0  0
  0  0  0  0  0
```

- Los 1s indican pixeles que SI se usan para predecir el pixel central
- Los 0s son pixeles que NO se deben usar (son "futuros")
- La mascara tipo A excluye el pixel central; la tipo B lo incluye (para capas intermedias)

**Blind spot:** La mascara rectangular crea un "punto ciego" (blind spot): los pixeles a la izquierda del pixel actual en la misma fila NO estan en el campo receptivo si solo se apilan convoluciones enmascaradas. Gated PixelCNN (van den Oord et al., 2016b) soluciona esto combinando una pila vertical y una horizontal.

**Ventaja sobre PixelRNN:** Las convoluciones se pueden paralelizar durante el entrenamiento (teacher forcing). Solo el muestreo sigue siendo secuencial.

### 5.4 Resultados

Estos modelos generan imagenes sorprendentemente buenas. PixelCNN y sus variantes (Gated PixelCNN, PixelCNN++) fueron el estado del arte en densidad (log-likelihood) sobre CIFAR-10 durante varios anos.

### 5.5 WaveNet (audio autoregresivo)

WaveNet (Oord et al., 2016) aplica la idea autoregresiva a **audio** (forma de onda cruda). La innovacion arquitectonica es usar **convoluciones dilatadas** (dilated convolutions): el kernel toca la senal cada $2^d$ entradas, donde $d$ es la profundidad de la capa. Esto hace que el campo receptivo crezca **exponencialmente** con la profundidad sin aumentar el numero de parametros.

```
Capa 0 (d=1):  o · o · o · o · o · o · o · o    (toca cada 1)
Capa 1 (d=2):  o · · · o · · · o · · · o · · ·  (toca cada 2)
Capa 2 (d=4):  o · · · · · · · o · · · · · · ·  (toca cada 4)
Capa 3 (d=8):  o · · · · · · · · · · · · · · ·  (toca cada 8)
```

Con solo 4 capas, el campo receptivo es de 16 muestras. WaveNet usa muchas mas capas para cubrir ventanas de audio de segundos. La calidad de sintesis de voz fue revolucionaria en su epoca.

### 5.6 Atencion y Transformers generativos

**Problemas de las RNNs para modelos autoregresivos:**

| Problema | Explicacion |
|----------|-------------|
| Cuello de botella | Un unico vector oculto $h^{(t)}$ debe resumir TODA la historia anterior |
| Secuencial | No se puede paralelizar: $h^{(t)}$ depende de $h^{(t-1)}$ |
| Gradientes inestables | Gradientes que explotan o se desvanecen al acceder a informacion lejana |

**Mecanismo de atencion:** En vez de comprimir toda la historia en un vector, la atencion compara el estado actual (**query**) con todos los estados anteriores (**keys**) usando un producto punto, construye una distribucion de pesos via softmax, y calcula un resumen ponderado (**values**):

```
1. Comparar: score(query, key_j) = query · key_j
2. Ponderar: alpha_j = softmax(scores)
3. Resumir: contexto = sum_j alpha_j · value_j
```

**Transformers generativos (GPT):** Reemplazan completamente las RNNs por capas de **self-attention enmascarada**. La mascara causal asegura que la posicion $i$ solo atiende a posiciones $\leq i$, preservando la estructura autoregresiva. Ventaja: el entrenamiento es completamente paralelizable (como PixelCNN, pero con campo receptivo global). GPT-2, GPT-3, LLaMA, etc. son modelos autoregresivos entrenados con MLE.

### 5.7 Aplicacion: deteccion de ejemplos adversariales (PixelDefend)

Un modelo generativo autoregresivo entrenado con MLE sobre datos limpios asigna alta probabilidad $p(x)$ a datos naturales y baja probabilidad a datos fuera de distribucion. PixelDefend (Song et al., 2018) explota esto: dado un input $\bar{x}$, evalua $p(\bar{x})$ con un PixelCNN. Los ejemplos adversariales (perturbaciones imperceptibles que enganan a clasificadores) tienen densidad significativamente menor bajo $p(x)$.

---

## 6. Densidad exacta vs. sampling lento

Esta es la tension fundamental de los modelos autoregresivos:

| Propiedad | Valor | Explicacion |
|-----------|-------|-------------|
| Likelihood exacta | Si | Solo multiplicas las condicionales: log p(x) = sum log p(x_i dado x_{<i}) |
| Entrenamiento | Eficiente | Teacher forcing: todas las condicionales en paralelo |
| Sampling | LENTO | Secuencial: primero x_1, luego x_2 dado x_1, luego x_3 dado x_1,x_2, ... |
| Representacion latente | No tiene | No hay variable z; el modelo es puramente observado |

### Por que el sampling es lento (diagrama)

```
Evaluacion de densidad (rapido):
  x_1, x_2, x_3, x_4  (todos conocidos)
   |    |    |    |
   v    v    v    v
  p_1  p_2  p_3  p_4   (todas en PARALELO)
  log p(x) = log p_1 + log p_2 + log p_3 + log p_4

Sampling (lento):
  Paso 1: x_1 ~ p(x_1)
  Paso 2: x_2 ~ p(x_2 | x_1)        <-- necesita x_1
  Paso 3: x_3 ~ p(x_3 | x_1, x_2)   <-- necesita x_1, x_2
  Paso 4: x_4 ~ p(x_4 | x_1, x_2, x_3)  <-- necesita todos los anteriores
  (no se puede paralelizar!)
```

**Analogia:** Evaluar la densidad es como leer una oracion y puntuar cada palabra en paralelo. Generar (sampling) es como escribir una oracion: no puedes escribir la tercera palabra sin saber cuales son las dos primeras.

---

## 7. Tabla comparativa de modelos autoregresivos

| Modelo | Datos | Condicionales | Params compartidos | Densidad | Paralelizable (train) |
|--------|-------|---------------|--------------------|----------|-----------------------|
| FVSBN | Binarios | Reg. logistica | No | Exacta | Si |
| NADE | Binarios | Red neuronal (1 capa) | Si (W, c) | Exacta | Si |
| MADE | Continuos/binarios | Autoencoder enmascarado | Si | Exacta | Si (1 forward pass) |
| PixelRNN | Imagenes (RGB) | LSTM + masking | Si | Exacta | No (secuencial) |
| PixelCNN | Imagenes (RGB) | Conv enmascaradas | Si | Exacta | Si |
| WaveNet | Audio | Dilated conv | Si | Exacta | Si |
| GPT/Transformer | Texto/general | Self-attention enmascarada | Si | Exacta | Si |

### Evolucion historica

```
FVSBN (simple, limitado)
  |
  v
NADE (mas expresivo, pesos compartidos)
  |
  v
MADE (un solo forward pass, mascaras)            ──> MAF/IAF (normalizing flows)
  |
  v
PixelRNN/PixelCNN (imagenes, redes profundas)
  |                                          \
  v                                           v
WaveNet (audio, dilated conv)          Attention + Transformer
                                               |
                                               v
                                        GPT-2/3, LLaMA (lenguaje)
```

---

## 8. Conexion con MLE y KL

Entrenar un modelo autoregresivo con **Maximum Likelihood Estimation** es directo:

$$
\max_\theta \sum_{\mathbf{x} \in \mathcal{D}} \log p_\theta(\mathbf{x}) = \max_\theta \sum_{\mathbf{x} \in \mathcal{D}} \sum_{i=1}^{n} \log p_\theta(x_i \mid x_{<i})
$$

**Como leerla:** "Maximizar sobre theta la suma, para cada dato x del dataset, de la suma, para cada dimension i, del log de la condicional p de x-i dado x-menor-que-i."

**Que significa:** Como la distribucion conjunta se descompone en condicionales, el log se convierte en una suma de logs. Cada termino individual mide lo bien que el modelo predice x_i dado lo anterior.

Recuerda que maximizar la log-verosimilitud es equivalente a minimizar la **KL divergence** entre la distribucion empirica de los datos y el modelo:

$$
\max_\theta \mathbb{E}_{p_{\text{data}}}[\log p_\theta(\mathbf{x})] \iff \min_\theta D_{KL}(p_{\text{data}} \| p_\theta)
$$

---

## 9. Glosario

- **Autoregresivo:** Un modelo donde cada variable se predice condicionada en las anteriores, siguiendo un orden fijo.
- **Teacher forcing:** Tecnica de entrenamiento donde se usan los datos reales (no las predicciones del modelo) para condicionar las condicionales. Permite paralelizar el entrenamiento.
- **Raster scan:** Orden que recorre una imagen de izquierda a derecha y de arriba a abajo, como se lee un texto.
- **Mascara:** Matriz binaria que se multiplica por los pesos de una red para "apagar" ciertas conexiones y respetar la estructura autoregresiva.
- **Condicional:** La distribucion de una variable dado el valor de otras: p(x_i | x_{<i}).
- **Factorizacion:** Descomponer una distribucion conjunta como producto de distribuciones mas simples.
- **Likelihood exacta:** El modelo puede calcular la probabilidad exacta de cualquier dato, sin aproximaciones.
- **Sigmoide:** Funcion que mapea numeros reales al intervalo (0,1): sigma(a) = 1/(1+exp(-a)).
- **LSTM:** Long Short-Term Memory, un tipo de red recurrente que puede recordar informacion a largo plazo.
- **Convolucion enmascarada:** Una convolucion donde ciertos pesos del kernel estan forzados a cero para respetar un orden causal.
- **Convolucion dilatada:** Convolucion donde el kernel salta posiciones (dilation), haciendo que el campo receptivo crezca exponencialmente con la profundidad.
- **Atencion (self-attention):** Mecanismo que compara cada posicion con todas las anteriores usando query/key/value, permitiendo acceso directo a cualquier parte del contexto.
- **Mascara causal:** Mascara que en self-attention impide que la posicion i atienda a posiciones j > i, preservando la estructura autoregresiva.
- **Blind spot:** Region del campo receptivo que queda fuera de la mascara de convolucion rectangular en PixelCNN. Solucionado con pilas vertical+horizontal.

---

**Cross-links:** [MLE-Maximum-Likelihood-Estimation.md](MLE-Maximum-Likelihood-Estimation.md) | [KL-Divergence.md](KL-Divergence.md) | [flujos_normalizantes.md](flujos_normalizantes.md) | [independencia_condicional.md](independencia_condicional.md)
