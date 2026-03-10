# Monte Carlo Integration for Latent Variable Models

## Problem Statement

A latent variable generative model specifies a joint probability distribution $p(x, z)$ between a set of observed variables $x \in \mathcal{X}$ and a set of latent variables $z \in \mathcal{Z}$. From the definition of conditional probability, we can express the joint distribution as $p(x, z) = p(z)p(x | z)$. Here, $p(z)$ is referred to as the **prior distribution** over $z$ and $p(x | z)$ is the **likelihood** of the observed data given the latent variables. One natural objective for learning a latent variable model is to maximize the **marginal likelihood** of the observed data given by:

$$p(x) = \int_z p(x, z) dz \tag{12}$$

When $z$ is high dimensional, evaluation of the marginal likelihood is computationally intractable even if we can tractably evaluate the prior and the conditional likelihood for any given $x$ and $z$. We can however use **Monte Carlo** to estimate the above integral. To do so, we sample $k$ samples from the prior $p(z)$ and our estimate is given as:

$$A(z^{(1)}, ..., z^{(k)}) = \frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)}), \text{ where } z^{(i)} \sim p(z) \tag{13}$$

**(a) [1 point]** An estimator $\hat{\theta}$ is an unbiased estimator of $\theta$ if and only if $\mathbb{E}[\hat{\theta}] = \theta$. Show that $A$ is an unbiased estimator of $p(x)$.

**(b) [1 point]** Is $\log A$ an unbiased estimator of $\log p(x)$? Prove why or why not.

**Hint:** The proof is short. Use the definition of an unbiased estimator and **Jensen's Inequality**.

---

## The Big Picture: Why This Matters

This problem introduces one of the most important concepts in deep generative modeling: **how do we compute likelihoods when we have latent variables?**

The marginal likelihood $p(x)$ is the probability of observing data $x$ after integrating out (marginalizing over) all possible values of the latent variable $z$. This is central to:

| Application | Why marginal likelihood matters |
|-------------|--------------------------------|
| **Training VAEs** | The ELBO is a lower bound on $\log p(x)$ |
| **Model comparison** | Higher $p(x)$ means the model explains data better |
| **Anomaly detection** | Low $p(x)$ indicates unusual data points |
| **Importance Weighted Autoencoders (IWAE)** | Use tighter bounds via Monte Carlo |

The fundamental challenge: **the integral $\int_z p(x,z) dz$ is often intractable**.

Monte Carlo estimation provides a practical solution, but understanding its statistical properties (bias, variance) is crucial for using it correctly.

---

## Key Definitions

### Probability Spaces and Variables

| Symbol | Name | Meaning |
|--------|------|---------|
| $x$ | Observed variable | The data we actually see (e.g., an image) |
| $z$ | Latent variable | Hidden/unobserved variable (e.g., style, content) |
| $\mathcal{X}$ | Observation space | Set of all possible observed values |
| $\mathcal{Z}$ | Latent space | Set of all possible latent values |

### Probability Distributions

| Symbol | Name | Meaning |
|--------|------|---------|
| $p(x, z)$ | Joint distribution | Probability of both $x$ and $z$ occurring together |
| $p(z)$ | Prior | Distribution over latent variables *before* seeing data |
| $p(x \| z)$ | Likelihood | Probability of data $x$ given a specific latent $z$ |
| $p(x)$ | Marginal likelihood (evidence) | Probability of $x$ after integrating out $z$ |
| $p(z \| x)$ | Posterior | Distribution over $z$ *after* observing $x$ |

### The Generative Process

A latent variable model generates data in two steps:

```
Step 1: Sample z ~ p(z)         [Draw a latent code from the prior]
Step 2: Sample x ~ p(x | z)     [Generate observed data given the code]
```

**Example: Generating handwritten digits**
1. Sample $z \sim \mathcal{N}(0, I)$ — a random point in latent space
2. Pass through decoder: $x = \text{Decoder}(z) + \text{noise}$

### Fundamental Probability Relationships

**Chain rule of probability:**
$$p(x, z) = p(z) \cdot p(x | z) = p(x) \cdot p(z | x)$$

**Marginalization (the integral in question):**
$$p(x) = \int_z p(x, z) dz = \int_z p(z) \cdot p(x | z) dz$$

This integral sums over all possible ways the latent variable $z$ could have generated the observed $x$.

---

## Understanding the Marginal Likelihood Integral

### What Does $p(x) = \int_z p(x, z) dz$ Mean?

