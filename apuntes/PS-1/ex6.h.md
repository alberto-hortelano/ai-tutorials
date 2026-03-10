# Exercise 6.h — Joint Temperature Scaling over Two Tokens [3 points, Coding, Extra Credit]

## What the problem asks

Implement the `temperature_horizon=2` case of the `temperature_scale` function in `src/submission/sample.py`. Instead of scaling the distribution over just the next single token (as in 6.f), you must scale the **joint distribution over the next two tokens**, and then return logits for the first token by marginalizing out the second.

There are three code blocks to fill in, each marked with `### START CODE HERE ###`:

1. **Compute `first_probs`** (line 33-35): the probability distribution over the first token, derived from the logits.

2. **Compute `joint_prob_t`** (line 47-49): for each candidate first token `t`, compute a 1-D tensor where entry `j` stores the joint probability $p(x_i = t, x_{i+1} = j \mid x_{<i})$. The code comment reminds you to apply top-k filtering when computing probabilities for the second token.

3. **Scale and marginalize** (line 57-59): scale the joint logits by temperature, then compute `first_logits` by marginalizing out (summing over) the second token dimension.

The scaffold code handles the loop over candidate first tokens (skipping those filtered out by top-k), converting probabilities to logits, and placing the results back into the return tensor.

## Motivation: why 6.g matters for 6.h

Exercise 6.g (written, extra credit) asks whether applying single-token temperature scaling autoregressively is the same as joint temperature scaling over the full sequence. The answer to that question motivates why 6.h exists at all — if the two approaches were equivalent, there would be no reason to implement joint scaling separately.

The key insight from 6.g is about what happens when you temperature-scale conditional distributions independently versus scaling the joint distribution. In an autoregressive model, the joint is:

$$p(x_0, x_1, \ldots, x_M) = \prod_{i=0}^{M} p(x_i \mid x_{<i})$$

Single-token temperature scaling (6.f) replaces each factor $p(x_i \mid x_{<i})$ with $p_T(x_i \mid x_{<i})$. Joint temperature scaling raises the entire joint to the power $1/T$:

$$p_T^{\text{joint}}(x_0, \ldots, x_M) \propto e^{\log p(x_0, \ldots, x_M) / T}$$

These are not the same operation in general, because each conditional $p(x_i \mid x_{<i})$ has its own normalization constant, and those normalization constants depend on the conditioning context $x_{<i}$. The hint in 6.g makes this precise: if $p(y \mid x) \propto g(x, y)$, the normalizing constant $\int_y g(x,y) dy$ depends on $x$, so you cannot simply combine independently-normalized conditionals and expect to recover the joint.

## Relevant concepts

### Joint distribution over two tokens

For an autoregressive model, the joint probability of the next two tokens given the context is:

$$p(x_i, x_{i+1} \mid x_{<i}) = p(x_i \mid x_{<i}) \cdot p(x_{i+1} \mid x_{\leq i})$$

This is just the chain rule. The first factor comes from the current model output (the logits you already have). The second factor requires running the model one more step, conditioning on each possible choice of $x_i$.

### Joint temperature scaling (Eq. 17)

The temperature-scaled joint distribution over two tokens is defined as:

$$p_T^{\text{joint-2}}(x_i, x_{i+1} \mid x_{<i}) \propto e^{\log p(x_i, x_{i+1} \mid x_{<i}) / T}$$

This takes the joint probability of the two-token pair, converts to log-space, divides by $T$, and exponentiates back. The $\propto$ means there is a normalization constant (summing over all pairs $(x_i, x_{i+1})$) that makes this a valid distribution.

### Marginalization (Eq. 18)

After computing the temperature-scaled joint, we still need to sample just the *first* token (the `sample` function generates one token at a time). To get the distribution over the first token alone, we **marginalize** (sum out) the second token:

$$p_T^{\text{joint-2}}(x_i \mid x_{<i}) = \sum_j p_T^{\text{joint-2}}(x_i, x_{i+1} = a_j \mid x_{<i})$$

This gives us a distribution over $x_i$ that accounts for the temperature-scaled joint — it considers how each choice of $x_i$ affects the quality of the *pair*, not just the single token.

### Why this is computationally expensive

In 6.f, temperature scaling was a single division. Here, for each candidate first token $t$ (those surviving top-k filtering), you must:

1. Run the model forward to get the distribution over the second token conditioned on $t$
2. Compute the joint probability for all pairs $(t, j)$

This is why the code loops over `range(config.vocab_size)` and skips tokens filtered by top-k — without that optimization, you would need $V$ forward passes through the model (one per possible first token), where $V = 50257$.

### The scaffold structure

The code organizes the computation as a 2D table of joint probabilities:

- **Rows**: candidate first tokens (those not filtered by top-k)
- **Columns**: all possible second tokens ($V = 50257$ entries)
- **Entry (i, j)**: $p(x_i = \text{first\_tokens}[i], x_{i+1} = a_j \mid x_{<i})$

After building this table, the code converts to log-space (`joint_logits`), and then you apply temperature scaling and marginalization to obtain logits for the first token.

### Connection to 6.f and 6.g

- **6.f** implements single-token temperature scaling: sharpen/flatten the distribution over the immediate next token
- **6.g** asks theoretically whether single-token scaling recovers joint scaling
- **6.h** implements joint scaling over two tokens, which produces a different (and arguably better) first-token distribution because it "looks ahead" — it considers the quality of two-token continuations rather than being greedy about the immediate next token

## Why not just apply single-token temperature at each step?

You might wonder: why go through all this trouble? The model generates tokens one by one anyway. You could just apply single-token temperature scaling (6.f) at each step — sharpen the distribution, sample a token, move on, repeat. Why compute joint probabilities?

The answer is that single-token temperature scaling is **myopic**: it sharpens the distribution over the immediate next token without considering what comes after. The token that looks best right now might not lead to the best continuation.

### Example

Suppose the context is "The effects of climate change on" and the model is choosing the next two words. Consider two candidate first words with their continuations:

| First word | $p(\text{first word})$ | Best continuation | $p(\text{pair})$ |
|---|---|---|---|
| "polar" | 0.15 | "polar bears" | $0.15 \times 0.7 = 0.105$ |
| "the" | 0.30 | "the environment" | $0.30 \times 0.2 = 0.06$ |

"the" is twice as likely as the first token — it's a common word that fits many contexts. But "polar" leads to the much stronger pair "polar bears," because once you say "polar," the continuation is highly predictable.

**Single-token scaling** ($T < 1$) looks only at the first column. It makes "the" (0.30) even more dominant over "polar" (0.15). It's greedy — it picks the locally best token.

**Joint scaling** ($T < 1$) looks at the pair probabilities. "polar bears" (0.105) is stronger than "the environment" (0.06), so it boosts "polar" as the first token. It "sees" that "polar" leads somewhere good.

### When does it matter?

At $T = 1$ (no temperature), the joint approach **changes nothing**. If you compute the joint over two tokens and marginalize out the second:

$$\sum_j p(x_i, x_{i+1} = a_j \mid x_{<i}) = p(x_i \mid x_{<i})$$

This is just the sum rule of probability — you recover the original single-token distribution exactly. The lookahead is irrelevant.

The difference between joint and single-token scaling only appears because temperature is a **nonlinear** transformation. Dividing logits by $T$ and then marginalizing gives a different result than marginalizing first and then dividing by $T$. In mathematical terms, temperature scaling does not commute with marginalization.

This means: the further $T$ is from 1, the more the joint approach diverges from single-token scaling. For temperatures very close to 1, the expensive joint computation buys you almost nothing. For very low temperatures (strong sharpening), the lookahead can make a meaningful difference in which first token gets selected.
