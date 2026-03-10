// Scene factories — create question and interactive-html scenes
import { Scene } from './scene';
import type { QuestionData, InteractiveHtmlData } from './types';
import { colors, fonts } from './shared/design-tokens';

/** Creates a question scene that pauses and shows a question overlay. */
export function questionScene(data: QuestionData | (() => QuestionData)): Scene {
  return new Scene({
    id: () => '?',
    duration: 2,
    interaction: 'question',
    questionData: data,
    render(progress, ctx, canvas) {
      // Simple placeholder render — dark bg with question mark
      ctx.fillStyle = colors.bodyBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.fillStyle = colors.warning;
      ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.2}px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(progress * Math.PI * 2);
      ctx.fillText('?', canvas.width / 2, canvas.height / 2);
      ctx.restore();
    },
  });
}

/** Creates an interactive HTML scene that pauses and shows an iframe overlay. */
export function interactiveScene(data: InteractiveHtmlData | (() => InteractiveHtmlData)): Scene {
  return new Scene({
    id: () => '\u{1F9EA}',
    duration: 2,
    interaction: 'interactive-html',
    interactiveData: data,
    render(progress, ctx, canvas) {
      // Simple placeholder render — dark bg with explore icon
      ctx.fillStyle = colors.bodyBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.fillStyle = colors.insight;
      ctx.font = `bold ${Math.min(canvas.width, canvas.height) * 0.15}px ${fonts.body}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.3 + 0.2 * Math.sin(progress * Math.PI * 2);
      ctx.fillText('\u{1F50D}', canvas.width / 2, canvas.height / 2);
      ctx.restore();
    },
  });
}
