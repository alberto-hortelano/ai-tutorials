
## A - Demostrar que $L_D$ se minimiza cuando $D_\phi = D^*$

Demostrar que la loss del discriminador (ecuacion 12) alcanza su minimo cuando: $$D_\phi(x) = D^*(x) = \frac{p_\text{data}(x)}{p_\theta(x) + p_\text{data}(x)}$$


$$L_D(\phi; \theta) = -\mathbb{E}_{x \sim p_\text{data}(x)}[\log D_\phi(x)] - \mathbb{E}_{x \sim p_\theta(x)}[\log(1 - D_\phi(x))]$$

Que valor de t minimiza: 
$$f(t) = -p_{data}(x) log(t) - p_\theta(x) log(1-t)$$

$$f'(t) = -\frac{p_{data}(x)}{t} + \frac{p_\theta(x)}{1 - t}$$

Si f'(t) es 0

$$0 = \frac{p_\theta(x)t - p_{data}(x)(1 - t)}{t - t^2}$$

$$0 = p_\theta(x)t - p_{data}(x)(1 - t)$$

$$p_\theta(x)t = p_{data}(x) - p_{data}(x)t$$

$$(p_\theta(x) + p_{data}(x))t = p_{data}(x)$$

$$t = \frac{p_{data}(x)}{p_\theta(x) + p_{data}(x)}$$


## B - 

$$D^*(x) = \frac{p_{data}(x)}{p_\theta(x) + p_{data}(x)}$$

$$D_\phi(x) = \sigma(h_\phi(x))$$

Si $D^*(x) = D_\phi(x)$

$$\frac{p_{data}(x)}{p_\theta(x) + p_{data}(x)} = \sigma(h_\phi(x))$$

$$h_\phi(x) = \sigma^{-1}\left(\frac{p_{data}(x)}{p_\theta(x) + p_{data}(x)}\right)$$

Dado que $\sigma^{-1}(x) = log(\frac{x}{1-x})$

$$h_\phi(x) = log\left(
    \frac{
        \frac{p_{data}(x)}{p_\theta(x) + p_{data}(x)}
    }{
        1 - \frac{p_{data}(x)}{p_\theta(x) + p_{data}(x)}
    }
\right)$$

Multiplico arriba y abajo por $p_\theta(x) + p_{data}(x)$

$$h_\phi(x) = log\left(
    \frac{
        p_{data}(x)
    }{
        p_\theta(x) + p_{data}(x) - p_{data}(x)
    }
\right)$$

$$h_\phi(x) = log\left(
    \frac{
        p_{data}(x)
    }{
        p_\theta(x)
    }
\right)$$
