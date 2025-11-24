'use client';

import { useMemo } from 'react';

interface PasswordRule {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordConditions: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const rules: PasswordRule[] = useMemo(() => {
    return [
      {
        label: 'Al menos 8 caracteres',
        test: (pwd) => pwd.length >= 8,
        met: password.length >= 8,
      },
      {
        label: 'Una letra mayúscula',
        test: (pwd) => /[A-Z]/.test(pwd),
        met: /[A-Z]/.test(password),
      },
      {
        label: 'Una letra minúscula',
        test: (pwd) => /[a-z]/.test(pwd),
        met: /[a-z]/.test(password),
      },
      {
        label: 'Un número',
        test: (pwd) => /[0-9]/.test(pwd),
        met: /[0-9]/.test(password),
      },
      {
        label: 'Un carácter especial',
        test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const allRulesMet = rules.every((rule) => rule.met);
  const metRulesCount = rules.filter((rule) => rule.met).length;

  if (!password) return null;

  return (
    <div className='password-requirements'>
      <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: '#64748b' }}>
        Seguridad: {allRulesMet ? '✓ Segura' : `${metRulesCount}/${rules.length} requisitos`}
      </p>
      {rules.map((rule, index) => (
        <p
          key={index}
          style={{
            color: rule.met ? '#10b981' : '#64748b',
            fontSize: '0.875rem',
            margin: '0.25rem 0',
          }}
        >
          {rule.met ? '✓' : '○'} {rule.label}
        </p>
      ))}
    </div>
  );
};

export default PasswordConditions;
