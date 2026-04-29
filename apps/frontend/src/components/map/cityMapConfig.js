export const roads = [
  { id: "blvd-norte", name: "Blvd. Norte", type: "primary", orientation: "horizontal", from: { x: 10, y: 22 }, to: { x: 90, y: 22 }, label: { x: 58, y: 18 } },
  { id: "av-central", name: "Av. Central", type: "primary", orientation: "horizontal", from: { x: 10, y: 45 }, to: { x: 90, y: 45 }, label: { x: 58, y: 41 } },
  { id: "av-universidad", name: "Av. Universidad", type: "primary", orientation: "horizontal", from: { x: 10, y: 68 }, to: { x: 90, y: 68 }, label: { x: 54, y: 64 } },
  { id: "calle-reforma", name: "Calle Reforma", type: "primary", orientation: "vertical", from: { x: 20, y: 12 }, to: { x: 20, y: 82 }, label: { x: 22, y: 35 } },
  { id: "av-tecnologico", name: "Av. Tecnologico", type: "primary", orientation: "vertical", from: { x: 50, y: 12 }, to: { x: 50, y: 82 }, label: { x: 52, y: 31 } },
  { id: "calle-juarez", name: "Calle Juarez", type: "primary", orientation: "vertical", from: { x: 80, y: 12 }, to: { x: 80, y: 82 }, label: { x: 82, y: 51 } },
  { id: "calle-hidalgo", name: "Calle Hidalgo", type: "secondary", orientation: "horizontal", from: { x: 20, y: 34 }, to: { x: 80, y: 34 }, label: { x: 35, y: 31 } },
  { id: "calle-morelos", name: "Calle Morelos", type: "secondary", orientation: "horizontal", from: { x: 20, y: 56 }, to: { x: 80, y: 56 }, label: { x: 35, y: 53 } },
  { id: "calle-plaza", name: "Calle Plaza", type: "secondary", orientation: "vertical", from: { x: 35, y: 22 }, to: { x: 35, y: 68 }, label: { x: 37, y: 59 } },
  { id: "calle-mercado", name: "Calle Mercado", type: "secondary", orientation: "vertical", from: { x: 65, y: 22 }, to: { x: 65, y: 68 }, label: { x: 67, y: 36 } }
];

export const intersections = [
  { id: "reforma-norte", x: 20, y: 22 },
  { id: "tecnologico-norte", x: 50, y: 22 },
  { id: "juarez-norte", x: 80, y: 22 },
  { id: "reforma-central", x: 20, y: 45 },
  { id: "tecnologico-central", x: 50, y: 45 },
  { id: "juarez-central", x: 80, y: 45 },
  { id: "reforma-universidad", x: 20, y: 68 },
  { id: "tecnologico-universidad", x: 50, y: 68 },
  { id: "juarez-universidad", x: 80, y: 68 },
  { id: "plaza-morelos", x: 35, y: 56 },
  { id: "mercado-hidalgo", x: 65, y: 34 }
];

export const trafficLights = [
  { id: "tl-central-reforma", x: 20, y: 45, phase: 0 },
  { id: "tl-central-tec", x: 50, y: 45, phase: 1 },
  { id: "tl-central-juarez", x: 80, y: 45, phase: 2 },
  { id: "tl-universidad-tec", x: 50, y: 68, phase: 1 },
  { id: "tl-norte-tec", x: 50, y: 22, phase: 0 }
];

export const landmarks = [
  { id: "terminal", name: "Terminal Centro", x: 18, y: 72 },
  { id: "campus", name: "Campus", x: 54, y: 73 },
  { id: "plaza", name: "Plaza Norte", x: 75, y: 29 },
  { id: "clinica", name: "Clinica Urbana", x: 29, y: 39 }
];

export const cityBlocks = [
  { x: 11, y: 13, width: 7, height: 7 },
  { x: 23, y: 13, width: 10, height: 7 },
  { x: 38, y: 13, width: 10, height: 7 },
  { x: 53, y: 13, width: 10, height: 7 },
  { x: 68, y: 13, width: 10, height: 7 },
  { x: 83, y: 13, width: 6, height: 7 },
  { x: 23, y: 25, width: 10, height: 7 },
  { x: 38, y: 25, width: 10, height: 7 },
  { x: 53, y: 25, width: 10, height: 7 },
  { x: 68, y: 25, width: 10, height: 7 },
  { x: 11, y: 36, width: 7, height: 7 },
  { x: 23, y: 36, width: 10, height: 7 },
  { x: 38, y: 36, width: 10, height: 7 },
  { x: 53, y: 36, width: 10, height: 7 },
  { x: 68, y: 36, width: 10, height: 7 },
  { x: 83, y: 36, width: 6, height: 7 },
  { x: 11, y: 47, width: 7, height: 7 },
  { x: 23, y: 47, width: 10, height: 7 },
  { x: 38, y: 47, width: 10, height: 7 },
  { x: 53, y: 47, width: 10, height: 7 },
  { x: 68, y: 47, width: 10, height: 7 },
  { x: 83, y: 47, width: 6, height: 7 },
  { x: 11, y: 58, width: 7, height: 8 },
  { x: 23, y: 58, width: 10, height: 8 },
  { x: 38, y: 58, width: 10, height: 8 },
  { x: 53, y: 58, width: 10, height: 8 },
  { x: 68, y: 58, width: 10, height: 8 },
  { x: 83, y: 58, width: 6, height: 8 },
  { x: 23, y: 70, width: 25, height: 8 },
  { x: 53, y: 70, width: 25, height: 8 }
];
