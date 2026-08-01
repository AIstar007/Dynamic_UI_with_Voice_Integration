'use client';
 
import { DynamicForm } from '@/util/dynamic';
import PDPPage from '@/util/upgrade';
import IndigoPassengerDetails from '@/util/pdp';
import { useFrontendTool, useCopilotChat } from '@copilotkit/react-core';
import { type InputProps, CopilotSidebar } from '@copilotkit/react-ui';
import { useState, useRef, useCallback, useEffect } from 'react';
import { TextMessage, MessageRole } from "@copilotkit/runtime-client-gql";
import { useSarvamVoice } from '@/hooks/useSarvamVoice';
import { isModuleNamespaceObject } from 'util/types';
 
function CustomInputWithVoice({ inProgress, onSend, isVisible }: InputProps) {
  const [inputValue, setInputValue] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const { voiceState, startRecording, stopRecording, translateAndSpeak, resetState } = useSarvamVoice();

  // Language options
  const languages = {
    'auto': 'Auto-Detect',
    'en': 'English',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'te': 'Telugu'
  };

  const handleVoiceInput = useCallback(async () => {
    if (voiceState.isListening) {
      stopRecording();
    } else {
      resetState();
      await startRecording();
    }
  }, [voiceState.isListening, stopRecording, startRecording, resetState]);

  // Track processed transcripts to avoid infinite loops
  const processedTranscripts = useRef(new Set<string>());

  // Handle when speech processing is complete
  useEffect(() => {
    if (voiceState.transcript && 
        !voiceState.isProcessing && 
        !voiceState.isListening &&
        !processedTranscripts.current.has(voiceState.transcript)) {
      
      // Mark this transcript as processed
      processedTranscripts.current.add(voiceState.transcript);
      
      console.log('Sending to CopilotKit:', voiceState.transcript);
      onSend(voiceState.transcript);
      
      // Clean up old processed transcripts (keep only last 10)
      if (processedTranscripts.current.size > 10) {
        const transcriptArray = Array.from(processedTranscripts.current);
        processedTranscripts.current = new Set(transcriptArray.slice(-5));
      }
      
      // Reset state after a delay
      setTimeout(() => {
        resetState();
      }, 1000);
    }
  }, [voiceState.transcript, voiceState.isProcessing, voiceState.isListening, onSend, resetState]);

  const handleSubmit = (value: string) => {
    if (value.trim()) {
      onSend(value);
      setInputValue('');
    }
  };

  const wrapperStyle = "flex flex-col gap-2 p-4 border-t relative";
  const inputContainerStyle = "relative flex-1";
  const inputStyle = "w-full p-2 pr-12 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 text-gray-900 placeholder-gray-400";
  const buttonStyle = "px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed";
  
  const voiceButtonStyle = `absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
    voiceState.isListening
      ? 'bg-red-500 hover:bg-red-600 animate-pulse'
      : voiceState.isProcessing
      ? 'bg-yellow-500 hover:bg-yellow-600'
      : 'bg-blue-500 hover:bg-blue-600'
  } text-white z-10`;

  return (
    <div className={wrapperStyle}>
      {/* Language Selection */}
      <div className="flex gap-2 items-center bg-white p-2 rounded border">
        <label className="text-sm font-semibold text-gray-800">Response Language:</label>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-800 bg-white focus:border-blue-500 focus:outline-none"
        >
          {Object.entries(languages).map(([code, name]) => (
            <option key={code} value={code} className="text-gray-800">{name}</option>
          ))}
        </select>
      </div>

      {/* Voice State Indicators */}
      {(voiceState.detectedLanguage || voiceState.transcript || voiceState.translatedText || voiceState.error) && (
        <div className="text-xs space-y-2 bg-white p-3 rounded-lg border shadow-sm">
          {voiceState.detectedLanguage && (
            <div className="text-blue-700 font-medium bg-blue-50 p-2 rounded">
              🎤 <span className="font-semibold">Detected Language:</span> {languages[voiceState.detectedLanguage as keyof typeof languages] || voiceState.detectedLanguage}
            </div>
          )}
          {voiceState.transcript && (
            <div className="text-green-700 bg-green-50 p-2 rounded">
              📝 <span className="font-semibold">Transcript:</span> <span className="font-medium text-gray-800">{voiceState.transcript}</span>
            </div>
          )}
          {voiceState.translatedText && (
            <div className="text-purple-700 bg-purple-50 p-2 rounded">
              🔄 <span className="font-semibold">Translated:</span> <span className="font-medium text-gray-800">{voiceState.translatedText}</span>
            </div>
          )}
          {voiceState.error && (
            <div className="text-red-700 font-medium bg-red-50 p-2 rounded">
              ❌ <span className="font-semibold">Error:</span> {voiceState.error}
            </div>
          )}
        </div>
      )}

      {/* Input Row */}
      <div className="flex gap-2">
        <div className={inputContainerStyle}>
          <input
            disabled={inProgress || voiceState.isProcessing}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              voiceState.isListening 
                ? "Listening..." 
                : voiceState.isProcessing 
                ? "Processing..." 
                : "Ask your question here..."
            }
            className={inputStyle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(inputValue);
              }
            }}
          />
         
          {/* Voice Control Button */}
          <button
            onClick={handleVoiceInput}
            className={voiceButtonStyle}
            title={
              voiceState.isListening 
                ? 'Stop listening' 
                : voiceState.isProcessing 
                ? 'Processing...' 
                : 'Start voice input'
            }
            disabled={inProgress}
          >
            {voiceState.isListening ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <rect x="6" y="6" width="8" height="8" />
              </svg>
            ) : voiceState.isProcessing ? (
              <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 715 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* Status Indicator */}
          {voiceState.isListening && (
            <div className="absolute -top-10 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-20">
              🎤 Listening...
            </div>
          )}
          {voiceState.isProcessing && (
            <div className="absolute -top-10 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs whitespace-nowrap z-20">
              ⚙️ Processing...
            </div>
          )}
        </div>
       
        <button
          disabled={inProgress || !inputValue.trim() || voiceState.isProcessing}
          className={buttonStyle}
          onClick={() => handleSubmit(inputValue)}
        >
          Ask
        </button>
      </div>
    </div>
  );
}
 
