# Logistic Regression and Naive Bayes

## Problem Statement

A mixture of $k$ Gaussians specifies a joint distribution given by $p_\theta(x, y)$ where $y \in \{1, ..., k\}$ signifies the mixture id and $x \in \mathbb{R}^n$ denotes $n$-dimensional real valued points.

The generative process for this mixture can be specified as:

$$p_\theta(y) = \pi_y, \quad \text{where } \sum_{y=1}^{k} \pi_y = 1$$

$$p_\theta(x | y) = \mathcal{N}(x | \mu_y, \sigma^2 I)$$

$$\mathcal{N}(x | \mu_y, \sigma^2 I) = \frac{1}{(2\pi\sigma^2)^{n/2}} \exp\left(-\frac{1}{2\sigma^2}(x - \mu_y)^\top(x - \mu_y)\right)$$

where we assume a diagonal covariance structure for modeling each of the Gaussians in the mixture.

Such a model is parameterized by $\theta = (\pi_1, \pi_2, ..., \pi_k, \mu_1, \mu_2, ..., \mu_k, \sigma)$, where $\pi_i \in \mathbb{R}_{++}$, $\mu_i \in \mathbb{R}^n$, and $\sigma \in \mathbb{R}_{++}$.

Now consider the multi-class logistic regression model for directly predicting $y$ from $x$ as:

$$p_\gamma(y | x) = \frac{\exp(x^\top w_y + b_y)}{\sum_{i=1}^{k} \exp(x^\top w_i + b_i)}$$

parameterized by vectors $\gamma = \{w_1, w_2, ..., w_k, b_1, b_2, ..., b_k\}$, where $w_i \in \mathbb{R}^n$ and $b_i \in \mathbb{R}$.

**Show that** for any choice of $\theta$, there exists $\gamma$ such that:

$$p_\theta(y | x) = p_\gamma(y | x)$$

---

## The Big Picture: Generative vs Discriminative Models

This problem explores a fundamental relationship in machine learning between two different approaches to classification:

| Approach | Models | Learns | Example |
|----------|--------|--------|---------|
| **Generative** | $p(x, y) = p(y) \cdot p(x\|y)$ | How the data is generated | Naive Bayes, Gaussian Mixture Models |
| **Discriminative** | $p(y \| x)$ directly | Decision boundary only | Logistic Regression, Neural Networks |

The problem asks: if we have a generative model (Gaussian mixture), can we always express its posterior $p_\theta(y|x)$ using a discriminative model (logistic regression)?

**Spoiler:** Yes! This is why logistic regression and Naive Bayes are sometimes called "a generative-discriminative pair."

---

## Key Definitions

### The Generative Model (Gaussian Mixture / Naive Bayes)

| Symbol | Name | Meaning |
|--------|------|---------|
| $y \in \{1, ..., k\}$ | Class/mixture ID | Which Gaussian component generated this point |
| $x \in \mathbb{R}^n$ | Data point | An $n$-dimensional real vector |
| $p_\theta(y) = \pi_y$ | Class prior | Probability of class $y$ before seeing data |
| $p_\theta(x \| y)$ | Class-conditional likelihood | Probability of $x$ given it came from class $y$ |
| $\mathcal{N}(x \| \mu_y, \sigma^2 I)$ | Gaussian density | Normal distribution with mean $\mu_y$ and isotropic covariance |

### Parameters of the Generative Model

| Symbol | Type | Meaning |
|--------|------|---------|
| $\pi_y$ | $\mathbb{R}_{++}$ (positive real) | Prior probability for class $y$ (must sum to 1) |
| $\mu_y$ | $\mathbb{R}^n$ | Mean vector for the Gaussian of class $y$ |
| $\sigma$ | $\mathbb{R}_{++}$ (positive real) | Shared standard deviation (same for all classes!) |
| $I$ | $n \times n$ matrix | Identity matrix (covariance is $\sigma^2 I$, i.e., spherical) |
| $\theta$ | All of the above | $(\pi_1, ..., \pi_k, \mu_1, ..., \mu_k, \sigma)$ |

### The Discriminative Model (Logistic Regression)

| Symbol | Type | Meaning |
|--------|------|---------|
| $w_y$ | $\mathbb{R}^n$ | Weight vector for class $y$ |
| $b_y$ | $\mathbb{R}$ | Bias term for class $y$ |
| $\gamma$ | All of the above | $\{w_1, ..., w_k, b_1, ..., b_k\}$ |
| $x^\top w_y + b_y$ | $\mathbb{R}$ | "Logit" or "score" for class $y$ |

