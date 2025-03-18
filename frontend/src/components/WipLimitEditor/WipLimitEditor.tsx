import React, { useState } from 'react';
import ActionButton from '../ActionButton/ActionButton';

interface WipLimitEditorProps {
  currentLimit: number;
  onSave: (newLimit: number) => void;
  onCancel: () => void;
}

const WipLimitEditor: React.FC<WipLimitEditorProps> = ({
  currentLimit,
  onSave,
  onCancel,
}) => {
  const [limit, setLimit] = useState(currentLimit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLimit(isNaN(value) ? 0 : value);
  };

  return (
    <div className="wip-limit-editor">
      <div className="input-group mb-2">
        <input
          type="number"
          min="0"
          value={limit}
          onChange={handleChange}
          className="form-control"
          placeholder="WIP Limit"
        />
      </div>
      <div className="d-flex gap-2">
        <ActionButton
          onClick={() => onSave(limit)}
          variant="success"
        >
          Zapisz
        </ActionButton>
        <ActionButton
          onClick={onCancel}
          variant="default"
        >
          Anuluj
        </ActionButton>
      </div>
    </div>
  );
};

export default WipLimitEditor;