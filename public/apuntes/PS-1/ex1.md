# Maximum Likelihood Estimation and KL Divergence

## Problem Statement

Let $\hat{p}(x, y)$ denote the empirical data distribution over a space of inputs $x \in \mathcal{X}$ and outputs $y \in \mathcal{Y}$. 

For example, in an image recognition task, $x$ can be an image and $y$ can be whether the image contains a cat or not. 

Let $p_\theta(y | x)$ be a probabilistic classifier parameterized by $\theta$, e.g., a logistic regression classifier with coefficients $\theta$. 

Show that the following equivalence holds:

$$\arg\max_{
    \theta \in \Theta
} \mathbb{E}_{
    \hat{p}(x,y)
}[
    \log p_\theta(y|x)
] = 
\arg\min_{
    \theta \in \Theta
} \mathbb{E}_{
    \hat{p}(x)
}[D_{KL}(
    \hat{p}(y|x) \| p_\theta(y|x)
)]$$

where $D_{KL}$ denotes the KL-divergence:

$$D_{KL}(p(x) \| q(x)) = \mathbb{E}_{x \sim p(x)}[\log p(x) - \log q(x)]$$

---

## Key Definitions

### Spaces

| Symbol | Meaning | Example |
|--------|---------|---------|
| $\mathcal{X}$ | Input space | Set of all possible images |
| $\mathcal{Y}$ | Output space | Set of all possible labels, e.g., $\{0, 1\}$ |
| $x \in \mathcal{X}$ | A single input | One image |
| $y \in \mathcal{Y}$ | A single output | One label (cat or not cat) |

### Distributions

| Symbol | Name | What it represents | Example |
|--------|------|-------------------|---------|
| $\hat{p}(x,y)$ | Empirical joint distribution | Your training data | The collection of (image, label) pairs you have |
| $\hat{p}(x)$ | Empirical marginal over inputs | Distribution of inputs in your data | Just the images (ignoring labels) |
| $\hat{p}(y\|x)$ | Empirical conditional | True label distribution given input $x$ | "This image is labeled cat" |
| $p_\theta(y\|x)$ | Model / Classifier | Your learnable predictor | Logistic regression outputting P(cat \| image) |

**Key distinction:**
- The **hat** ($\hat{\ }$) means "from the data" — these are fixed, given by your training set
- The **subscript** $\theta$ means "parameterized" — this is what you're learning/optimizing

### Parameters

| Symbol | Meaning |
|--------|---------|
| $\theta$ | Parameters of your model (e.g., weights and bias in logistic regression) |
| $\Theta$ | The set of all possible parameter values |

### Operators

| Symbol | Meaning |
|--------|---------|
| $\mathbb{E}_{p}[\cdot]$ | Expected value where samples are drawn from distribution $p$ |
| $D_{KL}(p \|\| q)$ | KL divergence from $q$ to $p$ — measures how different $q$ is from $p$ |
| $\arg\max_\theta$ | "The value of $\theta$ that maximizes..." |
| $\arg\min_\theta$ | "The value of $\theta$ that minimizes..." |

### What is Expected Value?

$\mathbb{E}$ is the **expected value** (or **expectation**) — the "weighted average" of a quantity, where the weights are probabilities.

**Discrete case:** If $x$ can take values $x_1, x_2, ..., x_n$ with probabilities $p(x_i)$, then:

$$\mathbb{E}_{x \sim p(x)}[f(x)] = \sum_{i=1}^{n} p(x_i) \cdot f(x_i)$$

**Example:** Rolling a fair die, what's the expected value?

$$\mathbb{E}[x] = \frac{1}{6}(1) + \frac{1}{6}(2) + \frac{1}{6}(3) + \frac{1}{6}(4) + \frac{1}{6}(5) + \frac{1}{6}(6) = 3.5$$

**Reading the notation** $\mathbb{E}_{x \sim p(x)}[f(x)]$:

- $\mathbb{E}$ — "take the expected value of..."
- $x \sim p(x)$ — "where $x$ is drawn from distribution $p$"
- $[f(x)]$ — "of the function $f(x)$"

The subscript tells you **which distribution** to use for the weights.

**In our problem:**

$$\mathbb{E}_{\hat{p}(x,y)}[\log p_\theta(y|x)]$$

This means: "Average the log-probability over all (image, label) pairs in your training data."

If you have $N$ training samples:

$$\mathbb{E}_{\hat{p}(x,y)}[\log p_\theta(y|x)] \approx \frac{1}{N} \sum_{i=1}^{N} \log p_\theta(y_i | x_i)$$

This is exactly the **log-likelihood** you maximize in MLE.

---

## Left side: Maximum Likelihood Estimation

$$\arg\max_{\theta \in \Theta} \mathbb{E}_{\hat{p}(x,y)}[\log p_\theta(y|x)]$$

$\arg\max_{\theta \in \Theta}$ => Find the value of θ (from the set Θ) that maximizes...

$\theta$ => Parameters of your classifier (e.g., coefficients in logistic regression)

