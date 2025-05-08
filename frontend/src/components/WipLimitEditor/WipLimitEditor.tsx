import React, { useState } from 'react';
import ActionButton from '../ActionButton/ActionButton';
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
          placeholder={t("WIP-limit")}
        />
      </div>
      <div className="d-flex gap-2">
        <ActionButton
          onClick={() => onSave(limit)}
          variant="success"
        >
          {t("save")}
        </ActionButton>
        <ActionButton
          onClick={onCancel}
          variant="default"
        >
          {t("cancel")}
        </ActionButton>
      </div>
    </div>
  );
};

export default WipLimitEditor;