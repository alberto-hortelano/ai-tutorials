# Autoregressive Models: Forward vs Reverse Factorization

## Problem Statement

Consider a set of $n$ univariate continuous real-valued random variables $(X_1, ..., X_n)$. You have access to powerful neural networks $\{\mu_i\}_{i=1}^{n}$ and $\{\sigma_i\}_{i=1}^{n}$ that can represent any function $\mu_i : \mathbb{R}^{i-1} \to \mathbb{R}$ and $\sigma_i : \mathbb{R}^{i-1} \to \mathbb{R}_{++}$. We shall, for notational simplicity, define $\mathbb{R}^0 = \{0\}$. You choose to build the following Gaussian autoregressive model in the **forward** direction:

$$p_f(x_1, ..., x_n) = \prod_{i=1}^{n} p_f(x_i | x_{<i}) = \prod_{i=1}^{n} \mathcal{N}(x_i | \mu_i(x_{<i}), \sigma_i^2(x_{<i}))$$

where $x_{<i}$ denotes:

$$x_{<i} = \begin{cases} (x_1, ..., x_{i-1})^\top & \text{if } i > 1 \\ 0 & \text{if } i = 1 \end{cases}$$

Your friend chooses to factor the model in the **reverse** order using equally powerful neural networks $\{\hat{\mu}_i\}_{i=1}^{n}$ and $\{\hat{\sigma}_i\}_{i=1}^{n}$ that can represent any function $\hat{\mu}_i : \mathbb{R}^{n-i} \to \mathbb{R}$ and $\hat{\sigma}_i : \mathbb{R}^{n-i} \to \mathbb{R}_{++}$:

$$p_r(x_1, ..., x_n) = \prod_{i=1}^{n} p_r(x_i | x_{>i}) = \prod_{i=1}^{n} \mathcal{N}(x_i | \hat{\mu}_i(x_{>i}), \hat{\sigma}_i^2(x_{>i}))$$

where $x_{>i}$ denotes:

$$x_{>i} = \begin{cases} (x_{i+1}, ..., x_n)^\top & \text{if } i < n \\ 0 & \text{if } i = n \end{cases}$$

**Question:** Do these models cover the same hypothesis space of distributions? In other words, given any choice of $\{\mu_i, \sigma_i\}_{i=1}^{n}$, does there always exist a choice of $\{\hat{\mu}_i, \hat{\sigma}_i\}_{i=1}^{n}$ such that $p_f = p_r$? If yes, provide a proof. Else, provide a concrete counterexample.

---

## The Big Picture: Why This Matters

This problem addresses a fundamental question about **autoregressive models**: does the choice of factorization order matter?

The chain rule of probability tells us that any joint distribution can be factored in any order:

$$p(x_1, x_2) = p(x_1)p(x_2|x_1) = p(x_2)p(x_1|x_2)$$

Both factorizations are **mathematically equivalent** for representing the true joint distribution. However, when we **constrain** the functional form of each conditional (e.g., requiring Gaussians), the story changes dramatically.

| Aspect | Unconstrained conditionals | Gaussian conditionals |
|--------|---------------------------|----------------------|
| Expressiveness | Any distribution | Limited to Gaussian structure |
| Forward = Reverse? | Yes (always) | **No!** (this problem) |

This has profound implications for model design:
- **VAEs**: The choice of approximate posterior family affects what true posteriors can be matched
- **Normalizing Flows**: Invertible transformations preserve distributions exactly
- **Language Models**: Left-to-right vs right-to-left generation can produce different distributions

---

## Key Definitions

### Number Sets

| Symbol | Name | Meaning | Examples |
|--------|------|---------|----------|
| $\mathbb{R}$ | Real numbers | All real values | $-3.14, 0, 2.5, \pi$ |
| $\mathbb{R}^n$ | $n$-dimensional real space | Vectors of $n$ real numbers | $\mathbb{R}^2$ = 2D plane |
| $\mathbb{R}^0$ | Zero-dimensional space | Convention: $\{0\}$ | Just the scalar 0 |
| $\mathbb{R}_{++}$ | Positive reals | Strictly positive real numbers | $0.001, 1, 100$ (NOT 0 or negatives) |