### The Softmax Function

The logistic regression formula uses the **softmax** function to convert scores into probabilities:

$$p_\gamma(y | x) = \frac{\exp(x^\top w_y + b_y)}{\sum_{i=1}^{k} \exp(x^\top w_i + b_i)} = \text{softmax}_y(z_1, ..., z_k)$$

where $z_i = x^\top w_i + b_i$ are the logits.

**Properties of softmax:**
- Outputs are always in $(0, 1)$
- Outputs always sum to 1 (valid probability distribution)
- Larger logits $\Rightarrow$ higher probability

---

## Understanding the Generative Model

### The Generative Story

The Gaussian mixture model tells a "story" of how data is generated:

1. **First**, sample a class $y$ from the prior: $y \sim \text{Categorical}(\pi_1, ..., \pi_k)$
2. **Then**, sample a data point from that class's Gaussian: $x \sim \mathcal{N}(\mu_y, \sigma^2 I)$

This gives us the joint distribution:

$$p_\theta(x, y) = p_\theta(y) \cdot p_\theta(x | y) = \pi_y \cdot \mathcal{N}(x | \mu_y, \sigma^2 I)$$

### The Gaussian Density

The multivariate Gaussian density is:

$$\mathcal{N}(x | \mu, \sigma^2 I) = \frac{1}{(2\pi\sigma^2)^{n/2}} \exp\left(-\frac{1}{2\sigma^2}(x - \mu)^\top(x - \mu)\right)$$

Let's break this down:

| Part | Meaning |
|------|---------|
| $(2\pi\sigma^2)^{n/2}$ | Normalization constant (makes it integrate to 1) |
| $(x - \mu)^\top(x - \mu)$ | Squared Euclidean distance from $x$ to the mean $\mu$ |
| $\exp(-\frac{1}{2\sigma^2} \cdot \text{distance}^2)$ | Exponentially decays with distance from mean |

**Key insight:** The covariance is $\sigma^2 I$ (same $\sigma$ for all dimensions, no correlations). This is called an **isotropic** or **spherical** Gaussian.

### Important Assumption: Shared Variance

Notice that all $k$ Gaussians share the **same** variance $\sigma^2$. This is crucial for the result! The Gaussians differ only in their means $\mu_y$.

```
Class 1: N(μ₁, σ²I)──┐
Class 2: N(μ₂, σ²I)──┼── All have the same "spread"
Class 3: N(μ₃, σ²I)──┘
```

---

## Understanding the Discriminative Model

### Logistic Regression as a Linear Classifier

The logistic regression model computes a **linear score** for each class:

$$\text{score}_y(x) = x^\top w_y + b_y = \sum_{j=1}^{n} x_j \cdot w_{y,j} + b_y$$

Then applies softmax to get probabilities:

$$p_\gamma(y | x) = \frac{e^{\text{score}_y(x)}}{\sum_{i=1}^k e^{\text{score}_i(x)}}$$

### Geometric Interpretation

- Each class $y$ has a weight vector $w_y$ and bias $b_y$
- The decision boundary between classes $i$ and $j$ is where $\text{score}_i(x) = \text{score}_j(x)$
- This boundary is a **hyperplane** (linear!)

---

## What the Problem Asks

Given ANY generative model parameters $\theta = (\pi_1, ..., \pi_k, \mu_1, ..., \mu_k, \sigma)$, find discriminative parameters $\gamma = (w_1, ..., w_k, b_1, ..., b_k)$ such that:

$$\underbrace{p_\theta(y | x)}_{\text{Posterior from Bayes' rule}} = \underbrace{p_\gamma(y | x)}_{\text{Logistic regression}}$$

In other words: **derive formulas for $w_y$ and $b_y$ in terms of $\pi_y$, $\mu_y$, and $\sigma$.**

---

## The Hint

The problem provides a starting point using Bayes' rule:

$$p_\theta(y | x) = \frac{p_\theta(x, y)}{p_\theta(x)} = \frac{\pi_y \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)\right) \cdot Z^{-1}(\sigma)}{\sum_i \pi_i \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_i)^\top(x-\mu_i)\right) \cdot Z^{-1}(\sigma)}$$

where $Z(\sigma) = (2\pi\sigma^2)^{n/2}$ is the Gaussian normalization constant.

How to compute $p_\theta(y|x)$ from the generative model using Bayes' rule.

Step 1: Bayes' Rule

$$
p_\theta(y | x) 
= 
\frac{p_\theta(x, y)}{p_\theta(x)}
= 
\frac{p_\theta(x, y)}{\sum_i p_\theta(x, i)}
$$

