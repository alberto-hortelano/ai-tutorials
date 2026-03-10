# Conditional Independence and Parameterization

## Problem Statement

Consider a collection of $n$ discrete random variables $\{X_i\}_{i=1}^{n}$, where the number of outcomes for $X_i$ is $|\text{val}(X_i)| = k_i$.

**(a)** Without any conditional independence assumptions, what is the total number of independent parameters needed to describe the joint distribution over $(X_1, ..., X_n)$?

**(b)** Under what independence assumptions is it possible to represent the joint distribution $(X_1, ..., X_n)$ with $\sum_{i=1}^{n}(k_i - 1)$ total number of independent parameters?

**(c)** Let $1, 2, ..., n$ denote the topological sort for a Bayesian network for the random variables $X_1, X_2, ..., X_n$. Let $m$ be a positive integer in $\{1, 2, ..., n-1\}$. Suppose, for every $i > m$, the random variable $X_i$ is conditionally independent of all ancestors given the previous $m$ ancestors in the topological ordering. Mathematically:

$$p(X_i | X_{i-1}, X_{i-2}, ..., X_2, X_1) = p(X_i | X_{i-1}, X_{i-2}, ..., X_{i-m})$$

for $i > m$. For $i \leq m$, we impose no conditional independence of $X_i$ with respect to its ancestors. Derive the total number of independent parameters to specify the joint distribution over $(X_1, ..., X_n)$.

---

## The Big Picture: Why Parameter Counting Matters

This problem is foundational for understanding the **curse of dimensionality** in probabilistic modeling and why **conditional independence assumptions** are essential for tractable generative models.

| Scenario | Parameters | Tractable? |
|----------|------------|------------|
| Full joint distribution | Exponential in $n$ | No |
| Full independence | Linear in $n$ | Yes, but too restrictive |
| Limited dependencies (autoregressive) | Polynomial in $n$ | Yes! |

The structure in part (c) is exactly what autoregressive models like GPT use: each token depends only on a **fixed window** of previous tokens, not the entire history. This is called the **Markov assumption** with order $m$.

---

## Key Definitions

### Random Variables and Their Values

| Symbol | Meaning | Example |
|--------|---------|---------|
| $X_i$ | The $i$-th random variable | A pixel, a word, a coin flip |
| $\text{val}(X_i)$ | The set of possible values $X_i$ can take | $\{0, 1\}$ for binary, $\{1, 2, ..., 6\}$ for a die |
| $k_i = |\text{val}(X_i)|$ | Number of possible outcomes for $X_i$ | 2 for binary, 6 for a die |
| $n$ | Total number of random variables | Number of pixels, sequence length |

### Distributions and Parameters

| Symbol | Meaning |
|--------|---------|
| $p(X_1, ..., X_n)$ | Joint probability distribution over all variables |
| $p(X_i \| X_{<i})$ | Conditional distribution of $X_i$ given all previous variables |
| "Independent parameters" | The minimum number of values needed to fully specify a distribution |

### Why "Independent" Parameters?

A probability distribution must sum to 1. For a single variable $X$ with $k$ outcomes:

$$p(X = 1) + p(X = 2) + ... + p(X = k) = 1$$

If you know $k-1$ of these probabilities, the last one is determined: $p(X = k) = 1 - \sum_{i=1}^{k-1} p(X = i)$.

**Therefore:** A single discrete variable with $k$ outcomes requires $k - 1$ independent parameters.

---

## Understanding Joint Distributions

### The Probability Table View

For $n$ discrete random variables, the joint distribution $p(X_1, ..., X_n)$ assigns a probability to every possible combination of values.

**Example:** Two binary variables $X_1, X_2 \in \{0, 1\}$

| $X_1$ | $X_2$ | $p(X_1, X_2)$ |
|-------|-------|---------------|
| 0 | 0 | $p_{00}$ |
| 0 | 1 | $p_{01}$ |
| 1 | 0 | $p_{10}$ |
| 1 | 1 | $p_{11}$ |

There are $2 \times 2 = 4$ entries, but they must sum to 1, so we need only **3 independent parameters**.

### General Case: How Many Entries?

For $n$ variables with $k_1, k_2, ..., k_n$ outcomes respectively:

- Total number of combinations = $k_1 \times k_2 \times ... \times k_n = \prod_{i=1}^{n} k_i$
- These probabilities must sum to 1, so one is determined by the others

**Key insight:** The joint probability table grows **exponentially** with $n$.