### Random Variables

| Symbol | Meaning |
|--------|---------|
| $(X_1, ..., X_n)$ | A collection of $n$ random variables |
| $x_i$ | A specific value (realization) of $X_i$ |
| "univariate" | Each $X_i$ is a single number (not a vector) |
| "continuous" | $X_i$ can take any real value (not discrete) |

### Conditioning Notation

| Symbol | Meaning | Example ($n=4$) |
|--------|---------|-----------------|
| $x_{<i}$ | All variables **before** index $i$ | $x_{<3} = (x_1, x_2)^\top$ |
| $x_{>i}$ | All variables **after** index $i$ | $x_{>2} = (x_3, x_4)^\top$ |
| $x_{\leq i}$ | Variables at or before $i$ | $x_{\leq 2} = (x_1, x_2)^\top$ |
| $^\top$ | Transpose (column vector) | $(x_1, x_2)^\top$ is a column vector |

**Special cases:**
- $x_{<1} = 0$ (nothing before the first variable)
- $x_{>n} = 0$ (nothing after the last variable)

### Neural Network Functions

| Symbol | Input dimension | Output dimension | Meaning |
|--------|-----------------|------------------|---------|
| $\mu_i : \mathbb{R}^{i-1} \to \mathbb{R}$ | $i-1$ numbers | 1 number | Predicts the **mean** of $X_i$ given previous variables |
| $\sigma_i : \mathbb{R}^{i-1} \to \mathbb{R}_{++}$ | $i-1$ numbers | 1 positive number | Predicts the **standard deviation** of $X_i$ |
| $\hat{\mu}_i : \mathbb{R}^{n-i} \to \mathbb{R}$ | $n-i$ numbers | 1 number | Predicts mean in reverse model |
| $\hat{\sigma}_i : \mathbb{R}^{n-i} \to \mathbb{R}_{++}$ | $n-i$ numbers | 1 positive number | Predicts std dev in reverse model |

**Why $\mathbb{R}_{++}$ for $\sigma$?** Standard deviation must be **strictly positive** (you can't have zero or negative spread in a Gaussian).

**Why "can represent any function"?** This is a theoretical assumption that the neural networks are **universal function approximators** — they're not a limitation.

### The Gaussian Distribution

| Symbol | Meaning |
|--------|---------|
| $\mathcal{N}(x \| \mu, \sigma^2)$ | Gaussian (Normal) distribution with mean $\mu$ and variance $\sigma^2$ |
| $\mu$ | Mean (center of the distribution) |
| $\sigma^2$ | Variance (spread squared) |
| $\sigma$ | Standard deviation (spread) |

The probability density function (PDF):

$$\mathcal{N}(x | \mu, \sigma^2) = \frac{1}{\sqrt{2\pi\sigma^2}} \exp\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)$$

**Key property:** A Gaussian is completely determined by its mean and variance. It's always:
- Symmetric around the mean
- Bell-shaped (unimodal)
- Has tails that decay exponentially

---

## Understanding the Two Models

### The Forward Model $p_f$

$$p_f(x_1, ..., x_n) = \prod_{i=1}^{n} \mathcal{N}(x_i | \mu_i(x_{<i}), \sigma_i^2(x_{<i}))$$

**In words:** Generate variables from left to right. Each variable $X_i$ is Gaussian, with mean and variance that depend on all previous variables.

**Example for $n = 3$:**

$$p_f(x_1, x_2, x_3) = p_f(x_1) \cdot p_f(x_2 | x_1) \cdot p_f(x_3 | x_1, x_2)$$

Where:
- $p_f(x_1) = \mathcal{N}(x_1 | \mu_1(0), \sigma_1^2(0))$ — unconditional Gaussian (constants $\mu_1, \sigma_1$)
- $p_f(x_2 | x_1) = \mathcal{N}(x_2 | \mu_2(x_1), \sigma_2^2(x_1))$ — mean and variance depend on $x_1$
- $p_f(x_3 | x_1, x_2) = \mathcal{N}(x_3 | \mu_3(x_1, x_2), \sigma_3^2(x_1, x_2))$

