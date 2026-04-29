export const vehicles = [
  {
    vehicleId: "BUS-001",
    type: "bus",
    name: "Ruta Centro",
    baseSpeed: 38,
    batteryDrain: 0.35,
    maintenanceEveryTicks: 12,
    route: [
      { lat: 27.4828, lng: -109.9304 },
      { lat: 27.4832, lng: -109.9312 },
      { lat: 27.4841, lng: -109.9322 },
      { lat: 27.485, lng: -109.9316 },
      { lat: 27.4857, lng: -109.9305 },
      { lat: 27.4849, lng: -109.9297 },
      { lat: 27.4839, lng: -109.9293 }
    ]
  },
  {
    vehicleId: "TAXI-001",
    type: "electric_taxi",
    name: "Taxi Eléctrico Norte",
    baseSpeed: 46,
    batteryDrain: 0.45,
    maintenanceEveryTicks: 15,
    route: [
      { lat: 27.4891, lng: -109.9368 },
      { lat: 27.4898, lng: -109.9359 },
      { lat: 27.4906, lng: -109.9348 },
      { lat: 27.4912, lng: -109.9337 },
      { lat: 27.4905, lng: -109.9329 },
      { lat: 27.4894, lng: -109.9334 },
      { lat: 27.4887, lng: -109.9347 }
    ]
  },
  {
    vehicleId: "SCOOTER-001",
    type: "scooter",
    name: "Scooter Plaza",
    baseSpeed: 22,
    batteryDrain: 0.55,
    maintenanceEveryTicks: 18,
    route: [
      { lat: 27.4814, lng: -109.9279 },
      { lat: 27.4818, lng: -109.9272 },
      { lat: 27.4824, lng: -109.9269 },
      { lat: 27.4829, lng: -109.9274 },
      { lat: 27.4826, lng: -109.9281 },
      { lat: 27.482, lng: -109.9286 },
      { lat: 27.4815, lng: -109.9284 }
    ]
  }
];
