import musicFile from '../assets/sounds/music/SCP-x1x.mp3';
import glitterBlast from '../assets/sounds/music/Glitter Blast.mp3';
import staticSound from '../assets/sounds/sfx/static_sound.ogg';
import breathingSound from '../assets/sounds/sfx/breathing.wav';
import zombieNoise1 from '../assets/sounds/zombies/zombienoise1.ogg';
import zombieNoise2 from '../assets/sounds/zombies/zombienoise2.ogg';
import zombieNoise3 from '../assets/sounds/zombies/zombienoise3.ogg';
import fastZombie1 from '../assets/sounds/zombies/fastzombie1.ogg';
import femaleScream1 from '../assets/sounds/voices/scream1.ogg';
import femaleScream2 from '../assets/sounds/voices/scream2.ogg';
import femaleScream3 from '../assets/sounds/voices/scream3.ogg';
import femaleScream4 from '../assets/sounds/voices/scream4.ogg';
import jumpCoinSound from '../assets/sounds/sfx/retro_coin_02.ogg';
import candyCoinSound from '../assets/sounds/sfx/retro_coin_01.ogg';
import heartPowerUpSound from '../assets/sounds/sfx/power_up_04.ogg';
import jawbreakerCollectSound from '../assets/sounds/sfx/power_up_01.ogg';
import jawbreakerExplosionSound from '../assets/sounds/sfx/retro_explosion_01.ogg';
import hitSound from '../assets/sounds/sfx/qubodupImpactMeat02.ogg';
import pumpkinHitSound from '../assets/sounds/sfx/qubodupImpactMeat02.ogg';
import parkAmbienceBirds from '../assets/sounds/ambient/park_ambience_birds.ogg';
import parkAmbienceWind from '../assets/sounds/ambient/park_ambience_wind.ogg';
import treeCreak from '../assets/sounds/ambient/tree_creak.ogg';

export class AudioManager {
    private breathingAudio: HTMLAudioElement | null = null;
    private isBreathing: boolean = false;
    private audioContext: AudioContext | null = null;
    private staticAudioBuffer: AudioBuffer | null = null;
    private staticSourceNode: AudioBufferSourceNode | null = null;
    private staticGainNode: GainNode | null = null;
    private zombieNoises: HTMLAudioElement[] = [];
    private glitterBlastAudio: HTMLAudioElement | null = null;
    private hitSounds: HTMLAudioElement[] = [];
    private hitAudio: HTMLAudioElement | null = null;
    private jumpCoinAudio: HTMLAudioElement | null = null;
    private candyCoinAudio: HTMLAudioElement | null = null;
    private heartPowerUpAudio: HTMLAudioElement | null = null;
    private jawbreakerCollectAudio: HTMLAudioElement | null = null;
    private jawbreakerExplosionAudio: HTMLAudioElement | null = null;
    private pumpkinHitAudio: HTMLAudioElement | null = null;
    private introSounds: HTMLAudioElement[] = [];
    private musicFadeStartVolume: number = 0.8;
    private introMusicPlaying: boolean = false;

    constructor(onIntroSoundLoaded: () => void) {
        this.setupBackgroundMusic();
        this.setupBreathingAudio();
        this.setupStaticAudio();
        this.setupZombieNoises();
        this.setupGlitterBlast();
        this.setupHitSounds();
        this.setupJumpCoinSound();
        this.setupCandyCoinSound();
        this.setupHeartPowerUpSound();
        this.setupJawbreakerCollectSound();
        this.setupJawbreakerExplosionSound();
        this.setupPumpkinHitSound();
        this.setupIntroSounds(onIntroSoundLoaded);
        this.setupClickListener();
    }

    private setupBackgroundMusic(): void {
        const audio = document.getElementById('backgroundMusic') as HTMLAudioElement;
        if (audio && !audio.dataset.setup) {
            audio.dataset.setup = 'true';
            audio.src = musicFile;
            audio.volume = 1;
            audio.loop = true;
            audio.preload = 'auto';
        }
    }

    private setupBreathingAudio(): void {
        this.breathingAudio = new Audio(breathingSound);
        this.breathingAudio.loop = true;
        this.breathingAudio.volume = 0;
        this.breathingAudio.preload = 'auto';
    }

    private setupZombieNoises(): void {
        const zombieSounds = [zombieNoise1, zombieNoise2, zombieNoise3, fastZombie1];
        for (const sound of zombieSounds) {
            const audio = new Audio(sound);
            audio.volume = 0.3;
            audio.preload = 'auto';
            this.zombieNoises.push(audio);
        }
    }

