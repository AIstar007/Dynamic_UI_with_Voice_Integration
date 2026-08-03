'use client';

import React from 'react';
import { A2UISurface, A2UIComponent } from './dynamic-ui-types';
import { DynamicForm } from './dynamic';

interface Props {
  surface: A2UISurface;
  /** Called when the user activates any interactive element (chip, list item, button, form submit). */
  onAction: (action: string, data: Record<string, any>) => void;
}

const alertStyles: Record<string, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
};

const buttonVariants: Record<string, string> = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
};

function RenderComponent({
  component,
  onAction,
}: {
  component: A2UIComponent;
  onAction: Props['onAction'];
}) {
  switch (component.type) {
    case 'heading': {
      const level = component.level ?? 2;
      const sizes = { 1: 'text-xl', 2: 'text-lg', 3: 'text-base' } as const;
      const Tag = (`h${level}`) as 'h1' | 'h2' | 'h3';
      return <Tag className={`${sizes[level]} font-bold text-gray-900`}>{component.text}</Tag>;
    }

    case 'text':
      return (
        <p className={`text-sm ${component.muted ? 'text-gray-500' : 'text-gray-800'}`}>
          {component.text}
        </p>
      );

    case 'card':
      return (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          {component.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={component.imageUrl} alt={component.title ?? ''} className="w-full h-32 object-cover" />
          )}
          <div className="p-4 space-y-1">
            <div className="flex items-start justify-between gap-2">
              {component.title && (
                <h4 className="font-semibold text-gray-900">{component.title}</h4>
              )}
              {component.badge && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                  {component.badge}
                </span>
              )}
            </div>
            {component.subtitle && (
              <p className="text-xs text-gray-500">{component.subtitle}</p>
            )}
            {component.body && <p className="text-sm text-gray-700">{component.body}</p>}
            {component.children?.map((child, i) => (
              <RenderComponent key={child.id ?? i} component={child} onAction={onAction} />
            ))}
            {component.footer && (
              <p className="text-xs text-gray-500 pt-1 border-t mt-2">{component.footer}</p>
            )}
            {component.action && (
              <button
                className={`mt-2 px-3 py-1.5 rounded-md text-sm font-medium ${buttonVariants.primary}`}
                onClick={() =>
                  onAction('card_action', { value: component.action!.value, cardId: component.id })
                }
              >
                {component.action.label}
              </button>
            )}
          </div>
        </div>
      );

    case 'list': {
      const ListTag = component.ordered ? 'ol' : 'ul';
      return (
        <ListTag className={`space-y-1 ${component.ordered ? 'list-decimal pl-5' : ''}`}>
          {component.items.map((item, i) => {
            if (typeof item === 'string') {
              return (
                <li key={i} className="text-sm text-gray-800 flex items-start gap-2">
                  {!component.ordered && <span className="text-blue-500 mt-0.5">•</span>}
                  {item}
                </li>
              );
            }
            const inner = (
              <div className="flex items-center justify-between gap-2 w-full">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.title}</div>
                  {item.subtitle && <div className="text-xs text-gray-500">{item.subtitle}</div>}
                </div>
                {item.trailing && (
                  <div className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {item.trailing}
                  </div>
                )}
              </div>
            );
            return (
              <li key={i}>
                {component.selectable ? (
                  <button
                    className="w-full text-left p-2 rounded-md border bg-white hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() =>
                      onAction(component.onSelectAction ?? 'list_select', {
                        value: item.value ?? item.title,
                        listId: component.id,
                      })
                    }
                  >
                    {inner}
                  </button>
                ) : (
                  <div className="p-2 rounded-md border bg-white">{inner}</div>
                )}
              </li>
            );
          })}
        </ListTag>
      );
    }

    case 'table':
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            {component.caption && (
              <caption className="text-xs text-gray-500 p-2 text-left">{component.caption}</caption>
            )}
            <thead className="bg-gray-50">
              <tr>
                {component.columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-left font-semibold text-gray-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {component.rows.map((row, i) => (
                <tr key={i} className="border-t">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'image':
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={component.url} alt={component.alt ?? ''} className="rounded-lg w-full" />
          {component.caption && (
            <figcaption className="text-xs text-gray-500 mt-1">{component.caption}</figcaption>
          )}
        </figure>
      );

    case 'alert':
      return (
        <div className={`rounded-lg border p-3 text-sm ${alertStyles[component.variant]}`}>
          {component.title && <div className="font-semibold mb-0.5">{component.title}</div>}
          {component.text}
        </div>
      );

    case 'progress': {
      const value = Math.max(0, Math.min(100, component.value));
      return (
        <div>
          {component.label && (
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{component.label}</span>
              <span>{value}%</span>
            </div>
          )}
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${value}%` }} />
          </div>
        </div>
      );
    }

    case 'chips':
      return (
        <div className="flex flex-wrap gap-2">
          {component.items.map((chip) => (
            <button
              key={chip.value}
              className="px-3 py-1 rounded-full text-sm border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              onClick={() =>
                onAction(component.onSelectAction ?? 'chip_select', {
                  value: chip.value,
                  chipsId: component.id,
                })
              }
            >
              {chip.label}
            </button>
          ))}
        </div>
      );

    case 'stat':
      return (
        <div className="bg-white rounded-lg border p-3">
          <div className="text-xs text-gray-500">{component.label}</div>
          <div className="text-xl font-bold text-gray-900">{component.value}</div>
          {component.delta && (
            <div
              className={`text-xs font-medium ${
                component.deltaDirection === 'down' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {component.deltaDirection === 'down' ? '▼' : '▲'} {component.delta}
            </div>
          )}
        </div>
      );

    case 'divider':
      return <hr className="border-gray-200" />;

    case 'form':
      return <DynamicForm schema={component.schema} onSubmit={onAction} />;

    case 'buttons':
      return (
        <div className="flex flex-wrap gap-2">
          {component.buttons.map((btn) => (
            <button
              key={btn.value}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                buttonVariants[btn.variant ?? 'primary']
              }`}
              onClick={() =>
                onAction(component.onSelectAction ?? 'button_click', { value: btn.value })
              }
            >
              {btn.label}
            </button>
          ))}
        </div>
      );

    default:
      return null;
  }
}

/**
 * Renders an A2UI Surface (surfaceId + component tree) inside chat.
 * Compatible with the shape emitted by backend/app/a2ui/surfaces.py and
 * with LLM-generated surfaces from the render-a2ui-surface frontend tool.
 */
export const A2UISurfaceRenderer: React.FC<Props> = ({ surface, onAction }) => {
  return (
    <div className="space-y-3" data-surface-id={surface.surfaceId}>
      {surface.title && <h3 className="text-lg font-bold text-gray-900">{surface.title}</h3>}
      {surface.components.map((component, i) => (
        <RenderComponent key={component.id ?? i} component={component} onAction={onAction} />
      ))}
    </div>
  );
};

export default A2UISurfaceRenderer;