### The Reverse Model $p_r$

$$p_r(x_1, ..., x_n) = \prod_{i=1}^{n} \mathcal{N}(x_i | \hat{\mu}_i(x_{>i}), \hat{\sigma}_i^2(x_{>i}))$$

**In words:** Generate variables from right to left. Each variable $X_i$ is Gaussian, with mean and variance that depend on all **later** variables.

**Example for $n = 3$:**

$$p_r(x_1, x_2, x_3) = p_r(x_3) \cdot p_r(x_2 | x_3) \cdot p_r(x_1 | x_2, x_3)$$

Where:
- $p_r(x_3) = \mathcal{N}(x_3 | \hat{\mu}_3(0), \hat{\sigma}_3^2(0))$ — unconditional Gaussian
- $p_r(x_2 | x_3) = \mathcal{N}(x_2 | \hat{\mu}_2(x_3), \hat{\sigma}_2^2(x_3))$
- $p_r(x_1 | x_2, x_3) = \mathcal{N}(x_1 | \hat{\mu}_1(x_2, x_3), \hat{\sigma}_1^2(x_2, x_3))$

---

## The Key Question: Hypothesis Space

### What is "Hypothesis Space"?

The **hypothesis space** is the set of all distributions that a model family can represent.

- Forward model hypothesis space: $\mathcal{H}_f = \{p_f : \text{for all possible choices of } \mu_i, \sigma_i\}$
- Reverse model hypothesis space: $\mathcal{H}_r = \{p_r : \text{for all possible choices of } \hat{\mu}_i, \hat{\sigma}_i\}$

**The question:** Is $\mathcal{H}_f = \mathcal{H}_r$?

**Equivalently:** For any $p_f \in \mathcal{H}_f$, can we always find network parameters such that $p_r = p_f$?

---

## The Hint: Simplify to $n = 2$

The problem suggests: consider just two variables $X_1, X_2$.

### Forward model ($n = 2$):

$$p_f(x_1, x_2) = p_f(x_1) \cdot p_f(x_2 | x_1)$$

Where:
- $p_f(x_1) = \mathcal{N}(x_1 | \mu_1, \sigma_1^2)$ — a Gaussian (fixed parameters)
- $p_f(x_2 | x_1) = \mathcal{N}(x_2 | \mu_2(x_1), \sigma_2^2(x_1))$ — mean/variance are functions of $x_1$

### Reverse model ($n = 2$):

$$p_r(x_1, x_2) = p_r(x_2) \cdot p_r(x_1 | x_2)$$

Where:
- $p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$ — a Gaussian (fixed parameters)
- $p_r(x_1 | x_2) = \mathcal{N}(x_1 | \hat{\mu}_1(x_2), \hat{\sigma}_1^2(x_2))$

### The Critical Insight

In the reverse model, $p_r(x_2)$ is the **marginal** over $x_2$. But:

$$p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$$

This is **always a Gaussian**!

Now consider the forward model. What is its marginal $p_f(x_2)$?

$$p_f(x_2) = \int p_f(x_1, x_2) dx_1 = \int p_f(x_1) \cdot p_f(x_2 | x_1) dx_1$$

This is a **mixture** of Gaussians (integrating over $x_1$), weighted by $p_f(x_1)$.

**Key question:** Is this mixture always Gaussian?

---

## The Counterexample

### Construction

Define the forward model with $n = 2$:

$$p_f(x_1) = \mathcal{N}(x_1 | 0, 1)$$

$$p_f(x_2 | x_1) = \mathcal{N}(x_2 | \mu_2(x_1), \epsilon)$$

where $\epsilon > 0$ is small and:

$$\mu_2(x_1) = \begin{cases} 0 & \text{if } x_1 \leq 0 \\ 1 & \text{if } x_1 > 0 \end{cases}$$

### What Does This Mean?

- $X_1$ is a standard normal: symmetric around 0
- Given $X_1$, we generate $X_2$ as a Gaussian centered at either 0 or 1, depending on whether $X_1$ is negative or positive
- The variance $\epsilon$ is small, so $X_2$ is tightly concentrated around its mean

