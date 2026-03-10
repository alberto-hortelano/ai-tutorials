# Score Matching

Estos apuntes explican en profundidad **score matching**, una familia de tecnicas para entrenar modelos generativos sin necesidad de calcular la constante de normalizacion. Score matching es la base conceptual de los modelos de difusion (DDPM, DDIM) que estudiaremos en el PS4.

Basados en las notas del curso y en el PS4, secciones 1-3.

---

## Guia rapida de simbolos

| Simbolo | Que es | Como se lee |
|---------|--------|-------------|
| $s_\theta(x)$ | Modelo de score parametrizado por una red neuronal | "ese-theta de equis" |
| $\nabla_x$ | Gradiente (vector de derivadas parciales) respecto a $x$ | "nabla sub equis" o "gradiente respecto a equis" |
| $\nabla_x \log p(x)$ | Score verdadero de la distribucion de datos | "nabla equis de log pe de equis" |
| $\nabla_x \log p_\text{data}(x)$ | Score de la distribucion empirica de los datos | "nabla equis de log pe-data de equis" |
| $E_\theta(x)$ | Funcion de energia parametrizada | "e-theta de equis" |
| $Z_\theta$ | Constante de normalizacion (funcion de particion) | "zeta-theta" |
| $\text{Tr}(\cdot)$ | Traza de una matriz (suma de los elementos diagonales) | "traza de..." |
| $J_{s_\theta}(x)$ | Jacobiano del modelo de score (matriz de derivadas parciales de $s_\theta$) | "jacobiano de ese-theta en equis" |
| $\mathbf{v}$ | Vector aleatorio para el estimador de Hutchinson | "ve" |
| $\sigma$ | Nivel de ruido (en denoising score matching) | "sigma" |
| $\tilde{x}$ | Dato corrompido con ruido | "equis tilde" |
| $\mathcal{N}(x)$ | Vecindario de $x$ (en concrete score matching) | "vecindario de equis" |
| $\|\cdot\|^2$ | Norma L2 al cuadrado (suma de cuadrados) | "norma al cuadrado" |
| $\mathcal{J}(\theta)$ | Funcion objetivo de score matching (Fisher divergence) | "jota de theta" |
| $d$ | Dimensionalidad del espacio de datos | "de" |

---

## 1. El problema: estimar densidades sin normalizar

### 1.1 Modelos basados en energia

Los modelos basados en energia (EBMs) definen la probabilidad a traves de una funcion de energia:

$$p_\theta(\mathbf{x}) = \frac{1}{Z_\theta} \exp(-E_\theta(\mathbf{x}))$$

**Como se lee:** "pe-theta de equis es igual a uno sobre zeta-theta por la exponencial de menos e-theta de equis."

**Que significa:** Los puntos con baja energia tienen alta probabilidad. $E_\theta$ puede ser cualquier red neuronal, lo que da maxima flexibilidad. Pero hay un problema enorme: la constante $Z_\theta$.

### 1.2 La constante intratable

$$Z_\theta = \int \exp(-E_\theta(\mathbf{x})) \, d\mathbf{x}$$

**Como se lee:** "zeta-theta es la integral de la exponencial de menos e-theta de equis sobre todo el espacio."

**Que significa:** Para que $p_\theta$ sea una distribucion valida (que integre a 1), necesitamos dividir por $Z_\theta$. Pero calcular esta integral sobre todo el espacio de datos es intratable en dimensiones altas.

### 1.3 MLE necesita $Z_\theta$

Si quisieramos entrenar por maxima verosimilitud (MLE), necesitariamos evaluar $\log p_\theta(\mathbf{x})$:

$$\log p_\theta(\mathbf{x}) = -E_\theta(\mathbf{x}) - \log Z_\theta$$

**Como se lee:** "log pe-theta de equis es igual a menos e-theta de equis menos log de zeta-theta."

**Que significa:** El termino $\log Z_\theta$ depende de $\theta$ y no lo podemos calcular. Esto bloquea el entrenamiento por MLE directamente.

### 1.4 La idea clave: el score no necesita $Z$

Observa que pasa cuando tomamos el gradiente del logaritmo respecto a $x$:

$$\nabla_x \log p_\theta(\mathbf{x}) = -\nabla_x E_\theta(\mathbf{x}) - \nabla_x \log Z_\theta = -\nabla_x E_\theta(\mathbf{x})$$

**Como se lee:** "nabla equis de log pe-theta es igual a menos nabla equis de e-theta de equis."

**Que significa:** $Z_\theta$ es una constante respecto a $x$, asi que su gradiente respecto a $x$ es cero. El score del modelo se calcula **sin necesitar $Z_\theta$**. Esta es la observacion fundamental que motiva todo score matching.

