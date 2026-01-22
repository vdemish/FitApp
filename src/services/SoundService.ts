import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

let countdownSound: Audio.Sound | null = null;
let isLoading = false;
let audioConfigured = false;

async function configureAudioMode() {
    if (audioConfigured) return;

    await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        playThroughEarpieceAndroid: false,
    });

    audioConfigured = true;
}

export async function prepareCountdownSound() {
    if (countdownSound || isLoading) return;
    isLoading = true;

    try {
        await configureAudioMode();
        const { sound } = await Audio.Sound.createAsync(
            require('../../assets/sounds/countdown.wav'),
            { shouldPlay: false }
        );
        countdownSound = sound;
    } catch (error) {
        console.error('[SoundService] Failed to load countdown sound', error);
    } finally {
        isLoading = false;
    }
}

export async function playCountdownSound() {
    await prepareCountdownSound();
    if (!countdownSound) return;

    try {
        await countdownSound.setPositionAsync(0);
        await countdownSound.playAsync();
    } catch (error) {
        console.error('[SoundService] Failed to play countdown sound', error);
    }
}