---

## Understanding Conditional Independence

### Definition

Random variables $X$ and $Y$ are **conditionally independent** given $Z$, written $X \perp Y | Z$, if:

$$p(X, Y | Z) = p(X | Z) \cdot p(Y | Z)$$

Equivalently: $p(X | Y, Z) = p(X | Z)$ — knowing $Y$ doesn't help predict $X$ once you know $Z$.

### Full Independence (Extreme Case)

If all variables are mutually independent:

$$p(X_1, ..., X_n) = \prod_{i=1}^{n} p(X_i)$$

Each $p(X_i)$ requires $k_i - 1$ parameters, so total = $\sum_{i=1}^{n} (k_i - 1)$.

**Trade-off:** Very few parameters, but this assumption is almost never true in practice!

### The Chain Rule (No Independence)

Any joint distribution can be factored using the **chain rule of probability**:

$$p(X_1, ..., X_n) = p(X_1) \cdot p(X_2 | X_1) \cdot p(X_3 | X_2, X_1) \cdot ... \cdot p(X_n | X_{n-1}, ..., X_1)$$

$$= \prod_{i=1}^{n} p(X_i | X_1, ..., X_{i-1})$$

This is an **identity** — it's always true, with no assumptions. But each conditional $p(X_i | X_{<i})$ can be expensive to represent.

---

## Counting Parameters for Conditional Distributions

### Key Concept: Conditional Probability Tables (CPTs)

A conditional distribution $p(X_i | \text{Parents})$ is specified by a table:
- One row for each combination of parent values
- Each row is a probability distribution over $X_i$'s values

**Parameters needed:**

$$\text{(number of parent combinations)} \times (k_i - 1)$$

The $(k_i - 1)$ comes from the normalization constraint: probabilities over $X_i$ must sum to 1 for each parent configuration.

### Example: $p(X_3 | X_1, X_2)$ where all are binary

| $X_1$ | $X_2$ | $p(X_3 = 0 \| X_1, X_2)$ | $p(X_3 = 1 \| X_1, X_2)$ |
|-------|-------|--------------------------|--------------------------|
| 0 | 0 | $\theta_1$ | $1 - \theta_1$ |
| 0 | 1 | $\theta_2$ | $1 - \theta_2$ |
| 1 | 0 | $\theta_3$ | $1 - \theta_3$ |
| 1 | 1 | $\theta_4$ | $1 - \theta_4$ |

- Parent combinations: $2 \times 2 = 4$
- Free parameters per row: $2 - 1 = 1$
- **Total: 4 parameters**

### General Formula

If $X_i$ has $k_i$ values and depends on parents $\text{Pa}(X_i)$:

$$\text{Parameters for } p(X_i | \text{Pa}(X_i)) = \left( \prod_{j \in \text{Pa}(X_i)} k_j \right) \times (k_i - 1)$$

Example for 3:

$$\prod_{i=1}^{3} k_i = k_1 \times k_2 \times k_3 = 3 \times 2 \times 2 = 12$$

---

## The Markov Assumption (Part c)

### What Part (c) Describes

Instead of conditioning on **all** previous variables, each $X_i$ only depends on the **most recent $m$** variables:

$$p(X_i | X_{i-1}, X_{i-2}, ..., X_1) = p(X_i | X_{i-1}, X_{i-2}, ..., X_{i-m})$$

This is called an **$m$-th order Markov chain** or **Markov assumption with context length $m$**.

### Visualization

```
Full dependencies (no assumptions):
X₁ → X₂ → X₃ → X₄ → X₅
 └────┴────┴────┴────┘  (X₅ depends on ALL previous)

Markov with m=2:
X₁ → X₂ → X₃ → X₄ → X₅
           └────┴────┘  (X₅ depends only on X₄, X₃)
```

### Why This Matters in Practice

| Application | Variable | Context ($m$) |
|-------------|----------|---------------|
| Language models | Word/token | Fixed window (e.g., 1024 tokens in GPT-2) |
| Image models | Pixel | Previous pixels in scan order |
| Time series | Observation | Recent history |

The key insight: limiting context makes the model **tractable** while still capturing **local dependencies**.

### The Two Regimes in Part (c)

The problem splits into two cases:

1. **For $i \leq m$:** No conditional independence — $X_i$ depends on all previous variables $X_1, ..., X_{i-1}$
2. **For $i > m$:** Markov assumption — $X_i$ depends only on $X_{i-m}, ..., X_{i-1}$ (the most recent $m$ variables)