The denominator sums over all classes to get the marginal $p(x)$. 

Step 2: Substitute the Joint Distribution 

We know:
$$
p_\theta(x, y) 
= 
p_\theta(y) \cdot p_\theta(x|y) 
= 
\pi_y \cdot \mathcal{N}(x | \mu_y, \sigma^2 I)
$$ 

Expanding the Gaussian: 
$$p_\theta(x, y) 
= 
\pi_y \cdot \frac{1}{(2\pi\sigma^2)^{n/2}} \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)\right)$$

The hint calls $Z(\sigma) = (2\pi\sigma^2)^{n/2}$, so:
$$p_\theta(x, y) 
= 
\pi_y \cdot Z^{-1}(\sigma) \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)\right)$$

Step 3: The Posterior 

Plugging into Bayes' rule:

$$p_\theta(y | x) = \frac{\pi_y \cdot Z^{-1}(\sigma) \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)\right)}{\sum_i \pi_i 
\cdot Z^{-1}(\sigma) \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_i)^\top(x-\mu_i)\right)}$$

The Key Observation 

$Z^{-1}(\sigma)$ appears in every term of both numerator and denominator. It's a constant that doesn't depend on $y$ or $i$, so it cancels
out: 

$$p_\theta(y | x) = \frac{\pi_y \cdot \exp\left(-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)\right)}{\sum_i \pi_i \cdot
\exp\left(-\frac{1}{2\sigma^2}(x-\mu_i)^\top(x-\mu_i)\right)}$$ 

**Key observation:** The $Z^{-1}(\sigma)$ terms cancel (they're the same in numerator and denominator)!

---

## Why This Matters

### Theoretical Insight

This result shows that **Gaussian Naive Bayes with shared variance is equivalent to logistic regression**. They make the same predictions!

However:
- **Naive Bayes** learns $p(x|y)$ and $p(y)$ separately (generative)
- **Logistic regression** learns $p(y|x)$ directly (discriminative)

### Practical Implications

| Aspect | Naive Bayes | Logistic Regression |
|--------|-------------|---------------------|
| **Assumes** | Data is Gaussian | Only that log-odds are linear |
| **Sample efficiency** | Better with small data | Better with large data |
| **Flexibility** | Can generate new samples | Can only classify |
| **Robustness** | Sensitive to model mismatch | More robust |

### The Asymmetry

The problem asks to show: for any $\theta$, there exists $\gamma$.

**But the converse is NOT true!** Not every logistic regression model corresponds to a Gaussian mixture. Logistic regression is **more expressive** — it can represent decision boundaries that don't come from Gaussians.

---

## Connection to Course Themes

This problem illustrates a key theme in generative modeling:

1. **Generative models** (like Gaussian mixtures) specify the full joint $p(x, y)$
2. From Bayes' rule, we can always compute the posterior $p(y|x)$
3. Sometimes this posterior has a nice **closed form** (like softmax!)
4. **Discriminative models** learn the posterior directly, potentially with less bias

Later in the course, we'll see this tension between generative and discriminative approaches in:
- VAEs (generative) vs. direct density estimation
- GANs (implicit generative model with discriminator)
- Flow models (exact likelihood vs. flexible architecture)

## Solution:

If 

$$p_\theta(y | x) = p_\gamma(y | x)$$

then 

$$
\frac{
\pi_y \cdot \exp\left(
-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)
\right) \cdot Z^{-1}(\sigma)
}{
\sum_i \pi_i \cdot \exp\left(
-\frac{1}{2\sigma^2}(x-\mu_i)^\top(x-\mu_i)
\right) \cdot Z^{-1}(\sigma)
}
$$

must be equal to 

$$
\frac{
\exp(x^\top w_y + b_y)
}{
\sum_{i=1}^{k} \exp(x^\top w_i + b_i)
}
$$

We can remove $\cdot Z^{-1}(\sigma)$ from both terms of the left side:

$$
\frac{
\pi_y \cdot \exp\left(
-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)
\right)
}{
\sum_i \pi_i \cdot \exp\left(
-\frac{1}{2\sigma^2}(x-\mu_i)^\top(x-\mu_i)
\right)
}
=
\frac{
\exp(x^\top w_y + b_y)
}{
\sum_{i=1}^{k} \exp(x^\top w_i + b_i)
}
$$

### Step 1: Expand the quadratic form

Expand $(x - \mu_y)^\top(x - \mu_y)$:

$$
(x - \mu_y)^\top(x - \mu_y) = x^\top x - 2x^\top\mu_y + \mu_y^\top\mu_y
$$

$$
(x - \mu_y)^\top(x - \mu_y) = x^\top x - x^\top\mu_y - \mu_y^\top x + \mu_y^\top\mu_y
$$

Substituting back into the exponential:

$$
\exp\left(-\frac{1}{2\sigma^2}(x-\mu_y)^\top(x-\mu_y)\right) = \exp\left(-\frac{x^\top x}{2\sigma^2} + \frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right)
$$

### Step 2: Factor out the common $x^\top x$ term

The term $-\frac{x^\top x}{2\sigma^2}$ appears in every Gaussian (for all classes $y$), since $\sigma$ is shared. We can factor it:

$$
\exp\left(-\frac{x^\top x}{2\sigma^2} + \frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right) = \exp\left(-\frac{x^\top x}{2\sigma^2}\right) \cdot \exp\left(\frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right)
$$

The numerator of $p_\theta(y|x)$ becomes:

$$
\pi_y \cdot \exp\left(-\frac{x^\top x}{2\sigma^2}\right) \cdot \exp\left(\frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right)
$$

And the denominator:

$$
\sum_i \pi_i \cdot \exp\left(-\frac{x^\top x}{2\sigma^2}\right) \cdot \exp\left(\frac{x^\top\mu_i}{\sigma^2} - \frac{\|\mu_i\|^2}{2\sigma^2}\right)
$$

Since $\exp\left(-\frac{x^\top x}{2\sigma^2}\right)$ is the same in every term, it cancels:

$$
p_\theta(y|x) = \frac{\pi_y \cdot \exp\left(\frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right)}{\sum_i \pi_i \cdot \exp\left(\frac{x^\top\mu_i}{\sigma^2} - \frac{\|\mu_i\|^2}{2\sigma^2}\right)}
$$

### Step 3: Convert $\pi_y$ to exponential form

Using $\pi_y = \exp(\log \pi_y)$:

$$
\pi_y \cdot \exp\left(\frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right) = \exp\left(\log \pi_y + \frac{x^\top\mu_y}{\sigma^2} - \frac{\|\mu_y\|^2}{2\sigma^2}\right)
$$

Therefore:

$$
p_\theta(y|x) = \frac{\exp\left(\frac{x^\top\mu_y}{\sigma^2} + \log \pi_y - \frac{\|\mu_y\|^2}{2\sigma^2}\right)}{\sum_i \exp\left(\frac{x^\top\mu_i}{\sigma^2} + \log \pi_i - \frac{\|\mu_i\|^2}{2\sigma^2}\right)}
$$

### Step 4: Match with logistic regression form

Comparing with the logistic regression form $\frac{\exp(x^\top w_y + b_y)}{\sum_i \exp(x^\top w_i + b_i)}$, we need:

$$
x^\top w_y + b_y = \frac{x^\top\mu_y}{\sigma^2} + \log \pi_y - \frac{\|\mu_y\|^2}{2\sigma^2}
$$

Matching the coefficient of $x$ and the constant term:

$$
\boxed{w_y = \frac{\mu_y}{\sigma^2}}
$$

$$
\boxed{b_y = \log \pi_y - \frac{\|\mu_y\|^2}{2\sigma^2}}
$$

### Conclusion

For any choice of generative model parameters $\theta = (\pi_1, \ldots, \pi_k, \mu_1, \ldots, \mu_k, \sigma)$, we can construct logistic regression parameters:

| Generative $\theta$ | Discriminative $\gamma$ |
|---------------------|-------------------------|
| $\mu_y$ (class mean) | $w_y = \frac{\mu_y}{\sigma^2}$ |
| $\pi_y$ (class prior), $\mu_y$, $\sigma$ | $b_y = \log \pi_y - \frac{\|\mu_y\|^2}{2\sigma^2}$ |

This proves that $p_\theta(y|x) = p_\gamma(y|x)$ for all $x$. $\square$

### Intuition for the result

- **$w_y = \frac{\mu_y}{\sigma^2}$**: The weight vector points toward the class mean, scaled by precision ($1/\sigma^2$). Higher precision (smaller $\sigma$) means sharper boundaries.

- **$b_y = \log \pi_y - \frac{\|\mu_y\|^2}{2\sigma^2}$**: The bias combines:
  - $\log \pi_y$: Classes with higher prior probability get a boost
  - $-\frac{\|\mu_y\|^2}{2\sigma^2}$: Penalizes classes whose means are far from the origin (corrects for the $x^\top w_y$ term)
