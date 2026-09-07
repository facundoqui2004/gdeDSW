import React, { useState } from 'react';

export default function Quiz({ title, questions }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const handleSelect = (qIndex, oIndex) => {
    // Solo permite seleccionar una vez por pregunta
    if (selectedAnswers[qIndex] !== undefined) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: oIndex
    }));
  };

  return (
    <div className="quiz-container">
      {title && <h3>{title}</h3>}
      {questions.map((q, qIndex) => {
        const selectedOption = selectedAnswers[qIndex];
        const isAnswered = selectedOption !== undefined;
        const isCorrect = isAnswered && selectedOption === q.correct;

        return (
          <div key={qIndex} className="quiz-question">
            <div className="quiz-title">
              <strong>{qIndex + 1}.</strong> {q.question}
            </div>
            <ul className="quiz-options">
              {q.options.map((opt, oIndex) => {
                let optClass = 'quiz-option';
                if (isAnswered) {
                  if (oIndex === q.correct) {
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
                    style={{ cursor: isAnswered ? 'default' : 'pointer' }}
                  >
                    {opt}
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
                <strong>{isCorrect ? '✅ ¡Correcto! ' : '❌ Incorrecto — '}</strong>
                {q.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