```
Problema central:

    Queremos entrenar p_theta(x)
    pero Z_theta es intratable
    y MLE necesita Z_theta

    Solucion:
    En vez de igualar DENSIDADES   p_theta(x) ≈ p_data(x)
    igualamos SCORES               nabla_x log p_theta(x) ≈ nabla_x log p_data(x)
                                    ↑                        ↑
                                    No necesita Z             No lo conocemos...
                                                              pero hay trucos!
```

---

## 2. La divergencia de Fisher y la loss de score matching

### 2.1 La divergencia de Fisher

La "distancia" natural entre dos scores es la **divergencia de Fisher**:

$$\mathcal{J}(\theta) = \frac{1}{2} \mathbb{E}_{p_\text{data}(\mathbf{x})}\left[\|s_\theta(\mathbf{x}) - \nabla_\mathbf{x} \log p_\text{data}(\mathbf{x})\|^2\right]$$

**Como se lee:** "jota de theta es un medio de la esperanza bajo pe-data de la norma al cuadrado de ese-theta de equis menos nabla equis de log pe-data de equis."

**Que significa cada parte:**

| Parte | Significado |
|-------|-------------|
| $s_\theta(\mathbf{x})$ | El score que predice nuestro modelo (una red neuronal) |
| $\nabla_\mathbf{x} \log p_\text{data}(\mathbf{x})$ | El score "verdadero" de los datos (desconocido!) |
| $\|\cdot\|^2$ | Distancia euclidiana al cuadrado entre ambos scores |
| $\mathbb{E}_{p_\text{data}}$ | Promediamos sobre todos los datos reales |
| $\frac{1}{2}$ | Factor de conveniencia (simplifica las derivadas) |

Esta es la ecuacion (5) del PS4, que tambien aparece como ecuacion (1) con la notacion $L(\theta)$.

### 2.2 El problema: no conocemos el score verdadero

La divergencia de Fisher es la metrica perfecta, pero tiene un problema fatal: no conocemos $\nabla_\mathbf{x} \log p_\text{data}(\mathbf{x})$. Solo tenemos muestras de $p_\text{data}$, no su formula analitica.

**Analogia:** Es como querer medir la distancia a un tesoro cuya ubicacion exacta desconoces. Necesitas un truco para reformular el problema sin necesitar la ubicacion exacta.

Las secciones 3-8 presentan diferentes trucos para resolver este problema:

```
                        Divergencia de Fisher
                    (necesita score verdadero)
                              |
              ┌───────────────┼───────────────┐
              |               |               |
     Hyvarinen SM       Denoising SM      Concrete SM
     (sec. 3-5)          (sec. 6)          (sec. 7)
              |
       ┌──────┴──────┐
       |              |
  Hutchinson       Sliced SM
   (sec. 4)        (sec. 5)
```

---

## 3. Objetivo de Hyvarinen (el truco de integracion por partes)

### 3.1 La transformacion magica

Hyvarinen (2005) demostro que la divergencia de Fisher se puede reescribir **sin el score verdadero**, usando integracion por partes:

$$\mathcal{J}(\theta) = \mathbb{E}_{p_\text{data}(\mathbf{x})}\left[\frac{1}{2}\|s_\theta(\mathbf{x})\|^2 + \text{Tr}(\nabla_\mathbf{x} s_\theta(\mathbf{x}))\right] + C$$

**Como se lee:** "jota de theta es la esperanza bajo pe-data de: un medio de la norma al cuadrado de ese-theta de equis, mas la traza de nabla-equis de ese-theta de equis; todo mas una constante ce."

Esta es la ecuacion (6) del PS4.

### 3.2 Cada termino explicado

**Que significa cada parte:**

| Termino | Formula | Significado | Analogia |
|---------|---------|-------------|----------|
| Norma del score | $\frac{1}{2}\|s_\theta(\mathbf{x})\|^2$ | Cuanto de "fuerte" es el score del modelo en cada punto | Que tan fuerte es el viento que predice tu modelo en cada lugar |
| Traza del Jacobiano | $\text{Tr}(\nabla_\mathbf{x} s_\theta(\mathbf{x}))$ | Suma de las derivadas segundas diagonales del log-densidad del modelo | Como cambia la direccion del viento a lo largo de cada eje |
| Constante $C$ | $C$ | No depende de $\theta$, se ignora en la optimizacion | Un offset fijo que no afecta que $\theta$ es optimo |

### 3.3 El Jacobiano del score

El termino $\nabla_\mathbf{x} s_\theta(\mathbf{x})$ es la **matriz Jacobiana** del modelo de score. Si $\mathbf{x} \in \mathbb{R}^d$ y $s_\theta(\mathbf{x}) \in \mathbb{R}^d$, entonces:

$$\nabla_\mathbf{x} s_\theta(\mathbf{x}) = \begin{pmatrix} \frac{\partial s_{\theta,1}}{\partial x_1} & \frac{\partial s_{\theta,1}}{\partial x_2} & \cdots \\ \frac{\partial s_{\theta,2}}{\partial x_1} & \frac{\partial s_{\theta,2}}{\partial x_2} & \cdots \\ \vdots & \vdots & \ddots \end{pmatrix}$$

**Como se lee:** "La entrada $(i,j)$ del Jacobiano es la derivada parcial de la $i$-esima componente del score respecto a la $j$-esima coordenada de equis."

La **traza** es la suma de la diagonal:

$$\text{Tr}(\nabla_\mathbf{x} s_\theta(\mathbf{x})) = \sum_{i=1}^{d} \frac{\partial s_{\theta,i}(\mathbf{x})}{\partial x_i}$$

**Como se lee:** "La traza es la suma, de $i$ igual 1 a $d$, de la derivada parcial de la componente $i$-esima del score respecto a $x_i$."

### 3.4 Intuicion de por que funciona

La integracion por partes "transfiere" la derivada del score verdadero (desconocido) al score del modelo (conocido). Es el mismo principio que cuando en calculo se usa $\int u \, dv = uv - \int v \, du$: pasamos la derivada de un factor al otro.

```
Antes (integracion por partes):

    E_{p_data}[ ||s_theta - nabla log p_data||^2 ]
                                ^^^^^^^^^^^^^^^^^^^
                                No lo tenemos!

Despues:

    E_{p_data}[ 1/2 ||s_theta||^2  +  Tr(nabla s_theta) ] + C
                    ^^^^^^^^            ^^^^^^^^^^^^^^^
                    Solo depende        Solo depende
                    del modelo          del modelo

    El score verdadero ha desaparecido!
```

### 3.5 Condiciones de frontera

Para que la integracion por partes funcione, necesitamos que $p_\text{data}(\mathbf{x}) \cdot s_\theta(\mathbf{x}) \to 0$ cuando $\|\mathbf{x}\| \to \infty$. En la practica, esto se cumple para distribuciones de datos "razonables" (que decaen suficientemente rapido en las colas).

---

## 4. Estimador de Hutchinson (estimacion estocastica de la traza)

### 4.1 El cuello de botella computacional

Calcular $\text{Tr}(\nabla_\mathbf{x} s_\theta(\mathbf{x}))$ directamente requiere computar las $d$ derivadas parciales diagonales del Jacobiano. Si usamos autodiferenciacion, esto implica $d$ pasadas hacia atras (una por cada componente del score), lo que cuesta $O(d)$ veces el coste de una pasada normal. Para imagenes de $64 \times 64 = 4096$ dimensiones, esto es prohibitivo.

### 4.2 El truco de Hutchinson

El estimador de Hutchinson aproxima la traza de una matriz usando vectores aleatorios:

$$\text{Tr}(A) \approx \frac{1}{m}\sum_{j=1}^{m} \mathbf{z}_j^\top A \mathbf{z}_j$$

**Como se lee:** "La traza de A se aproxima como el promedio de $m$ productos cuadraticos zeta-jota-traspuesta por A por zeta-jota."

Esta es la ecuacion (7) del PS4.

**Que significa cada parte:**

| Parte | Significado |
|-------|-------------|
| $A$ | La matriz cuya traza queremos calcular (en nuestro caso, el Jacobiano $\nabla_\mathbf{x} s_\theta(\mathbf{x})$) |
| $\mathbf{z}_j \in \mathbb{R}^d$ | Vectores aleatorios independientes con $\mathbb{E}[\mathbf{z}_j \mathbf{z}_j^\top] = I$ |
| $\mathbf{z}_j^\top A \mathbf{z}_j$ | Un **producto Jacobiano-vector** (eficiente con autograd) |
| $m$ | Numero de muestras aleatorias (tipicamente $m = 1$ basta en la practica) |

### 4.3 Por que es eficiente

**Sin Hutchinson:** Calcular $\text{Tr}(J)$ necesita el Jacobiano completo ($d \times d$ entradas) $\to O(d^2)$.

**Con Hutchinson:** Cada $\mathbf{z}^\top J \mathbf{z}$ es un producto Jacobiano-vector $J\mathbf{z}$, seguido de un producto punto con $\mathbf{z}$. El producto Jacobiano-vector se computa eficientemente con un solo pase de autodiferenciacion (forward-mode o reverse-mode) $\to O(d)$ por muestra.

```
Coste computacional:

    Jacobiano completo:    O(d^2)     ← intratable para d grande
    Traza exacta:          O(d) pases de backprop
    Hutchinson (m=1):      O(d)       ← un solo pase de backprop
                                         (producto Jacobiano-vector)
```

