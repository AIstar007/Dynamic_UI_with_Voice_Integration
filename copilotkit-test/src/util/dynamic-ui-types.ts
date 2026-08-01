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
