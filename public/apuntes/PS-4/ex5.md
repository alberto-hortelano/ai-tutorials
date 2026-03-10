# Ejercicio 5 — Inpainting

Este documento explica **que significa cada parte del enunciado**, no como resolverlo.

---

## Contexto: Generacion condicional con difusion

**Inpainting** es la tarea de reconstruir las regiones faltantes de una imagen manteniendo las regiones conocidas. Es un caso de **generacion condicional**: generar contenido nuevo que sea coherente con el contexto existente.

En modelos de difusion, el inpainting se logra modificando el proceso reverso (denoising) para que en cada paso:
- Las regiones **conocidas** se tomen de la imagen original (con el nivel de ruido apropiado)
- Las regiones **faltantes** se generen normalmente por el modelo

### Componentes

| Componente | Simbolo | Descripcion |
|------------|---------|-------------|
| Imagen original | $x_\text{orig}$ | La imagen completa antes de enmascarar |
| Mascara binaria | $m$ | $m = 0$ para pixeles conocidos, $m = 1$ para pixeles a reconstruir |
| Imagen ruidosa | $x_t$ | El estado actual del proceso reverso de difusion |
| Imagen original ruidosa | $x_\text{orig\_noisy}$ | La imagen original con ruido anadido segun el schedule al paso $t$ |

---

## Proceso forward para anadir ruido

$$x_t = \sqrt{\bar{\alpha}_t} \, x_{t-1} + \sqrt{1 - \bar{\alpha}_t} \, \epsilon$$

donde $\epsilon \sim \mathcal{N}(0, I)$ y $\bar{\alpha}_t$ es el producto acumulado del noise schedule.

### Como se lee

> "La imagen ruidosa en el paso $t$ es la imagen del paso anterior escalada por $\sqrt{\bar{\alpha}_t}$ mas ruido Gaussiano escalado por $\sqrt{1 - \bar{\alpha}_t}$."

Esta es la misma formula del forward process del ejercicio 4, usada aqui para crear la version ruidosa de la imagen original en cualquier timestep.

---

## Apartado (a) — [1 punto, Escrito]

> *"Express the inpainting update mathematically, ensuring that:*
> - *For $m = 0$, the value is taken directly from $x_\text{orig\_noisy}$*
> - *For $m = 1$, the value is taken from the noised version of $x_t$"*

### ¿Que pide?

Escribir una formula que combine $x_\text{orig\_noisy}$ y $x_t$ usando la mascara $m$, tal que:

| Valor de $m$ | ¿Que ocurre? | Interpretacion |
|--------------|-------------|----------------|
| $m = 0$ | Se usa $x_\text{orig\_noisy}$ | El pixel es **conocido**: forzamos el valor de la imagen original (con ruido al nivel $t$) |
| $m = 1$ | Se usa $x_t$ | El pixel es **faltante**: dejamos que el modelo lo genere |

### Intuicion

```
Imagen original:       Mascara (m):          Resultado:
+---+---+---+         +---+---+---+         +---+---+---+
| A | B | C |         | 0 | 0 | 0 |         | A | B | C |  <-- conocidos
+---+---+---+         +---+---+---+         +---+---+---+
| D | ? | ? |         | 0 | 1 | 1 |         | D | G | G |  <-- ? = generados
+---+---+---+         +---+---+---+         +---+---+---+
| E | ? | ? |         | 0 | 1 | 1 |         | E | G | G |
+---+---+---+         +---+---+---+         +---+---+---+
```

La formula es una combinacion lineal donde $m$ actua como selector pixel a pixel.

---

## Apartado (b) — [11.5 puntos, Codigo]

> *"Implementing Inpainting through DDPM."*

### ¿Que pide?

Implementar dos funciones en `inpaint.py`:

| Funcion | ¿Que calcula? |
|---------|---------------|
| `get_mask` | Crear la mascara binaria $m$: retener un cuadrado central de la mitad del lado de la imagen, enmascarar el resto |
| `apply_inpainting_mask` | Aplicar la formula del apartado (a) en cada paso del proceso reverso |

### Funcion `get_mask`

La mascara tiene valor $m = 0$ en un cuadrado central y $m = 1$ fuera de el. Esto significa que el modelo va a **regenerar los bordes** de la imagen manteniendo el centro intacto.

Ejemplo para una imagen 8x8 (centro de 4x4):

```
m:  1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1
    1 1 0 0 0 0 1 1
    1 1 0 0 0 0 1 1
    1 1 0 0 0 0 1 1
    1 1 0 0 0 0 1 1
    1 1 1 1 1 1 1 1
    1 1 1 1 1 1 1 1

0 = conocido (centro)
1 = a reconstruir (bordes)
```

### Funcion `apply_inpainting_mask`

Se llama en cada paso $t$ del reverse process DDPM. Necesita:

1. Crear $x_\text{orig\_noisy}$: la imagen original con ruido al nivel $t$ (usando `add_forward_tnoise`)
2. Combinar con $x_t$ usando la mascara $m$ y la formula del apartado (a)

### Funcion auxiliar `add_forward_tnoise`

Esta funcion ya esta proporcionada. Aplica el forward process:

$$x_\text{orig\_noisy} = \sqrt{\bar{\alpha}_t} \, x_\text{orig} + \sqrt{1 - \bar{\alpha}_t} \, \epsilon$$

### Ejecucion

Primero generar una imagen con DDIM para usarla como input:

```
python run_sampling.py --dataset faces --experiment ddim
```

Luego ejecutar inpainting:

```
python run_sampling.py --dataset faces --experiment inpaint --image_path /ruta/a/imagen
```

### Resultado esperado

La imagen original se muestra junto a la version enmascarada y la version reconstruida. El modelo regenera las regiones faltantes de forma coherente con el centro conocido.

---

## Resumen del ejercicio 5

| Apartado | Tipo | Puntos | ¿Que hacer? |
|----------|------|--------|-------------|
| (a) | Escrito | 1 | Escribir la formula de inpainting con mascara |
| (b) | Codigo | 11.5 | Implementar `get_mask` y `apply_inpainting_mask` |
| **Total** | | **12.5** | |

### Conceptos clave del ejercicio

1. **Inpainting** combina generacion libre (regiones faltantes) con restricciones (regiones conocidas)
2. La mascara $m$ selecciona pixel a pixel si usar el dato original o la generacion del modelo
3. En cada paso reverso, las regiones conocidas se "fuerzan" a la version ruidosa de la imagen original al nivel de ruido $t$
4. El modelo genera las regiones faltantes de forma coherente porque en cada paso "ve" el contexto de las regiones conocidas
5. Este metodo no requiere reentrenar el modelo — funciona con cualquier DDPM ya entrenado
