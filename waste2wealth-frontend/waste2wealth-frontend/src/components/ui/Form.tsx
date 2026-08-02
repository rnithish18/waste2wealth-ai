import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ label, error, hint, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-ink/80">{label}</label>}
      {children}
      {hint && !error && <p className="text-xs text-ink-faint">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

const baseFieldStyles =
  'w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint outline-none transition-colors focus:border-forest-500 disabled:bg-ink/[0.03] disabled:cursor-not-allowed';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <input
        ref={ref}
        id={id}
        className={cn(baseFieldStyles, error && 'border-red-400 focus:border-red-500', className)}
        {...props}
      />
    </FieldWrapper>
  )
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={id}
        rows={4}
        className={cn(baseFieldStyles, 'resize-none', error && 'border-red-400 focus:border-red-500', className)}
        {...props}
      />
    </FieldWrapper>
  )
);
Textarea.displayName = 'Textarea';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, options, placeholder, id, ...props }, ref) => (
    <FieldWrapper label={label} error={error} hint={hint}>
      <select
        ref={ref}
        id={id}
        className={cn(baseFieldStyles, 'appearance-none bg-no-repeat', error && 'border-red-400', className)}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
);
Select.displayName = 'Select';
