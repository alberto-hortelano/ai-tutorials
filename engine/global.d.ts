/// <reference types="vite/client" />

interface KaTeX {
  render(
    expression: string,
    baseNode: HTMLElement,
    options?: {
      displayMode?: boolean;
      throwOnError?: boolean;
      trust?: boolean;
    },
  ): void;
}

declare module 'katex/dist/contrib/auto-render.mjs' {
  function renderMathInElement(el: HTMLElement, opts?: object): void;
  export default renderMathInElement;
}

interface Window {
  katex?: KaTeX;
}