$\Theta$ => The set of all possible parameter values

$\mathbb{E}_{\hat{p}(x,y)}[\cdot]$ => Expected value where (x,y) pairs are drawn from the empirical distribution

$\hat{p}(x,y)$ => The empirical data distribution — your training set of (image, label) pairs

$p_\theta(y|x)$ => Your probabilistic classifier — given image $x$, outputs probability of label $y$

$\log p_\theta(y|x)$ => Log-probability your classifier assigns to label $y$ given input $x$

### What is $p_\theta(y|x)$?

Using the cat recognition example from the problem:
- $x$ = an image
- $y \in \{0, 1\}$ where $y=1$ means "contains a cat"
- $p_\theta(y|x)$ = probability your classifier assigns to label $y$ for image $x$

A logistic regression classifier with parameters $\theta = (w, b)$ predicts:

$$p_\theta(y=1|x) = \sigma(w^\top x + b) = \frac{1}{1 + e^{-(w^\top x + b)}}$$

$$p_\theta(y=0|x) = 1 - \sigma(w^\top x + b)$$

So if you have a cat image $(x, y=1)$, then:

$$\log p_\theta(y=1|x) = \log \sigma(w^\top x + b)$$

This is a negative number (since probabilities are between 0 and 1, their log is ≤ 0).

### What Does Maximizing It Mean?

When you maximize $\mathbb{E}_{\hat{p}(x,y)}[\log p_\theta(y|x)]$, you're finding parameters $\theta$ such that your classifier assigns high probability to the correct labels in your training data.

- If $p_\theta(y=\text{cat}|x) = 0.99$ for a cat image, then $\log p_\theta \approx -0.01$ (good!)
- If $p_\theta(y=\text{cat}|x) = 0.01$ for a cat image, then $\log p_\theta \approx -4.6$ (bad!)

### Plain English Summary

$$\arg\max_{\theta \in \Theta} \mathbb{E}_{\hat{p}(x,y)}[\log p_\theta(y|x)]$$

> **"Find the model parameters that make the training data most likely."**

Or more specifically: "Find $\theta$ such that, on average across all training examples, our classifier assigns the highest possible probability to the correct labels."

---

## Right side: KL Divergence Minimization

$$\arg\min_{\theta \in \Theta} \mathbb{E}_{\hat{p}(x)}[D_{KL}(\hat{p}(y|x) \| p_\theta(y|x))]$$

$\arg\min_{\theta \in \Theta}$ => Find the value of θ that minimizes...

$\mathbb{E}_{\hat{p}(x)}[\cdot]$ => Expected value over inputs $x$ drawn from empirical distribution (average over all images)

$\hat{p}(x)$ => The empirical distribution over inputs (just the images in your training set)

$D_{KL}(\cdot \| \cdot)$ => KL divergence — measures how different two distributions are

$\hat{p}(y|x)$ => The **true** conditional distribution of labels given image $x$ (from the data)

$p_\theta(y|x)$ => Your **classifier's** predicted distribution over labels

**In plain English:** Find the parameters θ that minimize the average "distance" between:
- What the data says the label distribution should be for each image
- What your classifier predicts

### What is KL Divergence?

The KL divergence measures how different distribution $p$ is from distribution $q$:

$$D_{KL}(p(x) \| q(x)) = \mathbb{E}_{x \sim p(x)}[\log p(x) - \log q(x)]$$

**Term-by-term breakdown:**

$D_{KL}(\cdot \| \cdot)$ => The KL divergence operator — measures the "distance" from distribution $q$ to distribution $p$

$p(x)$ => The **reference** distribution (what we consider "true" or "target")

