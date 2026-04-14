export const scenarios = [
  {
    id: "vfib-cardiac-arrest",
    title: "V-Fib / Pulseless V-Tach",
    description: "Standard ACLS Cardiac Arrest algorithm starting with a shockable rhythm.",
    stages: [
      {
        id: "stage-1",
        name: "Initial Presentation",
        rhythm: "vfib_coarse",
        vitals: { hr: 0, bpSys: 0, bpDia: 0, spo2: 0, co2: 15, rr: 0, temp: 98.6 }
      },
      {
        id: "stage-2",
        name: "Post-Shock 1 & CPR",
        rhythm: "vfib_fine",
        vitals: { hr: 110, bpSys: 0, bpDia: 0, spo2: 0, co2: 25, rr: 0, temp: 98.6 }
      },
      {
         id: "stage-3",
         name: "Rhythm Check 2 (Refractory)",
         rhythm: "vfib_fine",
         vitals: { hr: 0, bpSys: 0, bpDia: 0, spo2: 0, co2: 20, rr: 0, temp: 98.6 }
      },
      {
         id: "stage-4",
         name: "ROSC",
         rhythm: "nsr",
         vitals: { hr: 85, bpSys: 90, bpDia: 50, spo2: 94, co2: 45, rr: 12, temp: 98.6 }
      }
    ]
  },
  {
    id: "bradycardia",
    title: "Symptomatic Bradycardia",
    description: "Symptomatic bradycardia deteriorating into complete heart block.",
    stages: [
      {
        id: "stage-1",
        name: "Initial Assessment",
        rhythm: "brady",
        vitals: { hr: 38, bpSys: 85, bpDia: 40, spo2: 92, co2: 38, rr: 18, temp: 98.2 }
      },
      {
        id: "stage-2",
        name: "Deterioration",
        rhythm: "complete_hb",
        vitals: { hr: 28, bpSys: 60, bpDia: 30, spo2: 88, co2: 34, rr: 10, temp: 98.2 }
      }
    ]
  }
];
