import React, { useState, useEffect } from 'react';
import WaveformCanvas from './components/WaveformCanvas';
import { vitalsTracker } from './utils/signalGenerators';
import { scenarios } from './utils/scenarios';
import { Activity, HeartPulse, Settings, Volume2 } from 'lucide-react';

const InputControl = ({label, value, max, step = 1, onChange}) => (
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <label style={{fontSize: '0.7rem', color: 'var(--color-text-dim)'}}>{label}</label>
    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
        <input 
          type="number" 
          min="0" 
          max={max} 
          step={step}
          value={value} 
          onChange={e => onChange(parseFloat(e.target.value) || 0)} 
          style={{
            width: '50px', 
            background: 'var(--color-bg)', 
            color: 'white', 
            border: '1px solid var(--color-border)', 
            borderRadius: '4px', 
            padding: '2px 5px',
            fontFamily: 'inherit'
          }} 
        />
        <input 
          type="range" 
          min="0" 
          max={max} 
          step={step}
          value={value} 
          onChange={e => onChange(parseFloat(e.target.value) || 0)} 
          style={{flex: 1}} 
        />
    </div>
  </div>
);

const PillUpDown = ({ label, onDown, onUp, style }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#111', border: '1px solid #333', borderRadius: '20px',
    padding: '2px 8px', width: '130px', color: 'white', fontWeight: 'bold', fontSize: '0.65rem',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8)',
    ...style
  }}>
    <button style={{background:'transparent', border:'none', color:'white', padding:'4px', fontSize: '0.8rem'}} onClick={onDown}>▼</button>
    <div style={{textAlign: 'center', lineHeight: 1.1}}>{label}</div>
    <button style={{background:'transparent', border:'none', color:'white', padding:'4px', fontSize: '0.8rem'}} onClick={onUp}>▲</button>
  </div>
);

const PillButton = ({ label, color, bgColor, icon, onClick, style, iconColor }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    background: bgColor || '#111', color: color || 'white', border: '1px solid #333', borderRadius: '20px',
    padding: '6px 12px', width: '130px', fontWeight: 'bold', fontSize: '0.75rem',
    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.5)', ...style
  }}>
    {icon && <span style={{fontSize: '0.7rem', color: iconColor || (color === 'black' ? 'black' : '#bbf'), textShadow: iconColor === '#0f0' ? '0 0 8px #0f0' : 'none'}}>{icon}</span>}
    {label}
  </button>
);