Think of it as: "What is the total probability of observing $x$, considering all possible hidden causes $z$?"

**Discrete analogy:** If $z$ could only take values $\{z_1, z_2, z_3\}$:
$$p(x) = p(x, z_1) + p(x, z_2) + p(x, z_3) = \sum_{i=1}^{3} p(z_i) \cdot p(x | z_i)$$

**Continuous case:** Replace sum with integral:
$$p(x) = \int_z p(z) \cdot p(x | z) dz$$

### Why Is This Integral Intractable?

For high-dimensional $z$ (e.g., $z \in \mathbb{R}^{100}$):

1. **No closed form:** The integral rarely has an analytical solution
2. **Grid integration fails:** Discretizing 100 dimensions with 10 points each = $10^{100}$ evaluations
3. **Most of $\mathcal{Z}$ contributes nothing:** $p(x|z) \approx 0$ for most $z$ values

**This is the curse of dimensionality for integration.**

---

## Monte Carlo Estimation

### The Key Idea

Instead of integrating over all $z$, **sample** from $p(z)$ and average:

$$p(x) = \int_z p(z) \cdot p(x | z) dz = \mathbb{E}_{z \sim p(z)}[p(x | z)]$$

The integral is an **expectation**! And expectations can be estimated by sampling.

### The Monte Carlo Estimator

$$A(z^{(1)}, ..., z^{(k)}) = \frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)}), \quad \text{where } z^{(i)} \sim p(z)$$

**In words:**
1. Draw $k$ samples $z^{(1)}, z^{(2)}, ..., z^{(k)}$ independently from the prior $p(z)$
2. For each sample, compute the likelihood $p(x | z^{(i)})$
3. Average these likelihoods

### Breaking Down the Notation

| Symbol | Meaning |
|--------|---------|
| $A$ | The Monte Carlo estimator (a random variable because it depends on random samples) |
| $k$ | Number of Monte Carlo samples |
| $z^{(i)}$ | The $i$-th sample from the prior (superscript in parentheses = sample index) |
| $z^{(i)} \sim p(z)$ | Each sample is drawn independently from $p(z)$ |
| $p(x \| z^{(i)})$ | Likelihood evaluated at the $i$-th sample |

---

## Statistical Concepts

### Estimators

An **estimator** is a rule for computing an approximate value of a quantity from data (or samples).

| Term | Symbol | Meaning |
|------|--------|---------|
| True value | $\theta$ | The quantity we want to know (here: $p(x)$) |
| Estimator | $\hat{\theta}$ | A function of samples that approximates $\theta$ (here: $A$) |
| Estimate | (computed value) | The specific number we get from one set of samples |

**Key distinction:** The estimator $\hat{\theta}$ is a **random variable** (it depends on random samples). The true value $\theta$ is a fixed constant.

### Bias

**Definition:** The **bias** of an estimator is:
$$\text{Bias}(\hat{\theta}) = \mathbb{E}[\hat{\theta}] - \theta$$

| Condition | Name | Meaning |
|-----------|------|---------|
| $\mathbb{E}[\hat{\theta}] = \theta$ | Unbiased | On average, the estimator hits the true value |
| $\mathbb{E}[\hat{\theta}] \neq \theta$ | Biased | On average, the estimator over- or under-estimates |

**Why unbiasedness matters:** With enough samples, an unbiased estimator converges to the truth. A biased estimator converges to the wrong value.

### Expected Value of a Sample Mean

If $Y_1, Y_2, ..., Y_k$ are i.i.d. (independent and identically distributed) with $\mathbb{E}[Y_i] = \mu$, then:

$$\mathbb{E}\left[\frac{1}{k} \sum_{i=1}^{k} Y_i\right] = \frac{1}{k} \sum_{i=1}^{k} \mathbb{E}[Y_i] = \frac{1}{k} \cdot k \cdot \mu = \mu$$

**The sample mean is an unbiased estimator of the population mean.**

---

## Jensen's Inequality

### Statement

For a **concave** function $f$ and a random variable $X$:
$$f(\mathbb{E}[X]) \geq \mathbb{E}[f(X)]$$

For a **convex** function $f$:
$$f(\mathbb{E}[X]) \leq \mathbb{E}[f(X)]$$

### The Logarithm is Concave

The function $f(x) = \log(x)$ is **concave** (curves downward):

```
log(x)
  |      ___----
  |   __/
  |  /
  | /
  |/________________ x
```

**Second derivative test:** $\frac{d^2}{dx^2} \log(x) = -\frac{1}{x^2} < 0$ for all $x > 0$.

