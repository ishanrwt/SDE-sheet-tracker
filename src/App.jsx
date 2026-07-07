import React, { useState, useEffect, useMemo } from 'react';
import { sheetData } from './data';
import './index.css';

const SCROLL_KEY = 'sdeScrollY';

function App() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('sdeProgress');
    if (saved) {
      try {
        setProgress(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
  }, []);

  useEffect(() => {
    const savedScroll = localStorage.getItem(SCROLL_KEY);
    if (!savedScroll) return;

    const y = Number(savedScroll);
    if (Number.isNaN(y)) return;

    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    const restoreScroll = () => window.scrollTo(0, y);
    requestAnimationFrame(() => requestAnimationFrame(restoreScroll));
  }, []);

  useEffect(() => {
    let timeoutId;

    const saveScroll = () => {
      localStorage.setItem(SCROLL_KEY, String(window.scrollY));
    };

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(saveScroll, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', saveScroll);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', saveScroll);
    };
  }, []);

  const handleCheck = (id, checked) => {
    const newProgress = { ...progress, [id]: checked };
    setProgress(newProgress);
    localStorage.setItem('sdeProgress', JSON.stringify(newProgress));
  };

  const { totalProblems, solvedProblems, percent } = useMemo(() => {
    let total = 0;
    sheetData.forEach(day => {
      total += day.problems.length;
    });

    const solved = Object.values(progress).filter(Boolean).length;
    const pct = total === 0 ? 0 : Number((solved / total * 100).toFixed(1));

    return { totalProblems: total, solvedProblems: solved, percent: pct };
  }, [progress]);

  return (
    <>
      <header>
        <h1>SDE Sheet Tracker</h1>
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${percent}%` }}></div>
        </div>
        <div className="stats">
          {solvedProblems} / {totalProblems} Solved ({percent}%)
        </div>
      </header>
      
      <main>
        {sheetData.map(day => (
          <div className="day-card" key={day.day}>
            <h2 className="day-header">Day {day.day}: {day.title}</h2>
            <div className="problems-list">
              {day.problems.map(prob => {
                const isCompleted = !!progress[prob.id];
                return (
                  <div className={`problem-item ${isCompleted ? 'completed' : ''}`} key={prob.id}>
                    <div className="checkbox-wrapper">
                      <input 
                        type="checkbox" 
                        id={prob.id}
                        checked={isCompleted}
                        onChange={(e) => handleCheck(prob.id, e.target.checked)}
                      />
                    </div>
                    <a 
                      href={prob.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="problem-link"
                    >
                      {prob.name}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

export default App;