function Upgrade() {
    const { appendMessage } = useCopilotChat();
   
    // ===============================
    // 💾 Dynamic Data Storage
    // ===============================
    const [formData, setFormData] = useState<Record<string, any>>({});
    
    // Store a reference to the current onSend function
    const currentOnSendRef = useRef<((message: string) => void) | null>(null);
   
    // Store form data dynamically
    const storeFormData = useCallback((data: Record<string, any>) => {
        setFormData(prevData => ({
            ...prevData,
            ...data
        }));
        console.log('Form data stored:', data);
    }, []);
   
    // Send stored data to copilot using the direct onSend function
    const sendStoredDataDirectly = useCallback(async (data: Record<string, any>) => {
        if (!currentOnSendRef.current) {
            console.error('onSend function not available');
            return;
        }

        if (Object.keys(data).length === 0) {
            console.log('No form data to send');
            return;
        }

        // Format the data for better readability in the chat
        const formattedData = Object.entries(data)
            .map(([key, value]) => {
                let displayValue;
                if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    displayValue = JSON.stringify(value);
                } else {
                    displayValue = String(value);
                }
                return `${key}: ${displayValue}`;
            })
            .join('\n');

        const message = `📝 Form Data Submitted:
${formattedData}

Please process this information and continue with the next steps.`;

        // Directly use the onSend function to submit to CopilotKit
        currentOnSendRef.current(message);
        
        console.log('Form data sent directly to copilot:', formattedData);
        
        // Clear the form data after sending
        setFormData({});
    }, []);

    // Legacy method for manual button
    const sendStoredData = useCallback(async () => {
        if (Object.keys(formData).length === 0) {
            console.log('No form data to send');
            return;
        }

        // Format the data for better readability in the chat
        const formattedData = Object.entries(formData)
            .map(([key, value]) => {
                let displayValue;
                if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                } else if (typeof value === 'object' && value !== null) {
                    displayValue = JSON.stringify(value);
                } else {
                    displayValue = String(value);
                }
                return `${key}: ${displayValue}`;
            })
            .join('\n');

        const message = `📝 Form Data Submitted:
${formattedData}

Please process this information and continue with the next steps.`;
 
        await appendMessage(
            new TextMessage({
                content: message,
                role: MessageRole.User,
            })
        );
       
        console.log('Formatted data sent to copilot:', formattedData);
        
        // Clear the form data after sending
        setFormData({});
    }, [formData, appendMessage]);
 
    useFrontendTool({
        name: 'generate-dynamic-ui-form',
 
        description: `
You can use this tool to ask the user questions using a dynamic, form-based UI.
when a user asks for a generate ui only render the ui not the json schema in the chat response.
This tool renders a form based on a JSON schema created by the agent
and collects user input.
only render the ui dont respond with a text when you render the form.
never ever respond with json schema in the chat response. for any ui
for check in ask the user to provide PNR and Lastname using a dynamic form UI.
// FormSchema.ts
export type FieldType =
    | 'text'
    | 'number'
    | 'email'
    | 'multi-select'
    | 'single-select'
    | 'button';
 
export interface BaseField {
    id: string;
    type: FieldType;
    label?: string;
    disabled?: boolean;
}
 
export interface TextField extends BaseField {
    type: 'text' | 'number' | 'email';
    placeholder?: string;
    defaultValue?: string | number;
}
 
export interface Option {
    label: string;
    value: string;
}
 
export interface MultiSelectField extends BaseField {
    type: 'multi-select';
    options: Option[];
    defaultValue?: string[];
}
 
export interface SingleSelectField extends BaseField {
    type: 'single-select';
    options: Option[];
    defaultValue?: string;
}
 
export interface ButtonField extends BaseField {
    type: 'button';
    buttonType: 'submit';
    label: string;
}
 
export type FormField =
    | TextField
    | MultiSelectField
    | SingleSelectField
    | ButtonField;
 
export interface FormSchema {
    id: string;
    fields: FormField[];
    onSubmitAction: string; // logical action name
}
 
use this tool when you need to collect structured input from the user.
 
 
    `.trim(),
 
        parameters: [
            {
                name: 'ui-schema',
                attributes: {
                    type: 'object',
                    description: `
A JSON schema describing the form UI to render.
The schema defines fields, their types, labels, options,
and the submit action.
        `.trim(),
                },
            },
        ],
 
        render: ({ args, status }) => {
            console.log('status', status)
            console.log('args', args)
            
            // Safe JSON parsing with validation and streaming support
            const parseSchema = (schemaString: string) => {
                try {
                    if (!schemaString || typeof schemaString !== 'string') {
                        console.warn('Invalid or empty schema string:', schemaString);
                        return null;
                    }
                    
                    // Clean the string
                    let cleanedString = schemaString.trim();
                    
                    // Handle incomplete JSON from streaming responses
                    if (!cleanedString.endsWith('}')) {
                        console.warn('Incomplete JSON detected, waiting for complete response:', cleanedString.substring(0, 50) + '...');
                        return null;
                    }
                    
                    // Ensure it starts and ends properly
                    if (!cleanedString.startsWith('{')) {
                        console.warn('Schema does not start with {:', cleanedString.substring(0, 50) + '...');
                        return null;
                    }
                    
                    // Try to parse the JSON
                    const parsed = JSON.parse(cleanedString);
                    
                    // Validate required fields
                    if (!parsed.id || !parsed.fields || !Array.isArray(parsed.fields)) {
                        console.error('Schema missing required fields (id, fields):', parsed);
                        return null;
                    }
                    
                    return parsed;
                } catch (error) {
                    console.error('JSON parsing failed:', error, 'String length:', schemaString.length, 'First 100 chars:', schemaString.substring(0, 100));
                    return null;
                }
            };
            
            return (
                <>
                    {status === 'inProgress' && <p>🔄 Generating form...</p>}
                    {status === 'executing' && <p>⚙️ Processing request...</p>}
                    {status === 'complete' && (() => {
                        if (!args['ui-schema']) {
                            return <p className="text-orange-500">⚠️ No form schema received</p>;
                        }
                        
                        const schema = parseSchema(args['ui-schema']);
                        
                        if (!schema) {
                            return (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                                    <p className="text-orange-600 font-medium">⚠️ Waiting for complete response...</p>
                                    <p className="text-sm text-orange-500 mt-1">The AI is still generating the form. Please wait.</p>
                                </div>
                            );
                        }
                        
                        return (
                            <DynamicForm
                                schema={schema}
                                onSubmit={async (action, data) => {
                                    console.log('Form submitted with action:', action, 'data:', data);
                                   
                                    // Directly send the data to CopilotKit using onSend
                                    await sendStoredDataDirectly(data);
                                   
                                    // Handle different actions
                                    switch (action) {
                                        case 'check_in':
                                            console.log('Processing check-in with data:', data);
                                            break;
                                        case 'search_flight':
                                            console.log('Processing flight search with data:', data);
                                            break;
                                        case 'submit':
                                        default:
                                            console.log('Processing form submission with data:', data);
                                            break;
                                    }
                                }}
                            />
                        );
                    })()}
                </>
            );
        },
    });
 
    // ===============================
    // Custom Input with Preset Data Button
    // ===============================
    const CustomInputWithPresetData = useCallback((props: InputProps) => {
        // Store the onSend function reference for direct form submission
        currentOnSendRef.current = props.onSend;
        
        // Format form data for display
        const formatFormData = (data: Record<string, any>): string => {
            if (Object.keys(data).length === 0) return 'No data';
            
            return Object.entries(data)
                .map(([key, value]) => {
                    // Handle different value types
                    let displayValue;
                    if (Array.isArray(value)) {
                        displayValue = value.join(', ');
                    } else if (typeof value === 'object' && value !== null) {
                        displayValue = JSON.stringify(value);
                    } else {
                        displayValue = String(value);
                    }
                    return `${key}: ${displayValue}`;
                })
                .join(' | ');
        };
        
        return (
            <>
                {/* Original Voice Input */}
                <CustomInputWithVoice {...props} />
               
                {/* Preset Data Button */}
                {Object.keys(formData).length > 0 && (
                    <div className="border-t p-4 bg-gray-50">
                        <div className="mb-2">
                            <h4 className="text-sm font-semibold text-gray-900 mb-2">📋 Captured Form Data:</h4>
                            <div className="bg-white p-3 rounded border text-sm text-gray-900 max-h-20 overflow-y-auto shadow-sm">
                                {formatFormData(formData)}
                            </div>
                        </div>
                        <button
                            onClick={sendStoredData}
                            className="w-full p-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors shadow-sm"
                        >
                            💾 Submit Form Data
                        </button>
                    </div>
                )}
            </>
        );
    }, [formData, sendStoredData]);
 
    return (
        <main className="flex items-end justify-center h-screen relative">
            <PDPPage />
            <CopilotSidebar
                className="w-1/2"
                Input={CustomInputWithPresetData}
            />
        </main>
    );
}
 
export default Upgrade;