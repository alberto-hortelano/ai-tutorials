# Programming Assignment (Exercise 6)

## Problem Context

We use an autoregressive generative model (GPT-2) to create text. The model processes a sequence of tokens $x_0, x_1, ..., x_T$ where each token $x_i$ has 50257 possible values.

### Architecture (Figure 1)

```
x_i → e_{x_i} (768-dim) → GPT-2 → h_i (768-dim) → FC Layer → l_i (50257-dim) → Softmax → p_{i+1} (50257-dim)
```

| Component | Dimension | Description |
|-----------|-----------|-------------|
| $x_i$ | scalar | Token index at position $i$ |
| $e_{x_i}$ | 768 | Trainable embedding for token $x_i$ |
| $h_i$ | 768 | GPT-2 hidden state output |
| $l_i$ | 50257 | Logits from fully-connected layer |
| $p_{i+1}$ | 50257 | Probability distribution of next token |

**Trainable parameter nodes** (gray in figure): embeddings $e_{x_i}$, FC layer (produces $l_i$), softmax layer (produces $p_i$).

**GPT-2 module parameters are fixed** (pretrained, not counted when asking about parameter changes).

---

## 6b. Problem Statement

**[1 point (Written)]** If the number of possible tokens increases from 50257 to 60000, what is the increase in the number of parameters? Give an exact number and explain your answer.

**Hint:** The number of parameters in the GPT-2 module in Fig. 1 does not change.

### What parameters depend on vocabulary size?

Looking at the architecture, two components have dimensions tied to the vocabulary size $V$:

| Component | Parameter shape | Why it depends on $V$ |
|-----------|----------------|----------------------|
| Embedding layer | $V \times 768$ | One 768-dim vector per token |
| Fully-connected layer (weight) | $768 \times V$ | Maps 768-dim hidden state to $V$ logits |
| Fully-connected layer (bias) | $V$ | One bias per logit |
| Softmax | 0 | No parameters (just a function) |

The GPT-2 module itself takes 768-dim input and produces 768-dim output, so its parameters don't depend on $V$.

### Counting the change

When $V$ changes from 50257 to 60000, the increase $\Delta V = 60000 - 50257 = 9743$.

The parameters that grow are:
- **Embedding matrix:** $\Delta V \times 768$ new parameters
- **FC weight matrix:** $768 \times \Delta V$ new parameters
- **FC bias vector:** $\Delta V$ new parameters

Total increase: $\Delta V \times 768 + 768 \times \Delta V + \Delta V = \Delta V \times (768 + 768 + 1) = \Delta V \times 1537$

## Solution

a. 
$$n = \lceil \log_2(50257) \rceil = 16$$

b. 