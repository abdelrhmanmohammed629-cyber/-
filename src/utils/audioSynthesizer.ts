import { RingtoneId, RingtoneInfo } from '../types';

export const AVAILABLE_RINGTONES: RingtoneInfo[] = [
  {
    id: 'campus_chime',
    name: 'جرس أكاديمي جامعي',
    description: 'رنين أجراس ناعمة متناغمة تلائم أجواء الدراسة والمحاضرات',
    category: 'أكاديمي',
  },
  {
    id: 'digital_beep',
    name: 'رنين رقمي كلاسيكي',
    description: 'تنبيه إلكتروني حاد ومتكرر يضمن الاستيقاظ والتركيز فوراً',
    category: 'كلاسيكي',
  },
  {
    id: 'zen_marimba',
    name: 'نغمة هادئة ومركزة',
    description: 'أنغام ماريمبا دافئة ومريحة للتنبيه الهادئ بدون توتر',
    category: 'هادئ',
  },
  {
    id: 'energy_synth',
    name: 'تنبيه طاقة ونشاط',
    description: 'نغمات متصاعدة حماسية تمنحك دافعاً فورياً لبدء المذاكرة',
    category: 'نشط',
  },
  {
    id: 'radar_pulsar',
    name: 'رنين رادار متصاعد',
    description: 'نبضات صوتية متتالية تناسب المهام العاجلة والقصوى',
    category: 'نشط',
  },
  {
    id: 'vintage_clock',
    name: 'ساعة حائط كلاسيكية',
    description: 'دقات ساعة كلاسيكية مع رنين أوقات رصين وواضح',
    category: 'كلاسيكي',
  },
];

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private currentLoopTimer: number | null = null;
  private activeGainNodes: GainNode[] = [];

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play a single note with envelope
  private playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.5
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);

    this.activeGainNodes.push(gain);
  }

  // Play pattern for each ringtone type once
  private playPattern(ringtoneId: RingtoneId, volume: number = 0.6): number {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    switch (ringtoneId) {
      case 'digital_beep': {
        // Double beep beep ... beep beep
        const beeps = [0, 0.12, 0.24, 0.5, 0.62, 0.74];
        beeps.forEach((offset) => {
          this.playTone(ctx, 1046.5, now + offset, 0.08, 'square', volume * 0.4);
        });
        return 1.2; // loop cycle length in seconds
      }

      case 'campus_chime': {
        // Westminster-like collegiate chime: E4, G4, A4, B4, E5
        const notes = [
          { f: 659.25, time: 0, dur: 0.7 },    // E5
          { f: 587.33, time: 0.35, dur: 0.7 }, // D5
          { f: 523.25, time: 0.7, dur: 0.8 },  // C5
          { f: 783.99, time: 1.1, dur: 1.2 },  // G5
        ];
        notes.forEach((n) => {
          this.playTone(ctx, n.f, now + n.time, n.dur, 'triangle', volume * 0.6);
          // overtone
          this.playTone(ctx, n.f * 2, now + n.time, n.dur * 0.6, 'sine', volume * 0.2);
        });
        return 2.5;
      }

      case 'zen_marimba': {
        // Soft wooden pleasant pentatonic chord
        const notes = [
          { f: 440, time: 0, dur: 0.4 },
          { f: 554.37, time: 0.18, dur: 0.4 },
          { f: 659.25, time: 0.36, dur: 0.5 },
          { f: 880, time: 0.54, dur: 0.7 },
        ];
        notes.forEach((n) => {
          this.playTone(ctx, n.f, now + n.time, n.dur, 'sine', volume * 0.5);
          this.playTone(ctx, n.f * 1.5, now + n.time, n.dur * 0.4, 'triangle', volume * 0.2);
        });
        return 1.8;
      }

      case 'energy_synth': {
        // Fast energetic arpeggio
        const arpeggio = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5];
        arpeggio.forEach((freq, idx) => {
          this.playTone(ctx, freq, now + idx * 0.1, 0.15, 'sawtooth', volume * 0.3);
        });
        return 1.6;
      }

      case 'radar_pulsar': {
        // Ascending frequency sweeps
        const pulses = [0, 0.3, 0.6];
        pulses.forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, now + offset);
          osc.frequency.exponentialRampToValueAtTime(1400, now + offset + 0.18);

          gain.gain.setValueAtTime(0.01, now + offset);
          gain.gain.linearRampToValueAtTime(volume * 0.5, now + offset + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.25);
        });
        return 1.4;
      }

      case 'vintage_clock': {
        // Ding Dong resonance
        this.playTone(ctx, 523.25, now, 0.6, 'sine', volume * 0.6);
        this.playTone(ctx, 392.00, now + 0.35, 0.9, 'sine', volume * 0.6);
        return 1.8;
      }

      default:
        this.playTone(ctx, 880, now, 0.4, 'sine', volume * 0.5);
        return 1.0;
    }
  }

  // Preview a ringtone for 2-3 seconds
  public preview(ringtoneId: RingtoneId, volume: number = 0.6): void {
    this.stop();
    this.playPattern(ringtoneId, volume);
  }

  // Start continuous alarm ringing until explicitly stopped
  public startAlarm(ringtoneId: RingtoneId, volume: number = 0.7): { stop: () => void } {
    this.stop();

    const loop = () => {
      const duration = this.playPattern(ringtoneId, volume);
      this.currentLoopTimer = window.setTimeout(loop, duration * 1000);
    };

    loop();

    return {
      stop: () => this.stop(),
    };
  }

  // Stop any active sounds and loops
  public stop(): void {
    if (this.currentLoopTimer) {
      clearTimeout(this.currentLoopTimer);
      this.currentLoopTimer = null;
    }
    this.activeGainNodes.forEach((gain) => {
      try {
        gain.gain.cancelScheduledValues(0);
        gain.gain.value = 0;
      } catch {
        // ignore
      }
    });
    this.activeGainNodes = [];
  }
}

export const soundManager = new AudioSynthesizer();
