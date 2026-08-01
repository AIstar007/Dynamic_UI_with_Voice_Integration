import { useState, useRef, useCallback } from 'react';
import { SarvamAIService, type SarvamResponse } from '@/lib/sarvam-api';

export interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  detectedLanguage?: string;
  transcript?: string;
  translatedText?: string;
  error?: string;
}

export const useSarvamVoice = () => {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const sarvamService = useRef(new SarvamAIService());
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Clean up the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        setVoiceState(prev => ({ 
          ...prev, 
          error: 'Recording error occurred',
          isListening: false,
          isProcessing: false 
        }));
      };

      mediaRecorder.start(1000); // Collect data every 1000ms
      mediaRecorderRef.current = mediaRecorder;
      
      setVoiceState(prev => ({ ...prev, isListening: true, error: undefined }));
    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Could not access microphone. Please check permissions.' 
      }));
    }
  }, []);

  const stopRecording = useCallback(() => {
    console.log('Stopping recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    // Clean up stream immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setVoiceState(prev => ({ ...prev, isListening: false, isProcessing: true }));
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));
      
      // Step 1: Convert speech to text with language detection
      const speechResult = await sarvamService.current.speechToText(audioBlob);
      
      if (!speechResult?.transcript) {
        throw new Error('Failed to convert speech to text');
      }

      const detectedLang = speechResult.detected_language ? 
                          speechResult.detected_language.split('-')[0].toLowerCase() : 
                          sarvamService.current.detectLanguage(speechResult.transcript);
      
      setVoiceState(prev => ({
        ...prev,
        transcript: speechResult.transcript,
        detectedLanguage: detectedLang,
        isProcessing: false
      }));

      return {
        transcript: speechResult.transcript,
        detectedLanguage: detectedLang,
        originalAudio: audioBlob,
      };
    } catch (error) {
      console.error('Error processing audio:', error);
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Failed to process audio',
        isProcessing: false 
      }));
      return null;
    }
  }, []);

  const translateAndSpeak = useCallback(async (
    text: string, 
    sourceLang: string, 
    targetLang: string = 'en',
    speaker: string = 'anushka'
  ) => {
    try {
      setVoiceState(prev => ({ ...prev, isProcessing: true }));

      // Translate text if source and target languages are different
      let finalText = text;
      if (sourceLang !== targetLang) {
        const translatedText = await sarvamService.current.translateText(text, sourceLang, targetLang);
        if (translatedText) {
          finalText = translatedText;
          setVoiceState(prev => ({ ...prev, translatedText }));
        }
      }

      // Convert to speech
      const audioBlob = await sarvamService.current.textToSpeech(finalText, targetLang, speaker);
      
      if (audioBlob) {
        // Play the audio
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      }

      setVoiceState(prev => ({ ...prev, isProcessing: false }));
      return finalText;
    } catch (error) {
      console.error('Error in translate and speak:', error);
      setVoiceState(prev => ({ 
        ...prev, 
        error: 'Failed to translate and speak',
        isProcessing: false 
      }));
      return null;
    }
  }, []);

  const resetState = useCallback(() => {
    console.log('Resetting voice state');
    setVoiceState({
      isListening: false,
      isProcessing: false,
      detectedLanguage: undefined,
      transcript: undefined,
      translatedText: undefined,
      error: undefined,
    });
  }, []);

  return {
    voiceState,
    startRecording,
    stopRecording,
    translateAndSpeak,
    resetState,
  };
};