### 4.4 Que distribuciones para $\mathbf{z}$?

La condicion es $\mathbb{E}[\mathbf{z}\mathbf{z}^\top] = I$. Dos opciones comunes:

| Distribucion | Entradas | Varianza del estimador |
|-------------|----------|----------------------|
| Gaussiana | $z_i \sim \mathcal{N}(0, 1)$ | Mayor |
| Rademacher | $z_i \in \{-1, +1\}$ con probabilidad $1/2$ | Menor (preferida) |

---

## 5. Sliced Score Matching

### 5.1 La idea: proyectar en direcciones aleatorias

En vez de comparar los vectores de score completos ($d$-dimensionales), sliced score matching los proyecta sobre direcciones aleatorias y compara las proyecciones escalares:

$$\mathcal{J}_\text{sliced}(\theta) = \mathbb{E}_{\mathbf{v}}\mathbb{E}_{p_\text{data}}\left[\frac{1}{2}(\mathbf{v}^\top s_\theta(\mathbf{x}))^2 + \mathbf{v}^\top \nabla_\mathbf{x}(s_\theta(\mathbf{x})) \mathbf{v}\right]$$

**Como se lee:** "jota-sliced de theta es la esperanza sobre ve, de la esperanza bajo pe-data, de: un medio del cuadrado de ve-traspuesta ese-theta de equis, mas ve-traspuesta nabla-equis de ese-theta de equis por ve."

Esto viene del PS4 Q3b.

### 5.2 Cada termino explicado

| Termino | Formula | Significado |
|---------|---------|-------------|
| Proyeccion del score | $\mathbf{v}^\top s_\theta(\mathbf{x})$ | El score del modelo proyectado en la direccion $\mathbf{v}$ (un escalar) |
| Derivada direccional | $\mathbf{v}^\top \nabla_\mathbf{x}(s_\theta(\mathbf{x})) \mathbf{v}$ | Curvatura del score en la direccion $\mathbf{v}$ (un escalar) |
| Expectativa sobre $\mathbf{v}$ | $\mathbb{E}_\mathbf{v}$ | Promediamos sobre muchas direcciones aleatorias |

### 5.3 Por que es mas rapido

El termino $\mathbf{v}^\top \nabla_\mathbf{x}(s_\theta(\mathbf{x})) \mathbf{v}$ es un **producto cuadratico** con el Jacobiano, no la traza completa. Esto requiere un solo producto Jacobiano-vector $J\mathbf{v}$ (coste $O(d)$), seguido de un producto punto con $\mathbf{v}$ (coste $O(d)$).

```
Comparacion de costes:

    Exact Score Matching:    Tr(J) → O(d) pases de backprop o Hutchinson
    Sliced Score Matching:   v^T J v → 1 pase de backprop (JVP)

    Sliced SM evita incluso la aproximacion
    estocastica de la traza — directamente
    trabaja con proyecciones 1D.
```

### 5.4 Relacion con el objetivo de Hyvarinen

Si $\mathbf{v}$ se muestrea uniformemente sobre la esfera unitaria, entonces $\mathbb{E}_\mathbf{v}[\mathbf{v}^\top A \mathbf{v}] = \frac{1}{d}\text{Tr}(A)$ (propiedad de la proyeccion aleatoria). Asi que sliced score matching esta optimizando un objetivo equivalente a Hyvarinen SM, pero accediendo a el de forma mas eficiente.

---

## 6. Denoising Score Matching (DSM)

### 6.1 La idea fundamental

En vez de intentar igualar el score de los datos limpios (que no conocemos), corrompemos los datos con ruido Gaussiano y entrenamos el modelo para igualar el score de los datos **ruidosos**. La ventaja crucial: el score de los datos ruidosos **si lo podemos calcular**.

### 6.2 El objetivo DSM

$$\mathcal{L}_\text{DSM} = \mathbb{E}_{\mathbf{x} \sim p_\text{data}} \mathbb{E}_{\mathbf{z} \sim \mathcal{N}(0, \sigma^2 I)}\left[\|s_\theta(\mathbf{x} + \mathbf{z}) + \mathbf{z}/\sigma^2\|^2\right]$$

**Como se lee:** "ele-DSM es la esperanza sobre equis muestreado de pe-data, de la esperanza sobre zeta muestreado de una normal con media cero y varianza sigma cuadrado por identidad, de la norma al cuadrado de: ese-theta de equis mas zeta, mas zeta sobre sigma cuadrado."

Esta es la ecuacion (8) del PS4.

### 6.3 Cada parte explicada