### Computing $p_f(x_2)$

$$p_f(x_2) = \int_{-\infty}^{\infty} p_f(x_1) \cdot p_f(x_2 | x_1) dx_1$$

Split the integral based on the sign of $x_1$:

$$p_f(x_2) = \underbrace{\int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | 0, \epsilon) dx_1}_{\text{contribution from } x_1 \leq 0} + \underbrace{\int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | 1, \epsilon) dx_1}_{\text{contribution from } x_1 > 0}$$

Since $p_f(x_1) = \mathcal{N}(x_1 | 0, 1)$ is symmetric:
- $\int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) dx_1 = 0.5$
- $\int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) dx_1 = 0.5$

Therefore:

$$p_f(x_2) = 0.5 \cdot \mathcal{N}(x_2 | 0, \epsilon) + 0.5 \cdot \mathcal{N}(x_2 | 1, \epsilon)$$

### This is a Mixture of Two Gaussians!

The marginal $p_f(x_2)$ is a **bimodal** distribution:
- One mode (peak) at $x_2 = 0$
- Another mode at $x_2 = 1$
- Each component has weight 0.5

**Visualization:**

```
p_f(x_2):
     ___         ___
    /   \       /   \
   /     \     /     \
  /       \___/       \
 -1   0   0.5   1    2
      ↑         ↑
    mode 1    mode 2
```

### Why the Reverse Model Cannot Match This

In the reverse model, the marginal must be:

$$p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$$

This is **always unimodal** (single peak)! A single Gaussian can never be bimodal.

**Therefore:** No matter what parameters $\hat{\mu}_2, \hat{\sigma}_2$ we choose, $p_r(x_2) \neq p_f(x_2)$.

Since the marginals don't match, the joint distributions cannot match: $p_f \neq p_r$.

---

## The Second Perspective: Conditional $p_f(x_1 | x_2)$

The hint also mentions looking at the conditional $p_f(x_1 | x_2)$.

### Computing $p_f(x_1 | x_2)$

By Bayes' rule:

$$p_f(x_1 | x_2) = \frac{p_f(x_1, x_2)}{p_f(x_2)} = \frac{p_f(x_1) \cdot p_f(x_2 | x_1)}{p_f(x_2)}$$

### When $\epsilon$ is Very Small

As $\epsilon \to 0$, the distribution $p_f(x_2 | x_1)$ becomes more concentrated (approaches a delta function).

**Effect on $p_f(x_1 | x_2)$:**
- If $x_2 \approx 0$: then $x_1$ was likely $\leq 0$ (because only negative $x_1$ produces $x_2$ near 0)
- If $x_2 \approx 1$: then $x_1$ was likely $> 0$

This means $p_f(x_1 | x_2)$ approaches a **truncated Gaussian**:
- For $x_2 \approx 0$: concentrated on $x_1 \leq 0$
- For $x_2 \approx 1$: concentrated on $x_1 > 0$

### Truncated Gaussians are Not Gaussians!

The reverse model requires:

$$p_r(x_1 | x_2) = \mathcal{N}(x_1 | \hat{\mu}_1(x_2), \hat{\sigma}_1^2(x_2))$$

A Gaussian has infinite support (non-zero probability everywhere). A truncated Gaussian has zero probability on one side. They can never match exactly.

---

## Summary: Why the Answer is NO

The forward and reverse Gaussian autoregressive models do **NOT** cover the same hypothesis space.

### The Core Reason

| Forward model | Reverse model |
|---------------|---------------|
| Marginal $p_f(x_2)$ can be a **mixture of Gaussians** | Marginal $p_r(x_2)$ is **always a single Gaussian** |
| Conditionals can induce non-Gaussian marginals | First variable is always Gaussian |

### Intuition

The forward model generates $X_1$ first, then uses $X_1$ to decide where to place $X_2$. If the function $\mu_2(x_1)$ is non-linear (like a step function), the resulting marginal over $X_2$ can be multimodal.

The reverse model generates $X_2$ first from a single Gaussian — it **must** be unimodal.

