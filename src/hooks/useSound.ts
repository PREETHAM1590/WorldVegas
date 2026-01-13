'use client';

import { useCallback, useRef, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Sound settings store
 */
interface SoundSettingsState {
  enabled: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleSound: () => void;
}

export const useSoundSettings = create<SoundSettingsState>()(
  persist(
    (set, get) => ({
      enabled: true,
      volume: 0.7,
      setEnabled: (enabled) => set({ enabled }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
      toggleSound: () => set({ enabled: !get().enabled }),
    }),
    {
      name: 'worldvegas-sound-settings',
    }
  )
);

/**
 * Sound types available in the app - organized by game
 */
export type SoundType =
  // General sounds
  | 'click'
  | 'buttonClick'
  | 'win'
  | 'bigWin'
  | 'jackpot'
  | 'lose'
  | 'coinDrop'
  | 'levelUp'
  // Slots sounds
  | 'spin'
  | 'reelStop'
  | 'slotLever'
  | 'slotNearWin'
  // Blackjack sounds
  | 'cardDeal'
  | 'cardFlip'
  | 'cardShuffle'
  | 'blackjackHit'
  | 'blackjackStand'
  | 'blackjackBust'
  | 'blackjackBlackjack'
  // Chip/betting sounds
  | 'chip'
  | 'chipStack'
  | 'betPlace'
  // Aviator sounds
  | 'aviatorTakeoff'
  | 'aviatorFlying'
  | 'aviatorCrash'
  | 'aviatorCashout'
  | 'aviatorCountdown'
  // Coin flip sounds
  | 'coinFlip'
  | 'coinLand'
  | 'coinSpin'
  // Dice sounds
  | 'diceRoll'
  | 'diceHit'
  | 'diceBounce'
  // Roulette sounds
  | 'rouletteSpin'
  | 'rouletteBall'
  | 'rouletteStop'
  | 'rouletteClick'
  // Mines sounds
  | 'mineReveal'
  | 'mineGem'
  | 'mineExplosion'
  | 'mineSweep';

/**
 * Audio Context for Web Audio API - generates real sounds
 */
class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  resume() {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  // ============ GENERAL SOUNDS ============

  // Button click
  playClick() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 1000;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }

  // Win sound - happy ascending tones
  playWinSound() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
    });
  }

  // Big win - fanfare
  playBigWinSound() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const melody = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 659.25, time: 0.15, dur: 0.15 },
      { freq: 783.99, time: 0.3, dur: 0.15 },
      { freq: 1046.50, time: 0.45, dur: 0.3 },
      { freq: 783.99, time: 0.75, dur: 0.1 },
      { freq: 1046.50, time: 0.85, dur: 0.4 },
    ];

    melody.forEach(({ freq, time, dur }) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      const startTime = now + time;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0.15, startTime + dur * 0.5);
      gain.gain.linearRampToValueAtTime(0, startTime + dur);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + dur + 0.1);
    });
  }

  // Jackpot celebration
  playJackpotSound() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 5; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = i % 2 === 0 ? 'sine' : 'triangle';
      const baseFreq = 400 + (i * 200);
      oscillator.frequency.setValueAtTime(baseFreq, now);
      oscillator.frequency.linearRampToValueAtTime(baseFreq * 2, now + 1);

      gain.gain.setValueAtTime(0.15 / (i + 1), now);
      gain.gain.linearRampToValueAtTime(0, now + 1.5);

      oscillator.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start(now + i * 0.1);
      oscillator.stop(now + 1.5);
    }
  }

  // Lose sound - sad descending
  playLoseSound() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, now);
    oscillator.frequency.linearRampToValueAtTime(200, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }

  // Coin drop
  playCoinDrop() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    [0, 0.1, 0.18, 0.24, 0.28].forEach((delay, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      const freq = 3000 - (i * 300);
      oscillator.frequency.setValueAtTime(freq, now + delay);
      oscillator.frequency.exponentialRampToValueAtTime(freq * 0.5, now + delay + 0.05);

      const vol = 0.15 * (1 - i * 0.15);
      gain.gain.setValueAtTime(vol, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.08);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(now + delay);
      oscillator.stop(now + delay + 0.1);
    });
  }

  // Level up / achievement
  playLevelUp() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.linearRampToValueAtTime(0.1, startTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.25);
    });
  }

  // ============ SLOTS SOUNDS ============

  // Slot machine spinning sound
  playSpinSound(duration: number = 2000) {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.linearRampToValueAtTime(100, now + duration / 1000);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.05, now + duration / 1000);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
  }

  // Reel stop click
  playReelStop() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.1);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // Slot lever pull
  playSlotLever() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, now);
    oscillator.frequency.linearRampToValueAtTime(80, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.35);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.35);
  }

  // Near win tension
  playSlotNearWin() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 3; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 600 + i * 100;

      const startTime = now + i * 0.15;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.12);

      oscillator.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    }
  }

  // ============ BLACKJACK SOUNDS ============

  // Card deal - swoosh
  playCardDeal() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const bufferSize = this.audioContext.sampleRate * 0.1;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 2000;

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(now);
  }

  // Card flip
  playCardFlip() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(2000, now);
    oscillator.frequency.exponentialRampToValueAtTime(500, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // Card shuffle
  playCardShuffle() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 8; i++) {
      const bufferSize = this.audioContext.sampleRate * 0.05;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * (1 - j / bufferSize) * 0.3;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 3000;

      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(0.1, now + i * 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNode);

      noise.start(now + i * 0.06);
    }
  }

  // Blackjack hit
  playBlackjackHit() {
    this.playCardDeal();
  }

  // Blackjack stand - soft confirmation
  playBlackjackStand() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 800;

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.2);
  }

  // Blackjack bust
  playBlackjackBust() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const notes = [400, 300, 200];

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'square';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.15);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.15);
    });
  }

  // Got blackjack!
  playBlackjackBlackjack() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const notes = [659.25, 783.99, 987.77, 1318.51]; // E5, G5, B5, E6

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.03);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.25);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    });
  }

  // ============ CHIP/BETTING SOUNDS ============

  // Chip sound
  playChip() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(4000, now);
    oscillator.frequency.exponentialRampToValueAtTime(1500, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // Chip stack - multiple chips
  playChipStack() {
    if (!this.audioContext || !this.gainNode) return;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playChip(), i * 50);
    }
  }

  // Bet place
  playBetPlace() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Chip place sound
    const osc1 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(3000, now);
    osc1.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(this.gainNode);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Confirmation tone
    const osc2 = this.audioContext.createOscillator();
    const gain2 = this.audioContext.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = 600;
    gain2.gain.setValueAtTime(0.1, now + 0.05);
    gain2.gain.linearRampToValueAtTime(0, now + 0.15);
    osc2.connect(gain2);
    gain2.connect(this.gainNode);
    osc2.start(now + 0.05);
    osc2.stop(now + 0.15);
  }

  // ============ AVIATOR SOUNDS ============

  // Aviator takeoff - engine starting
  playAviatorTakeoff() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(80, now);
    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
    oscillator.frequency.exponentialRampToValueAtTime(150, now + 1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.3);
    gain.gain.linearRampToValueAtTime(0.15, now + 1);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 1);
  }

  // Aviator flying - continuous engine
  playAviatorFlying() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    const gain = this.audioContext.createGain();

    // Main engine sound
    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 120;

    // LFO for vibration effect
    lfo.frequency.value = 15;
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    gain.gain.setValueAtTime(0.12, now);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    lfo.start(now);
    oscillator.start(now);
    oscillator.stop(now + 0.5);
    lfo.stop(now + 0.5);
  }

  // Aviator crash - explosion
  playAviatorCrash() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Explosion noise
    const bufferSize = this.audioContext.sampleRate * 0.5;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(now);

    // Low boom
    const oscillator = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(100, now);
    oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.3);
    oscGain.gain.setValueAtTime(0.3, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
    oscillator.connect(oscGain);
    oscGain.connect(this.gainNode);
    oscillator.start(now);
    oscillator.stop(now + 0.4);
  }

  // Aviator cashout - success ding
  playAviatorCashout() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const notes = [880, 1108.73, 1318.51]; // A5, C#6, E6

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.3);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.35);
    });
  }

  // Aviator countdown beep
  playAviatorCountdown() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 880;

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // ============ COIN FLIP SOUNDS ============

  // Coin flip - whoosh with metallic sound
  playCoinFlip() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Metallic spinning sound
    for (let i = 0; i < 10; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 2000 + Math.sin(i * 0.5) * 500;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0.1 * (1 - i * 0.08), startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.06);

      oscillator.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.08);
    }
  }

  // Coin land
  playCoinLand() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Impact
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(3000, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.05);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.15);

    // Ring
    const ring = this.audioContext.createOscillator();
    const ringGain = this.audioContext.createGain();

    ring.type = 'sine';
    ring.frequency.value = 2500;

    ringGain.gain.setValueAtTime(0.15, now);
    ringGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    ring.connect(ringGain);
    ringGain.connect(this.gainNode);

    ring.start(now);
    ring.stop(now + 0.3);
  }

  // Coin spinning on table
  playCoinSpin() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 15; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      const rate = 1 - (i / 15);
      oscillator.type = 'sine';
      oscillator.frequency.value = 1500 + rate * 1000;

      const startTime = now + (i * 0.05 * (1 + i * 0.1));
      gain.gain.setValueAtTime(0.15 * rate, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.04);

      oscillator.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.05);
    }
  }

  // ============ DICE SOUNDS ============

  // Dice roll - shaking
  playDiceRoll() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 12; i++) {
      const bufferSize = this.audioContext.sampleRate * 0.03;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const data = buffer.getChannelData(0);

      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.5;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000 + Math.random() * 2000;
      filter.Q.value = 5;

      const gain = this.audioContext.createGain();
      const startTime = now + i * 0.04 + Math.random() * 0.02;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.03);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.gainNode);

      noise.start(startTime);
    }
  }

  // Dice hit table
  playDiceHit() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(300, now);
    oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  }

  // Dice bounce
  playDiceBounce() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const bounces = [0, 0.12, 0.2, 0.26];

    bounces.forEach((delay, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.value = 250 - i * 30;

      const startTime = now + delay;
      const vol = 0.2 * (1 - i * 0.2);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.1);
    });
  }

  // ============ ROULETTE SOUNDS ============

  // Roulette wheel spin
  playRouletteSpin() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();
    const gain = this.audioContext.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.value = 100;

    lfo.frequency.setValueAtTime(20, now);
    lfo.frequency.linearRampToValueAtTime(5, now + 3);
    lfoGain.gain.value = 50;

    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 3);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    lfo.start(now);
    oscillator.start(now);
    oscillator.stop(now + 3);
    lfo.stop(now + 3);
  }

  // Roulette ball rolling
  playRouletteBall() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 20; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      const speed = 1 - (i / 20);
      oscillator.frequency.value = 2500 + speed * 1000 + Math.random() * 200;

      const interval = 0.08 + (i * 0.015);
      const startTime = now + (i * interval);
      gain.gain.setValueAtTime(0.1 * speed + 0.05, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.03);

      oscillator.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.05);
    }
  }

  // Roulette ball stops
  playRouletteStop() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Final ball drop
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(3000, now);
    oscillator.frequency.exponentialRampToValueAtTime(1000, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.2);

    // Settle bounces
    [0.15, 0.25, 0.32].forEach((delay, i) => {
      const osc = this.audioContext!.createOscillator();
      const g = this.audioContext!.createGain();

      osc.type = 'sine';
      osc.frequency.value = 2000 - i * 300;

      const startTime = now + delay;
      g.gain.setValueAtTime(0.1 * (1 - i * 0.25), startTime);
      g.gain.exponentialRampToValueAtTime(0.01, startTime + 0.05);

      osc.connect(g);
      g.connect(this.gainNode!);

      osc.start(startTime);
      osc.stop(startTime + 0.08);
    });
  }

  // Roulette wheel click (pockets)
  playRouletteClick() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = 3500;

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.03);
  }

  // ============ MINES SOUNDS ============

  // Mine reveal - tile flip
  playMineReveal() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.1);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    oscillator.connect(gain);
    gain.connect(this.gainNode);

    oscillator.start(now);
    oscillator.stop(now + 0.12);
  }

  // Found gem - happy sparkle
  playMineGem() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;
    const notes = [1046.50, 1318.51, 1567.98]; // C6, E6, G6

    notes.forEach((freq, i) => {
      const oscillator = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.05;
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.15);

      oscillator.connect(gain);
      gain.connect(this.gainNode!);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    });
  }

  // Mine explosion
  playMineExplosion() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    // Explosion noise
    const bufferSize = this.audioContext.sampleRate * 0.4;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const gain = this.audioContext.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.gainNode);

    noise.start(now);

    // Low boom
    const oscillator = this.audioContext.createOscillator();
    const oscGain = this.audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(80, now);
    oscillator.frequency.exponentialRampToValueAtTime(20, now + 0.25);
    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    oscillator.connect(oscGain);
    oscGain.connect(this.gainNode);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  // Mine sweep - reveal all gems at cashout
  playMineSweep() {
    if (!this.audioContext || !this.gainNode) return;

    const now = this.audioContext.currentTime;

    for (let i = 0; i < 5; i++) {
      const oscillator = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 1000 + i * 200;

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.linearRampToValueAtTime(0, startTime + 0.1);

      oscillator.connect(gain);
      gain.connect(this.gainNode);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.12);
    }
  }
}