$q(x)$ => The **approximating** distribution (what we're comparing against $p$)

$p(x) \| q(x)$ => Read as "p relative to q" or "divergence of q from p"

$\mathbb{E}_{x \sim p(x)}[\cdot]$ => Expected value where $x$ is sampled from distribution $p$ (NOT from $q$!)

$\log p(x)$ => Log-probability of $x$ under the reference distribution $p$

$\log q(x)$ => Log-probability of $x$ under the approximating distribution $q$

$\log p(x) - \log q(x)$ => The "surprise difference" — how much more surprised $q$ is than $p$ to see $x$

**Intuition:** We sample points from $p$ and ask: "On average, how many extra bits would we need to encode these samples if we used $q$ instead of $p$?" If $q$ assigns low probability to points that $p$ considers likely, the KL divergence is large.

This expands to:

$$D_{KL}(p \| q) = \sum_x p(x) \log p(x) - \sum_x p(x) \log q(x)$$

- First term: **negative entropy** of $p$ (does NOT depend on $q$)
- Second term: **negative cross-entropy** between $p$ and $q$ (depends on $q$)

Key properties:
- $D_{KL}(p \| q) \geq 0$ always (non-negative)
- $D_{KL}(p \| q) = 0$ if and only if $p = q$
- $D_{KL}(p \| q) \neq D_{KL}(q \| p)$ in general (asymmetric!)

### In our cat recognition example:

$$D_{KL}(\hat{p}(y|x) \| p_\theta(y|x)) = \mathbb{E}_{y \sim \hat{p}(y|x)}[\log \hat{p}(y|x) - \log p_\theta(y|x)]$$

For a specific image $x$:
- $\hat{p}(y|x)$ = true probability of "cat" vs "not cat" for this image (from labeled data)
- $p_\theta(y|x)$ = your classifier's predicted probability

The KL divergence measures: how different is your classifier's prediction from the true label distribution for this image?

### Plain English Summary

$$\arg\min_{\theta \in \Theta} \mathbb{E}_{\hat{p}(x)}[D_{KL}(\hat{p}(y|x) \| p_\theta(y|x))]$$

> **"Find the model parameters that make our predictions closest to the true labels."**

Or more specifically: "Find $\theta$ such that, on average across all training images, the 'distance' between what the data says and what our classifier predicts is minimized."

---

## The Hint

The problem gives you this property: if $\psi$ is a strictly monotonically decreasing function, then:

$$\max_{\theta} f(\theta) = \min_{\theta} \psi(f(\theta))$$

This is useful because it lets you convert a maximization into a minimization (or vice versa).

---

## Solution

Logic: 

 * MLE: maximize how well our model explains the data

 * KL: minimize how different our model is from the truth

It is basically the same idea, that's why they are "the same"

Steps: 

1) Expand de $D_{KL}$ in the right term

    We have

    $D_{KL}(\hat{p}(y|x) \| p_\theta(y|x))$ 

    but the deffinition is 

    $D_{KL}(p(x) \| q(x)) = \mathbb{E}_{x \sim p(x)}[\log p(x) - \log q(x)]$ 

    so 
    
    $D_{KL}(
        \hat{p}(y|x) \| p_\theta(y|x)
    ) = \mathbb{E}_{
        y \sim \hat{p}(y|x)
    }[
        \log \hat{p}(y|x) - \log p_\theta(y|x)
    ]$

    Right side: 
    
    $$\arg\min_{
        \theta \in \Theta
    } \mathbb{E}_{
        \hat{p}(x)
    } \Big[
        \mathbb{E}_{
            y \sim \hat{p}(y|x)
        }[
            \log \hat{p}(y|x) - \log p_\theta(y|x)
        ]
    \Big]$$

    Simplify $\mathbb{E}$'s: (law of iterated expectations $\hat{p}(x,y) = \hat{p}(x) \cdot \hat{p}(y|x)$)

    $\mathbb{E}_{
        \hat{p}(x)
    }\Big[
        \mathbb{E}_{
            y \sim \hat{p}(y|x)
        }[f(x,y)]
    \Big] = 
    \mathbb{E}_{
        \hat{p}(x,y)
    }[f(x,y)]$

    So finally we have: 

    $\arg\min_{
        \theta \in \Theta
    } \mathbb{E}_{
        \hat{p}(x,y)
    }[
        \log \hat{p}(y|x) - \log p_\theta(y|x)
    ]$

    Complete expression: 

    $$\arg\max_{
        \theta \in \Theta
    } \mathbb{E}_{
        \hat{p}(x,y)
    }[
        \log p_\theta(y|x)
    ] = 
    \arg\min_{
        \theta \in \Theta
    } \mathbb{E}_{
        \hat{p}(x,y)
    }[
        \log \hat{p}(y|x) - \log p_\theta(y|x)
    ]$$

    $$\arg\min_{\theta} \Big[ -\mathbb{E}{\hat{p}(x,y)}[\log p\theta(y|x)] \Big]$$

2) Simplify result.

    We have repeated terms right and left like: 

    $$\arg\max_{
        \theta \in \Theta
    } \mathbb{E}_{
        p(x)
    }[
        f(x)
    ] = 
    \arg\min_{
        \theta \in \Theta
    } \mathbb{E}_{
        p(x)
    }[
        g(x) - f(x)
    ]$$

    Key parts: 

    * f(x) => $\log p_\theta(y|x)$
    * g(x) => $\log \hat{p}(y|x)$

3) Conclusion:

    $\log \hat{p}(y|x)$ Dont depend on $\theta$ so maximizing f(x) is the same as minimizing -f(x)

    Using the hint: 

    We have a function h(f) = g(x) - f 

    $$\arg\max_{
        \theta \in \Theta
    } \mathbb{E}_{
        p(x)
    }[
        f(x)
    ] = 
    \arg\min_{
        \theta \in \Theta
    } \mathbb{E}_{
        p(x)
    }[
        h(f(x))
    ]$$

    so we can apply the hint to finally have:

    $$\arg\max_{
        \theta \in \Theta
    } \mathbb{E}_{
        p(x)
    }[
        f(x)
    ] = 
    \arg\max_{
        \theta \in \Theta
    } \mathbb{E}_{
        p(x)
    }[
        f(x)
    ]$$