### General Principle

**Constraining the functional form of conditionals limits what marginals can be achieved.**

Even though the chain rule holds for any ordering, the Gaussian constraint on each conditional creates different hypothesis spaces for different orderings.

---

## Connection to Course Themes

### Variational Autoencoders

This result foreshadows a key insight for VAEs:
- The true posterior $p(z | x)$ may be complex (multimodal, etc.)
- If we approximate it with $q(z | x) = \mathcal{N}(\mu(x), \sigma^2(x))$, we may never match it exactly
- This is called the **amortization gap**

### Model Expressiveness

When designing generative models, the choice of:
1. **Factorization order** (left-to-right vs right-to-left)
2. **Conditional family** (Gaussian, mixture, neural network output, etc.)

...determines what distributions can be represented.

### Why Normalizing Flows Work

Normalizing flows use **invertible** transformations. By the change of variables formula, any distribution that can be reached by transforming a base distribution can also be reached by transforming it back. This ensures forward and reverse have the **same** expressiveness.

---

## Questions to Test Understanding

1. Why is a mixture of two Gaussians not itself a Gaussian?

2. What would happen if we allowed $p_r(x_2)$ to be a mixture of Gaussians instead of a single Gaussian?

3. In the counterexample, what if $\mu_2(x_1) = x_1$ (identity function) instead of a step function? Would $p_f(x_2)$ still be non-Gaussian?

4. How does this relate to the "posterior collapse" problem in VAEs?

5. If we used a more expressive family (e.g., Gaussian mixtures) for each conditional, would forward and reverse have the same hypothesis space?

## Solution:

Both models for only 2 varables $(x_1, x_2)$

$$p_f(x_1, x_2) = p_f(x_1) \cdot p_f(x_2 | x_1)$$

$$p_r(x_1, x_2) = p_r(x_2) \cdot p_r(x_1 | x_2)$$

Define $\mu_2$ as

$$\mu_2(x_1) = \begin{cases} 0 & \text{if } x_1 \leq 0 \\ 1 & \text{if } x_1 > 0 \end{cases}$$

Forward for $x_2$

$$p_f(x_2) = \int p_f(x_1, x_2) dx_1$$

Expand p_f(x_1, x_2): 

$$p_f(x_2) = \int p_f(x_1) \cdot p_f(x_2 | x_1) dx_1$$

We have:

$$p_f(x_1) = \mathcal{N}(x_1 | 0, 1)$$

$$p_f(x_2 | x_1) = \mathcal{N}(x_2 | \mu_2(x_1), \epsilon)$$

So we can expand $p_f(x_1)$ and $p_f(x_2 | x_1)$

$$p_f(x_2) = \int \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | \mu_2(x_1), \epsilon) dx_1$$

As we have two different $\mu_2$ we have two integrals

$$p_f(x_2) = 
\int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | 0, \epsilon) dx_1 
+ 
\int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) \cdot \mathcal{N}(x_2 | 1, \epsilon) dx_1$$

Get out everything not dependant of $x_1$

$$p_f(x_2) = 
\mathcal{N}(x_2 | 0, \epsilon) \cdot \int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) dx_1 
+ 
\mathcal{N}(x_2 | 1, \epsilon) \cdot \int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) dx_1$$

So I have the integral of $p_f(x_1)$ which is the probability in that region and that is more than 0.

$$w_1 = \int_{-\infty}^{0} \mathcal{N}(x_1 | 0, 1) dx_1 = P(x_1 \leq 0) > 0$$

$$w_2 = \int_{0}^{\infty} \mathcal{N}(x_1 | 0, 1) dx_1 = P(x_1 > 0) > 0$$

$$p_f(x_2) = 
\mathcal{N}(x_2 | 0, \epsilon) \cdot w_1
+ 
\mathcal{N}(x_2 | 1, \epsilon) \cdot w_2$$

This means it is the mixture of two Gaussians so $p_r(x_2)$ can not equal it because it is only one Gaussian

$$p_r(x_2) = \mathcal{N}(x_2 | \hat{\mu}_2, \hat{\sigma}_2^2)$$
