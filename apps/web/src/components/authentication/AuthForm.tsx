import React from 'react';

export interface AuthFormData {
    alias?: string;
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
}

interface AuthFormField {
    name: keyof AuthFormData;
    type: string;
    placeholder: string;
    required?: boolean;
}

interface AuthFormProps {
    fields: AuthFormField[];
    formData: AuthFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
    children?: React.ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({
    fields,
    formData,
    onChange,
    onSubmit,
    submitLabel,
    children
}) => {
    return (
        <form onSubmit={onSubmit}>
            {fields.map((field) => (
                <input
                    key={field.name}
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name] ?? ''}
                    onChange={onChange}
                    required={field.required ?? true}
                    className="input-field"
                />
            ))}

            <button type="submit" className="submit-btn">
                {submitLabel}
            </button>

            {children}
        </form>
    );
};

export default AuthForm;
export type { AuthFormField };