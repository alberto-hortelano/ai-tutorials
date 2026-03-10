# Exercise 6.c -- Sampling from GPT-2

## What the problem asks

**[5 points (Coding)]** Implement autoregressive sampling from the GPT-2 model to generate text. Complete the `sample` function in `src/submission/sample.py`.

The generated text should look like a technical paper.

## The experiment

`main.py` runs the following experiment:

1. Takes 5 real NeurIPS 2015 paper abstracts
2. Uses the first 100 characters of each as a **prompt** (starting text)
3. Asks GPT-2 to continue generating text for `config.n_ctx // 2` additional tokens
4. Saves the generated samples to `submission/samples.txt`

So the model receives the beginning of a real abstract and must produce a plausible continuation.

## What the `sample` function does

The function generates text **one token at a time** in a loop. The overall structure is already provided in the starter code:

- At each iteration, the model receives the current token and returns **logits** -- a vector of 50,257 values representing unnormalized log-probabilities for every possible next token
- **Top-k filtering** is applied to the logits (already implemented) -- this zeroes out all but the $k$ most likely tokens to improve text quality
- Then **your code** must use those logits to produce the next token and keep the loop going

Your implementation goes in the `### START CODE HERE ###` block (lines 91-94). The hint says it should take about 3-5 lines.

## Relevant concepts

### Autoregressive generation

The model predicts $p(x_{t+1} \mid x_{\leq t})$ -- the conditional distribution of the next token given all tokens so far. To generate a full sequence, you produce one token at a time and feed it back as input for the next step:

$$x_0, x_1, \ldots, x_T \xrightarrow{\text{prompt}} \hat{x}_{T+1} \sim p(\cdot \mid x_{\leq T}) \xrightarrow{\text{feed back}} \hat{x}_{T+2} \sim p(\cdot \mid x_{\leq T}, \hat{x}_{T+1}) \xrightarrow{} \cdots$$

This is the chain rule of probability applied sequentially -- the same autoregressive factorization from the written questions earlier in this problem set.

### Sampling vs. greedy decoding

The starter code has a placeholder that uses `torch.argmax` (greedy decoding -- always pick the most likely token). The exercise asks you to replace this with **sampling** from the distribution, which introduces randomness and produces more diverse, natural-sounding text.

### The `past` cache

GPT-2 uses self-attention, so at each step it needs information about all previous tokens. To avoid recomputing everything from scratch, the model returns a `past` object (cached key/value tensors). By passing `past` back into the next call, the model only needs to process the **single new token**, not the entire sequence.

This means `current_text` at each step should be just the newly chosen token, not the whole sequence. The full sequence is tracked separately in the `output` list.

## How to run

```bash
cd XCS236-PS1/src
python main.py
```

Output goes to `submission/samples.txt`. A correct implementation produces text that reads like a coherent technical paper.
