export const scenarios = [
  {
    "id": "megacode-1",
    "title": "Megacode 1 2025",
    "description": "Out-of-hospital unstable bradycardia [cite: 1] progressing from sinus bradycardia to pulseless VT, then PEA, and finally ROSC/PCAC[cite: 2, 3].",
    "stages": [
      {
        "id": "m1-s1",
        "name": "Symptomatic Bradycardia [cite: 47]",
        "rhythm": "brady",
        "vitals": { "hr": 32, "bpSys": 78, "bpDia": 42, "spo2": 92, "co2": 38, "rr": 18, "temp": 98.6 }
      },
      {
        "id": "m1-s2",
        "name": "Pulseless VT [cite: 51]",
        "rhythm": "vtach",
        "vitals": { "hr": 180, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 15, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m1-s3",
        "name": "Pulseless Electrical Activity [cite: 58]",
        "rhythm": "pea",
        "vitals": { "hr": 40, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 22, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m1-s4",
        "name": "Post-Cardiac Arrest Care (ROSC) [cite: 80, 87]",
        "rhythm": "nsr",
        "vitals": { "hr": 92, "bpSys": 110, "bpDia": 70, "spo2": 96, "co2": 40, "rr": 12, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-2",
    "title": "Megacode 2 2025",
    "description": "Out-of-hospital bradycardia [cite: 101] deteriorating into Ventricular Fibrillation and Asystole before recovery[cite: 107].",
    "stages": [
      {
        "id": "m2-s1",
        "name": "Unstable Bradycardia [cite: 105]",
        "rhythm": "brady",
        "vitals": { "hr": 44, "bpSys": 84, "bpDia": 50, "spo2": 90, "co2": 35, "rr": 3, "temp": 98.6 }
      },
      {
        "id": "m2-s2",
        "name": "Ventricular Fibrillation [cite: 148]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 22, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m2-s3",
        "name": "Asystole [cite: 154]",
        "rhythm": "asystole",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 10, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m2-s4",
        "name": "Post-Cardiac Arrest Care [cite: 157, 179]",
        "rhythm": "nsr",
        "vitals": { "hr": 56, "bpSys": 180, "bpDia": 108, "spo2": 95, "co2": 50, "rr": 8, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-3",
    "title": "Megacode 3 2025",
    "description": "Elderly post-transplant patient [cite: 232] with 3rd-degree block [cite: 235] progressing through PVT and PEA[cite: 191].",
    "stages": [
      {
        "id": "m3-s1",
        "name": "3rd Degree Heart Block [cite: 235]",
        "rhythm": "complete_hb",
        "vitals": { "hr": 32, "bpSys": 86, "bpDia": 48, "spo2": 92, "co2": 38, "rr": 18, "temp": 98.6 }
      },
      {
        "id": "m3-s2",
        "name": "Pulseless VT [cite: 240]",
        "rhythm": "vtach",
        "vitals": { "hr": 170, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 20, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m3-s3",
        "name": "PEA [cite: 251]",
        "rhythm": "pea",
        "vitals": { "hr": 40, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 22, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m3-s4",
        "name": "PCAC [cite: 255]",
        "rhythm": "nsr",
        "vitals": { "hr": 60, "bpSys": 68, "bpDia": 40, "spo2": 94, "co2": 48, "rr": 8, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-4",
    "title": "Megacode 4 2025",
    "description": "Unstable monomorphic VT [cite: 335] in a dialysis patient [cite: 353] deteriorating to VF and PEA[cite: 293, 300].",
    "stages": [
      {
        "id": "m4-s1",
        "name": "Unstable VT [cite: 335]",
        "rhythm": "vtach_pulse",
        "vitals": { "hr": 150, "bpSys": 84, "bpDia": 54, "spo2": 94, "co2": 35, "rr": 20, "temp": 98.6 }
      },
      {
        "id": "m4-s2",
        "name": "VF [cite: 339]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 25, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m4-s3",
        "name": "PEA [cite: 351]",
        "rhythm": "pea",
        "vitals": { "hr": 70, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 24, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m4-s4",
        "name": "PCAC [cite: 357]",
        "rhythm": "nsr",
        "vitals": { "hr": 100, "bpSys": 94, "bpDia": 56, "spo2": 100, "co2": 60, "rr": 10, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-5",
    "title": "Megacode 5 2025",
    "description": "Toxicological case (Calcium Channel Blocker overdose) [cite: 431, 453] presenting as bradycardia progressing to VF and Asystole[cite: 402].",
    "stages": [
      {
        "id": "m5-s1",
        "name": "Ventricular Escape Rhythm [cite: 454]",
        "rhythm": "complete_hb",
        "vitals": { "hr": 30, "bpSys": 80, "bpDia": 48, "spo2": 98, "co2": 38, "rr": 16, "temp": 97.7 }
      },
      {
        "id": "m5-s2",
        "name": "VF [cite: 456]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 15, "rr": 0, "temp": 97.7 }
      },
      {
        "id": "m5-s3",
        "name": "Asystole [cite: 461]",
        "rhythm": "asystole",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 10, "rr": 0, "temp": 97.7 }
      },
      {
        "id": "m5-s4",
        "name": "PCAC [cite: 463]",
        "rhythm": "nsr",
        "vitals": { "hr": 40, "bpSys": 85, "bpDia": 50, "spo2": 98, "co2": 40, "rr": 12, "temp": 97.7 }
      }
    ]
  },
  {
    "id": "megacode-6",
    "title": "Megacode 6 2025",
    "description": "In-hospital pneumonia patient with 3rd-degree block [cite: 505, 546] transitioning to refractory VF and then PEA[cite: 507].",
    "stages": [
      {
        "id": "m6-s1",
        "name": "3rd Degree Heart Block [cite: 546]",
        "rhythm": "complete_hb",
        "vitals": { "hr": 35, "bpSys": 88, "bpDia": 49, "spo2": 92, "co2": 38, "rr": 18, "temp": 98.6 }
      },
      {
        "id": "m6-s2",
        "name": "Refractory VF [cite: 549]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 20, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m6-s3",
        "name": "PEA [cite: 553]",
        "rhythm": "pea",
        "vitals": { "hr": 110, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 15, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m6-s4",
        "name": "PCAC [cite: 584]",
        "rhythm": "nsr",
        "vitals": { "hr": 110, "bpSys": 70, "bpDia": 30, "spo2": 98, "co2": 40, "rr": 12, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-7",
    "title": "Megacode 7 2025",
    "description": "Stable angina patient deteriorating into symptomatic VT [cite: 606, 645], VF, and then PEA[cite: 602].",
    "stages": [
      {
        "id": "m7-s1",
        "name": "Symptomatic VT [cite: 652]",
        "rhythm": "vtach_pulse",
        "vitals": { "hr": 160, "bpSys": 156, "bpDia": 92, "spo2": 93, "co2": 32, "rr": 22, "temp": 98.6 }
      },
      {
        "id": "m7-s2",
        "name": "VF [cite: 655]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 18, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m7-s3",
        "name": "PEA [cite: 660]",
        "rhythm": "pea",
        "vitals": { "hr": 50, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 22, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m7-s4",
        "name": "PCAC [cite: 691]",
        "rhythm": "nsr",
        "vitals": { "hr": 80, "bpSys": 100, "bpDia": 60, "spo2": 96, "co2": 40, "rr": 12, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-8",
    "title": "Megacode 8 2025",
    "description": "Inferior STEMI [cite: 749] with bradycardia progressing to pulseless VT and PEA[cite: 707].",
    "stages": [
      {
        "id": "m8-s1",
        "name": "Sinus Bradycardia (STEMI) [cite: 753]",
        "rhythm": "brady",
        "vitals": { "hr": 50, "bpSys": 150, "bpDia": 70, "spo2": 90, "co2": 36, "rr": 24, "temp": 98.6 }
      },
      {
        "id": "m8-s2",
        "name": "PVT [cite: 758]",
        "rhythm": "vtach",
        "vitals": { "hr": 170, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 18, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m8-s3",
        "name": "PEA [cite: 761]",
        "rhythm": "pea",
        "vitals": { "hr": 60, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 12, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m8-s4",
        "name": "PCAC [cite: 766]",
        "rhythm": "nsr",
        "vitals": { "hr": 108, "bpSys": 80, "bpDia": 60, "spo2": 95, "co2": 40, "rr": 14, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-9",
    "title": "Megacode 9 2025",
    "description": "Stable SVT [cite: 809] complicating an asthma exacerbation [cite: 842], progressing to PEA and VF[cite: 812].",
    "stages": [
      {
        "id": "m9-s1",
        "name": "Stable SVT [cite: 809]",
        "rhythm": "svt",
        "vitals": { "hr": 160, "bpSys": 140, "bpDia": 70, "spo2": 92, "co2": 45, "rr": 24, "temp": 98.6 }
      },
      {
        "id": "m9-s2",
        "name": "PEA (Auto-PEEP) [cite: 846]",
        "rhythm": "pea",
        "vitals": { "hr": 50, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 15, "rr": 8, "temp": 98.6 }
      },
      {
        "id": "m9-s3",
        "name": "VF [cite: 852]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 12, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m9-s4",
        "name": "PCAC [cite: 857]",
        "rhythm": "nsr",
        "vitals": { "hr": 110, "bpSys": 89, "bpDia": 70, "spo2": 94, "co2": 38, "rr": 12, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-10",
    "title": "Megacode 10 2025",
    "description": "Post-PCI patient with unstable VT [cite: 932, 894] deteriorating to VF and then PEA[cite: 930].",
    "stages": [
      {
        "id": "m10-s1",
        "name": "Unstable VT [cite: 894]",
        "rhythm": "vtach_pulse",
        "vitals": { "hr": 130, "bpSys": 72, "bpDia": 40, "spo2": 90, "co2": 34, "rr": 20, "temp": 98.6 }
      },
      {
        "id": "m10-s2",
        "name": "VF [cite: 898]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 18, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m10-s3",
        "name": "PEA [cite: 900]",
        "rhythm": "pea",
        "vitals": { "hr": 70, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 22, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m10-s4",
        "name": "PCAC [cite: 905]",
        "rhythm": "nsr",
        "vitals": { "hr": 85, "bpSys": 90, "bpDia": 60, "spo2": 98, "co2": 40, "rr": 12, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-11",
    "title": "Megacode 11 2025",
    "description": "Sedation-related respiratory failure [cite: 985] causing bradycardia, VF, and PEA[cite: 992].",
    "stages": [
      {
        "id": "m11-s1",
        "name": "Symptomatic Bradycardia [cite: 1031]",
        "rhythm": "brady",
        "vitals": { "hr": 30, "bpSys": 70, "bpDia": 40, "spo2": 82, "co2": 55, "rr": 3, "temp": 98.6 }
      },
      {
        "id": "m11-s2",
        "name": "VF [cite: 1042]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 20, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m11-s3",
        "name": "PEA [cite: 1047]",
        "rhythm": "pea",
        "vitals": { "hr": 140, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 15, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m11-s4",
        "name": "PCAC [cite: 1076]",
        "rhythm": "nsr",
        "vitals": { "hr": 90, "bpSys": 100, "bpDia": 70, "spo2": 95, "co2": 40, "rr": 12, "temp": 98.6 }
      }
    ]
  },
  {
    "id": "megacode-12",
    "title": "Megacode 12 2025",
    "description": "Surgical waiting room scenario [cite: 1091] with Mobitz II block [cite: 1139] progressing to VF and then Asystole/PEA[cite: 1093].",
    "stages": [
      {
        "id": "m12-s1",
        "name": "Mobitz Type II Block [cite: 1139]",
        "rhythm": "mobitz2",
        "vitals": { "hr": 28, "bpSys": 68, "bpDia": 40, "spo2": 96, "co2": 38, "rr": 18, "temp": 98.6 }
      },
      {
        "id": "m12-s2",
        "name": "VF [cite: 1147]",
        "rhythm": "vfib_coarse",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 20, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m12-s3",
        "name": "Asystole/PEA [cite: 1152, 1155]",
        "rhythm": "asystole",
        "vitals": { "hr": 0, "bpSys": 0, "bpDia": 0, "spo2": 0, "co2": 12, "rr": 0, "temp": 98.6 }
      },
      {
        "id": "m12-s4",
        "name": "PCAC [cite: 1157]",
        "rhythm": "nsr",
        "vitals": { "hr": 72, "bpSys": 95, "bpDia": 60, "spo2": 97, "co2": 40, "rr": 12, "temp": 98.6 }
      }
    ]
  }
]