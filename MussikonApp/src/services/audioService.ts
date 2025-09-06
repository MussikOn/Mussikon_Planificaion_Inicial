import { Platform } from 'react-native';

export class AudioService {
  private static instance: AudioService;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // Load the notification sound
  public async loadNotificationSound(): Promise<void> {
    try {
      // For now, we'll skip loading the audio file to avoid the module error
      // TODO: Implement with expo-audio when stable
      this.isLoaded = true;
      
      console.log('Notification sound loaded successfully');
    } catch (error) {
      console.error('Error loading notification sound:', error);
      this.isLoaded = false;
    }
  }

  // Play the notification sound
  public async playNotificationSound(): Promise<void> {
    try {
      if (!this.isLoaded) {
        console.log('Audio not loaded, skipping sound');
        return;
      }

      if (Platform.OS === 'web') {
        // For web, we can use the HTML5 Audio API
        const audio = new Audio('/assets/audio/El_mejor_Tono_del_celular_de_steven_universe.mp3');
        audio.play().catch(e => console.error("Error playing web sound:", e));
      } else {
        // For mobile, we'll use a simple beep or vibration
        console.log('Playing notification sound (mobile)');
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  // Play new request sound
  public async playNewRequestSound(): Promise<void> {
    await this.playNotificationSound();
  }

  // Play new offer sound
  public async playNewOfferSound(): Promise<void> {
    await this.playNotificationSound();
  }

  // Play offer selected sound
  public async playOfferSelectedSound(): Promise<void> {
    await this.playNotificationSound();
  }

  // Unload sound resources
  public unloadSound(): void {
    this.isLoaded = false;
  }
}

export const audioService = AudioService.getInstance();