| Parte | Significado |
|-------|-------------|
| $\mathbf{x} \sim p_\text{data}$ | Tomamos un dato limpio del dataset |
| $\mathbf{z} \sim \mathcal{N}(0, \sigma^2 I)$ | Generamos ruido Gaussiano |
| $\mathbf{x} + \mathbf{z}$ | El dato corrompido $\tilde{\mathbf{x}}$ |
| $s_\theta(\mathbf{x} + \mathbf{z})$ | Lo que predice nuestro modelo para el dato ruidoso |
| $-\mathbf{z}/\sigma^2$ | Lo que el modelo **deberia** predecir (el score verdadero del dato ruidoso) |
| $\|\cdot\|^2$ | Error cuadratico entre la prediccion y el objetivo |

### 6.4 Por que $-\mathbf{z}/\sigma^2$ es el score correcto

Si $\tilde{\mathbf{x}} = \mathbf{x} + \mathbf{z}$ donde $\mathbf{z} \sim \mathcal{N}(0, \sigma^2 I)$, entonces la distribucion de $\tilde{\mathbf{x}}$ dado $\mathbf{x}$ es:

$$p(\tilde{\mathbf{x}} | \mathbf{x}) = \mathcal{N}(\tilde{\mathbf{x}} | \mathbf{x}, \sigma^2 I)$$

El score de esta Gaussiana respecto a $\tilde{\mathbf{x}}$ es:

$$\nabla_{\tilde{\mathbf{x}}} \log p(\tilde{\mathbf{x}} | \mathbf{x}) = -\frac{\tilde{\mathbf{x}} - \mathbf{x}}{\sigma^2} = -\frac{\mathbf{z}}{\sigma^2}$$

**Como se lee:** "El gradiente de log pe de equis-tilde dado equis es igual a menos equis-tilde menos equis sobre sigma cuadrado, que es menos zeta sobre sigma cuadrado."

**Que significa:** El score de la distribucion ruidosa apunta **de vuelta** hacia el dato limpio, con una fuerza inversamente proporcional a la varianza del ruido. Esto es equivalente a entrenar un **autoencoder denoising**.

### 6.5 Ventajas sobre Exact Score Matching

```
Exact Score Matching:           Denoising Score Matching:

  Necesita Tr(J)                  NO necesita Tr(J)
  O(d) pases de backprop          Solo necesita evaluar s_theta
  o Hutchinson                    y comparar con -z/sigma^2
  Inestable en dim. alta          Estable y escalable
  Memoria: O(d^2)                 Memoria: O(d)
```

**Analogia:** Exact SM le pregunta al modelo "en que direccion y cuanto crece la densidad?", lo cual requiere calcular derivadas del propio score. DSM le pregunta al modelo "dado este dato ruidoso, de donde viene el ruido?", lo cual es mucho mas simple computacionalmente.

### 6.6 Formula de Tweedie: la conexion profunda

La formula de Tweedie explica **por que** DSM funciona y conecta el score con la prediccion optima del dato limpio:

$$\mathbb{E}[\mathbf{x} \mid \tilde{\mathbf{x}}] = \tilde{\mathbf{x}} + \sigma^2 \nabla_{\tilde{\mathbf{x}}} \log q_\sigma(\tilde{\mathbf{x}})$$

**Como se lee:** "La esperanza de equis dado equis-tilde es equis-tilde mas sigma-cuadrado por el score de la distribucion ruidosa evaluado en equis-tilde."

**Que significa cada parte:**

| Parte | Significado |
|-------|-------------|
| $\mathbb{E}[\mathbf{x} \mid \tilde{\mathbf{x}}]$ | La mejor estimacion (MMSE) del dato limpio dado el ruidoso |
| $\tilde{\mathbf{x}}$ | El dato ruidoso, punto de partida |
| $\sigma^2 \nabla \log q_\sigma(\tilde{\mathbf{x}})$ | Correccion: "caminar" en la direccion del score, escalado por la varianza del ruido |

**Implicaciones:**
1. Si $s_\theta(\tilde{\mathbf{x}}) \approx \nabla \log q_\sigma(\tilde{\mathbf{x}})$, entonces $\hat{\mathbf{x}}_0 \approx \tilde{\mathbf{x}} + \sigma^2 s_\theta(\tilde{\mathbf{x}})$ es el denoiser optimo.
2. Entrenar un score model con DSM es equivalente a entrenar un denoising autoencoder optimo.
3. En modelos de difusion, esta formula conecta directamente la prediccion de ruido $\epsilon_\theta$ con la estimacion de $x_0$ (la funcion `predict_x0` del PS4).

### 6.7 El rol de $\sigma$

El nivel de ruido $\sigma$ controla un compromiso:

| $\sigma$ | Efecto | Problema |
|----------|--------|----------|
| Grande | Facil de entrenar (la senyal de gradiente es fuerte) | El score aprendido corresponde a una version muy "borrosa" de los datos |
| Pequeno | El score aprendido se aproxima al score verdadero de los datos | Dificil de entrenar (la senyal es debil, alta varianza) |

