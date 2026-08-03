'use client';

import { DynamicForm } from '@/util/dynamic';
import { A2UISurfaceRenderer } from '@/util/a2ui-renderer';
import IndigoItinerary from '@/util/itinerary';
import { useFrontendTool } from '@copilotkit/react-core';
import { type InputProps, CopilotSidebar } from '@copilotkit/react-ui';
import { useState, useRef, useCallback, useEffect } from 'react';
import { useSarvamVoice } from '@/hooks/useSarvamVoice';

/* ------------------------------------------------------------------ */
/* Voice-enabled chat input (Sarvam STT + language selector)           */
/* ------------------------------------------------------------------ */
function VoiceChatInput({ inProgress, onSend }: InputProps) {
	const [inputValue, setInputValue] = useState('');
	const { voiceState, startRecording, stopRecording, resetState } = useSarvamVoice();

	const languages: Record<string, string> = {
		auto: 'Auto-Detect',
		en: 'English',
		hi: 'Hindi',
		bn: 'Bengali',
		gu: 'Gujarati',
		kn: 'Kannada',
		ml: 'Malayalam',
		mr: 'Marathi',
		ta: 'Tamil',
		te: 'Telugu',
	};

	const handleVoiceInput = useCallback(async () => {
		if (voiceState.isListening) {
			stopRecording();
		} else {
			resetState();
			await startRecording();
		}
	}, [voiceState.isListening, stopRecording, startRecording, resetState]);

	// Auto-send completed transcripts, once each
	const processedTranscripts = useRef(new Set<string>());
	useEffect(() => {
		if (
			voiceState.transcript &&
			!voiceState.isProcessing &&
			!voiceState.isListening &&
			!processedTranscripts.current.has(voiceState.transcript)
		) {
			processedTranscripts.current.add(voiceState.transcript);
			onSend(voiceState.transcript);
			setTimeout(() => resetState(), 1000);
		}
	}, [voiceState.transcript, voiceState.isProcessing, voiceState.isListening, onSend, resetState]);

	const handleSubmit = (value: string) => {
		if (value.trim()) {
			onSend(value);
			setInputValue('');
		}
	};

	return (
		<div className="flex flex-col gap-2 p-4 border-t relative">
			{(voiceState.detectedLanguage || voiceState.transcript || voiceState.error) && (
				<div className="text-xs space-y-2 bg-white p-3 rounded-lg border shadow-sm">
					{voiceState.detectedLanguage && (
						<div className="text-blue-700 font-medium bg-blue-50 p-2 rounded">
							🎤 Detected: {languages[voiceState.detectedLanguage] ?? voiceState.detectedLanguage}
						</div>
					)}
					{voiceState.transcript && (
						<div className="text-green-700 bg-green-50 p-2 rounded">
							📝 {voiceState.transcript}
						</div>
					)}
					{voiceState.error && (
						<div className="text-red-700 font-medium bg-red-50 p-2 rounded">
							❌ {voiceState.error}
						</div>
					)}
				</div>
			)}

			<div className="flex gap-2">
				<div className="relative flex-1">
					<input
						disabled={inProgress || voiceState.isProcessing}
						type="text"
						value={inputValue}
						onChange={(e) => setInputValue(e.target.value)}
						placeholder={
							voiceState.isListening
								? 'Listening...'
								: voiceState.isProcessing
								? 'Processing...'
								: 'Ask anything — try "show me flight options"...'
						}
						className="w-full p-2 pr-12 rounded-md border border-gray-300 focus:outline-none focus:border-blue-500 disabled:bg-gray-100 text-gray-900 placeholder-gray-400"
						onKeyDown={(e) => {
							if (e.key === 'Enter') handleSubmit(inputValue);
						}}
					/>
					<button
						onClick={handleVoiceInput}
						disabled={inProgress}
						title={voiceState.isListening ? 'Stop listening' : 'Start voice input'}
						className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors text-white z-10 ${
							voiceState.isListening
								? 'bg-red-500 hover:bg-red-600 animate-pulse'
								: voiceState.isProcessing
								? 'bg-yellow-500 hover:bg-yellow-600'
								: 'bg-blue-500 hover:bg-blue-600'
						}`}
					>
						{voiceState.isListening ? (
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<rect x="6" y="6" width="8" height="8" />
							</svg>
						) : (
							<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
								<path
									fillRule="evenodd"
									d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
									clipRule="evenodd"
								/>
							</svg>
						)}
					</button>
				</div>
				<button
					disabled={inProgress || !inputValue.trim() || voiceState.isProcessing}
					className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
					onClick={() => handleSubmit(inputValue)}
				>
					Ask
				</button>
			</div>
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Playground                                                          */
/* ------------------------------------------------------------------ */
export default function CopilotKitPage() {
	const onSendRef = useRef<((message: string) => void) | null>(null);

	const sendAction = useCallback((action: string, data: Record<string, any>) => {
		const formatted = Object.entries(data)
			.map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v)}`)
			.join('\n');
		onSendRef.current?.(`Action "${action}" submitted:\n${formatted}\nPlease continue with the next step.`);
	}, []);

	// Safe streaming-aware JSON parse shared by both tools
	const parseJson = (raw: unknown) => {
		if (!raw) return null;
		if (typeof raw === 'object') return raw as any;
		if (typeof raw !== 'string') return null;
		const s = raw.trim();
		if (!s.startsWith('{') || !s.endsWith('}')) return null;
		try {
			return JSON.parse(s);
		} catch {
			return null;
		}
	};

	/* ---- AG-UI style generative form tool ---- */
	useFrontendTool({
		name: 'generate-dynamic-ui-form',
		description: `
Render a dynamic form UI to collect structured input from the user.
Pass a FormSchema JSON in 'ui-schema':
{ id, title?, description?, onSubmitAction, fields: [
  { id, type: 'text'|'number'|'email'|'date'|'textarea', label, placeholder? } |
  { id, type: 'multi-select'|'single-select'|'dropdown', label, options: [{label, value}] } |
  { id, type: 'toggle', label } |
  { id, type: 'slider', label, min, max, step } |
  { id, type: 'button', buttonType: 'submit', label }
]}
Only render the UI — never echo the JSON schema as text.
		`.trim(),
		parameters: [
			{
				name: 'ui-schema',
				attributes: {
					type: 'object',
					description: 'FormSchema JSON describing fields and submit action.',
				},
			},
		],
		render: ({ args, status }) => {
			if (status !== 'complete') return <p>🔄 Generating form...</p>;
			const schema = parseJson(args['ui-schema']);
			if (!schema?.fields) return <p className="text-orange-500">⚠️ Waiting for complete form schema…</p>;
			return <DynamicForm schema={schema} onSubmit={sendAction} />;
		},
	});

	/* ---- A2UI surface tool (rich generative UI) ---- */
	useFrontendTool({
		name: 'render-a2ui-surface',
		description: `
Render a rich A2UI surface (cards, lists, tables, alerts, chips, stats, progress, images, buttons, embedded forms) in the chat.
Use this for showing results, options, summaries, dashboards — anything beyond a plain input form.
Pass a Surface JSON in 'surface':
{ surfaceId, title?, components: [
  { type: 'heading', text, level? } |
  { type: 'text', text, muted? } |
  { type: 'card', title?, subtitle?, body?, badge?, footer?, imageUrl?, action?: {label, value} } |
  { type: 'list', items: [string | {title, subtitle?, trailing?, value?}], selectable?, onSelectAction? } |
  { type: 'table', columns: [..], rows: [[..]], caption? } |
  { type: 'alert', variant: 'info'|'success'|'warning'|'error', title?, text } |
  { type: 'progress', value: 0-100, label? } |
  { type: 'chips', items: [{label, value}], onSelectAction? } |
  { type: 'stat', label, value, delta?, deltaDirection? } |
  { type: 'image', url, alt?, caption? } |
  { type: 'divider' } |
  { type: 'buttons', buttons: [{label, value, variant?}], onSelectAction? } |
  { type: 'form', schema: FormSchema }
]}
Only render the UI — never echo the JSON as text.
		`.trim(),
		parameters: [
			{
				name: 'surface',
				attributes: {
					type: 'object',
					description: 'A2UI Surface JSON: { surfaceId, title?, components: [...] }',
				},
			},
		],
		render: ({ args, status }) => {
			if (status !== 'complete') return <p>🔄 Building UI...</p>;
			const surface = parseJson(args['surface']);
			if (!surface?.components) return <p className="text-orange-500">⚠️ Waiting for complete surface…</p>;
			return <A2UISurfaceRenderer surface={surface} onAction={sendAction} />;
		},
	});

	const InputWithRef = useCallback((props: InputProps) => {
		onSendRef.current = props.onSend;
		return <VoiceChatInput {...props} />;
	}, []);

	return (
		<main>
			<CopilotSidebar
				disableSystemMessage={false}
				clickOutsideToClose={false}
				defaultOpen
				Input={InputWithRef}
				labels={{
					title: '6ESkai Assistant',
					initial: "👋 Hi! I'm 6ESkai. Ask by text or voice — I'll build the UI to match.",
				}}
				suggestions={[
					{ title: 'Dynamic Form', message: 'I want to check in — collect my PNR and last name.' },
					{ title: 'Flight Cards', message: 'Show me flight options from Delhi to Mumbai tomorrow as cards.' },
					{ title: 'Comparison Table', message: 'Compare economy vs business class in a table.' },
					{ title: 'Booking Progress', message: 'Show my booking progress with steps.' },
					{ title: 'Quick Replies', message: 'Give me quick reply chips for meal preferences.' },
				]}
				icons={{ openIcon: <SkaiComponent /> }}
			>
				<IndigoItinerary />
			</CopilotSidebar>
		</main>
	);
}

function SkaiComponent() {
	return (
		<img
			alt="Custom Avatar"
			src="/6E Skai Logo.png"
			className="rounded-full h-auto w-auto max-h-20 max-w-20 object-contain"
		/>
	);
}
