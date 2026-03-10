# Exercise 6.f — Temperature Scaling [4 points, Coding]

## What the problem asks

Implement the function `temperature_scale` in `src/submission/sample.py` **only for the case `temperature_horizon=1`**. Given the logits produced by the GPT-2 model for the next token, return those logits scaled by a temperature parameter $T > 0$.

The temperature-scaled distribution over the next token is defined as:

$$p_T(x_i \mid x_{<i}) \propto e^{\log p(x_i \mid x_{<i}) / T}$$

where $p$ is the original (unscaled) GPT-2 model and $p_T$ is the temperature-scaled model.

The function signature is:

```python
def temperature_scale(logits, model, new_past, config, temperature, temperature_horizon):
```

For `temperature_horizon=1`, you only need the `logits` and `temperature` arguments. The implementation is very short (a single expression).

## Relevant concepts

### What are logits?

In the GPT-2 architecture (Figure 1 of PS1), the model processes a sequence of tokens through embeddings, transformer layers, and a final fully-connected layer. The output of this last linear layer is a vector $l_i \in \mathbb{R}^{V}$ (where $V = 50257$ is the vocabulary size) called the **logits**. The probability distribution over the next token is obtained by applying softmax to these logits:

$$p(x_i = j \mid x_{<i}) = \frac{e^{l_j}}{\sum_{k=1}^{V} e^{l_k}}$$

So the logits are the unnormalized log-probabilities: $l_j = \log p(x_i = j \mid x_{<i}) + \text{const}$, where the constant is the same for all $j$ (the log of the normalization factor).

### Temperature scaling: the idea

When we sample from a language model, the probability distribution over the next token might be relatively flat (many tokens have similar probabilities) or peaked (a few tokens dominate). **Temperature** is a hyperparameter that controls the "sharpness" of this distribution at sampling time, without changing the underlying model.

The intuition comes from statistical mechanics, where temperature controls how spread out or concentrated a Boltzmann distribution is over energy states. The same idea applies here:

- **$T = 1$**: The distribution is unchanged. This is the model's learned distribution.
- **$T < 1$ (low temperature)**: The distribution becomes **sharper**. High-probability tokens get even higher probability, low-probability tokens get even lower. In the limit $T \to 0$, this becomes greedy decoding (always picking the most likely token).
- **$T > 1$ (high temperature)**: The distribution becomes **flatter** (more uniform). This increases randomness and diversity in the generated text. In the limit $T \to \infty$, the distribution approaches uniform over all tokens.

### Why it works: dividing logits

The temperature-scaled distribution is:

$$p_T(x_i = j \mid x_{<i}) \propto e^{\log p(x_i = j \mid x_{<i}) / T}$$

Since $\log p(x_i = j \mid x_{<i}) = l_j - \log Z$ (where $Z$ is the softmax normalization constant), dividing by $T$ gives:

$$p_T(x_i = j \mid x_{<i}) \propto e^{(l_j - \log Z) / T} = e^{l_j / T} \cdot e^{-\log Z / T}$$

The factor $e^{-\log Z / T}$ is the same for all $j$, so it gets absorbed into the new normalization constant. This means:

$$p_T(x_i = j \mid x_{<i}) = \frac{e^{l_j / T}}{\sum_{k=1}^{V} e^{l_k / T}}$$

In other words, **dividing the logits by $T$ before applying softmax** is equivalent to temperature scaling the probability distribution. This is exactly what the exercise asks you to implement.

### Why temperature scaling matters for text generation

Autoregressive text generation involves sampling one token at a time from the model's predicted distribution. Without any modification, the model's distribution might:

- Be too peaked, producing repetitive, boring text (always picking the most likely continuation)
- Be too flat in some contexts, producing incoherent jumps

Temperature gives us a simple knob to control the exploration-exploitation trade-off during generation. Lower temperature produces more predictable, "safer" text; higher temperature produces more creative but potentially less coherent text. This is widely used in practice with models like GPT-2, GPT-4, etc.

### Connection to the broader exercise

Exercise 6.c implements basic sampling from GPT-2 (no temperature). Exercise 6.f adds temperature scaling on top of that. The later parts (6.g and 6.h, extra credit) explore **joint temperature scaling**, where instead of scaling the distribution over just the next single token, you scale the joint distribution over the next two tokens — a more expensive but theoretically different operation.
