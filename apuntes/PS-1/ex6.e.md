# Exercise 6.e — Text Classification: Random vs. Non-Random [2 points, Coding]

## What the problem asks

Given new, unseen text snippets (stored in `snippets.pkl`), determine **whether each snippet is randomly generated or not**. The snippets come from one of three sources:

- **NeurIPS 2015** paper abstracts (not random)
- **Shakespeare's** works (not random)
- **Randomly generated** text (random)

Your task is a **binary classification**: random (`True`) vs. not random (`False`). You must complete the function `classification` in `src/submission/classifier.py`:

```python
def classification(model, text):
    """
    :param model: The GPT-2 model
    :param text: A tensor of shape (1, T), where T is the length of the text
    :return: True if `text` is a random string. Otherwise return False
    """
```

Important constraints from the code comments:
- The solution should be **very short** (the reference implementation is 2 lines)
- You should use the `log_likelihood()` function from exercise 6.d
- There is **no model training** involved

## Connection to exercise 6.d

This exercise builds directly on 6.d, where you computed log-likelihoods for strings from three different corpora and plotted histograms (Figure 2). The key observation is in those histograms — they reveal a structural difference between random and non-random text as measured by the GPT-2 model.

## Relevant concepts

### Using a generative model as a classifier

One powerful application of generative models is **anomaly detection** or **out-of-distribution detection**. The idea is simple: if you have a model that assigns probabilities to data, you can use those probabilities to decide whether a new data point "fits" the distribution the model has learned.

A language model like GPT-2 has been trained on vast amounts of natural English text. It has learned what plausible English looks like — word frequencies, grammar, semantic coherence. When presented with text, it can quantify how "surprised" it is via the likelihood it assigns.

### Log-likelihood as a feature

Recall from 6.d that the log-likelihood of a sequence is:

$$\log p(x_1, \ldots, x_T \mid x_0) = \sum_{i=0}^{T-1} \log p(x_{i+1} \mid x_0, \ldots, x_i)$$

This single scalar summarizes, across every token position, how well the model predicted what actually came next. It captures everything about the sequence in one number:
- If the text is coherent English, the model predicts each next token reasonably well, and the log-probabilities are relatively high (less negative)
- If the text is random gibberish, the model is constantly surprised, and the log-probabilities are very low (very negative)

### What Figure 2 reveals

The histograms from exercise 6.d show the distribution of log-likelihoods for each text type. The crucial observation is about where these distributions sit on the log-likelihood axis and whether they overlap — particularly, the relationship between **random** text and the two kinds of **coherent** text (Shakespeare and NeurIPS).

### Density estimation for classification

This exercise illustrates a fundamental idea in generative modeling: a model that learns the distribution of "normal" data can be used to **detect anomalies** without any supervised training. Instead of training a classifier with labeled examples of "random" and "not random," we use the density (likelihood) that a generative model assigns to a data point as a signal. This is sometimes called **likelihood-based anomaly detection**.

The hint in the problem — "Is there a simple representation space in which the random data is separable from the non-random data?" — is pointing you toward thinking about what single feature, already available to you, could serve as a decision boundary.
