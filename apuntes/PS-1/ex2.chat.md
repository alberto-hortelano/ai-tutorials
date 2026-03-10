
● Done. I've completed the derivation with:

  1. Expanding the quadratic $(x-\mu_y)^\top(x-\mu_y) = x^\top x - 2x^\top\mu_y
  + |\mu_y|^2$
  2. Canceling the $x^\top x$ term — since all classes share the same $\sigma$,
  this term appears identically in numerator and denominator
  3. Converting $\pi_y$ to exponential form using $\pi_y = \exp(\log \pi_y)$
  4. Matching coefficients to get the closed-form mapping:
    - $w_y = \frac{\mu_y}{\sigma^2}$
    - $b_y = \log \pi_y - \frac{|\mu_y|^2}{2\sigma^2}$

  The key insight is that the shared variance $\sigma^2$ across all Gaussians is
   what makes this work — it causes the $x^\top x$ terms to cancel, leaving a
  linear function of $x$ in the exponent.

✻ Sautéed for 60s

❯ At step 1 I have added what I get from expanding. How is that transformed 
   into your solution?                                                      

● Good question. Looking at your expansion:

  $$
  (x - \mu_y)^\top(x - \mu_y) = x^\top x - x^\top\mu_y - x\mu_y^\top +
  \mu_y^\top\mu_y
  $$

  I think you meant $\mu_y^\top x$ for the third term (not $x\mu_y^\top$, which
  would be an outer product matrix). The correct expansion is:

  $$
  (x - \mu_y)^\top(x - \mu_y) = x^\top x - x^\top\mu_y - \mu_y^\top x +
  \mu_y^\top\mu_y
  $$

  The key observation is that $x^\top\mu_y$ and $\mu_y^\top x$ are the same 
  scalar:

  $$
  x^\top\mu_y = \sum_{j=1}^n x_j \mu_{y,j} = \mu_y^\top x
  $$

  The dot product is commutative. So:

  $$
  -x^\top\mu_y - \mu_y^\top x = -2x^\top\mu_y
  $$

  Therefore:

  $$
  x^\top x - x^\top\mu_y - \mu_y^\top x + \mu_y^\top\mu_y = x^\top x -
  2x^\top\mu_y + |\mu_y|^2
  $$

❯ Can you explain in more detail? I understand that x^\top is the           
  transposed matrix of x and the same for \mu_y^\top                        

● Let me break this down concretely.

  The vectors

  $x$ and $\mu_y$ are column vectors in $\mathbb{R}^n$:

  $$
  x = \begin{pmatrix} x_1 \ x_2 \ \vdots \ x_n \end{pmatrix}, \quad
  \mu_y = \begin{pmatrix} \mu_{y,1} \ \mu_{y,2} \ \vdots \ \mu_{y,n}
  \end{pmatrix}
  $$

  Their transposes are row vectors:

  $$
  x^\top = \begin{pmatrix} x_1 & x_2 & \cdots & x_n \end{pmatrix}, \quad
  \mu_y^\top = \begin{pmatrix} \mu_{y,1} & \mu_{y,2} & \cdots & \mu_{y,n}
  \end{pmatrix}
  $$

  Computing $x^\top \mu_y$

  This is a $(1 \times n)$ row vector times an $(n \times 1)$ column vector,
  giving a $(1 \times 1)$ scalar:

  $$
  x^\top \mu_y = \begin{pmatrix} x_1 & x_2 & \cdots & x_n \end{pmatrix}
  \begin{pmatrix} \mu_{y,1} \ \mu_{y,2} \ \vdots \ \mu_{y,n} \end{pmatrix} =
  x_1\mu_{y,1} + x_2\mu_{y,2} + \cdots + x_n\mu_{y,n}
  $$

  Computing $\mu_y^\top x$

  This is also $(1 \times n)$ times $(n \times 1)$, giving a scalar:

  $$
  \mu_y^\top x = \begin{pmatrix} \mu_{y,1} & \mu_{y,2} & \cdots & \mu_{y,n}
  \end{pmatrix} \begin{pmatrix} x_1 \ x_2 \ \vdots \ x_n \end{pmatrix} =
  \mu_{y,1}x_1 + \mu_{y,2}x_2 + \cdots + \mu_{y,n}x_n
  $$

  They're equal

  Since multiplication of real numbers is commutative ($x_1\mu_{y,1} =
  \mu_{y,1}x_1$):

  $$
  x^\top \mu_y = \sum_{j=1}^n x_j \mu_{y,j} = \sum_{j=1}^n \mu_{y,j} x_j =
  \mu_y^\top x
  $$

  Both are just the dot product $x \cdot \mu_y$.

  Concrete example with $n=2$

  Let $x = \begin{pmatrix} 3 \ 4 \end{pmatrix}$ and $\mu_y = \begin{pmatrix} 1 \
   2 \end{pmatrix}$.

  $$
  x^\top \mu_y = \begin{pmatrix} 3 & 4 \end{pmatrix} \begin{pmatrix} 1 \ 2
  \end{pmatrix} = 3 \cdot 1 + 4 \cdot 2 = 11
  $$

  $$
  \mu_y^\top x = \begin{pmatrix} 1 & 2 \end{pmatrix} \begin{pmatrix} 3 \ 4
  \end{pmatrix} = 1 \cdot 3 + 2 \cdot 4 = 11
  $$

  Same result.

  Why $x\mu_y^\top$ is different

  Note that $x\mu_y^\top$ (column times row) gives an $(n \times n)$ matrix, not
   a scalar:

  $$
  x\mu_y^\top = \begin{pmatrix} 3 \ 4 \end{pmatrix} \begin{pmatrix} 1 & 2
  \end{pmatrix} = \begin{pmatrix} 3 & 6 \ 4 & 8 \end{pmatrix}
  $$

  This is called the outer product and is not what appears in the quadratic form
   expansion.