Este compromiso motiva el enfoque **multi-escala** de la seccion 8.

---

## 7. Concrete Score Matching (datos discretos)

### 7.1 El problema: no hay gradientes en espacios discretos

Score matching clasico usa $\nabla_x \log p(x)$, que es un **gradiente continuo**. Si los datos viven en un espacio discreto como $\{0,1\}^d$ (por ejemplo, texto, grafos, datos binarios), no podemos tomar gradientes. Concrete score matching (PS4 Q2) extiende la idea a datos discretos.

### 7.2 Vecindarios y distancia de Hamming

Para cada punto $\mathbf{x} \in \{0,1\}^d$, definimos su vecindario como todos los puntos que difieren en exactamente un bit:

$$\mathcal{N}(\mathbf{x}) = \{\mathbf{x}' \in \mathcal{X} : \text{Hamming}(\mathbf{x}, \mathbf{x}') = 1\}$$

**Como se lee:** "El vecindario de equis es el conjunto de equis-prima en el espacio X tales que la distancia de Hamming entre equis y equis-prima es 1."

Esta es la ecuacion (2) del PS4. Para datos binarios de dimension $d$, cada punto tiene exactamente $d$ vecinos (uno por cada bit que se puede voltear).

### 7.3 El concrete score

El **concrete score** reemplaza al gradiente continuo con diferencias finitas en el vecindario:

$$c_{p_\text{data}}(\mathbf{x}; \mathcal{N}) \triangleq \left[\frac{p_\text{data}(\mathbf{x}_{n_1}) - p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x})}, \ldots, \frac{p_\text{data}(\mathbf{x}_{n_K}) - p_\text{data}(\mathbf{x})}{p_\text{data}(\mathbf{x})}\right]^\top$$

**Como se lee:** "ce-pe-data de equis es un vector cuya componente $k$-esima es pe-data del vecino $k$-esimo menos pe-data de equis, todo dividido por pe-data de equis."

Esta es la ecuacion (3) del PS4.

**Que significa cada componente:**

| Parte | Significado |
|-------|-------------|
| $p_\text{data}(\mathbf{x}_{n_k})$ | Probabilidad del vecino $k$-esimo |
| $p_\text{data}(\mathbf{x})$ | Probabilidad del punto actual |
| La fraccion completa | Cambio relativo de probabilidad al ir de $\mathbf{x}$ a su vecino $n_k$ |

**Analogia:** En vez de preguntar "en que **direccion continua** crece la densidad?" (gradiente), preguntamos "si volteo el bit $k$, la probabilidad sube o baja, y por cuanto?" (diferencia finita).

### 7.4 Objetivo de Concrete Score Matching

$$\mathcal{L}_\text{CSM}(\theta) = \sum_{\mathbf{x}} p_\text{data}(\mathbf{x}) \|c_\theta(\mathbf{x}; \mathcal{N}) - c_{p_\text{data}}(\mathbf{x}; \mathcal{N})\|_2^2$$

**Como se lee:** "ele-CSM de theta es la suma sobre todos los equis de pe-data de equis por la norma al cuadrado de la diferencia entre el concrete score del modelo y el concrete score de los datos."

Esta es la ecuacion (4) del PS4.

### 7.5 Tractabilidad y escalabilidad

| Hamming $k$ | Tamano del vecindario | Coste |
|------------|----------------------|-------|
| $k = 1$ | $d$ vecinos | $O(d)$ -- tratable |
| $k = 2$ | $\binom{d}{2}$ vecinos | $O(d^2)$ -- costoso |
| $k$ general | $\binom{d}{k}$ vecinos | $O(d^k / k!)$ -- intratable rapidamente |

Del PS4 Q2b: con Hamming $k$, el vecindario crece como $O(\binom{d}{k})$, que se vuelve intratable para $k$ grande. En la practica se usa Monte Carlo para aproximar la suma sobre el espacio $\mathcal{X}$.

---

## 8. Score-based diffusion: puente hacia modelos de difusion

### 8.1 El problema de las regiones de baja densidad

Score matching (en todas sus variantes) tiene una debilidad fundamental: el score se estima bien solo donde hay **datos de entrenamiento**. En regiones de baja densidad (lejos de los datos), la estimacion es pobre porque casi no hay muestras ahi.

```
Distribucion de datos (1D, dos modas):

    p(x)
     ^
     |     *                 *
     |    ***               ***
     |   *****             *****
     |  *******           *******
     | *********         *********
     ├──────────────────────────────► x
          alta               alta
        densidad            densidad

              ← baja densidad →
              score estimado
              es impreciso aqui!
```