    playRandomZombieNoise(): void {
        if (this.zombieNoises.length === 0) return;
        const randomIndex = Math.floor(Math.random() * this.zombieNoises.length);
        const audio = this.zombieNoises[randomIndex].cloneNode() as HTMLAudioElement;
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Zombie noise play failed:', e));
    }

    private setupHitSounds(): void {
        const screamSounds = [femaleScream1, femaleScream2, femaleScream3, femaleScream4];
        for (const sound of screamSounds) {
            const audio = new Audio(sound);
            audio.volume = 0.7;
            audio.preload = 'auto';
            this.hitSounds.push(audio);
        }

        this.hitAudio = new Audio(hitSound);
        this.hitAudio.volume = 0.6;
        this.hitAudio.preload = 'auto';
    }

    playHitSounds(): void {
        if (this.hitAudio) {
            const hitClone = this.hitAudio.cloneNode() as HTMLAudioElement;
            hitClone.volume = 0.6;
            hitClone.play().catch(e => console.log('Hit sound play failed:', e));
        }

        if (this.hitSounds.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.hitSounds.length);
            const screamClone = this.hitSounds[randomIndex].cloneNode() as HTMLAudioElement;
            screamClone.volume = 0.7;
            screamClone.play().catch(e => console.log('Scream sound play failed:', e));
        }
    }

    private setupJumpCoinSound(): void {
        this.jumpCoinAudio = new Audio(jumpCoinSound);
        this.jumpCoinAudio.volume = 0.5;
        this.jumpCoinAudio.preload = 'auto';
    }

    playJumpCoin(): void {
        console.log('playJumpCoin called, jumpCoinAudio exists:', !!this.jumpCoinAudio);
        if (this.jumpCoinAudio) {
            const coinClone = this.jumpCoinAudio.cloneNode() as HTMLAudioElement;
            coinClone.volume = 0.5;
            coinClone.play().catch(e => console.log('Jump coin sound play failed:', e));
            console.log('Jump coin sound play attempted');
        } else {
            console.log('jumpCoinAudio is null, cannot play sound');
        }
    }

    private setupCandyCoinSound(): void {
        this.candyCoinAudio = new Audio(candyCoinSound);
        this.candyCoinAudio.volume = 0.6;
        this.candyCoinAudio.preload = 'auto';
    }

    playCandyCoin(): void {
        if (this.candyCoinAudio) {
            const coinClone = this.candyCoinAudio.cloneNode() as HTMLAudioElement;
            coinClone.volume = 0.6;
            coinClone.play().catch(e => console.log('Candy coin sound play failed:', e));
        }
    }

    private setupHeartPowerUpSound(): void {
        this.heartPowerUpAudio = new Audio(heartPowerUpSound);
        this.heartPowerUpAudio.volume = 0.7;
        this.heartPowerUpAudio.preload = 'auto';
    }

    private setupJawbreakerCollectSound(): void {
        this.jawbreakerCollectAudio = new Audio(jawbreakerCollectSound);
        this.jawbreakerCollectAudio.volume = 0.6;
        this.jawbreakerCollectAudio.preload = 'auto';
    }

    private setupJawbreakerExplosionSound(): void {
        this.jawbreakerExplosionAudio = new Audio(jawbreakerExplosionSound);
        this.jawbreakerExplosionAudio.volume = 0.8;
        this.jawbreakerExplosionAudio.preload = 'auto';
    }

    playHeartPowerUp(): void {
        if (this.heartPowerUpAudio) {
            const powerUpClone = this.heartPowerUpAudio.cloneNode() as HTMLAudioElement;
            powerUpClone.volume = 0.7;
            powerUpClone.play().catch(e => console.log('Heart power-up sound play failed:', e));
        }
    }

    playJawbreakerCollect(): void {
        if (this.jawbreakerCollectAudio) {
            const collectClone = this.jawbreakerCollectAudio.cloneNode() as HTMLAudioElement;
            collectClone.volume = 0.6;
            collectClone.play().catch(e => console.log('Jawbreaker collect sound play failed:', e));
        }
    }

    playJawbreakerExplosion(): void {
        if (this.jawbreakerExplosionAudio) {
            const explosionClone = this.jawbreakerExplosionAudio.cloneNode() as HTMLAudioElement;
            explosionClone.volume = 0.8;
            explosionClone.play().catch(e => console.log('Jawbreaker explosion sound play failed:', e));
        }
    }

    private setupPumpkinHitSound(): void {
        this.pumpkinHitAudio = new Audio(pumpkinHitSound);
        this.pumpkinHitAudio.volume = 0.8;
        this.pumpkinHitAudio.preload = 'auto';
    }

    playPumpkinHit(): void {
        if (this.pumpkinHitAudio) {
            const hitClone = this.pumpkinHitAudio.cloneNode() as HTMLAudioElement;
            hitClone.volume = 0.8;
            hitClone.play().catch(e => console.log('Pumpkin hit sound play failed:', e));
        }
    }

    private setupIntroSounds(onLoaded: () => void): void {
        const sounds = [parkAmbienceBirds, parkAmbienceWind, treeCreak];
        let loadedCount = 0;
        
        console.log('Setting up intro sounds, expecting', sounds.length, 'sounds');
        
        // Timeout to prevent blocking if sounds don't load
        const timeout = setTimeout(() => {
            console.warn('Intro sounds timed out, proceeding anyway');
            onLoaded();
        }, 5000); // 5 second timeout
        
        for (let i = 0; i < sounds.length; i++) {
            const sound = sounds[i];
            const audio = new Audio(sound);
            audio.volume = 0.4;
            audio.loop = true;
            audio.preload = 'auto';

            audio.addEventListener('canplaythrough', () => {
                loadedCount++;
                console.log(`Intro sound ${i} loaded (${loadedCount}/${sounds.length})`);
                if (loadedCount === sounds.length) {
                    clearTimeout(timeout);
                    console.log('All intro sounds loaded! Calling onLoaded callback');
                    onLoaded();
                }
            });

            audio.addEventListener('error', (e) => {
                console.error(`Intro sound ${i} failed to load:`, e);
                loadedCount++;
                if (loadedCount === sounds.length) {
                    clearTimeout(timeout);
                    console.log('All intro sounds processed (some failed). Calling onLoaded callback');
                    onLoaded();
                }
            });

            this.introSounds.push(audio);
        }
    }

    private setupClickListener(): void {
        document.addEventListener('click', () => {
            this.startIntroSounds();
        });
    }

    startIntroSounds(): void {
        for (let i = 0; i < this.introSounds.length; i++) {
            const audio = this.introSounds[i];
            audio.play().catch(e => console.log(`Intro sound ${i} play failed:`, e));
        }
    }

    stopAllIntroSounds(): void {
        console.log('Stopping all intro sounds');
        for (const audio of this.introSounds) {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0.4; // Reset volume for next time
        }
    }

    playAllIntroSounds(): void {
        console.log('Playing all intro sounds');
        for (const sound of this.introSounds) {
            try {
                sound.currentTime = 0;
                sound.play().catch(e => console.log('Intro sound play failed:', e));
            } catch (e) {
                console.log('Intro sound play error:', e);
            }
        }
    }

    fadeOutIntroSounds(duration: number = 2000): void {
        console.log('Fading out intro sounds over', duration, 'ms');
        for (const sound of this.introSounds) {
            if (sound.volume > 0) {
                const startVolume = sound.volume;
                const fadeStep = startVolume / (duration / 100); // 100 steps over duration
                let currentVolume = startVolume;
                
                const fadeInterval = setInterval(() => {
                    currentVolume -= fadeStep;
                    if (currentVolume <= 0) {
                        currentVolume = 0;
                        sound.volume = 0;
                        sound.pause();
                        clearInterval(fadeInterval);
                    } else {
                        sound.volume = Math.max(0, currentVolume);
                    }
                }, 100);
            }
        }
    }

    setIntroMusicPlaying(playing: boolean): void {
        this.introMusicPlaying = playing;
    }

    getIntroMusicPlaying(): boolean {
        return this.introMusicPlaying;
    }

    private setupGlitterBlast(): void {
        this.glitterBlastAudio = new Audio(glitterBlast);
        this.glitterBlastAudio.volume = this.musicFadeStartVolume;
        this.glitterBlastAudio.loop = true;
        this.glitterBlastAudio.preload = 'auto';
    }

    private setupStaticAudio(): void {
        this.audioContext = new AudioContext();
        this.staticGainNode = this.audioContext.createGain();
        this.staticGainNode.connect(this.audioContext.destination);
        this.staticGainNode.gain.value = 0.8;

        fetch(staticSound)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext!.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.staticAudioBuffer = this.trimSilence(audioBuffer);
            })
            .catch(e => console.error('Failed to load static audio:', e));
    }

    private trimSilence(buffer: AudioBuffer): AudioBuffer {
        const threshold = 0.001;
        const channels = buffer.numberOfChannels;
        const data = buffer.getChannelData(0);

        let start = 0;
        let end = buffer.length;

        for (let i = 0; i < buffer.length - 1; i++) {
            if (Math.abs(data[i]) > threshold) {
                for (let j = i; j < Math.min(i + 100, buffer.length - 1); j++) {
                    if ((data[j] >= 0 && data[j + 1] < 0) || (data[j] < 0 && data[j + 1] >= 0)) {
                        start = j;
                        break;
                    }
                }
                break;
            }
        }

        for (let i = buffer.length - 1; i >= 1; i--) {
            if (Math.abs(data[i]) > threshold) {
                for (let j = i; j > Math.max(i - 100, 0); j--) {
                    if ((data[j] >= 0 && data[j - 1] < 0) || (data[j] < 0 && data[j - 1] >= 0)) {
                        end = j;
                        break;
                    }
                }
                break;
            }
        }

        const length = end - start;
        const trimmed = this.audioContext!.createBuffer(channels, length, buffer.sampleRate);

        for (let ch = 0; ch < channels; ch++) {
            trimmed.copyToChannel(buffer.getChannelData(ch).slice(start, end), ch);
        }

        return trimmed;
    }

    playStaticAudio(): void {
        if (!this.audioContext || !this.staticAudioBuffer || !this.staticGainNode) return;

        this.stopStaticAudio();

        this.staticSourceNode = this.audioContext.createBufferSource();
        this.staticSourceNode.buffer = this.staticAudioBuffer;
        this.staticSourceNode.loop = true;
        this.staticSourceNode.connect(this.staticGainNode);
        this.staticSourceNode.start(0);
    }

    stopStaticAudio(): void {
        if (this.staticSourceNode) {
            try {
                this.staticSourceNode.stop();
                this.staticSourceNode.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
            this.staticSourceNode = null;
        }
    }

    updateBreathingAudio(isMovingDown: boolean, deltaMultiplier: number, isGameOver: boolean): void {
        if (!this.breathingAudio || isGameOver) return;

        const fadeSpeed = 0.02 * deltaMultiplier;
        
        if (isMovingDown) {
            if (!this.isBreathing) {
                this.isBreathing = true;
                this.breathingAudio.play().catch(e => console.log('Breathing audio play failed:', e));
            }
            if (this.breathingAudio.volume < 0.6) {
                this.breathingAudio.volume = Math.min(0.6, this.breathingAudio.volume + fadeSpeed);
            }
        } else {
            if (this.breathingAudio.volume > 0) {
                this.breathingAudio.volume = Math.max(0, this.breathingAudio.volume - fadeSpeed);
            }
            if (this.breathingAudio.volume === 0 && this.isBreathing) {
                this.isBreathing = false;
                this.breathingAudio.pause();
                this.breathingAudio.currentTime = 0;
            }
        }
    }

    stopBreathing(): void {
        if (this.breathingAudio) {
            this.breathingAudio.pause();
            this.breathingAudio.currentTime = 0;
            this.breathingAudio.volume = 0;
            this.isBreathing = false;
        }
    }

    pauseAllSounds(): void {
        console.log('Pausing all sounds');
        // Stop breathing
        this.stopBreathing();
        
        // Stop static audio
        this.stopStaticAudio();
        
        // Stop zombie noises
        for (const noise of this.zombieNoises) {
            noise.pause();
            noise.currentTime = 0;
        }
        
        // Stop hit sounds
        for (const hitSound of this.hitSounds) {
            hitSound.pause();
            hitSound.currentTime = 0;
        }
        
        // Stop other audio elements
        if (this.jumpCoinAudio) {
            this.jumpCoinAudio.pause();
            this.jumpCoinAudio.currentTime = 0;
        }
        if (this.candyCoinAudio) {
            this.candyCoinAudio.pause();
            this.candyCoinAudio.currentTime = 0;
        }
        if (this.heartPowerUpAudio) {
            this.heartPowerUpAudio.pause();
            this.heartPowerUpAudio.currentTime = 0;
        }
        if (this.pumpkinHitAudio) {
            this.pumpkinHitAudio.pause();
            this.pumpkinHitAudio.currentTime = 0;
        }
    }
}