### Jensen's Inequality for Logarithm

Since $\log$ is concave:
$$\log(\mathbb{E}[X]) \geq \mathbb{E}[\log(X)]$$

**In words:** The log of the average is greater than or equal to the average of the logs.

**When is equality achieved?** Only when $X$ is constant (no randomness). If $X$ varies, the inequality is **strict**: $\log(\mathbb{E}[X]) > \mathbb{E}[\log(X)]$.

### Visual Intuition

Consider two points $x_1$ and $x_2$ with equal weight (probability 0.5 each):

```
log(x)
  |         * log((x1+x2)/2)  ← log of the average
  |        /\
  |       /  * (log(x1) + log(x2))/2  ← average of logs
  |      /    \
  |   * /      \ *
  |    x1      x2
  |_________________________ x
```

The chord connecting $(\x_1, \log x_1)$ and $(x_2, \log x_2)$ lies **below** the curve.

---

## Part (a): Proving $A$ is Unbiased

### Goal

Show that $\mathbb{E}[A] = p(x)$, where the expectation is over the random samples $z^{(1)}, ..., z^{(k)}$.

### Setup

The estimator is:
$$A = \frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)}), \quad z^{(i)} \sim p(z)$$

Define $Y_i = p(x | z^{(i)})$. Each $Y_i$ is a random variable because $z^{(i)}$ is random.

### Key Properties

1. **Independence:** The $z^{(i)}$ are drawn independently, so the $Y_i$ are independent
2. **Identical distribution:** Each $z^{(i)} \sim p(z)$, so each $Y_i$ has the same distribution
3. **Expected value of each $Y_i$:**

$$\mathbb{E}[Y_i] = \mathbb{E}_{z^{(i)} \sim p(z)}[p(x | z^{(i)})] = \int_z p(z) \cdot p(x | z) dz = p(x)$$

This last step is **crucial**: the expected value of the likelihood over the prior equals the marginal likelihood!

### The Proof

$$\mathbb{E}[A] = \mathbb{E}\left[\frac{1}{k} \sum_{i=1}^{k} Y_i\right]$$

By linearity of expectation:
$$= \frac{1}{k} \sum_{i=1}^{k} \mathbb{E}[Y_i]$$

Since each $\mathbb{E}[Y_i] = p(x)$:
$$= \frac{1}{k} \sum_{i=1}^{k} p(x) = \frac{1}{k} \cdot k \cdot p(x) = p(x)$$

**Therefore:** $\mathbb{E}[A] = p(x)$, so $A$ is an **unbiased estimator** of $p(x)$. ∎

---

## Part (b): Is $\log A$ an Unbiased Estimator of $\log p(x)$?

### Goal

Determine whether $\mathbb{E}[\log A] = \log p(x)$.

### The Answer: NO

$\log A$ is a **biased** estimator of $\log p(x)$.

### The Proof

We want to compare $\mathbb{E}[\log A]$ with $\log p(x) = \log \mathbb{E}[A]$.

By Jensen's inequality (since $\log$ is concave):
$$\log(\mathbb{E}[A]) \geq \mathbb{E}[\log A]$$

Since $A$ is a random variable (it depends on random samples) and is not constant:
$$\log(\mathbb{E}[A]) > \mathbb{E}[\log A]$$

The inequality is **strict** because $A$ has variance (different samples give different values of $A$).

Therefore:
$$\log p(x) = \log(\mathbb{E}[A]) > \mathbb{E}[\log A]$$

This means:
$$\mathbb{E}[\log A] < \log p(x)$$

**The estimator $\log A$ is biased and systematically underestimates $\log p(x)$.**

### The Bias

$$\text{Bias}(\log A) = \mathbb{E}[\log A] - \log p(x) < 0$$

The bias is **negative**: taking the log of a Monte Carlo estimate gives a value that is, on average, **too small**.

---

## Why This Matters: The ELBO Connection

### The Evidence Lower BOund (ELBO)

In VAE training, we maximize a lower bound on $\log p(x)$:

$$\log p(x) \geq \text{ELBO} = \mathbb{E}_{q(z|x)}[\log p(x|z)] - D_{KL}(q(z|x) \| p(z))$$

This problem shows why we use a **lower bound** rather than estimating $\log p(x)$ directly:

| Approach | Bias | Use in training |
|----------|------|-----------------|
| Estimate $p(x)$, then take $\log$ | Biased low | Problematic for optimization |
| ELBO | Guaranteed lower bound | Safe to maximize |
| Importance Weighted (IWAE) | Tighter bound with more samples | Better, but still a bound |

