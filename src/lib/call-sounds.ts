// Web Audio API ভিত্তিক সাউন্ড জেনারেটর (Zero External MP3 Dependency)

class CallSoundManager {
  private audioCtx: AudioContext | null = null;
  private ringInterval: NodeJS.Timeout | null = null;
  private isPlaying: boolean = false;

  private initContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // ১. ইনকামিং কল রিংটোন (Melodic Dual-Chime Loop)
  playIncomingRingtone(): void {
    if (this.isPlaying) this.stopAll();
    this.isPlaying = true;

    const ctx = this.initContext();
    if (!ctx) return;

    const playChimeSequence = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      // নোট ফ্রিকোয়েন্সি: E5 (659Hz) -> G#5 (830Hz) -> B5 (987Hz)
      const notes = [659.25, 830.61, 987.77, 659.25];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.4);
      });
    };

    playChimeSequence();
    // প্রতি ৩ সেকেন্ড পর পর লুপ হবে
    this.ringInterval = setInterval(playChimeSequence, 3000);
  }

  // ২. আউটগোয়িং কল ডায়াল টোন (Standard European/Telecom Ringback Tone: 440Hz + 480Hz)
  playOutgoingRingback(): void {
    if (this.isPlaying) this.stopAll();
    this.isPlaying = true;

    const ctx = this.initContext();
    if (!ctx) return;

    const playTone = () => {
      if (!this.isPlaying) return;
      const now = ctx.currentTime;

      // ডুয়াল ফ্রিকোয়েন্সি অসিলেটর
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      // ১.৫ সেকেন্ড রিং হবে, ২ সেকেন্ড বিরতি থাকবে
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.setValueAtTime(0.12, now + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    };

    playTone();
    this.ringInterval = setInterval(playTone, 3500);
  }

  // ৩. কল ডিসকানেক্ট / রিজেক্ট বিপ সাউন্ড (3 Fast Beeps: 480Hz)
  playCallEndedBeep(): void {
    this.stopAll();

    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const beepTimes = [0, 0.22, 0.44];

    beepTimes.forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(480, now + delay);

      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.18);
    });
  }

  // সব সাউন্ড থামানো
  stopAll(): void {
    this.isPlaying = false;
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }
}

export const callSounds = new CallSoundManager();