// Singleton sound generator
let soundGenerator: SoundGenerator | null = null;

function getSoundGenerator(): SoundGenerator {
  if (!soundGenerator) {
    soundGenerator = new SoundGenerator();
  }
  return soundGenerator;
}

/**
 * Hook for playing sounds in the app
 */
export function useSound() {
  const { enabled, volume } = useSoundSettings();
  const generatorRef = useRef<SoundGenerator | null>(null);

  // Initialize on mount
  useEffect(() => {
    generatorRef.current = getSoundGenerator();

    const handleInteraction = () => {
      if (generatorRef.current) {
        generatorRef.current.init();
        generatorRef.current.resume();
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.setVolume(volume);
    }
  }, [volume]);

  /**
   * Play a sound effect
   */
  const play = useCallback(
    (type: SoundType) => {
      if (!enabled || !generatorRef.current) return;

      generatorRef.current.init();
      generatorRef.current.setVolume(volume);

      switch (type) {
        // General
        case 'click':
        case 'buttonClick':
          generatorRef.current.playClick();
          break;
        case 'win':
          generatorRef.current.playWinSound();
          break;
        case 'bigWin':
          generatorRef.current.playBigWinSound();
          break;
        case 'jackpot':
          generatorRef.current.playJackpotSound();
          break;
        case 'lose':
          generatorRef.current.playLoseSound();
          break;
        case 'coinDrop':
          generatorRef.current.playCoinDrop();
          break;
        case 'levelUp':
          generatorRef.current.playLevelUp();
          break;

        // Slots
        case 'spin':
          generatorRef.current.playSpinSound();
          break;
        case 'reelStop':
          generatorRef.current.playReelStop();
          break;
        case 'slotLever':
          generatorRef.current.playSlotLever();
          break;
        case 'slotNearWin':
          generatorRef.current.playSlotNearWin();
          break;

        // Blackjack
        case 'cardDeal':
          generatorRef.current.playCardDeal();
          break;
        case 'cardFlip':
          generatorRef.current.playCardFlip();
          break;
        case 'cardShuffle':
          generatorRef.current.playCardShuffle();
          break;
        case 'blackjackHit':
          generatorRef.current.playBlackjackHit();
          break;
        case 'blackjackStand':
          generatorRef.current.playBlackjackStand();
          break;
        case 'blackjackBust':
          generatorRef.current.playBlackjackBust();
          break;
        case 'blackjackBlackjack':
          generatorRef.current.playBlackjackBlackjack();
          break;

        // Chips
        case 'chip':
          generatorRef.current.playChip();
          break;
        case 'chipStack':
          generatorRef.current.playChipStack();
          break;
        case 'betPlace':
          generatorRef.current.playBetPlace();
          break;

        // Aviator
        case 'aviatorTakeoff':
          generatorRef.current.playAviatorTakeoff();
          break;
        case 'aviatorFlying':
          generatorRef.current.playAviatorFlying();
          break;
        case 'aviatorCrash':
          generatorRef.current.playAviatorCrash();
          break;
        case 'aviatorCashout':
          generatorRef.current.playAviatorCashout();
          break;
        case 'aviatorCountdown':
          generatorRef.current.playAviatorCountdown();
          break;

        // Coin flip
        case 'coinFlip':
          generatorRef.current.playCoinFlip();
          break;
        case 'coinLand':
          generatorRef.current.playCoinLand();
          break;
        case 'coinSpin':
          generatorRef.current.playCoinSpin();
          break;

        // Dice
        case 'diceRoll':
          generatorRef.current.playDiceRoll();
          break;
        case 'diceHit':
          generatorRef.current.playDiceHit();
          break;
        case 'diceBounce':
          generatorRef.current.playDiceBounce();
          break;

        // Roulette
        case 'rouletteSpin':
          generatorRef.current.playRouletteSpin();
          break;
        case 'rouletteBall':
          generatorRef.current.playRouletteBall();
          break;
        case 'rouletteStop':
          generatorRef.current.playRouletteStop();
          break;
        case 'rouletteClick':
          generatorRef.current.playRouletteClick();
          break;

        // Mines
        case 'mineReveal':
          generatorRef.current.playMineReveal();
          break;
        case 'mineGem':
          generatorRef.current.playMineGem();
          break;
        case 'mineExplosion':
          generatorRef.current.playMineExplosion();
          break;
        case 'mineSweep':
          generatorRef.current.playMineSweep();
          break;
      }
    },
    [enabled, volume]
  );

  /**
   * Stop all sounds
   */
  const stopAll = useCallback(() => {
    // Web Audio API sounds are self-terminating
  }, []);

  return {
    play,
    stopAll,
    enabled,
    volume,
  };
}

/**
 * Initialize sounds on app load
 */
export function initSounds() {
  if (typeof window !== 'undefined') {
    getSoundGenerator();
  }
}

/**
 * Game-specific sound helpers
 */
export const GameSounds = {
  slots: {
    lever: 'slotLever' as SoundType,
    spin: 'spin' as SoundType,
    reelStop: 'reelStop' as SoundType,
    nearWin: 'slotNearWin' as SoundType,
    win: 'win' as SoundType,
    bigWin: 'bigWin' as SoundType,
    jackpot: 'jackpot' as SoundType,
  },
  blackjack: {
    deal: 'cardDeal' as SoundType,
    flip: 'cardFlip' as SoundType,
    shuffle: 'cardShuffle' as SoundType,
    hit: 'blackjackHit' as SoundType,
    stand: 'blackjackStand' as SoundType,
    bust: 'blackjackBust' as SoundType,
    blackjack: 'blackjackBlackjack' as SoundType,
    win: 'win' as SoundType,
    lose: 'lose' as SoundType,
  },
  aviator: {
    takeoff: 'aviatorTakeoff' as SoundType,
    flying: 'aviatorFlying' as SoundType,
    crash: 'aviatorCrash' as SoundType,
    cashout: 'aviatorCashout' as SoundType,
    countdown: 'aviatorCountdown' as SoundType,
  },
  coinflip: {
    flip: 'coinFlip' as SoundType,
    land: 'coinLand' as SoundType,
    spin: 'coinSpin' as SoundType,
    win: 'win' as SoundType,
    lose: 'lose' as SoundType,
  },
  dice: {
    roll: 'diceRoll' as SoundType,
    hit: 'diceHit' as SoundType,
    bounce: 'diceBounce' as SoundType,
    win: 'win' as SoundType,
    lose: 'lose' as SoundType,
  },
  roulette: {
    spin: 'rouletteSpin' as SoundType,
    ball: 'rouletteBall' as SoundType,
    stop: 'rouletteStop' as SoundType,
    click: 'rouletteClick' as SoundType,
    win: 'win' as SoundType,
    lose: 'lose' as SoundType,
  },
  mines: {
    reveal: 'mineReveal' as SoundType,
    gem: 'mineGem' as SoundType,
    explosion: 'mineExplosion' as SoundType,
    sweep: 'mineSweep' as SoundType,
    win: 'win' as SoundType,
  },
  betting: {
    chip: 'chip' as SoundType,
    chipStack: 'chipStack' as SoundType,
    betPlace: 'betPlace' as SoundType,
  },
};