Esto es problematico para el muestreo: si usamos Langevin dynamics para generar muestras, las cadenas que empiezan en regiones de baja densidad recibiran senales de score poco fiables y podrian no converger a las modas correctamente.

### 8.2 La solucion: multiples escalas de ruido

En vez de usar un solo nivel de ruido $\sigma$, usamos una secuencia decreciente:

$$\sigma_1 > \sigma_2 > \cdots > \sigma_L$$

y entrenamos un unico modelo $s_\theta(\mathbf{x}, \sigma)$ que estima el score **condicionado al nivel de ruido**:

$$s_\theta(\mathbf{x}, \sigma_i) \approx \nabla_\mathbf{x} \log p_{\sigma_i}(\mathbf{x})$$

**Como se lee:** "ese-theta de equis, sigma-$i$ aproxima nabla equis de log pe-sigma-$i$ de equis."

**Que significa:** $p_{\sigma_i}$ es la distribucion de datos convolucionada con ruido Gaussiano de escala $\sigma_i$. A mayor $\sigma$, la distribucion es mas "suave" y el score mas facil de estimar en todas partes.

### 8.3 Muestreo: Annealed Langevin Dynamics

El muestreo procede de ruido alto a bajo:

```
Paso 1: sigma_1 (ruido alto)
    Distribucion muy suave, score fiable en todo el espacio
    → Las muestras encuentran las regiones correctas

         ~~~~~~~~~~~~~~~~~~~~~~~~
        ~          ~~~~          ~
        ~~~~~~~~~~~~~~~~~~~~~~~~~

Paso 2: sigma_2 (ruido medio)
    Distribucion menos suave, mas detalle
    → Las muestras se refinan

            ~~      ~~~~      ~~
           ~~~~    ~~~~~~    ~~~~

    ...

Paso L: sigma_L (ruido bajo)
    Distribucion casi identica a los datos
    → Muestras finales de alta calidad

             *                 *
            ***               ***
           *****             *****
```

En cada nivel de ruido, corremos varias iteraciones de Langevin dynamics:

$$\mathbf{x}_{t+1} = \mathbf{x}_t + \frac{\eta}{2} s_\theta(\mathbf{x}_t, \sigma_i) + \sqrt{\eta} \cdot \boldsymbol{\epsilon}_t, \qquad \boldsymbol{\epsilon}_t \sim \mathcal{N}(0, I)$$

### 8.4 Conexion con DDPM y DDIM

Este enfoque multi-escala es conceptualmente identico a los **modelos de difusion**:

| Concepto en score-based | Concepto en DDPM |
|------------------------|------------------|
| Secuencia de ruidos $\sigma_1 > \cdots > \sigma_L$ | Schedule de ruido $\beta_1, \ldots, \beta_T$ |
| Entrenar $s_\theta(\mathbf{x}, \sigma)$ para cada escala | Entrenar $\epsilon_\theta(\mathbf{x}_t, t)$ para cada paso temporal |
| Annealed Langevin dynamics | Proceso reverso iterativo |
| Score: $\nabla_x \log p_\sigma(x)$ | Prediccion de ruido: $\epsilon_\theta \propto -\sigma \cdot \nabla_x \log p_\sigma(x)$ |

La relacion precisa entre score y prediccion de ruido es:

$$s_\theta(\mathbf{x}_t, t) = -\frac{\epsilon_\theta(\mathbf{x}_t, t)}{\sqrt{1 - \bar{\alpha}_t}}$$

**Que significa:** Predecir el score y predecir el ruido son dos perspectivas sobre la misma tarea. Los modelos de difusion son modelos de score multi-escala con una formulacion de entrenamiento elegante (denoising score matching en cada paso temporal).

---

## 9. Comparacion con MLE y entrenamiento adversario

| Propiedad | MLE | Score Matching | Adversarial (GAN) |
|-----------|-----|----------------|-------------------|
| Requiere $Z_\theta$ | Si | **No** | No |
| Requiere muestras de $p_\text{data}$ | Si | Si | Si |
| Requiere evaluar $p_\text{data}$ | No | No | No |
| Estabilidad del entrenamiento | Alta | Alta | Baja |
| Calidad de muestras | Variable | Alta (con DSM multi-escala) | Alta |
| Modo de fallo tipico | Mode covering | Regiones de baja densidad | Mode collapse |
| Metrica de progreso | Log-likelihood | Fisher divergence | Ninguna clara |
| Flexibilidad arquitectonica | Restringida (necesita $Z$) | Alta (cualquier red) | Alta (cualquier red) |
| Coste de muestreo | Rapido (flows) / Lento (autoreg.) | Lento (Langevin iterativo) | Rapido (una pasada) |

