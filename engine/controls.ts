// Controls — play/pause button, progress bar, scene indicators
import { colors } from './shared/design-tokens';
import type { Timeline } from './timeline';

export class Controls {
  container: HTMLElement;
  timeline: Timeline;
  playBtn!: HTMLButtonElement;
  timeDisplay!: HTMLSpanElement;
  progressWrap!: HTMLDivElement;
  markersTrack!: HTMLDivElement;
  progressTrack!: HTMLDivElement;
  progressFill!: HTMLDivElement;
  progressThumb!: HTMLDivElement;
  sceneLabel!: HTMLSpanElement;
  ccBtn!: HTMLButtonElement;

  constructor(container: HTMLElement, timeline: Timeline) {
    this.container = container;
    this.timeline = timeline;
    this._build();
    this._bind();
  }

  _build(): void {
    this.container.innerHTML = '';
    this.container.classList.add('pres-controls');

    // Play/pause button
    this.playBtn = document.createElement('button');
    this.playBtn.className = 'pres-play-btn';
    this.playBtn.setAttribute('aria-label', 'Play/Pause');
    this._updatePlayIcon();

    // Time display
    this.timeDisplay = document.createElement('span');
    this.timeDisplay.className = 'pres-time';
    this.timeDisplay.textContent = '0:00 / 0:00';

    // Progress bar wrapper
    this.progressWrap = document.createElement('div');
    this.progressWrap.className = 'pres-progress-wrap';

    // Scene markers
    this.markersTrack = document.createElement('div');
    this.markersTrack.className = 'pres-markers';
    this._buildMarkers();
    this.progressWrap.appendChild(this.markersTrack);

    // Progress track
    this.progressTrack = document.createElement('div');
    this.progressTrack.className = 'pres-progress-track';
    this.progressFill = document.createElement('div');
    this.progressFill.className = 'pres-progress-fill';
    this.progressThumb = document.createElement('div');
    this.progressThumb.className = 'pres-progress-thumb';
    this.progressTrack.appendChild(this.progressFill);
    this.progressTrack.appendChild(this.progressThumb);
    this.progressWrap.appendChild(this.progressTrack);

    // Scene label
    this.sceneLabel = document.createElement('span');
    this.sceneLabel.className = 'pres-scene-label';
    this.sceneLabel.textContent = '';

    // CC (subtitles) toggle button
    this.ccBtn = document.createElement('button');
    this.ccBtn.className = 'pres-cc-btn';
    this.ccBtn.setAttribute('aria-label', 'Subtítulos');
    this.ccBtn.textContent = 'CC';
    const subtitlesOn = localStorage.getItem('subtitles') !== 'off';
    if (!subtitlesOn) {
      this.ccBtn.classList.add('off');
      document.getElementById('subtitle')?.classList.add('hidden');
    }

    // Assemble
    this.container.appendChild(this.playBtn);
    this.container.appendChild(this.timeDisplay);
    this.container.appendChild(this.progressWrap);
    this.container.appendChild(this.sceneLabel);
    this.container.appendChild(this.ccBtn);
  }

  _buildMarkers(): void {
    this.markersTrack.innerHTML = '';
    const { scenes, totalDuration } = this.timeline;
    let acc = 0;
    for (let i = 0; i < scenes.length; i++) {
      if (i > 0) {
        const marker = document.createElement('div');
        marker.className = 'pres-marker';
        marker.style.left = `${(acc / totalDuration) * 100}%`;
        marker.title = scenes[i].id;
        // Color markers by interaction type
        const interaction = scenes[i].interaction;
        if (interaction === 'question') {
          marker.style.background = colors.warning;   // yellow
          marker.style.width = '3px';
        } else if (interaction === 'interactive-html') {
          marker.style.background = colors.insight;    // green
          marker.style.width = '3px';
        }
        this.markersTrack.appendChild(marker);
      }
      acc += scenes[i].duration;
    }
  }

  _bind(): void {
    // Play/pause
    this.playBtn.addEventListener('click', () => this.timeline.toggle());

    // Seek via click/drag on progress bar
    let dragging = false;
    const seekFromEvent = (e: MouseEvent): void => {
      const rect = this.progressTrack.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      this.timeline.seekProgress(p);
    };

    // Click on the wider wrapper area for easier targeting
    this.progressWrap.addEventListener('mousedown', (e: MouseEvent) => {
      dragging = true;
      seekFromEvent(e);
    });
    window.addEventListener('mousemove', (e: MouseEvent) => {
      if (dragging) seekFromEvent(e);
    });
    window.addEventListener('mouseup', () => { dragging = false; });

    // Timeline events
    this.timeline.on('play', () => this._updatePlayIcon());
    this.timeline.on('pause', () => this._updatePlayIcon());
    this.timeline.on('timeupdate', () => this._updateProgress());
    this.timeline.on('scenechange', ({ scene }: { scene: { id: string } }) => {
      this.sceneLabel.textContent = scene.id;
    });
    this.timeline.on('end', () => this._updatePlayIcon());

    // CC toggle
    this.ccBtn.addEventListener('click', () => {
      const subtitleEl = document.getElementById('subtitle');
      const isOff = this.ccBtn.classList.toggle('off');
      subtitleEl?.classList.toggle('hidden', isOff);
      localStorage.setItem('subtitles', isOff ? 'off' : 'on');
    });

    // Keyboard
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); this.timeline.toggle(); }
      if (e.code === 'ArrowRight') { e.preventDefault(); this.timeline.seek(this.timeline.currentTime + 5); }
      if (e.code === 'ArrowLeft') { e.preventDefault(); this.timeline.seek(this.timeline.currentTime - 5); }
    });
  }

  _updatePlayIcon(): void {
    this.playBtn.innerHTML = this.timeline.playing
      ? '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>'
      : '<svg viewBox="0 0 24 24" width="22" height="22"><polygon points="6,4 20,12 6,20" fill="currentColor"/></svg>';
  }

  _updateProgress(): void {
    const p = this.timeline.progress;
    this.progressFill.style.width = `${p * 100}%`;
    this.progressThumb.style.left = `${p * 100}%`;
    this.timeDisplay.textContent = `${fmtTime(this.timeline.currentTime)} / ${fmtTime(this.timeline.totalDuration)}`;
  }

  destroy(): void {
    this.container.innerHTML = '';
  }
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}
