'use client';

import React, { useState } from 'react';
import { FormSchema, FormField } from './dynamic-ui-types';
import { Input } from '../components/Input';
import { Checkbox } from '../components/Checkbox';
import { Radio } from '../components/Radio';
import { Button } from '../components/Button';

interface Props {
  schema: FormSchema;
  onSubmit: (action: string, data: Record<string, any>) => void;
}

export const DynamicForm: React.FC<Props> = ({ schema, onSubmit }) => {
  /* ---------------- Initial State ---------------- */
  const initialState = schema.fields.reduce<Record<string, any>>(
    (acc, field) => {
      if ('defaultValue' in field && field.defaultValue !== undefined) {
        acc[field.id] = field.defaultValue;
      } else if (field.type === 'multi-select') {
        acc[field.id] = [];
      } else if (field.type === 'toggle') {
        acc[field.id] = false;
      } else if (field.type === 'slider') {
        acc[field.id] = (field as any).min ?? 0;
      } else {
        acc[field.id] = '';
      }
      return acc;
    },
    {}
  );

  const [formState, setFormState] = useState<Record<string, any>>(initialState);

  /* ---------------- Change Handler ---------------- */
  const handleChange = (id: string, value: string | number | boolean | any[]) => {
    setFormState((prev) => {
      const field = schema.fields.find((f) => f.id === id);

      // Normalize number fields
      if (field?.type === 'number' || field?.type === 'slider') {
        return { ...prev, [id]: value === '' ? '' : Number(value) };
      }

      return { ...prev, [id]: value };
    });
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(schema.onSubmitAction, formState);
  };

  const labelStyle = 'block text-sm font-semibold text-gray-900';

  /* ---------------- Render ---------------- */
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      {schema.title && (
        <h3 className="text-base font-bold text-gray-900 mb-1">{schema.title}</h3>
      )}
      {schema.description && (
        <p className="text-sm text-gray-600 mb-3">{schema.description}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        {schema.fields.map((field) => {
          switch (field.type) {
            /* ---------- INPUT ---------- */
            case 'text':
            case 'email':
            case 'number':
            case 'date':
              return (
                <div key={field.id} className="space-y-2">
                  <Input
                    id={field.id}
                    label={field.label ?? ''}
                    type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                    value={String(formState[field.id] ?? '')}
                    disabled={field.disabled}
                    placeholder={(field as any).placeholder}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(field.id, e.target.value)
                    }
                  />
                </div>
              );

            /* ---------- TEXTAREA ---------- */
            case 'textarea':
              return (
                <div key={field.id} className="space-y-2">
                  <label className={labelStyle} htmlFor={field.id}>{field.label}</label>
                  <textarea
                    id={field.id}
                    value={String(formState[field.id] ?? '')}
                    disabled={field.disabled}
                    placeholder={(field as any).placeholder}
                    rows={3}
                    className="w-full p-2 rounded-md border border-gray-300 text-gray-900 focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                </div>
              );

            /* ---------- CHECKBOX GROUP ---------- */
            case 'multi-select':
              return (
                <div key={field.id} className="space-y-2">
                  <label className={labelStyle}>{field.label}</label>
                  <div className="space-y-2">
                    {(field as any).options?.map((opt: any) => {
                      const selectedValues: any[] = formState[field.id] ?? [];
                      const checked = selectedValues.includes(opt.value);

                      return (
                        <Checkbox
                          key={opt.value}
                          label={opt.label}
                          checked={checked}
                          disabled={field.disabled}
                          onChange={(isChecked: boolean) => {
                            handleChange(
                              field.id,
                              isChecked
                                ? [...selectedValues, opt.value]
                                : selectedValues.filter((v) => v !== opt.value)
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );

            /* ---------- RADIO GROUP ---------- */
            case 'single-select':
              return (
                <div key={field.id} className="space-y-2">
                  <label className={labelStyle}>{field.label}</label>
                  <div className="space-y-2">
                    {(field as any).options?.map((opt: any) => (
                      <Radio
                        key={opt.value}
                        name={field.id}
                        label={opt.label}
                        value={opt.value}
                        checked={formState[field.id] === opt.value}
                        disabled={field.disabled}
                        onChange={(checked: boolean) => {
                          if (checked) {
                            handleChange(field.id, opt.value);
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
              );

            /* ---------- DROPDOWN ---------- */
            case 'dropdown':
              return (
                <div key={field.id} className="space-y-2">
                  <label className={labelStyle} htmlFor={field.id}>{field.label}</label>
                  <select
                    id={field.id}
                    value={formState[field.id] ?? ''}
                    disabled={field.disabled}
                    className="w-full p-2 rounded-md border border-gray-300 text-gray-900 bg-white focus:outline-none focus:border-blue-500 disabled:bg-gray-100"
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  >
                    <option value="" disabled>Select…</option>
                    {(field as any).options?.map((opt: any) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              );

            /* ---------- TOGGLE ---------- */
            case 'toggle':
              return (
                <div key={field.id} className="flex items-center justify-between">
                  <label className={labelStyle} htmlFor={field.id}>{field.label}</label>
                  <button
                    id={field.id}
                    type="button"
                    role="switch"
                    aria-checked={!!formState[field.id]}
                    disabled={field.disabled}
                    onClick={() => handleChange(field.id, !formState[field.id])}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formState[field.id] ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formState[field.id] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );

            /* ---------- SLIDER ---------- */
            case 'slider':
              return (
                <div key={field.id} className="space-y-2">
                  <label className={labelStyle} htmlFor={field.id}>
                    {field.label}
                    <span className="ml-2 font-normal text-gray-600">{formState[field.id]}</span>
                  </label>
                  <input
                    id={field.id}
                    type="range"
                    min={(field as any).min ?? 0}
                    max={(field as any).max ?? 100}
                    step={(field as any).step ?? 1}
                    value={formState[field.id] ?? 0}
                    disabled={field.disabled}
                    className="w-full accent-blue-500"
                    onChange={(e) => handleChange(field.id, e.target.value)}
                  />
                </div>
              );

            /* ---------- BUTTON ---------- */
            case 'button':
              return (
                <div key={field.id} className="pt-4">
                  <Button type="submit" disabled={field.disabled}>
                    {field.label}
                  </Button>
                </div>
              );

            default:
              return null;
          }
        })}
      </form>
    </div>
  );
};

export default DynamicForm;
