import React, { useState, useEffect } from 'react';
import EyeTracker from './EyeTracker';
import axios from 'axios';

const testDatabase = {
  1: { 
    level: 'Easy', 
    memory: ['Apple', 'Train', 'Ocean'], 
    qa: [
      { q: 'What color is the sky on a clear day?', options: ['Red', 'Blue', 'Green', 'Yellow'], a: 'Blue' },
      { q: 'What is 5 + 3?', options: ['7', '8', '9', '10'], a: '8' },
      { q: 'Which animal purrs and likes milk?', options: ['Dog', 'Cat', 'Bird', 'Fish'], a: 'Cat' },
      { q: 'What do we use to tell the time?', options: ['Book', 'Phone', 'Watch', 'Pen'], a: 'Watch' },
      { q: 'How many days are in a week?', options: ['5', '6', '7', '8'], a: '7' }
    ],
    speech: 'The quick brown fox jumps over the lazy dog.'
  },
  2: { 
    level: 'Easy', 
    memory: ['Cat', 'Table', 'Pen', 'Sand'], 
    qa: [
      { q: 'How many legs does a spider have?', options: ['4', '6', '8', '10'], a: '8' },
      { q: 'Which month comes after January?', options: ['March', 'February', 'April', 'May'], a: 'February' },
      { q: 'What is the opposite of hot?', options: ['Warm', 'Cold', 'Spicy', 'Dry'], a: 'Cold' },
      { q: 'What shape is a standard soccer ball?', options: ['Square', 'Triangle', 'Round', 'Flat'], a: 'Round' },
      { q: 'Which fruit is typically yellow and long?', options: ['Apple', 'Banana', 'Grape', 'Orange'], a: 'Banana' }
    ],
    speech: 'A rolling stone gathers no moss.'
  },
  3: { 
    level: 'Medium', 
    memory: ['Elephant', 'Guitar', 'Cloud', 'Book', 'Window'], 
    qa: [
      { q: 'Which planet is known as the Red Planet?', options: ['Earth', 'Mars', 'Jupiter', 'Saturn'], a: 'Mars' },
      { q: 'What is the capital of France?', options: ['London', 'Berlin', 'Paris', 'Madrid'], a: 'Paris' },
      { q: 'How many minutes are in an hour?', options: ['50', '60', '80', '100'], a: '60' },
      { q: 'What is the largest mammal in the world?', options: ['Elephant', 'Blue Whale', 'Giraffe', 'Shark'], a: 'Blue Whale' },
      { q: 'What is 15 - 7?', options: ['6', '7', '8', '9'], a: '8' }
    ],
    speech: 'To be or not to be, that is the question.'
  },
  4: { 
    level: 'Medium', 
    memory: ['Laptop', 'Sun', 'Bottle', 'Grass', 'Cloud'], 
    qa: [
      { q: 'How many continents are there?', options: ['5', '6', '7', '8'], a: '7' },
      { q: 'What is 12 x 5?', options: ['50', '60', '70', '80'], a: '60' },
      { q: 'Which element does "O" represent on the periodic table?', options: ['Gold', 'Oxygen', 'Iron', 'Silver'], a: 'Oxygen' },
      { q: 'What color do you get by mixing red and blue?', options: ['Green', 'Orange', 'Purple', 'Brown'], a: 'Purple' },
      { q: 'Who painted the Mona Lisa?', options: ['Van Gogh', 'Picasso', 'Leonardo da Vinci', 'Claude Monet'], a: 'Leonardo da Vinci' }
    ],
    speech: 'Early bird catches the worm.'
  },
  5: { 
    level: 'Hard', 
    memory: ['Triangle', 'Purple', 'Freedom', 'Ocean', 'Symphony'], 
    qa: [
      { q: 'Who wrote "Romeo and Juliet"?', options: ['Charles Dickens', 'William Shakespeare', 'Mark Twain', 'Leo Tolstoy'], a: 'William Shakespeare' },
      { q: 'What is the square root of 64?', options: ['6', '7', '8', '9'], a: '8' },
      { q: 'In which year did World War II end?', options: ['1918', '1939', '1945', '1950'], a: '1945' },
      { q: 'What is the hardest natural substance?', options: ['Gold', 'Iron', 'Diamond', 'Quartz'], a: 'Diamond' },
      { q: 'Which country is also a continent?', options: ['Brazil', 'Australia', 'India', 'Canada'], a: 'Australia' }
    ],
    speech: 'An apple a day keeps the doctor away.'
  },
  6: { 
    level: 'Hard', 
    memory: ['Diamond', 'Jungle', 'Harmony', 'Velocity', 'Ancient'], 
    qa: [
      { q: 'What is the chemical symbol for water?', options: ['O2', 'CO2', 'H2O', 'HO'], a: 'H2O' },
      { q: 'Which is the largest ocean?', options: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], a: 'Pacific' },
      { q: 'How many bones are in the adult human body?', options: ['186', '206', '216', '256'], a: '206' },
      { q: 'What is the boiling point of water in Celsius?', options: ['90', '100', '110', '120'], a: '100' },
      { q: 'Who discovered gravity?', options: ['Albert Einstein', 'Isaac Newton', 'Galileo Galilee', 'Nikola Tesla'], a: 'Isaac Newton' }
    ],
    speech: 'Every cloud has a silver lining.'
  },
  7: { 
    level: 'Expert', 
    memory: ['Banana', 'Helicopter', 'Sapphire', 'Oxygen', 'Zebra', 'Velvet'], 
    qa: [
      { q: 'What is the currency of Japan?', options: ['Yuan', 'Yen', 'Won', 'Dollar'], a: 'Yen' },
      { q: 'Which gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], a: 'Carbon Dioxide' },
      { q: 'What is the capital of Australia?', options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'], a: 'Canberra' },
      { q: 'How many players are on a standard football (soccer) team?', options: ['9', '10', '11', '12'], a: '11' },
      { q: 'What is the value of Pi to two decimal places?', options: ['3.12', '3.14', '3.16', '3.18'], a: '3.14' }
    ],
    speech: 'Supercalifragilisticexpialidocious.'
  }
};

const CognitiveTest = ({ day, onComplete }) => {
  const [step, setStep] = useState(0); 
  const [currentQAIndex, setCurrentQAIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attention, setAttention] = useState(100);
  const [startTime, setStartTime] = useState(0);
  const [answerInput, setAnswerInput] = useState('');
  const [memoryShowing, setMemoryShowing] = useState(true);
  const [memoryTimer, setMemoryTimer] = useState(5);
  const [reactionPhase, setReactionPhase] = useState('wait'); // 'wait', 'ready', 'clicked'
  const [reactionTime, setReactionTime] = useState(0);
  
  const currentTest = testDatabase[day] || testDatabase[1];
  const maxScore = 55; // 10 memory, 25 QA, 10 speech, 10 reaction

  const [speechResult, setSpeechResult] = useState('');
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    let timer;
    if (step === 1 && memoryTimer > 0) {
      timer = setTimeout(() => setMemoryTimer(t => t - 1), 1000);
    } else if (step === 1 && memoryTimer === 0) {
      setMemoryShowing(false);
      handleNextStep();
    }
    return () => clearTimeout(timer);
  }, [step, memoryTimer]);

  useEffect(() => {
    let reactionTimer;
    if (step === 5 && reactionPhase === 'wait') {
      const delay = Math.random() * 3000 + 2000; // 2-5 seconds
      reactionTimer = setTimeout(() => {
        setReactionPhase('ready');
        setReactionTime(Date.now());
      }, delay);
    }
    return () => clearTimeout(reactionTimer);
  }, [step, reactionPhase]);

  const handleNextStep = () => {
    if (step === 0) {
      setStartTime(Date.now());
      setMemoryTimer(day > 4 ? 3 : 5);
    }
    setStep(s => s + 1);
  };

  const submitTest = async () => {
    const timeTaken = (Date.now() - startTime) / 1000;
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://cognicare-1-lxfi.onrender.com/api/tests/submit', {
        day,
        score,
        maxScore,
        averageResponseTime: timeTaken,
        attentionScore: attention,
        testBreakdown: {
          memory: score >= 10 ? 10 : score,
          reaction: 10, // Placeholder
          qa: score >= 35 ? 25 : (score - 20 > 0 ? score - 20 : 0), // Basic logic
          speech: 10
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onComplete();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit test');
    }
  };

  const handleSpeechTest = () => {
    if (!SpeechRecognition) return alert("Browser does not support Speech Recognition");
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpeechResult(transcript);
      const similarity = transcript.toLowerCase().includes(currentTest.speech.split(' ')[0].toLowerCase());
      if (similarity) setScore(s => s + 10);
    };
  };

  const handleQA = (option) => {
    if (option === currentTest.qa[currentQAIndex].a) {
      setScore(s => s + 5);
    }
    if (currentQAIndex < currentTest.qa.length - 1) {
      setCurrentQAIndex(i => i + 1);
    } else {
      handleNextStep();
    }
  };

  if (step === 0) {
    return (
      <div className="test-card animate-in text-center" style={{padding: '40px'}}>
        <div style={{fontSize: '56px', marginBottom: '24px'}}>📋</div>
        <h2>Day {day} Cognitive Test</h2>
        <p className="mt-4" style={{color: 'var(--text2)', fontSize: '16px'}}>Difficulty: <strong className={`risk-${currentTest.level.toLowerCase()}`}>{currentTest.level}</strong></p>
        <div className="alert alert-info mt-6 text-left">
           <strong>How it works:</strong>
           <ul className="mt-2" style={{marginLeft: '20px', fontSize: '14px'}}>
             <li>Memory: Memorize words and recall them later.</li>
             <li>Q&A: Answer 5 cognitive reasoning questions.</li>
             <li>Speech: Repeat the sentence shown on screen.</li>
             <li>Reaction: Click the button as soon as it turns green.</li>
           </ul>
        </div>
        <button className="btn-primary mt-8 py-4 px-12 rounded-full shadow-lg hover:scale-105" onClick={handleNextStep}>Start Assessment</button>
      </div>
    );
  }

  return (
    <>
      <div className="card mb-4 border-l-4 border-blue-500">
        <div className="d-flex justify-between align-center mb-4">
           <div>
             <h3 className="text-xl font-bold">Assessment in Progress</h3>
             <p className="text-sm text2">Please focus on the screen for accurate attention tracking.</p>
           </div>
           <div className="badge badge-blue px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold">Day {day}</div>
        </div>
        
        <div className="tab-row">
           <div className={`tab-btn ${step <= 2 ? 'active' : ''}`}>🧠 Memory</div>
           <div className={`tab-btn ${step === 3 ? 'active' : ''}`}>💡 Q&A</div>
           <div className={`tab-btn ${step === 4 ? 'active' : ''}`}>🗣️ Speech</div>
           <div className={`tab-btn ${step === 5 ? 'active' : ''}`}>⚡ Reaction</div>
        </div>
      </div>

      <div className="grid-6-4">
        <div className="card animate-in min-h-[450px] d-flex flex-col justify-center">
          {step === 1 && (
            <div className="text-center py-6">
              <h3 className="mb-4 text-2xl font-bold text-slate-800">Memory Challenge</h3>
              <p className="mb-8 text-slate-500">Memorize these words. They will disappear in <span className="text-red-500 font-bold text-xl">{memoryTimer}s</span>.</p>
              <div className="word-card-container d-flex gap-4 justify-center flex-wrap">
                {currentTest.memory.map((word, idx) => (
                  <div key={idx} className="word-bubble px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-xl border border-blue-100 shadow-sm animate-pulse">
                    {word}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-6 px-4">
              <h3 className="mb-4 text-2xl font-bold text-slate-800">Recall Assessment</h3>
              <p className="mb-6 text-slate-500">Type the words you just saw (comma separated):</p>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-100 p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all text-lg" 
                  value={answerInput} 
                  onChange={e => setAnswerInput(e.target.value)} 
                  placeholder="e.g. Apple, Train, Ocean" 
                />
              </div>
              <button className="btn-primary mt-8 w-100 py-4 rounded-xl text-lg font-bold shadow-md hover:translate-y-[-2px]" onClick={() => {
                const words = answerInput.toLowerCase().split(',').map(w => w.trim());
                let found = 0;
                currentTest.memory.forEach(m => { if (words.includes(m.toLowerCase())) found++; });
                if (found > 0) setScore(s => s + (Math.min(found, 3) * 3.33)); // Max 10 pts
                handleNextStep();
              }}>Submit Answer</button>
            </div>
          )}

          {step === 3 && (
            <div className="py-4">
              <div className="d-flex justify-between mb-4">
                <h3 className="text-2xl font-bold">Cognitive Q&A</h3>
                <span style={{color: 'var(--blue)', fontWeight: '700'}}>{currentQAIndex + 1} / {currentTest.qa.length}</span>
              </div>
              <div className="progress-bar mb-8" style={{height: '6px'}}>
                <div className="progress-fill" style={{width: `${((currentQAIndex + 1) / currentTest.qa.length) * 100}%`, background: 'var(--blue)'}}></div>
              </div>
              <p className="mb-8 font-medium" style={{fontSize: '20px', lineHeight: '1.4', color: 'var(--text)'}}>{currentTest.qa[currentQAIndex].q}</p>
              <div className="grid-2 gap-4">
                {currentTest.qa[currentQAIndex].options.map((opt, oIdx) => (
                  <button 
                    key={`${opt}-${oIdx}`} 
                    className="btn-outline p-4 transition-all text-left" 
                    style={{borderRadius: '12px', fontSize: '18px', fontWeight: '500'}}
                    onClick={() => handleQA(opt)}
                  >
                    <span className="option-text">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <h3 className="mb-4 text-2xl font-bold">Speech Recall</h3>
              <p className="mb-8" style={{color: 'var(--text2)'}}>Wait for the sentence to appear, then click record and repeat it clearly.</p>
              <div className="p-8 alert alert-info mb-8" style={{fontSize: '20px', fontWeight: '500', borderRadius: '16px', border: '2px dashed var(--border)', background: 'var(--bg)'}}>
                "{currentTest.speech}"
              </div>
              <div className="d-flex justify-center gap-4">
                {!speechResult ? (
                  <button className="btn-blue py-4 px-8" style={{borderRadius: '99px', boxShadow: 'var(--shadow-md)'}} onClick={handleSpeechTest}>🎤 Start Recording</button>
                ) : (
                  <div className="animate-in" style={{color: 'var(--green)', fontWeight: '700', fontSize: '18px'}}>✅ Recording Captured</div>
                )}
              </div>
              {speechResult && (
                <div className="mt-8 p-4 alert alert-success" style={{fontSize: '14px'}}>
                  <strong>Transcribed:</strong> "{speechResult}"
                </div>
              )}
              <button className="btn-primary mt-8 w-100 py-4" style={{borderRadius: '12px', fontSize: '18px', fontWeight: '700'}} onClick={handleNextStep}>Next Category</button>
            </div>
          )}

          {step === 5 && (
            <div className="text-center py-6">
              <h3 className="mb-4 text-2xl font-bold">Reaction Speed</h3>
              <p className="mb-8" style={{color: 'var(--text2)'}}>When the circle turns <span style={{color: 'var(--green)', fontWeight: '700'}}>GREEN</span>, click it as fast as you can!</p>
              
              <div 
                className="animate-in"
                style={{
                  width: '240px',
                  height: '240px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  background: reactionPhase === 'ready' ? 'var(--green)' : 'var(--red)',
                  transform: reactionPhase === 'ready' ? 'scale(1.1)' : 'scale(1)',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: '900',
                  letterSpacing: '2px'
                }}
                onClick={() => {
                  if (reactionPhase === 'wait') {
                    alert("Too early! Focus and wait for green.");
                    setScore(s => Math.max(0, s - 2));
                  } else if (reactionPhase === 'ready') {
                    const diff = Date.now() - reactionTime;
                    setReactionPhase('clicked');
                    if (diff < 500) setScore(s => s + 10);
                    else if (diff < 1000) setScore(s => s + 7);
                    else setScore(s => s + 5);
                    
                    setTimeout(() => handleNextStep(), 1000);
                  }
                }}
              >
                {reactionPhase === 'wait' ? 'WAIT...' : reactionPhase === 'ready' ? 'CLICK!' : 'GOOD!'}
              </div>
              
              <div className="mt-12" style={{color: 'var(--text3)', fontSize: '13px'}}>
                Reaction time directly measures neuro-motor coordination.
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="text-center py-8">
              <div style={{fontSize: '64px', marginBottom: '24px'}}>🎉</div>
              <h2 className="mb-4" style={{fontSize: '32px', fontWeight: '900'}}>Assessment Complete!</h2>
              <p className="mb-8" style={{fontSize: '18px', color: 'var(--text2)'}}>You've successfully completed the Day {day} cognitive check-in.</p>
              
              <div className="p-6 mb-8" style={{background: 'var(--blue-light)', borderRadius: '20px', border: '1px solid var(--border)'}}>
                <div style={{fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--blue)', marginBottom: '8px'}}>Estimated Accuracy</div>
                <div style={{fontSize: '48px', fontWeight: '900', color: 'var(--text)'}}>{((score / maxScore) * 100).toFixed(0)}%</div>
              </div>
              
              <button className="btn-primary p-5 w-100" style={{borderRadius: '16px', fontSize: '20px', fontWeight: '700', boxShadow: 'var(--shadow-md)'}} onClick={submitTest}>Submit Results & Save Progress</button>
            </div>
          )}
        </div>
        
        <div className="card">
          <div className="d-flex align-center gap-2 mb-4">
            <span style={{fontSize: '24px'}}>🎥</span>
            <h3 className="font-bold">Eye Attention</h3>
          </div>
          <div className="mb-4 card-sub">Tracking your focus levels in real-time. Keep your head centered.</div>
          {step < 6 && <EyeTracker onAttentionChange={(val) => setAttention(val)} />}
          <div className="mt-4 p-3" style={{background: 'var(--bg)', borderRadius: '10px', fontSize: '12px', color: 'var(--text2)'}}>
            Current Attention: <strong>{attention}%</strong>
          </div>
        </div>
      </div>
    </>
  );
};

export default CognitiveTest;
