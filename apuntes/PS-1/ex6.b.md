# Exercise 6.b -- Increase in Parameters When Vocabulary Grows

## What the problem asks

**[1 point (Written)]** The model currently uses a vocabulary of $V = 50{,}257$ tokens. If we increase the vocabulary to $V' = 60{,}000$ tokens, how many **additional** parameters does the model need? Give an exact number and explain your reasoning.

**Hint from the problem:** The number of parameters inside the GPT-2 module does not change.

## The architecture (Figure 1)

![GPT-2 Architecture](../XCS236-PS1/tex/figures/gpt-2.png)

The pipeline processes a sequence of tokens $x_0, x_1, \ldots, x_T$ from left to right through four stages. The color of each node in the diagram tells you whether it contains learnable parameters (gray = has learnable parameters, green/red = computed values without own parameters).

### Stage 1: Embedding Layer (gray nodes) -- has learnable parameters, depends on $V$

Each token $x_i$ is an integer index (e.g., 0 to 50,256). The embedding layer is a lookup table: a matrix $E \in \mathbb{R}^{V \times 768}$ where each row is the 768-dimensional vector for one token. Given $x_i$, we simply look up row $x_i$ to get $e_{x_i} \in \mathbb{R}^{768}$.

- **Parameters:** $V \times 768$ (one 768-dim vector per token in the vocabulary)
- **Depends on $V$?** Yes -- more tokens means more rows in the table.

### Stage 2: GPT-2 (gray block) -- has learnable parameters, does NOT depend on $V$

All the embedding vectors are fed into the GPT-2 transformer. This is the heavy part of the model (self-attention blocks, feedforward layers, layer norms, etc.). It takes each 768-dim input and produces a 768-dim hidden state $h_i$.

- **Parameters:** Many (millions), but all internal -- they operate on 768-dim vectors regardless of vocabulary size.
- **Depends on $V$?** No. GPT-2 sees 768-dim in, 768-dim out. It doesn't know or care how big the vocabulary is.
- **Note:** In this assignment the GPT-2 weights are **pretrained and fixed** (not trained further).

### Stage 3: Fully-Connected Layer (gray block) -- has learnable parameters, depends on $V$

Each hidden state $h_i \in \mathbb{R}^{768}$ is mapped to a logit vector $l_i \in \mathbb{R}^{V}$ through a standard linear layer:

$$l_i = W h_i + b$$

where $W \in \mathbb{R}^{V \times 768}$ and (optionally) $b \in \mathbb{R}^{V}$.

- **Parameters:** $V \times 768$ weights + $V$ biases (if bias is included)
- **Depends on $V$?** Yes -- more tokens means more rows in $W$ and more entries in $b$.

### Stage 4: Softmax (red block) -- NO learnable parameters

The softmax function converts the logit vector $l_i$ into a probability distribution $p_{i+1}$ over the next token:

$$p_{i+1}[j] = \frac{\exp(l_i[j])}{\sum_{k=1}^{V} \exp(l_i[k])}$$

- **Parameters:** Zero. This is a pure function -- no weights, no biases.
- **Depends on $V$?** No (in terms of parameters). It just normalizes whatever length vector it receives.

### Summary table

| Component | Learnable params? | Shape depends on $V$? | Color in diagram |
|-----------|:-:|:-:|:-:|
| Embedding | Yes | Yes | Gray |
| GPT-2 | Yes (but fixed) | No | Gray |
| FC Layer | Yes | Yes | Gray |
| Softmax | No | No | Red |

The question is: **which of these have learnable parameters, and which of those depend on $V$?**

## What was said in class

The instructor (Sebastian) emphasized several key points:

### 1. Identify which layers have learnable parameters

Not every box in the diagram contains parameters you can train. You need to go component by component and ask: does this layer have weights/biases that are learned?

### 2. Softmax has NO learnable parameters

Softmax is a pure mathematical function -- it takes a vector of logits and normalizes them into probabilities. There are no weights or biases to learn. So changing $V$ does **not** add parameters through the softmax.

### 3. GPT-2 is not affected

GPT-2 takes in 768-dimensional vectors and outputs 768-dimensional vectors. Its internal parameters (attention weights, feedforward layers, etc.) don't depend on the vocabulary size at all. The problem hint confirms this explicitly.

### 4. The embedding dimension stays at 768

A student (Pinaki) asked in class whether the embedding dimension changes. Sebastian confirmed: **no, only the vocabulary size changes, not the embedding dimension.** So each token still gets a 768-dimensional embedding vector -- there are just more tokens now.

### 5. Multiple valid answers are accepted

This was an important clarification. Sebastian explained that the exact number you get depends on **what assumptions you state**:

- **Bias terms:** The FC layer may or may not include a bias vector. If you choose to exclude it (or include it), just say so.
- **Weight tying:** In many LLMs, the embedding matrix and the FC output layer **share the same weights** (this is called "weight tying" or "tied embeddings"). The idea is that the input representation of a word and the output representation should live in the same space. If you assume weight tying, then increasing $V$ only adds parameters once (not twice). If you don't assume it, both layers grow independently.

**As long as you clearly state your assumptions and the arithmetic is correct given those assumptions, any of these answers is accepted.**

## What you need to figure out

The core task: look at each component in the pipeline, determine whether it has learnable parameters whose size depends on $V$, and compute how much those parameters grow when $V$ goes from 50,257 to 60,000. Report the **delta** (increase), not the total.

## Solution:

Only the embedding and the Fully connected layer's parameters depends on V

The Embeddings have V * 768 parameters: $768 \Delta V$

The Fully connected layer have V * 768 parameters (assume no bias to simplify): $768 \Delta V$

$768 \Delta V + 768 \Delta V = 1536 \Delta V$

The increase in V is $\Delta V = 60000 -50257 = 9743$

So total increase is 

$1536 \Delta V = 1536 \times 9743 = 14965248$