---

## Intuition Builders

### Why Does Independence Reduce Parameters?

**Without independence:** To specify $p(X_2 | X_1)$ and $p(X_1)$ separately, then multiply — but the full table $p(X_1, X_2)$ has the same information.

**With independence:** $p(X_1, X_2) = p(X_1) \cdot p(X_2)$. Instead of $k_1 \cdot k_2 - 1$ parameters, you need only $(k_1 - 1) + (k_2 - 1)$.

### The Curse of Dimensionality

If all $k_i = k$ (same number of outcomes), then:
- Full joint: $k^n - 1$ parameters (exponential!)
- Full independence: $n(k-1)$ parameters (linear)
- Markov order $m$: roughly $n \cdot k^m \cdot (k-1)$ (polynomial if $m$ is fixed)

**Example:** $n = 100$ binary variables ($k = 2$)

| Model | Parameters |
|-------|------------|
| Full joint | $2^{100} - 1 \approx 10^{30}$ |
| Full independence | $100$ |
| Markov $m = 5$ | $\approx 3200$ |

---

## Connection to Course Themes

### Autoregressive Models

Part (c) describes exactly the structure of **autoregressive models** with bounded context:

$$p(x_1, ..., x_n) = \prod_{i=1}^{n} p(x_i | x_{\max(1, i-m)}, ..., x_{i-1})$$

This is the foundation for:
- **NADE** (Neural Autoregressive Distribution Estimation)
- **PixelCNN** (each pixel conditioned on context window)
- **Transformers** (attention over bounded context)

### The Parameter-Expressiveness Trade-off

| More parameters | Fewer parameters |
|-----------------|------------------|
| More expressive | Less expressive |
| Harder to learn | Easier to learn |
| Prone to overfitting | May underfit |
| Computationally expensive | Tractable |

The art of generative modeling is finding the right **inductive bias** (like the Markov assumption) that captures real-world structure while remaining tractable.

---

## Helpful Formulas Reference

### Counting Combinations

- If $X_i$ has $k_i$ outcomes, and we have $n$ variables
- Total combinations: $\prod_{i=1}^{n} k_i$
- For uniform case ($k_i = k$ for all $i$): $k^n$ combinations

### Counting Parameters

| Distribution | Parameters |
|--------------|------------|
| Single variable with $k$ outcomes | $k - 1$ |
| Joint over $n$ variables (no assumptions) | $\prod_{i=1}^{n} k_i - 1$ |
| $n$ independent variables | $\sum_{i=1}^{n} (k_i - 1)$ |
| Conditional $p(X \| Y_1, ..., Y_m)$ | $\left(\prod_{j=1}^{m} k_{Y_j}\right) \times (k_X - 1)$ |

### Useful Identities

- Product of $n$ terms $k$: $\underbrace{k \times k \times ... \times k}_{n \text{ times}} = k^n$
- Sum of $n$ terms $(k-1)$: $\underbrace{(k-1) + (k-1) + ... + (k-1)}_{n \text{ times}} = n(k-1)$

---

## Questions to Test Understanding

Before working on the problem, make sure you can answer:

1. Why does a probability distribution over $k$ outcomes need only $k-1$ parameters? 

    Because you thy all add to 1 so you can calculate the last one

2. How many entries are in a joint probability table for 3 binary variables?

    $2^3 = 8$

3. If $X_3$ depends on $X_1$ and $X_2$ (both binary), how many parameters specify $p(X_3 | X_1, X_2)$?
4. What's the difference between the chain rule (always true) and conditional independence (an assumption)?
5. In part (c), how many "parents" does $X_i$ have when $i > m$? When $i \leq m$?

## Solution:

a. The multiplication of all the number of outcomes for each term $\prod_{i=1}^{n} k_i - 1$

b. If the terms are completely independent.

c. For $i \leq m$ they are completely dependent so we use 

$\sum_{i=1}^{m}\left[\prod_{j=1}^{i-1} k_j (k_i - 1)\right]$

For $i > m$ we use the conditional formula

$\sum_{i=m+1}^{n}\left[\prod_{j=i - m}^{i-1} k_j (k_i - 1)\right]$

And we add both:

$\sum_{i=1}^{m}\left[\prod_{j=1}^{i-1} k_j (k_i - 1)\right] + \sum_{i=m+1}^{n}\left[\prod_{j=i - m}^{i-1} k_j (k_i - 1)\right]$