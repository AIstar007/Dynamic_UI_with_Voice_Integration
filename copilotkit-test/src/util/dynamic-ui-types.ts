// FormSchema.ts — dynamic UI schema shared by the form renderer and the A2UI surface renderer
export type FieldType =
	| 'text'
	| 'number'
	| 'email'
	| 'date'
	| 'textarea'
	| 'multi-select'
	| 'single-select'
	| 'dropdown'
	| 'toggle'
	| 'slider'
	| 'button';

export interface BaseField {
	id: string;
	type: FieldType;
	label?: string;
	disabled?: boolean;
	required?: boolean;
}

export interface TextField extends BaseField {
	type: 'text' | 'number' | 'email' | 'date' | 'textarea';
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
	type: 'single-select' | 'dropdown';
	options: Option[];
	defaultValue?: string;
}

export interface ToggleField extends BaseField {
	type: 'toggle';
	defaultValue?: boolean;
}

export interface SliderField extends BaseField {
	type: 'slider';
	min?: number;
	max?: number;
	step?: number;
	defaultValue?: number;
}

export interface ButtonField extends BaseField {
	type: 'button';
	buttonType: 'submit';
	label: string;
	variant?: 'primary' | 'secondary' | 'danger';
}

export type FormField =
	| TextField
	| MultiSelectField
	| SingleSelectField
	| ToggleField
	| SliderField
	| ButtonField;

export interface FormSchema {
	id: string;
	title?: string;
	description?: string;
	fields: FormField[];
	onSubmitAction: string; // logical action name
}

/* ------------------------------------------------------------------ */
/* A2UI surface schema — mirrors backend/app/a2ui/schemas.py Surface   */
/* ------------------------------------------------------------------ */

export type A2UIComponentType =
	| 'heading'
	| 'text'
	| 'card'
	| 'list'
	| 'table'
	| 'image'
	| 'alert'
	| 'progress'
	| 'chips'
	| 'stat'
	| 'divider'
	| 'form'
	| 'buttons';

export interface A2UIBase {
	type: A2UIComponentType;
	id?: string;
}

export interface A2UIHeading extends A2UIBase {
	type: 'heading';
	text: string;
	level?: 1 | 2 | 3;
}

export interface A2UIText extends A2UIBase {
	type: 'text';
	text: string;
	muted?: boolean;
}

export interface A2UICard extends A2UIBase {
	type: 'card';
	title?: string;
	subtitle?: string;
	imageUrl?: string;
	body?: string;
	footer?: string;
	badge?: string;
	children?: A2UIComponent[];
	action?: { label: string; value: string };
}

export interface A2UIList extends A2UIBase {
	type: 'list';
	ordered?: boolean;
	items: Array<string | { title: string; subtitle?: string; trailing?: string; value?: string }>;
	selectable?: boolean;
	onSelectAction?: string;
}

export interface A2UITable extends A2UIBase {
	type: 'table';
	columns: string[];
	rows: Array<Array<string | number>>;
	caption?: string;
}

export interface A2UIImage extends A2UIBase {
	type: 'image';
	url: string;
	alt?: string;
	caption?: string;
}

export interface A2UIAlert extends A2UIBase {
	type: 'alert';
	variant: 'info' | 'success' | 'warning' | 'error';
	title?: string;
	text: string;
}

export interface A2UIProgress extends A2UIBase {
	type: 'progress';
	value: number; // 0-100
	label?: string;
}

export interface A2UIChips extends A2UIBase {
	type: 'chips';
	items: Array<{ label: string; value: string }>;
	onSelectAction?: string;
}

export interface A2UIStat extends A2UIBase {
	type: 'stat';
	label: string;
	value: string;
	delta?: string;
	deltaDirection?: 'up' | 'down';
}

export interface A2UIDivider extends A2UIBase {
	type: 'divider';
}

export interface A2UIFormComponent extends A2UIBase {
	type: 'form';
	schema: FormSchema;
}

export interface A2UIButtons extends A2UIBase {
	type: 'buttons';
	buttons: Array<{ label: string; value: string; variant?: 'primary' | 'secondary' | 'danger' }>;
	onSelectAction?: string;
}

export type A2UIComponent =
	| A2UIHeading
	| A2UIText
	| A2UICard
	| A2UIList
	| A2UITable
	| A2UIImage
	| A2UIAlert
	| A2UIProgress
	| A2UIChips
	| A2UIStat
	| A2UIDivider
	| A2UIFormComponent
	| A2UIButtons;

export interface A2UISurface {
	surfaceId: string;
	title?: string;
	components: A2UIComponent[];
}