export default function App() {
  const [vitals, setVitals] = useState({
    hr: 60,
    bpSys: 120,
    bpDia: 80,
    spo2: 98,
    co2: 40,
    rr: 12,
    temp: 98.7
  });

  const [rhythm, setRhythm] = useState('nsr'); // nsr, brady, tachy, svt, vtach, vfib_coarse, vfib_fine, asystole, cpr
  const [isRhythmModalOpen, setIsRhythmModalOpen] = useState(false);
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [activeScenario, setActiveScenario] = useState(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [targetVitals, setTargetVitals] = useState(null);
  const driftStepsRef = React.useRef({ hr:1, bpSys:1, bpDia:1, spo2:1, co2:1, rr:1, temp:0.1 });
  const [preCprState, setPreCprState] = useState(null);
  
  // Interventions State
  const [isDefibOn, setIsDefibOn] = useState(false);
  const [isSyncOn, setIsSyncOn] = useState(false);
  const [isPacerOn, setIsPacerOn] = useState(false);
  const [isPacerPaused, setIsPacerPaused] = useState(false);
  const [joules, setJoules] = useState(200);
  const [pacerRate, setPacerRate] = useState(70);
  const [pacerOutput, setPacerOutput] = useState(5);
  const [shocks, setShocks] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const [monitorMessage, setMonitorMessage] = useState("");

  // Visibility State
  const [showHR, setShowHR] = useState(true);
  const [showBP, setShowBP] = useState(true);
  const [showSPO2, setShowSPO2] = useState(true);
  const [showCO2, setShowCO2] = useState(true);

  // System & Settings State
  const [time, setTime] = useState(new Date());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Vitals drifting logic — steps are pre-computed to complete in 2 seconds (10 ticks × 200ms)
  useEffect(() => {
    if (!targetVitals) return;
    
    const s = driftStepsRef.current;
    const interval = setInterval(() => {
      setVitals(prev => {
        let allMatched = true;
        const next = { ...prev };
        
        const step = (current, target, maxStep) => {
          if (Math.abs(current - target) <= maxStep) return target;
          allMatched = false;
          return current < target ? current + maxStep : current - maxStep;
        };

        next.hr   = step(prev.hr,    targetVitals.hr,    s.hr);
        next.bpSys = step(prev.bpSys, targetVitals.bpSys, s.bpSys);
        next.bpDia = step(prev.bpDia, targetVitals.bpDia, s.bpDia);
        next.spo2  = step(prev.spo2,  targetVitals.spo2,  s.spo2);
        next.co2   = step(prev.co2,   targetVitals.co2,   s.co2);
        next.rr    = step(prev.rr,    targetVitals.rr,    s.rr);
        next.temp  = step(prev.temp,  targetVitals.temp,  s.temp);

        if (allMatched) setTargetVitals(null);
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [targetVitals]);

  const toggleDefib = () => {
    if (isDefibOn) {
      setIsDefibOn(false);
      setIsSyncOn(false);
      setIsCharging(false);
      setIsCharged(false);
      setMonitorMessage("");
    } else {
      setIsDefibOn(true);
    }
  };

  const handleCharge = () => {
    if (!isDefibOn) return;
    setIsCharging(true);
    setIsCharged(false);
    setMonitorMessage("CHARGING...");
    setTimeout(() => {
      setIsCharging(false);
      setIsCharged(true);
      setMonitorMessage(`${joules}J READY`);
    }, 2000);
  };

  const handleShock = () => {
    if (!isDefibOn) return;
    if (isCharged) {
       setShocks(s => s + 1);
       setIsCharged(false);
       
       vitalsTracker.triggerShock();
       
       setMonitorMessage(`${joules}J DELIVERED`);
       setTimeout(() => setMonitorMessage(""), 3000);
    }
  };

  const adjustJoules = (diff) => {
    setJoules(prev => {
      let next = prev + diff;
      if (next > 200) next = 200;
      if (next < 120) next = 120;
      return next;
    });
  };
  
  // Keep singleton tracker in sync with React state
  useEffect(() => {
    vitalsTracker.setHR(vitals.hr);
    vitalsTracker.setRR(vitals.rr);
    vitalsTracker.setSPO2(vitals.spo2);
    vitalsTracker.setCO2(vitals.co2);
    vitalsTracker.setRhythmState(rhythm);
  }, [vitals.hr, vitals.rr, vitals.spo2, vitals.co2, rhythm]);

  useEffect(() => {
    vitalsTracker.setPacer(isPacerOn, isPacerPaused, pacerRate, pacerOutput);
  }, [isPacerOn, isPacerPaused, pacerRate, pacerOutput]);

  useEffect(() => {
    vitalsTracker.setAudioParams(isMuted, volume);
  }, [isMuted, volume]);

  useEffect(() => {
    vitalsTracker.setDefibState(isCharging, isCharged);
  }, [isCharging, isCharged]);

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    const handleInitialClick = () => {
      vitalsTracker.initAudio();
      document.removeEventListener('click', handleInitialClick);
    };
    document.addEventListener('click', handleInitialClick);
    return () => document.removeEventListener('click', handleInitialClick);
  }, []);

  const updateVital = (key, value) => {
    setVitals(v => ({ ...v, [key]: value }));
    setTargetVitals(null); // Cancel automatic drift on manual override
  };

  const DRIFT_TICKS = 10; // 10 × 200ms = 2 seconds

  const loadScenarioStage = (stage) => {
     const tv = stage.vitals;
     // Capture step sizes from current vitals at the moment of load
     driftStepsRef.current = {
       hr:    Math.max(1,   Math.ceil(Math.abs(tv.hr    - vitals.hr)    / DRIFT_TICKS)),
       bpSys: Math.max(1,   Math.ceil(Math.abs(tv.bpSys - vitals.bpSys) / DRIFT_TICKS)),
       bpDia: Math.max(1,   Math.ceil(Math.abs(tv.bpDia - vitals.bpDia) / DRIFT_TICKS)),
       spo2:  Math.max(1,   Math.ceil(Math.abs(tv.spo2  - vitals.spo2)  / DRIFT_TICKS)),
       co2:   Math.max(1,   Math.ceil(Math.abs(tv.co2   - vitals.co2)   / DRIFT_TICKS)),
       rr:    Math.max(1,   Math.ceil(Math.abs(tv.rr    - vitals.rr)    / DRIFT_TICKS)),
       temp:  Math.max(0.1, Math.abs(tv.temp  - vitals.temp)  / DRIFT_TICKS),
     };
     // If CPR is active, queue the new rhythm as the post-CPR state instead of interrupting it
     if (rhythm === 'cpr') {
       setPreCprState(prev => ({ ...prev, rhythm: stage.rhythm }));
     } else {
       setRhythm(stage.rhythm);
     }
     setTargetVitals(tv);
  };

  const loadScenario = (scenario) => {
      setActiveScenario(scenario);
      setCurrentStageIndex(0);
      setIsScenarioModalOpen(false);
      loadScenarioStage(scenario.stages[0]);
  };

  const nextStage = () => {
     if (activeScenario && currentStageIndex < activeScenario.stages.length - 1) {
         const nextIdx = currentStageIndex + 1;
         setCurrentStageIndex(nextIdx);
         loadScenarioStage(activeScenario.stages[nextIdx]);
     }
  };

  const prevStage = () => {
     if (activeScenario && currentStageIndex > 0) {
         const prevIdx = currentStageIndex - 1;
         setCurrentStageIndex(prevIdx);
         loadScenarioStage(activeScenario.stages[prevIdx]);
     }
  };

  const handleRhythmSelect = (newRhythm, defaultHr) => {
    if (rhythm === 'cpr') {
      setPreCprState({ rhythm: newRhythm, hr: defaultHr !== undefined ? defaultHr : vitals.hr });
    } else {
      setRhythm(newRhythm);
      if (defaultHr !== undefined) updateVital('hr', defaultHr);
    }
    setIsRhythmModalOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      let handled = true;
      switch(e.key.toLowerCase()) {
        case 'q': updateVital('hr', vitals.hr + 5); break;
        case 'a': updateVital('hr', Math.max(0, vitals.hr - 5)); break;
        case 'w': updateVital('bpSys', vitals.bpSys + 5); break;
        case 's': updateVital('bpSys', Math.max(0, vitals.bpSys - 5)); break;
        case 'e': updateVital('bpDia', vitals.bpDia + 5); break;
        case 'd': updateVital('bpDia', Math.max(0, vitals.bpDia - 5)); break;
        case 'r': updateVital('spo2', Math.min(100, vitals.spo2 + 1)); break;
        case 'f': updateVital('spo2', Math.max(0, vitals.spo2 - 1)); break;
        case 't': updateVital('rr', vitals.rr + 1); break;
        case 'g': updateVital('rr', Math.max(0, vitals.rr - 1)); break;
        case 'y': updateVital('co2', vitals.co2 + 1); break;
        case 'h': updateVital('co2', Math.max(0, vitals.co2 - 1)); break;
        case '1': handleRhythmSelect('nsr', 60); break;
        case '2': handleRhythmSelect('brady', 40); break;
        case '3': handleRhythmSelect('tachy', 120); break;
        case '4': handleRhythmSelect('svt', 160); break;
        case '5': handleRhythmSelect('afib_rvr', 140); break;
        case '6': handleRhythmSelect('vtach', 180); break;
        case '7': handleRhythmSelect('mobitz1', 70); break;
        case '8': handleRhythmSelect('mobitz2', 70); break;
        case '9': handleRhythmSelect('complete_hb', 35); break;
        case '0': handleRhythmSelect('vfib_coarse'); break;
        case '-': handleRhythmSelect('vfib_fine'); break;
        case '=': handleRhythmSelect('asystole', 0); break;
        default: handled = false; break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rhythm, vitals, preCprState]);

  const handleCPR = () => {
    if (rhythm === 'cpr') {
      if (preCprState) {
        setRhythm(preCprState.rhythm);
        updateVital('hr', preCprState.hr);
      } else {
        setRhythm('nsr');
        updateVital('hr', 60);
      }
      setPreCprState(null);
    } else {
      setPreCprState({ rhythm, hr: vitals.hr });
      setRhythm('cpr');
      updateVital('hr', 110);
    }
  };

  // derived display vitals
  const isDead = rhythm === 'vfib_coarse' || rhythm === 'vfib_fine' || rhythm === 'asystole';
  const showDashes = isDead || rhythm === 'cpr';
  
  // Calculate if the pacer is actively capturing control of the heart rate
  const isPacerCapturing = isPacerOn && !isPacerPaused && pacerOutput >= 70 && rhythm !== 'vfib_coarse' && rhythm !== 'vfib_fine' && rhythm !== 'cpr';
  const effectiveHR = (isPacerCapturing && pacerRate > vitals.hr) ? pacerRate : vitals.hr;
  
  const displayHR = (rhythm === 'vfib_coarse' || rhythm === 'vfib_fine') ? '---' : 
                    (rhythm === 'asystole' && !isPacerCapturing) ? '---' : effectiveHR;

  const displayBPSys = showDashes ? '---' : vitals.bpSys;
  const displayBPDia = showDashes ? '---' : vitals.bpDia;
  const displayMAP = showDashes ? '---' : Math.round((vitals.bpSys + 2 * vitals.bpDia) / 3);
  const displaySPO2 = showDashes ? '---' : vitals.spo2;
  const displayTemp = showDashes ? '---' : vitals.temp.toFixed(1);
  const displayRR = showDashes ? '---' : vitals.rr;

  return (
    <>
      <div className="monitor-grid">
        <div className="waveform-section">
          {/* ECG Channel */}
          {showHR && (
            <div className="waveform-row" style={{position: 'relative'}}>
              {monitorMessage && (
                 <div style={{position: 'absolute', top: 10, left: '30%', color: '#ffcc00', fontSize: '1.5rem', fontWeight: 'bold', zIndex: 10, border: '2px solid #ffcc00', padding: '5px 20px', background: 'rgba(0,0,0,0.8)', borderRadius: '5px', letterSpacing: '2px'}}>
                    {monitorMessage}
                 </div>
              )}
              <WaveformCanvas 
                signalGenerator={(t) => vitalsTracker.getECG(t, rhythm)} 
                color="var(--color-ecg)" 
                speed={2} 
                amplitude={0.8} 
                drawSyncMarkers={isSyncOn}
                pacerSpikeDetector={isPacerOn && !isPacerPaused ? () => vitalsTracker.pollPacerSpike() : null}
              />
              <div className="vital-readout">
                <div className="vital-label">Current Heart Rate</div>
                <div className="vital-value" style={{color: 'var(--color-ecg)'}}>{displayHR}</div>
              </div>
            </div>
          )}

          {/* Arterial / BP Channel */}
          {showBP && (
            <div className="waveform-row">
              <WaveformCanvas 
                signalGenerator={(t) => vitalsTracker.getBP(t, rhythm)} 
                color="var(--color-bp)" 
                speed={2} 
                amplitude={0.7} 
              />
              <div className="vital-readout">
                <div className="vital-label">Current Pressure</div>
                <div className="vital-value" style={{color: 'var(--color-bp)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center'}}>
                  <div>{displayBPSys}<span style={{fontSize: '2rem'}}>/{displayBPDia}</span></div>
                  <div style={{fontSize: '1.8rem', lineHeight: '1', marginTop: '-5px'}}>({displayMAP})</div>
                </div>
              </div>
            </div>
          )}

          {/* SPO2 Channel */}
          {showSPO2 && (
            <div className="waveform-row">
              <WaveformCanvas 
                signalGenerator={(t) => vitalsTracker.getSPO2(t, rhythm)} 
                color="var(--color-spo2)" 
                speed={2} 
                amplitude={0.6} 
              />
              <div className="vital-readout">
                <div className="vital-label">Current SPO2</div>
                <div className="vital-value" style={{color: 'var(--color-spo2)'}}>{displaySPO2}</div>
              </div>
            </div>
          )}

          {/* CO2 Channel */}
          {showCO2 && (
            <div className="waveform-row">
              <WaveformCanvas 
                signalGenerator={(t) => vitalsTracker.getCO2(t)} 
                color="var(--color-co2)" 
                speed={1} 
                amplitude={0.7} 
              />
              <div className="vital-readout">
                <div className="vital-label">Current CO2 level mmHg</div>
                <div className="vital-value" style={{color: 'var(--color-co2)'}}>{vitals.co2}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Vitals */}
        <div className="right-sidebar">
          <div className="panel" style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px'}}>
                 <span style={{fontSize: '0.8rem', color: 'var(--color-text-dim)'}}>ALARMS</span>
                 <Settings size={14} color="var(--color-text-dim)" style={{cursor: 'pointer'}} onClick={() => setIsSettingsOpen(true)} />
             </div>
             <div style={{fontSize: '2rem', color: 'var(--color-ecg)', fontWeight: 'bold'}}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
          </div>
          
          <div className="panel" style={{flex: 2, display: 'flex', gap: 10}}>
             <div className="panel" style={{flex: 1}}>
                <div className="vital-label">Temperature</div>
                <div className="vital-value" style={{color: 'var(--color-temp)', fontSize: '2.5rem'}}>{displayTemp}</div>
             </div>
             <div className="panel" style={{flex: 1}}>
                <div className="vital-label">Respirations</div>
                <div className="vital-value" style={{color: 'var(--color-temp)', fontSize: '2.5rem'}}>{displayRR}</div>
             </div>
          </div>

          <div className="panel" style={{flex: 2, display: 'flex', flexWrap: 'wrap', gap: 5}}>
             <button style={{flex: '1 1 40%', background: showHR ? '' : '#222', color: showHR ? '' : '#888'}} onClick={() => setShowHR(!showHR)}>{showHR ? 'Hide HR' : 'Show HR'}</button>
             <button style={{flex: '1 1 40%', background: showBP ? '' : '#222', color: showBP ? '' : '#888'}} onClick={() => setShowBP(!showBP)}>{showBP ? 'Hide BP' : 'Show BP'}</button>
             <button style={{flex: '1 1 40%', background: showSPO2 ? '' : '#222', color: showSPO2 ? '' : '#888'}} onClick={() => setShowSPO2(!showSPO2)}>{showSPO2 ? 'Hide SPO2' : 'Show SPO2'}</button>
             <button style={{flex: '1 1 40%', background: showCO2 ? '' : '#222', color: showCO2 ? '' : '#888'}} onClick={() => setShowCO2(!showCO2)}>{showCO2 ? 'Hide CO2' : 'Show CO2'}</button>
          </div>
        </div>
      </div>

      <div className="controls-grid">
         {/* Pacer Hardware Panel */}
         <div className="panel" style={{flex: 1.2, backgroundColor: '#1a1d24', padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto'}}>
             <div style={{fontSize: '0.8rem', color: 'var(--color-text-dim)', alignSelf: 'flex-start'}}>PACER MODULE</div>
             <div style={{background: '#2c3e38', padding: '15px', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%', justifyContent: 'center'}}>
                <PillButton label="PACER" icon="●" iconColor={isPacerOn ? '#0f0' : '#1a401a'} onClick={() => setIsPacerOn(!isPacerOn)} />
                <PillUpDown label="RATE" onDown={() => setPacerRate(r => Math.max(0, r - 5))} onUp={() => setPacerRate(r => Math.min(200, r + 5))} />
                <PillUpDown label="CURRENT" onDown={() => setPacerOutput(o => Math.max(0, o - 5))} onUp={() => setPacerOutput(o => Math.min(200, o + 5))} />
                <PillButton label="PAUSE" icon="●" iconColor={isPacerPaused ? '#ffcc00' : '#443'} onClick={() => isPacerOn && setIsPacerPaused(!isPacerPaused)} />
             </div>
             
             {/* Pacer Readout */}
             <div style={{display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', background: '#0a0a0c', padding: '10px', borderRadius: '8px', border: '1px solid #333', width: '100%', marginTop: 'auto'}}>
                <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '0.65rem', color: 'var(--color-text-dim)'}}>PACER RATE</div>
                    <div style={{color: isPacerOn && !isPacerPaused ? 'var(--color-ecg)' : '#111', fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1}}>{isPacerOn ? pacerRate : '---'}</div>
                </div>
                <div style={{textAlign: 'center'}}>
                    <div style={{fontSize: '0.65rem', color: 'var(--color-text-dim)'}}>PACER OUTPUT</div>
                    <div style={{color: isPacerOn && !isPacerPaused ? 'var(--color-ecg)' : '#111', fontSize: '2.5rem', fontWeight: 'bold', lineHeight: 1}}>{isPacerOn ? pacerOutput : '---'} <span style={{fontSize: '0.8rem'}}>mA</span></div>
                </div>
             </div>
         </div>

         {/* Defibrillator Hardware Panel (Zoll-style) */}
         <div className="panel" style={{display: 'flex', flexDirection: 'row', gap: '15px', flex: 2, backgroundColor: '#1a1d24', padding: '15px', overflowY: 'auto'}}>
             {/* Left Column: Control Strips */}
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px', flex: 1.5}}>
                 <div style={{fontSize: '0.8rem', color: 'var(--color-text-dim)'}}>DEFIBRILLATOR</div>
                 <div style={{paddingTop: 0, paddingBottom: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'center', gap: '15px', flex: 1}}>
                    {/* Left Column (Modes & Numbers) */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                        {/* Row 1 (Empty left, 1 right) */}
                        <div style={{display: 'flex', justifyContent: 'flex-end', height: '32px', alignItems: 'center'}}>
                            <span style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'white'}}>1</span>
                        </div>
                        
                        {/* Row 2 (CPR, 2) */}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '160px'}}>
                            <PillButton label="CPR" icon="●" iconColor={rhythm === 'cpr' ? '#0f0' : '#444'} onClick={handleCPR} style={{width: '110px'}} />
                            <span style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'white'}}>2</span>
                        </div>
                        
                        {/* Row 3 (Spacer block for alignment, 3) */}
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '160px'}}>
                            <div style={{width: '110px'}}></div>
                            <span style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'white'}}>3</span>
                        </div>
                        
                        {/* Row 4 (SYNC) */}
                        <PillButton label="SYNC" icon="●" iconColor={isSyncOn ? '#ffcc00' : '#444'} onClick={() => setIsSyncOn(!isSyncOn)} style={{width: '110px'}} />
                    </div>
                
                    {/* Right Column (Therapy Block) */}
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                        {/* ON Button matching Row 1 height */}
                        <div style={{height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <PillButton label="ON" bgColor="#3b823b" icon="●" iconColor={isDefibOn ? '#0f0' : '#1a401a'} onClick={toggleDefib} style={{width: '110px'}} />
                        </div>
                        
                        {/* Therapy Block containing Energy, Charge, Shock */}
                        <div style={{padding: '15px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', flex: 1}}>
                            <PillUpDown label={<>ENERGY<br/>SELECT</>} onDown={() => adjustJoules(-10)} onUp={() => adjustJoules(10)} style={{width: '110px'}} />
                            <PillButton label={isCharging ? "CHARGING" : "CHARGE"} bgColor="#ffb700" color="black" onClick={handleCharge} style={{width: '110px'}} />
                            <button style={{
                               width: '65px', height: '65px', borderRadius: '50%', padding: 0,
                               background: '#ed2f2f', border: 'none', color: 'white', 
                               fontSize: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
                               boxShadow: isCharged ? '0 0 20px #ff0000, 0 4px 6px rgba(0,0,0,0.5)' : '0 4px 6px rgba(0,0,0,0.3)', 
                               opacity: isCharged ? 1 : 0.6,
                               cursor: isCharged ? 'pointer' : 'default',
                               transition: 'all 0.2s', marginTop: '10px'
                            }} onClick={handleShock}>⚡</button>
                        </div>
                    </div>
                 </div>
             </div>

             {/* Right Column: Information Screens */}
             <div style={{display: 'flex', flexDirection: 'column', gap: '10px', flex: 1}}>
                 <div style={{fontSize: '0.8rem', visibility: 'hidden'}}>ALIGNMENT SPACER</div>
                 {/* Energy Readout */}
                 <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c', padding: '15px', borderRadius: '8px', border: '1px solid #333', flex: 1}}>
                     <div style={{fontSize: '0.8rem', color: 'var(--color-text-dim)'}}>ENERGY SELECTED</div>
                     <div style={{color: isDefibOn ? 'var(--color-ecg)' : '#111', fontSize: '4.5rem', fontWeight: 'bold', textShadow: isCharged && isDefibOn ? '0 0 20px var(--color-ecg)' : 'none', lineHeight: 1, margin: '10px 0'}}>{isDefibOn ? joules : '---'}</div>
                     <div style={{fontSize: '1rem', color: 'var(--color-text-dim)', marginBottom: '10px'}}>Shocks Delivered: {shocks}</div>
                     <button style={{marginTop: 'auto', background: '#222', border: '1px solid #444', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem'}} onClick={() => {setIsCharged(false); setIsCharging(false); setMonitorMessage("");}}>DISARM</button>
                 </div>
             </div>
         </div>

         {/* Variables adjustment */}
         <div className="panel controls-wide">
             <div className="controls-panel-title">Scenario Overrides</div>
             
             {/* Scenario Management */}
             <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                 <button style={{flex: 1, padding: '10px', fontSize: '1rem', background: '#222', border: '1px solid #444', color: activeScenario && currentStageIndex > 0 ? 'white' : '#555', cursor: activeScenario && currentStageIndex > 0 ? 'pointer' : 'default'}} onClick={prevStage}>◀ Back</button>
                 <button style={{flex: 2, padding: '10px', fontSize: '1rem', background: '#2c3e50', border: '1px solid #34495e', color: 'white', fontWeight: 'bold'}} onClick={() => setIsScenarioModalOpen(true)}>Scenario Menu</button>
                 <button style={{flex: 1, padding: '10px', fontSize: '1rem', background: '#222', border: '1px solid #444', color: activeScenario && currentStageIndex < activeScenario.stages.length - 1 ? 'white' : '#555', cursor: activeScenario && currentStageIndex < activeScenario.stages.length - 1 ? 'pointer' : 'default'}} onClick={nextStage}>Next ▶</button>
             </div>
             {/* Active Scenario Indicator */}
             {activeScenario && (
               <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827', border: '1px solid #374151', borderRadius: '6px', padding: '6px 10px', marginBottom: '6px'}}>
                 <div style={{fontSize: '0.7rem', color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{activeScenario.title}</div>
                 <div style={{fontSize: '0.7rem', color: '#9ca3af'}}>{currentStageIndex + 1}/{activeScenario.stages.length} — {activeScenario.stages[currentStageIndex].name}</div>
               </div>
             )}

             {/* Rhythm & CPR Actions */}
             <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '10px', paddingBottom: '15px', borderBottom: '1px solid #333', marginBottom: '10px'}}>
                 <button style={{height: '50px', fontSize: '1rem', background: '#2c3e50', border: '1px solid #34495e', color: 'white'}} onClick={() => setIsRhythmModalOpen(true)}>Rhythm Selection</button>
             </div>
             
             <div className="controls-panel-title">Adjust Vitals</div>
             <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, overflowY: 'auto'}}>
                 <InputControl label="HR" value={vitals.hr} max={250} onChange={val => updateVital('hr', val)} />
                 <InputControl label="RR" value={vitals.rr} max={50} onChange={val => updateVital('rr', val)} />
                 <InputControl label="BP Sys" value={vitals.bpSys} max={250} onChange={val => updateVital('bpSys', val)} />
                 <InputControl label="SPO2" value={vitals.spo2} max={100} onChange={val => updateVital('spo2', val)} />
                 <InputControl label="BP Dia" value={vitals.bpDia} max={200} onChange={val => updateVital('bpDia', val)} />
                 <InputControl label="CO2" value={vitals.co2} max={100} onChange={val => updateVital('co2', val)} />
                 <InputControl label="Temp" value={vitals.temp} max={110} step={0.1} onChange={val => updateVital('temp', val)} />
             </div>
         </div>
      </div>
      
      {/* Rhythm Selection Modal */}
      {isRhythmModalOpen && (
        <div className="modal-overlay" onClick={() => setIsRhythmModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span>Select Patient Rhythm</span>
              <button onClick={() => setIsRhythmModalOpen(false)} style={{padding: '4px 10px', fontSize: '1rem'}}>×</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
                 <button className={(rhythm === 'nsr' || (rhythm === 'cpr' && preCprState?.rhythm === 'nsr')) ? 'active' : ''} onClick={() => handleRhythmSelect('nsr', 60)}><b>[1]</b> Normal Sinus</button>
                 <button className={(rhythm === 'brady' || (rhythm === 'cpr' && preCprState?.rhythm === 'brady')) ? 'active' : ''} onClick={() => handleRhythmSelect('brady', 40)}><b>[2]</b> Sinus Brady</button>
                 <button className={(rhythm === 'tachy' || (rhythm === 'cpr' && preCprState?.rhythm === 'tachy')) ? 'active' : ''} onClick={() => handleRhythmSelect('tachy', 120)}><b>[3]</b> Sinus Tachy</button>
                 <button className={(rhythm === 'svt' || (rhythm === 'cpr' && preCprState?.rhythm === 'svt')) ? 'active' : ''} onClick={() => handleRhythmSelect('svt', 160)}><b>[4]</b> SVT</button>
                 <button className={(rhythm === 'afib_rvr' || (rhythm === 'cpr' && preCprState?.rhythm === 'afib_rvr')) ? 'active' : ''} onClick={() => handleRhythmSelect('afib_rvr', 140)}><b>[5]</b> A-Fib RVR</button>
                 <button className={(rhythm === 'vtach' || (rhythm === 'cpr' && preCprState?.rhythm === 'vtach')) ? 'active' : ''} onClick={() => handleRhythmSelect('vtach', 180)}><b>[6]</b> V-Tach</button>
                 <button className={(rhythm === 'mobitz1' || (rhythm === 'cpr' && preCprState?.rhythm === 'mobitz1')) ? 'active' : ''} onClick={() => handleRhythmSelect('mobitz1', 70)}><b>[7]</b> Mobitz I</button>
                 <button className={(rhythm === 'mobitz2' || (rhythm === 'cpr' && preCprState?.rhythm === 'mobitz2')) ? 'active' : ''} onClick={() => handleRhythmSelect('mobitz2', 70)}><b>[8]</b> Mobitz II</button>
                 <button className={(rhythm === 'complete_hb' || (rhythm === 'cpr' && preCprState?.rhythm === 'complete_hb')) ? 'active' : ''} onClick={() => handleRhythmSelect('complete_hb', 35)}><b>[9]</b> 3rd Deg Block</button>
                 <button className={(rhythm === 'vfib_coarse' || (rhythm === 'cpr' && preCprState?.rhythm === 'vfib_coarse')) ? 'active' : ''} onClick={() => handleRhythmSelect('vfib_coarse')}><b>[0]</b> Coarse V-Fib</button>
                 <button className={(rhythm === 'vfib_fine' || (rhythm === 'cpr' && preCprState?.rhythm === 'vfib_fine')) ? 'active' : ''} onClick={() => handleRhythmSelect('vfib_fine')}><b>[-]</b> Fine V-Fib</button>
                 <button className={(rhythm === 'asystole' || (rhythm === 'cpr' && preCprState?.rhythm === 'asystole')) ? 'active' : ''} onClick={() => handleRhythmSelect('asystole', 0)}><b>[=]</b> Asystole</button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '300px'}}>
            <div className="modal-header">
              <span>System Settings</span>
              <button onClick={() => setIsSettingsOpen(false)} style={{padding: '4px 10px', fontSize: '1rem'}}>×</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 20, padding: '10px 0'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                     <span>Mute Alarms</span>
                     <button 
                        style={{background: isMuted ? '#bf362e' : '#223', color: 'white', padding: '6px 12px'}}
                        onClick={() => setIsMuted(!isMuted)}
                     >
                        {isMuted ? 'UNMUTE' : 'MUTE'}
                     </button>
                 </div>
                 <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                     <span>System Volume ({volume}%)</span>
                     <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                         <Volume2 size={20} color={isMuted ? "#555" : "white"}/>
                         <input 
                           type="range" 
                           min="0" max="100" 
                           value={volume} 
                           onChange={(e) => setVolume(e.target.value)} 
                           disabled={isMuted}
                           style={{flex: 1}}
                         />
                     </div>
                 </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Selection Modal */}
      {isScenarioModalOpen && (
        <div className="modal-overlay" onClick={() => setIsScenarioModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '450px'}}>
            <div className="modal-header">
              <span>Scenario Menu</span>
              <button onClick={() => setIsScenarioModalOpen(false)} style={{padding: '4px 10px', fontSize: '1rem'}}>×</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              {scenarios.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => loadScenario(scenario)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '12px 16px', borderRadius: '6px', textAlign: 'left',
                    background: activeScenario?.id === scenario.id ? '#1e3a5f' : '#1a1d24',
                    border: activeScenario?.id === scenario.id ? '1px solid #60a5fa' : '1px solid #333',
                    color: 'white', gap: '4px'
                  }}
                >
                  <div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{scenario.title}</div>
                  <div style={{fontSize: '0.75rem', color: '#9ca3af'}}>{scenario.description} — {scenario.stages.length} stages</div>
                </button>
              ))}
              {activeScenario && (
                <button
                  onClick={() => { setActiveScenario(null); setCurrentStageIndex(0); setIsScenarioModalOpen(false); }}
                  style={{marginTop: '4px', background: '#2a0a0a', border: '1px solid #7f1d1d', color: '#fca5a5', padding: '8px'}}
                >
                  ✕ Clear Active Scenario
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