### 9.1 Cuando usar cada enfoque

```
Necesitas log-likelihoods exactas?
├── Si → MLE (autorregresivos o flujos normalizantes)
└── No
    ├── Priorizas estabilidad de entrenamiento?
    │   ├── Si → Score matching / Difusion
    │   └── No → GAN (si aguantas la inestabilidad)
    └── Priorizas velocidad de muestreo?
        ├── Si → GAN o flujos
        └── No → Score matching / Difusion
                  (mejor calidad, pero lento)
```

---

## 10. Resumen visual completo

```
Score Matching: Mapa conceptual

    Modelos basados en energia
    p(x) = exp(-E(x)) / Z
              |
              | Z es intratable
              |
              v
    Pero nabla_x log p(x) = -nabla_x E(x)
    no necesita Z!
              |
              v
    ┌─────────────────────────────┐
    │    FISHER DIVERGENCE        │
    │  1/2 E[||s_theta - s*||^2]  │
    │  Pero no conocemos s*...    │
    └────────────┬────────────────┘
                 |
    ┌────────────┼────────────────────────┐
    |            |                        |
    v            v                        v
┌────────┐  ┌──────────┐           ┌──────────┐
│Hyvarinen│  │ Denoising│           │ Concrete │
│   SM    │  │    SM    │           │    SM    │
│ Tr(J)   │  │  -z/s^2  │           │ discreto │
│eq.(6)PS4│  │ eq.(8)PS4│           │ eq.(3)PS4│
└────┬────┘  └──────────┘           └──────────┘
     |
┌────┼────────┐
|              |
v              v
Hutchinson   Sliced SM
 eq.(7)PS4    Q3b PS4
```

---

## 11. Glosario

| Castellano | Ingles | Definicion breve |
|------------|--------|------------------|
| Score (funcion score) | Score function | Gradiente del logaritmo de la densidad: $\nabla_x \log p(x)$ |
| Score matching | Score matching | Familia de tecnicas que entrenan modelos igualando scores en vez de densidades |
| Divergencia de Fisher | Fisher divergence | Distancia L2 esperada entre el score del modelo y el score verdadero |
| Objetivo de Hyvarinen | Hyvarinen's objective | Reformulacion del score matching que elimina el score verdadero via integracion por partes |
| Traza | Trace | Suma de los elementos diagonales de una matriz cuadrada |
| Jacobiano | Jacobian | Matriz de todas las derivadas parciales de una funcion vectorial |
| Estimador de Hutchinson | Hutchinson's estimator | Aproximacion estocastica de la traza usando vectores aleatorios |
| Score matching rebanado | Sliced score matching | Variante que proyecta scores en direcciones aleatorias para mayor eficiencia |
| Score matching por denoising | Denoising score matching (DSM) | Variante que entrena el modelo a predecir el score de datos ruidosos |
| Score concreto | Concrete score | Analogo discreto del score continuo, basado en diferencias finitas en un vecindario |
| Distancia de Hamming | Hamming distance | Numero de bits diferentes entre dos vectores binarios |
| Dinamica de Langevin | Langevin dynamics | Algoritmo de muestreo que sigue el score con ruido aleatorio |
| Langevin annealed | Annealed Langevin dynamics | Langevin con multiples escalas de ruido, de alto a bajo |
| Constante de normalizacion | Partition function / Normalization constant | $Z = \int \exp(-E(x)) dx$, asegura que la distribucion integra a 1 |
| Modelo basado en energia | Energy-based model (EBM) | Modelo que define $p(x) \propto \exp(-E(x))$ con $E$ arbitraria |
| Integracion por partes | Integration by parts | Tecnica de calculo que transfiere derivadas de un factor a otro en una integral |
| Producto Jacobiano-vector | Jacobian-vector product (JVP) | Multiplicacion eficiente del Jacobiano por un vector, sin construir la matriz completa |
| Autodiferenciacion | Automatic differentiation (autograd) | Calculo exacto de derivadas usando la regla de la cadena automaticamente |
| Formula de Tweedie | Tweedie's formula | $\mathbb{E}[x|\tilde{x}] = \tilde{x} + \sigma^2 \nabla \log q_\sigma(\tilde{x})$: la estimacion optima del dato limpio usa el score |

---

## Cross-links

- [Funcion-Score.md](Funcion-Score.md) -- Definicion y propiedades de la funcion score
- [Modelos-Basados-en-Energia.md](Modelos-Basados-en-Energia.md) -- EBMs y la constante de normalizacion
- [KL-Divergence.md](KL-Divergence.md) -- Divergencia KL (contraste con Fisher divergence)
- [MLE-Maximum-Likelihood-Estimation.md](MLE-Maximum-Likelihood-Estimation.md) -- MLE y por que necesita $Z$
