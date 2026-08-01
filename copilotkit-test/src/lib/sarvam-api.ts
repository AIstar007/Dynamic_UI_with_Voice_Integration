export interface SarvamResponse {
  original_text: string;
  translated_text?: string;
  source_language: string;
  target_language?: string;
  audio_data?: string; // base64 encoded
  detected_language?: string;
}

export interface SpeechToTextResponse {
  transcript: string;
  detected_language?: string;
}

export class SarvamAIService {
  private apiKey: string;
  private baseUrl = 'https://api.sarvam.ai';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_SARVAM_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Sarvam API key not found');
    }
  }

  private getLanguageCode(lang: string): string {
    const languageCodes: Record<string, string> = {
      'auto': 'auto',
      'en': 'en-IN',
      'hi': 'hi-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'kn': 'kn-IN',
      'ml': 'ml-IN',
      'mr': 'mr-IN',
      'od': 'od-IN',
      'pa': 'pa-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
    };
    return languageCodes[lang.toLowerCase()] || lang;
  }

  async speechToText(audioBlob: Blob, expectedLanguage?: string): Promise<SpeechToTextResponse | null> {
    try {
      console.log('Starting Sarvam speech-to-text...');
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      
      if (expectedLanguage && expectedLanguage !== 'auto') {
        const langCode = this.getLanguageCode(expectedLanguage);
        formData.append('language', langCode);
      }

      const response = await fetch(`${this.baseUrl}/speech-to-text`, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Sarvam speech-to-text result:', result);
        return {
          transcript: result.transcript,
          detected_language: result.detected_language || result.language_code,
        };
      }
      
      console.error('Speech to text error:', response.status, await response.text());
      
      // Fallback to browser speech recognition if Sarvam fails
      return await this.fallbackSpeechRecognition(audioBlob);
    } catch (error) {
      console.error('Error in speech to text:', error);
      // Fallback to browser speech recognition
      return await this.fallbackSpeechRecognition(audioBlob);
    }
  }

  private async fallbackSpeechRecognition(audioBlob: Blob): Promise<SpeechToTextResponse | null> {
    console.log('Using fallback speech recognition...');
    return new Promise((resolve) => {
      // Create a simple fallback using Web Speech API
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        resolve(null);
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        resolve({
          transcript,
          detected_language: 'en'
        });
      };

      recognition.onerror = () => {
        resolve(null);
      };

      // For fallback, we'll use the microphone directly
      // This is a simplified version - in production you'd want better audio handling
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          recognition.start();
        })
        .catch(() => {
          resolve(null);
        });
    });
  }

  async translateText(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: text,
          source_language_code: this.getLanguageCode(sourceLang),
          target_language_code: this.getLanguageCode(targetLang),
          mode: 'formal',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return result.translated_text;
      }
      
      console.error('Translation error:', await response.text());
      return null;
    } catch (error) {
      console.error('Error in translation:', error);
      return null;
    }
  }

  async textToSpeech(text: string, lang: string = 'en-IN', speaker: string = 'anushka'): Promise<Blob | null> {
    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech`, {
        method: 'POST',
        headers: {
          'api-subscription-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          target_language_code: this.getLanguageCode(lang),
          speaker,
          pitch: 0,
          pace: 1,
          loudness: 1,
          speech_sample_rate: 22050,
          enable_preprocessing: true,
          model: 'bulbul:v2',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const audioBase64 = result.audios?.[0];
        
        if (audioBase64) {
          // Convert base64 to blob
          const binaryString = atob(audioBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return new Blob([bytes], { type: 'audio/wav' });
        }
      }
      
      console.error('Text to speech error:', await response.text());
      return null;
    } catch (error) {
      console.error('Error in text to speech:', error);
      return null;
    }
  }

  detectLanguage(text: string): string {
    // Simple language detection based on character patterns
    const patterns = {
      hi: /[\u0900-\u097F]/,
      bn: /[\u0980-\u09FF]/,
      gu: /[\u0A80-\u0AFF]/,
      kn: /[\u0C80-\u0CFF]/,
      ml: /[\u0D00-\u0D7F]/,
      mr: /[\u0900-\u097F]/,
      ta: /[\u0B80-\u0BFF]/,
      te: /[\u0C00-\u0C7F]/,
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }
}