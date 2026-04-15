class SignalGeneratorCore {
  constructor() {
    if (SignalGeneratorCore.instance) {
      return SignalGeneratorCore.instance;
    }
    this.ecgPhase = 0;
    this.respPhase = 0;
    this.lastTime = performance.now();
    this.vFibSeed = Math.random() * 1000;
    this.hr = 60;
    this.rr = 12;
    this.spo2 = 98;
    this.co2 = 40;
    this.rhythm = 'nsr';
    this.shockCurrent = 0;
    this.postShockFlatlineRemaining = 0;
    
    // Complex Rhythm State Tracking
    this.droppedQrsBeat = 0; 
    this.afibJitter = 1.0;
    this.pPhase = 0;
    this.isCurrentBeatDropped = false;
    
    this.audioCtx = null;
    this.audioVolume = 0.8;
    this.isMuted = false;
    
    // Lethal Alarm Tracking
    this.lethalAlarmOsc = null;
    this.lethalAlarmGain = null;
    this.alarmPhase = 0;
    
    this.initAudio = () => {
       if (!this.audioCtx) {
           this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
       }
       if (this.audioCtx.state === 'suspended') {
           this.audioCtx.resume();
       }
    };
    
    this.playPulseBeep = () => {
       if (!this.audioCtx || this.isMuted || this.audioVolume <= 0 || this.postShockFlatlineRemaining > 0) return;
       
       try {
           const osc = this.audioCtx.createOscillator();
           const gainNode = this.audioCtx.createGain();
           
           // Pitch mapping: 100% = 800Hz, 80% = 600Hz
           let freq = 300 + (this.spo2 - 50) * 10;
           if (freq < 300) freq = 300;
           if (freq > 1000) freq = 1000;
           
           osc.type = 'triangle';
           osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
           
           // Clinically accurate 'ping': ultra-fast attack, abrupt decay
           gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
           gainNode.gain.linearRampToValueAtTime(this.audioVolume, this.audioCtx.currentTime + 0.005);
           gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.10);
           
           osc.connect(gainNode);
           gainNode.connect(this.audioCtx.destination);
           
           osc.start(this.audioCtx.currentTime);
           osc.stop(this.audioCtx.currentTime + 0.12);
       } catch (e) {
           // AudioCtx not ready
       }
    };
    
    this.setLethalAlarmState = (isLethal) => {
        if (isLethal && !this.isMuted && this.audioVolume > 0 && this.audioCtx) {
            if (!this.lethalAlarmOsc) {
                try {
                    this.lethalAlarmOsc = this.audioCtx.createOscillator();
                    this.lethalAlarmGain = this.audioCtx.createGain();
                    
                    this.lethalAlarmOsc.type = 'square';
                    this.lethalAlarmOsc.frequency.setValueAtTime(800, this.audioCtx.currentTime); // High pitch red alarm
                    this.lethalAlarmGain.gain.setValueAtTime(0, this.audioCtx.currentTime);
                    
                    this.lethalAlarmOsc.connect(this.lethalAlarmGain);
                    this.lethalAlarmGain.connect(this.audioCtx.destination);
                    this.lethalAlarmOsc.start();
                } catch(e) {}
            }
        } else {
            if (this.lethalAlarmOsc) {
                try { this.lethalAlarmOsc.stop(); } catch(e){}
                this.lethalAlarmOsc = null;
                this.lethalAlarmGain = null;
                this.alarmPhase = 0; // Reset phase
            }
        }
    };
    
    // Defib Audio Tracking
    this.chargingOsc = null;
    this.chargingGain = null;
    
    this.chargedOsc = null;
    this.chargedGain = null;
    
    this.setDefibState = (isCharging, isCharged) => {
        // Handle Capacitor Charging Whine
        if (isCharging && !this.chargingOsc) {
            if (!this.audioCtx || this.isMuted || this.audioVolume <= 0) return;
            try {
               this.chargingOsc = this.audioCtx.createOscillator();
               this.chargingGain = this.audioCtx.createGain();
               this.chargingOsc.type = 'sine'; // Smooth, clinical capacitor physics whine
               
               // Sweep gracefully utilizing natural exponential curve
               this.chargingOsc.frequency.setValueAtTime(500, this.audioCtx.currentTime);
               this.chargingOsc.frequency.exponentialRampToValueAtTime(2100, this.audioCtx.currentTime + 2.0);
               
               this.chargingGain.gain.setValueAtTime(this.audioVolume * 0.5, this.audioCtx.currentTime);
               
               this.chargingOsc.connect(this.chargingGain);
               this.chargingGain.connect(this.audioCtx.destination);
               this.chargingOsc.start();
            } catch (e) {}
        } else if (!isCharging && this.chargingOsc) {
            try { this.chargingOsc.stop(); } catch(e){}
            this.chargingOsc = null;
            this.chargingGain = null;
        }
        
        // Handle Hot/Charged Alarm (Piercing continuous tone)
        if (isCharged && !this.chargedOsc) {
            if (!this.audioCtx || this.isMuted || this.audioVolume <= 0) return;
            try {
               this.chargedOsc = this.audioCtx.createOscillator();
               this.chargedGain = this.audioCtx.createGain();
               
               this.chargedOsc.type = 'sine';
               this.chargedOsc.frequency.setValueAtTime(2100, this.audioCtx.currentTime);
               
               this.chargedGain.gain.setValueAtTime(this.audioVolume * 0.5, this.audioCtx.currentTime);
               
               this.chargedOsc.connect(this.chargedGain);
               this.chargedGain.connect(this.audioCtx.destination);
               
               this.chargedOsc.start();
            } catch(e) {}
        } else if (!isCharged && this.chargedOsc) {
            try { this.chargedOsc.stop(); } catch(e){}
            this.chargedOsc = null;
            this.chargedGain = null;
        }
    };
    
    // Pacer State
    this.isPacerOn = false;
    this.isPacerPaused = false;
    this.pacerRate = 70;
    this.pacerOutput = 5;
    this.pacerPhase = 0;
    this.pacerFired = false;
    this.activePacedTime = 0;
    
    // Start central integration loop
    const loop = () => {
      const now = performance.now();
      const dtMs = now - this.lastTime;
      this.lastTime = now;
      
      const dt = (dtMs / 1000) * 120; // 120 units per sec
      
      // Protect against tab backgrounding huge dt
      if (dt < 0 || dt > 120) {
        requestAnimationFrame(loop);
        return;
      }
      
      let effectiveHr = Math.max(1, this.hr);
      if (this.rhythm === 'afib_rvr') effectiveHr *= this.afibJitter;
      
      const ecgBps = effectiveHr / 60;
      const ecgPeriod = 120 / ecgBps;
      const previousEcgPhase = this.ecgPhase;
      this.ecgPhase += dt / ecgPeriod;
      
      if (this.ecgPhase >= 1) {
          this.ecgPhase -= 1;
          this.droppedQrsBeat = (this.droppedQrsBeat + 1) % 4;
          this.afibJitter = 0.8 + (Math.random() * 0.4); // 80% to 120% R-R variance
          
          let drop = false;
          if (this.activePacedTime <= 0) {
             if (this.rhythm === 'mobitz1' && this.droppedQrsBeat === 3) drop = true;
             if (this.rhythm === 'mobitz2' && this.droppedQrsBeat % 2 === 1) drop = true; // 2:1 conduction
          }
          this.isCurrentBeatDropped = drop;
      }
      
      // Independent Atrial Pacemaker for 3rd degree block (75 bpm native SA rate)
      const atrialBps = 75 / 60;
      this.pPhase += dt / (120 / atrialBps);
      if (this.pPhase >= 1) this.pPhase -= 1;
      
      // --- Lethal Alarm Driver ---
      const pacerIsEffective = this.isPacerOn && !this.isPacerPaused && this.pacerOutput >= 70 && this.rhythm !== 'vfib_coarse' && this.rhythm !== 'vfib_fine';
      const isLethal = (this.rhythm === 'asystole' || this.rhythm === 'vfib_coarse' || this.rhythm === 'vfib_fine' || this.rhythm === 'vtach' || this.rhythm === 'pea') && !pacerIsEffective && this.rhythm !== 'cpr';
      
      this.setLethalAlarmState(isLethal);
      if (this.lethalAlarmOsc && this.lethalAlarmGain && this.audioCtx) {
          // Advance alarm phase (cycle every 1.5 seconds -> 120 units/sec, so 180 units = 1.5s)
          this.alarmPhase += dt / 180;
          if (this.alarmPhase >= 1) this.alarmPhase -= 1;
          
          let targetAlarmGain = 0;
          const p = this.alarmPhase;
          
          // ISO-style High-Priority Red Alarm: BEEP-BEEP-BEEP ----- BEEP-BEEP-BEEP -----
          if ((p > 0.0 && p < 0.1) || (p > 0.2 && p < 0.3) || (p > 0.4 && p < 0.5)) {
              targetAlarmGain = this.audioVolume * 0.4;
          }
          
          // Prevents audio popping when transitioning 0 -> value
          this.lethalAlarmGain.gain.setTargetAtTime(targetAlarmGain, this.audioCtx.currentTime, 0.01);
      }
      
      // Demand Pacer syncing: IF intrinsic QRS occurs, reset pacer phase
      if (previousEcgPhase < 0.27 && this.ecgPhase >= 0.27) {
          this.pacerPhase = 0.27; 
          
          const isDeadRhythm = this.rhythm === 'asystole' || this.rhythm === 'vfib_coarse' || this.rhythm === 'vfib_fine';
          const isCapturing = this.activePacedTime > 0;
          
          // Only beep if the patient has an organized rhythm, is undergoing CPR, or is being successfully paced
          if (!isDeadRhythm || isCapturing || this.rhythm === 'cpr') {
              if (!this.isCurrentBeatDropped || isCapturing) {
                 this.playPulseBeep();
              }
          }
      }
      
      if (this.isPacerOn && !this.isPacerPaused) {
          const pacerBps = Math.max(1, this.pacerRate) / 60;
          const pacerPeriod = 120 / pacerBps;
          this.pacerPhase += dt / pacerPeriod;
          
          if (this.pacerPhase >= 1) {
              this.pacerPhase -= 1;
              this.pacerFired = true; 
              
              if (this.pacerOutput >= 70) {
                 this.ecgPhase = 0.25; // Capture! Jump-start QRS complex 0.02 units prior to peak
                 this.activePacedTime = 0.6; // Force standard paced morphology rendering for 0.6s
              }
          }
      }
      
      if (this.activePacedTime > 0) {
          this.activePacedTime -= (dtMs / 1000);
      }
      
      const respBps = Math.max(1, this.rr) / 60;
      const respPeriod = 120 / respBps;
      this.respPhase += dt / respPeriod;
      if (this.respPhase >= 1) this.respPhase -= 1;
      
      if (this.shockCurrent > 0) {
        this.shockCurrent -= dt / 10;
        if (this.shockCurrent < 0) this.shockCurrent = 0;
      }
      
      if (this.postShockFlatlineRemaining > 0) {
        this.postShockFlatlineRemaining -= (dtMs / 1000);
      }
      
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    
    SignalGeneratorCore.instance = this;
  }

  setHR(hr) { this.hr = hr; }
  setRR(rr) { this.rr = rr; }
  setSPO2(spo2) { this.spo2 = spo2; }
  setCO2(co2) { this.co2 = co2; }
  setRhythmState(rhythm) { this.rhythm = rhythm; }

  setAudioParams(isMuted, volume) {
     this.isMuted = isMuted;
     this.audioVolume = volume / 100;
     
     // Update continuous streams instantly if muted
     if (this.isMuted) {
         if (this.chargedOsc) {
             try { this.chargedOsc.stop(); } catch(e){}
             this.chargedOsc = null;
         }
         if (this.chargingOsc) {
             try { this.chargingOsc.stop(); } catch(e){}
             this.chargingOsc = null;
         }
         if (this.lethalAlarmOsc) {
             try { this.lethalAlarmOsc.stop(); } catch(e){}
             this.lethalAlarmOsc = null;
             this.lethalAlarmGain = null;
         }
     }
  }

  setPacer(isOn, isPaused, rate, output) {
     this.isPacerOn = isOn;
     this.isPacerPaused = isPaused;
     this.pacerRate = rate;
     this.pacerOutput = output;
  }

  pollPacerSpike() {
      if (this.pacerFired) {
          this.pacerFired = false;
          return true;
      }
      return false;
  }

  triggerShock() {
    this.shockCurrent = 1.0;
    this.postShockFlatlineRemaining = 2.5; // 2.5 seconds flatline after shock
  }

  getECG(time, rhythm) {
    let baseVal = 0;
    
    // Even if rhythm is dead, if pacer is capturing, force QRS morphology rendering
    const forceRender = this.activePacedTime > 0;

    if (this.postShockFlatlineRemaining > 0) {
      baseVal = (Math.random() - 0.5) * 0.05; // myocardial stunning flatline
    } else if (rhythm === 'asystole' && !forceRender) {
      baseVal = (Math.random() - 0.5) * 0.05; // tiny wandering baseline
    } else if (rhythm === 'cpr' && !forceRender) {
      const activeBPM = Math.max(1, this.hr);
      const cprPeriod = 120 / (activeBPM / 60);
      const p = (time % cprPeriod) / cprPeriod;
      baseVal = Math.sin(p * Math.PI * 2) * 0.6 + (Math.random() - 0.5) * 0.1;
    } else if (rhythm === 'vfib_coarse' && !forceRender) {
      const t = time / 20 + this.vFibSeed;
      baseVal = (Math.sin(t) + Math.sin(t * 2.4) + Math.sin(t * 1.5) + Math.cos(t * 3.1) * 0.5) / 2.5;
    } else if (rhythm === 'vfib_fine' && !forceRender) {
      const t = time / 25 + this.vFibSeed;
      baseVal = (Math.sin(t) + Math.sin(t * 2.1) + Math.sin(t * 1.3) + Math.cos(t * 3.7)) / 15;
    } else if ((rhythm === 'vtach' || rhythm === 'vtach_pulse') && !forceRender) {
      baseVal = -Math.sin(this.ecgPhase * Math.PI * 2) * 0.8;
    } else {
      let val = (Math.random() - 0.5) * 0.02;
      const beatSec = 60 / Math.max(1, this.hr);
      
      // Anchor the QRS complex around ecgPhase 0.27 to maintain alignment with BP/SPO2
      const tOffset = (this.ecgPhase - 0.27) * beatSec;

      if (forceRender) {
         // Paced Beat Morphology (Wide predominately negative QRS, Huge Discordant T-Wave)
         if (tOffset > -0.02 && tOffset < 0.05) {
            val -= Math.sin(((tOffset + 0.02) / 0.07) * Math.PI / 2) * 0.8;
         } else if (tOffset >= 0.05 && tOffset < 0.14) {
            val -= Math.cos(((tOffset - 0.05) / 0.09) * Math.PI / 2) * 0.8;
         } else if (tOffset >= 0.14 && tOffset < 0.45) {
            val += Math.sin(((tOffset - 0.14) / 0.31) * Math.PI) * 0.35;
         }
      } else {
         // Standard Intrinsic Morphology
         let tOffsetW = tOffset; // PR interval tracker
         let renderPWave = true;
         let renderQRS = true;
         let useWideVentricularMorphology = false;
         
         if (this.rhythm === 'afib_rvr') {
             renderPWave = false; 
             val += (Math.sin(time / 2) + Math.cos(time / 3)) * 0.05; // Coarse wandering baseline
         } else if (this.rhythm === 'mobitz1') {
             // Wenckebach: PR interval progressively lengthens.
             if (this.droppedQrsBeat === 1) tOffsetW += 0.08;
             if (this.droppedQrsBeat === 2) tOffsetW += 0.16;
             if (this.isCurrentBeatDropped) renderQRS = false;
         } else if (this.rhythm === 'mobitz2') {
             if (this.isCurrentBeatDropped) renderQRS = false;
         } else if (this.rhythm === 'complete_hb') {
             renderPWave = false; // P waves decoupled entirely
             useWideVentricularMorphology = true; // Complete AV block results in wide idioventricular escape
             const pBeatSec = 60 / 75; // SA node firing at 75 bpm uniformly
             const pOffset = (this.pPhase - 0.27) * pBeatSec;
             if (pOffset > -0.15 && pOffset < -0.06) {
                 val += Math.sin(((pOffset + 0.15) / 0.09) * Math.PI) * 0.12; 
             }
         }
         
         if (renderPWave) {
             // P wave (-0.15s to -0.06s before R wave)
             if (tOffsetW > -0.15 && tOffsetW < -0.06) {
                val += Math.sin(((tOffsetW + 0.15) / 0.09) * Math.PI) * 0.1;
             }
         }
         
         if (renderQRS) {
             if (useWideVentricularMorphology) {
                 // Idioventricular escape block morphology (Wide QRS, Discordant T-Wave)
                 if (tOffset > -0.02 && tOffset < 0.05) {
                    val -= Math.sin(((tOffset + 0.02) / 0.07) * Math.PI / 2) * 0.8;
                 } else if (tOffset >= 0.05 && tOffset < 0.14) {
                    val -= Math.cos(((tOffset - 0.05) / 0.09) * Math.PI / 2) * 0.8;
                 } else if (tOffset >= 0.14 && tOffset < 0.45) {
                    val += Math.sin(((tOffset - 0.14) / 0.31) * Math.PI) * 0.35;
                 }
             } else {
                 // QRS Complex (Fixed 60ms width narrow complex)
                 if (tOffset > -0.02 && tOffset < 0.0) val -= 0.1; 
                 else if (tOffset >= 0.0 && tOffset < 0.03) val += 0.8; 
                 else if (tOffset >= 0.03 && tOffset < 0.06) val -= 0.2; 
                 // T wave
                 else if (tOffset > 0.12 && tOffset < 0.32) {
                    val += Math.sin(((tOffset - 0.12) / 0.20) * Math.PI) * 0.15;
                 }
             }
         }
      }
      
      baseVal = val;
    }

    // Overlay explosive shock artifact if actively discharging
    if (this.shockCurrent > 0) {
      // Create high-frequency, high-amplitude artifact decaying over ~0.3 seconds
      const artifact = Math.sin(time) * 4.0 * this.shockCurrent;
      baseVal += artifact;
    }

    return baseVal;
  }

  getBP(time, rhythm) {
    if (this.postShockFlatlineRemaining > 0) return 0;
    if (rhythm === 'asystole' || rhythm === 'vfib_coarse' || rhythm === 'vfib_fine' || rhythm === 'vtach' || rhythm === 'pea') return 0;
    if (this.isCurrentBeatDropped && this.activePacedTime <= 0) return 0; // Absolute zero diastolic trough
    if (rhythm === 'cpr') {
      const activeBPM = Math.max(1, this.hr);
      const cprPeriod = 120 / (activeBPM / 60);
      const p = (time % cprPeriod) / cprPeriod;
      return Math.sin(p * Math.PI * 2) > 0 ? -0.5 : 0.5; // Scale inverted 
    }

    const p = (this.ecgPhase + 0.9) % 1;
    if (p < 0.15) {
      return -(Math.sin((p / 0.15) * Math.PI / 2)) * 0.8;
    } else if (p < 0.4) {
      return -0.8 + ((p - 0.15) / 0.25) * 0.6;
    } else if (p < 0.45) {
      return -0.2 - Math.sin(((p - 0.4) / 0.05) * Math.PI) * 0.1;
    } else if (p < 0.8) {
      return -0.2 + ((p - 0.45) / 0.35) * 0.2;
    } else {
      return 0;
    }
  }

  getSPO2(time, rhythm) {
    if (this.postShockFlatlineRemaining > 0) return 0;
    if (rhythm === 'asystole' || rhythm === 'vfib_coarse' || rhythm === 'vfib_fine' || rhythm === 'vtach' || rhythm === 'cpr' || rhythm === 'pea') return 0;
    if (this.isCurrentBeatDropped && this.activePacedTime <= 0) return 0.25; // Extended diastolic flatline runoff
    
    // Offset standard ECG phase so SPO2 wave aligns slightly after QRS
    const p = (this.ecgPhase + 0.8) % 1;
    
    if (p < 0.12) {
      // Anacrotic ascent: steep rise to main systolic peak
      const fraction = p / 0.12;
      return -0.8 + (Math.sin(fraction * Math.PI / 2) * 1.6);
    } else if (p < 0.30) {
      // Systolic descent to dicrotic notch valley
      const fraction = (p - 0.12) / 0.18;
      return 0.8 - (fraction * 0.9);
    } else if (p < 0.45) {
      // Dicrotic wave (secondary peak)
      const fraction = (p - 0.30) / 0.15;
      return -0.1 + (Math.sin(fraction * Math.PI / 2) * 0.35);
    } else {
      // Diastolic runoff/decay back to trough
      const fraction = (p - 0.45) / 0.55;
      return 0.25 - (Math.pow(fraction, 1.2) * 1.05);
    }
  }

  getCO2(time) {
    const scale = Math.max(0, this.co2) / 40; // Normalize to 40mmHg baseline
    const p = this.respPhase;
    let raw;
    if (p < 0.5) raw = 0.5;
    else if (p < 0.6) raw = 0.5 - ((p - 0.5) / 0.1) * 0.8;
    else if (p < 0.9) raw = -0.3 - ((p - 0.6) / 0.3) * 0.1;
    else raw = -0.4 + ((p - 0.9) / 0.1) * 0.9;
    return raw * scale;
  }
}

export const vitalsTracker = new SignalGeneratorCore();
