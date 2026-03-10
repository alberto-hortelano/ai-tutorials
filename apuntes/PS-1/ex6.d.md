# Exercise 6.d — Log-Likelihood Computation [4 points, Coding]

## What the problem asks

Complete the function `log_likelihood` in `src/submission/likelihood.py`. Given the pretrained GPT-2 model and an input string (as a tensor of token indices), compute the **log-likelihood** of that string under the model.

The function signature is:

```python
def log_likelihood(model, text):
    """
    :param model: The GPT-2 model
    :param text: A tensor of shape (1, T), where T is the length of the text
    :return: The log-likelihood as a Python scalar.
    NOTE: for simplicity, you can ignore the likelihood of the first token.
    """
```

After implementing this, the code runs `log_likelihood` over strings from three different corpora (random text, Shakespeare, and NeurIPS abstracts) and produces histograms. Your histograms should look like Figure 2 below.

## Figure 2 — Expected log-likelihood histograms for each text type

| Random | Shakespeare | NeurIPS |
|--------|-------------|---------|
| ![random](../XCS236-PS1/tex/figures/random.png) | ![shakespeare](../XCS236-PS1/tex/figures/shakespeare.png) | ![neurips](../XCS236-PS1/tex/figures/neurips.png) |

These histograms show the distribution of log-likelihoods across many text snippets for each corpus. Notice that:

- **Random text** has very low (very negative) log-likelihoods — the model considers random strings extremely unlikely
- **Shakespeare and NeurIPS** have much higher (less negative) log-likelihoods — the model considers coherent English text far more probable
- The Shakespeare and NeurIPS distributions are concentrated in a similar range, while the random distribution is shifted far to the left

## Relevant concepts

### Log-likelihood of a sequence under an autoregressive model

Recall from the model architecture (Figure 1 in exercise 6) that GPT-2 is an autoregressive model. Given a sequence of tokens $x_0, x_1, \ldots, x_T$, the model produces, at each position $i$, a probability distribution $p_{i+1}$ over the next token. That is, after processing tokens $x_0, \ldots, x_i$, the model outputs:

$$p(x_{i+1} \mid x_0, x_1, \ldots, x_i)$$

By the chain rule of probability, the joint probability of the entire sequence factorizes as:

$$p(x_0, x_1, \ldots, x_T) = p(x_0) \cdot \prod_{i=0}^{T-1} p(x_{i+1} \mid x_0, \ldots, x_i)$$

Taking the logarithm (and using the hint that we can ignore the first token $x_0$):

$$\log p(x_1, \ldots, x_T \mid x_0) = \sum_{i=0}^{T-1} \log p(x_{i+1} \mid x_0, \ldots, x_i)$$

So the log-likelihood of the string is the **sum of the log-probabilities the model assigns to each token, given all previous tokens**.

### From logits to log-probabilities

The model outputs raw **logits** $l_i \in \mathbb{R}^{50257}$ at each position. To get probabilities, we apply softmax:

$$p(x_{i+1} = v \mid x_{\le i}) = \frac{\exp(l_i[v])}{\sum_{j=1}^{50257} \exp(l_i[j])}$$

The log of this is the **log-softmax**:

$$\log p(x_{i+1} = v \mid x_{\le i}) = l_i[v] - \log \sum_{j=1}^{50257} \exp(l_i[j])$$

### Connection to cross-entropy loss

The code hints mention `CrossEntropyLoss`. PyTorch's cross-entropy loss computes:

$$\text{CE}(l, y) = -\log \frac{\exp(l[y])}{\sum_j \exp(l[j])}$$

which is the **negative log-probability** of the target class $y$ given logits $l$. This is exactly the negative of what we need for each position. The log-likelihood is the negative of the total cross-entropy loss across all positions (using `reduction='sum'`).

### Why this matters

Log-likelihood lets us quantify how "surprised" the model is by a given text. A well-trained language model should assign:
- **High log-likelihood** (close to 0) to text that looks like natural language
- **Low log-likelihood** (very negative) to random or incoherent text

This is the foundation for using generative models as **density estimators** — they give us a way to score how probable any given data point is under the learned distribution. Exercise 6.e will build on this by using log-likelihoods to *classify* whether text is random or not.

### Alignment between inputs and outputs

A subtle but important detail: the model's output at position $i$ predicts the token at position $i+1$. So when computing the loss, the logits and the target tokens need to be **shifted**:

- **Logits to use:** positions $0$ through $T-1$ (the model's predictions for the *next* token)
- **Target tokens:** positions $1$ through $T$ (the actual next tokens)

This offset-by-one alignment is standard in autoregressive language models.