### Variance vs. Bias Trade-off

| Number of samples $k$ | Estimator $A$ | Estimator $\log A$ |
|-----------------------|---------------|-------------------|
| Small $k$ | High variance, unbiased | High variance, high bias |
| Large $k$ | Low variance, unbiased | Low variance, **still biased** |
| $k \to \infty$ | Converges to $p(x)$ | Bias shrinks but never zero for finite $k$ |

---

## Summary Table

| Question | Answer | Key Reasoning |
|----------|--------|---------------|
| Is $A$ unbiased for $p(x)$? | **Yes** | $\mathbb{E}[A] = \mathbb{E}_{z \sim p(z)}[p(x\|z)] = p(x)$ |
| Is $\log A$ unbiased for $\log p(x)$? | **No** | Jensen: $\log \mathbb{E}[A] > \mathbb{E}[\log A]$ |
| Direction of bias? | Underestimates | $\mathbb{E}[\log A] < \log p(x)$ |

---

## Connection to Course Themes

### Why Latent Variable Models?

| Advantage | Explanation |
|-----------|-------------|
| Representation learning | $z$ captures meaningful structure in data |
| Generation | Sample $z$, decode to $x$ |
| Semi-supervised learning | Use $z$ to propagate labels |
| Disentanglement | Different dimensions of $z$ control different factors |

### The Intractability Problem

This problem introduces the core challenge that motivates:
1. **Variational inference** (VAEs) — approximate the intractable posterior
2. **Monte Carlo methods** — estimate integrals by sampling
3. **Importance sampling** — sample from a better distribution than the prior
4. **ELBO optimization** — work with a tractable lower bound

### Connection to Later Topics

| Topic | How Problem 5 connects |
|-------|----------------------|
| **VAE (PS2)** | The intractable integral motivates the ELBO |
| **IWAE (PS2)** | Uses importance-weighted Monte Carlo estimates |
| **Score matching (PS4)** | Avoids computing $p(x)$ entirely |

---

## Questions to Test Understanding

1. Why can't we just use more samples to eliminate the bias in $\log A$?

2. If we wanted an unbiased estimator of $\log p(x)$, what would we need to change about our approach?

3. The estimator $A$ is unbiased but may have high variance. How does variance change with $k$?

4. In the context of VAEs, why do we maximize the ELBO instead of directly maximizing a Monte Carlo estimate of $\log p(x)$?

5. What is the relationship between the bias of $\log A$ and the variance of $A$? (Hint: Jensen's gap)

## Solution

$$A(z^{(1)}, ..., z^{(k)}) = \frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)}), \text{ where } z^{(i)} \sim p(z)$$

$$\mathbb{E}[X + Y] = \mathbb{E}[X] + \mathbb{E}[Y]$$
$$\mathbb{E}[c X] = c \mathbb{E}[X]$$

a. Show that A is an unbiased estimator of p(x)

$$A = \frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)})$$

$$\mathbb{E}[A] = \mathbb{E}\big[\frac{1}{k} \sum_{i=1}^{k} p(x | z^{(i)})\big]$$

$$\mathbb{E}[A] = \frac{1}{k} \mathbb{E}\big[\sum_{i=1}^{k} p(x | z^{(i)})\big]$$

$$\mathbb{E}[A] = \frac{1}{k} \sum_{i=1}^{k} \mathbb{E}\big[p(x | z^{(i)})\big]$$

By definition the expected value is the same for every term (i) of the distribution so it's sum is the same number k times.

$$\mathbb{E}[A] = \frac{1}{k} k \mathbb{E}[p(x|z)]$$

$$\mathbb{E}[A] = \mathbb{E}[p(x | z)]$$

As the estimate is hover p(z) we calculate it by $\mathbb{E}_{z \sim p(z)}[f(z)] = \int p(z)  f(z) , dz$

$$\mathbb{E}[A] = \int p(z) p(x | z) , dz$$

and $p(z) p(x | z) = p(x, z)$ so:

$$\mathbb{E}[A] = \int p(x, z) , dz$$

$$\mathbb{E}[A] = p(x)$$

b. Is log A an unbiased estimator of log p(x)?

$$\mathbb{E}[\log A] = \log p(x)$$

thanks to Jensen $f(\mathbb{E}[X]) \geq \mathbb{E}[f(X)]$

$$\log(p(x)) \geq \mathbb{E}[\log A]$$

So it is not unbiased