import React from 'react';
import styles from './ActionButton.module.scss';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'success' | 'default';
  fullWidth?: boolean;
  title?: string;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  variant = 'default',
  fullWidth = false,
  title,
  children
}) => {
  const getClassNames = () => {
    const classNames = [styles.actionButton];
    
    if (variant === 'primary') classNames.push(styles.primary);
    if (variant === 'danger') classNames.push(styles.danger);
    if (variant === 'success') classNames.push(styles.success);
    if (fullWidth) classNames.push(styles.fullWidth);
    if (disabled) classNames.push(styles.disabled);
    
    return classNames.join(' ');
  };

  return (
    <button
      onClick={onClick}
      className={getClassNames()}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  );
};

export default ActionButton;