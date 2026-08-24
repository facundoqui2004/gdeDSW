import React, { useState } from 'react';

export default function Quiz({ title, questions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (qIndex, oIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: oIndex
    }));
  };

  return (
    <div className="quiz-container">
      <h3>{title}</h3>
      {questions.map((q, qIndex) => {
        const selectedOption = selectedAnswers[qIndex];
        const isAnswered = selectedOption !== undefined;
        const isCorrect = isAnswered && q.options[selectedOption].correct;

        return (
          <div key={qIndex} className="quiz-question">
            <div className="quiz-title">{q.question}</div>
            <ul className="quiz-options">
              {q.options.map((opt, oIndex) => {
                let optClass = 'quiz-option';
                if (isAnswered) {
                  if (opt.correct) {
                    optClass += ' correct';
                  } else if (selectedOption === oIndex) {
                    optClass += ' incorrect';
                  }
                }

                return (
                  <li 
                    key={oIndex} 
                    className={optClass}
                    onClick={() => handleSelect(qIndex, oIndex)}
                  >
                    {opt.text}
                  </li>
                );
              })}
            </ul>

            {isAnswered && (
              <div 
                className="quiz-explanation"
                style={{
                  display: 'block',
                  backgroundColor: isCorrect ? 'var(--tip-bg)' : 'var(--warn-bg)',
                  color: isCorrect ? 'var(--tip-text)' : 'var(--warn-text)',
                  border: isCorrect ? '1px solid var(--tip-border)' : '1px solid var(--warn-border)'
                }}
              >
                <strong>{isCorrect ? '¡Correcto! ' : 'Explicación: '}</strong>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
