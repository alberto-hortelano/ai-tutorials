# Divergencia de Jensen-Shannon (JSD)

## Intuicion: Que problema resuelve?

La KL Divergence tiene un problema fundamental: no es simetrica. $D_\text{KL}(P \| Q) \neq D_\text{KL}(Q \| P)$, asi que la "distancia" depende de cual distribucion pongas primero. La Divergencia de Jensen-Shannon resuelve esto: es una forma **simetrica** y **acotada** de medir que tan diferentes son dos distribuciones.

## Analogia

Imagina dos recetas distintas para hacer galletas (dos distribuciones P y Q). Con KL, preguntas: "que tan sorprendido estoy si uso la receta Q cuando los datos vienen de P?" Pero esa pregunta no es justa -- depende de quien pregunte. Con JSD, ambas recetas se comparan contra una **mezcla 50-50** de las dos. Asi, ambas direcciones cuentan por igual.

## Construyendo la idea paso a paso

### Paso 1: El problema con KL

La asimetria de KL hace que no sea una distancia real. Si quieres comparar dos modelos generativos, cual KL usas? $D_\text{KL}(P \| Q)$ o $D_\text{KL}(Q \| P)$? Cada una tiene comportamiento diferente (mode-covering vs mode-seeking).

### Paso 2: La distribucion mezcla

Definimos una distribucion intermedia, la mezcla:

$$M = \frac{1}{2}(P + Q)$$

Esta M es un "punto medio" entre P y Q. Si P y Q son parecidas, M se parece a ambas. Si son muy diferentes, M esta a medio camino.

### Paso 3: JSD como promedio de dos KLs

La JSD mide que tan lejos estan P y Q de su mezcla:

$$D_\text{JSD}(P \| Q) = \frac{1}{2} D_\text{KL}\left(P \middle\| M\right) + \frac{1}{2} D_\text{KL}\left(Q \middle\| M\right)$$

Lectura: "La JSD es el promedio de la sorpresa extra de P respecto a la mezcla, y la sorpresa extra de Q respecto a la mezcla."

### Paso 4: Ejemplo numerico

Moneda justa P = (0.5, 0.5) vs. moneda sesgada Q = (0.9, 0.1).

La mezcla es M = (0.7, 0.3).

$$D_\text{KL}(P \| M) = 0.5 \ln\frac{0.5}{0.7} + 0.5 \ln\frac{0.5}{0.3} \approx 0.0852$$

$$D_\text{KL}(Q \| M) = 0.9 \ln\frac{0.9}{0.7} + 0.1 \ln\frac{0.1}{0.3} \approx 0.1165$$

$$D_\text{JSD}(P \| Q) = \frac{1}{2}(0.0852 + 0.1165) \approx 0.1009$$

Nota que esta entre 0 y $\ln 2 \approx 0.693$.

## Propiedades clave

| Propiedad | Significado |
|---|---|
| $D_\text{JSD}(P \| Q) \geq 0$ | Siempre no negativa |
| $D_\text{JSD}(P \| Q) = 0$ sii $P = Q$ | Cero solo si las distribuciones son identicas |
| $D_\text{JSD}(P \| Q) = D_\text{JSD}(Q \| P)$ | **Simetrica** (a diferencia de KL) |
| $0 \leq D_\text{JSD} \leq \ln 2$ | Acotada superiormente (con logaritmo natural) |
| $\sqrt{D_\text{JSD}}$ es una metrica | La raiz cuadrada satisface la desigualdad triangular |

## Por que aparece en generative models?

En GANs: cuando el discriminador es optimo, el objetivo del GAN original equivale a minimizar $2 \cdot D_\text{JSD}(p_\text{data} \| p_G) - \log 4$. Es decir, entrenar un GAN vanilla es fundamentalmente minimizar la JSD entre la distribucion real y la generada.

Pregunta socratica: Si la JSD esta acotada por $\ln 2$, que pasa con los gradientes cuando $p_\text{data}$ y $p_G$ tienen soportes completamente disjuntos? Piensa: si JSD es constante ($= \ln 2$), que informacion recibe el generador para mejorar?

Cross-links: [KL-Divergence.md](KL-Divergence.md), [f-Divergencias.md](f-Divergencias.md), [Distancia-de-Wasserstein.md](Distancia-de-Wasserstein.md)
