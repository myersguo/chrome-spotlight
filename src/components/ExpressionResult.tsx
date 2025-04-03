import React, { useState } from 'react';

interface ExpressionResultProps {
  expression: string;
  result: string;
}

const ExpressionResult: React.FC<ExpressionResultProps> = ({ expression, result }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${result}`);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1500);
  };

  return (
    <div className="spotlight-expression">
      <div className="expression-result-row">
        <div className="expression-text">{expression} = {result}</div>
        <div className="copy-container">
          <button className="copy-button" onClick={handleCopy}>
            📋
          </button>
          {showTooltip && <div className="tooltip">Copied</div>}
        </div>
      </div>
    </div>
  );
};

export default ExpressionResult;
