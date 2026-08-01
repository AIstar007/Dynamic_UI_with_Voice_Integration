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
  console.log('DynamicForm schema:', schema);

  /* ---------------- Initial State ---------------- */
  const initialState = schema.fields.reduce<Record<string, any>>(
    (acc, field) => {
      if ('defaultValue' in field) {
        acc[field.id] = field.defaultValue;
      } else if (field.type === 'multi-select') {
        acc[field.id] = [];
      } else {
        acc[field.id] = '';
      }
      return acc;
    },
    {}
  );

  const [formState, setFormState] = useState<Record<string, any>>(initialState);

  /* ---------------- Change Handler ---------------- */
  const handleChange = (id: string, value: string | boolean | any[]) => {
    setFormState((prev) => {
      const field = schema.fields.find((f) => f.id === id);

      // Normalize number fields
      if (field?.type === 'number') {
        return { ...prev, [id]: value === '' ? '' : Number(value) };
      }

      return { ...prev, [id]: value };
    });
  };

  /* ---------------- Field → Tool Type Mapper (KEPT) ---------------- */
  const mapFieldType = (
    field: FormField
  ): 'string' | 'number' | 'object[]' | undefined => {
    if (field.type === 'button') {
      return undefined;
    }

    switch (field.type) {
      case 'number':
        return 'number';
      case 'multi-select':
      case 'single-select':
        return 'object[]';
      default:
        return 'string';
    }
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(schema.onSubmitAction, formState);
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <form onSubmit={handleSubmit} className="space-y-4">
        {schema.fields.map((field) => {
          switch (field.type) {
            /* ---------- INPUT ---------- */
            case 'text':
            case 'email':
            case 'number':
              return (
                <div key={field.id} className="space-y-2">
                  <Input
                    id={field.id}
                    label={field.label ?? ''}
                    value={String(formState[field.id] ?? '')} // ✅ always string
                    disabled={field.disabled}
                    placeholder={(field as any).placeholder}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(field.id, e.target.value)
                    }
                  />
                </div>
              );

            /* ---------- CHECKBOX ---------- */
            case 'multi-select':
              return (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    {field.label}
                  </label>
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
                                : selectedValues.filter(
                                    (v) => v !== opt.value
                                  )
                            );
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );

            /* ---------- RADIO ---------- */
            case 'single-select':
              return (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    {field.label}
                  </label>
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

            /* ---------- BUTTON ---------- */
            case 'button':
              return (
                <div key={field.id} className="pt-4">
                  <Button
                    type="submit" // ✅ correct, no double submit
                    disabled={field.disabled}
                  >
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
