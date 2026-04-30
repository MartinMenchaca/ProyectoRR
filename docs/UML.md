# Diagramas UML — Movilidad Inteligente POC

> Todos los diagramas están en formato Mermaid y pueden pegarse directamente en cualquier editor compatible (GitHub, GitLab, Notion, Obsidian, mermaid.live).

---

## A) Diagrama de Casos de Uso

```mermaid
flowchart TD
    subgraph Actores
        U[👤 Operador / Usuario]
        S[⚙️ Sistema de Movilidad]
        B[📡 Broker MQTT]
        V[🚌 Vehículo Simulado]
    end

    subgraph Casos de Uso
        UC1[Visualizar mapa urbano]
        UC2[Monitorear vehículos en tiempo real]
        UC3[Consultar estado de conexión]
        UC4[Visualizar rutas de vehículos]
        UC5[Ver información detallada del vehículo]
        UC6[Simular pago de pasajero]
        UC7[Reportar mantenimiento]
        UC8[Consultar historial de eventos]
        UC9[Simular recorrido IoT]
        UC10[Publicar telemetría MQTT]
        UC11[Persistir datos en base de datos]
        UC12[Notificar actualizaciones por WebSocket]
    end

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8

    V --> UC9
    V --> UC10

    B --> UC10

    S --> UC11
    S --> UC12
    S --> UC2
```

---

## B) Diagrama de Componentes

```mermaid
graph TB
    subgraph Frontend["Frontend (React + Vite · :5173)"]
        APP[App.jsx\nOrquestador de estado]
        SHELL[MobileShell\nLayout general]
        STATUS[SystemStatus\nEstado de comunicaciones]
        MAP[SimulatedMap\nMapa SVG 60fps]
        MARKER[VehicleMarker\nMarcador de vehículo]
        CARD[VehicleStatusCard\nDetalle de vehículo]
        SEL[VehicleSelector\nSelector de unidad]
        OP[OperatorPanel\nPanel operador]
        PAY[PaymentsPanel\nPagos simulados]
        MAINT[MaintenancePanel\nMantenimiento]
        EVT[EventTimeline\nLínea de eventos]
        FLOW[CommunicationFlow\nDiagrama educativo]
        HTTP_CLIENT[api/http.js\nCliente REST]
        WS_CLIENT[api/socket.js\nCliente Socket.IO]
        MAP_CFG[map/cityMapConfig.js\nCalles, semáforos, puntos]
        ROUTES_CFG[map/routesConfig.js\nRutas SVG por vehículo]
        MAP_UTILS[map/mapUtils.js\nInterpolación de posición]
    end

    subgraph Backend["Backend (Express · :3001)"]
        API[REST API\n/api/*]
        SOCK_SRV[Socket.IO Server\nEmite eventos en tiempo real]
        MQTT_CLI[MQTT Client\nSuscriptor de topics]
        MSG_PROC[messageProcessor\nProcesa mensajes MQTT]
        DB[(SQLite\nmovilidad.sqlite)]
        HEALTH[/health]
        VEH_RT[/vehicles]
        EVT_RT[/events]
        PAY_RT[/payments]
        MAINT_RT[/maintenance]
    end

    subgraph Broker["Broker MQTT (Aedes · :1883)"]
        AEDES[Aedes TCP\nBroker MQTT]
    end

    subgraph Simulator["Simulador IoT (Node.js)"]
        SIM[Loop de publicación\ncada 1800ms]
        VEH_DEF[vehicles.js\nDefinición GPS + config]
    end

    APP --> HTTP_CLIENT
    APP --> WS_CLIENT
    APP --> SHELL
    SHELL --> STATUS
    SHELL --> MAP
    SHELL --> CARD
    SHELL --> SEL
    SHELL --> OP
    SHELL --> PAY
    SHELL --> MAINT
    SHELL --> EVT
    SHELL --> FLOW
    MAP --> MARKER
    MAP --> MAP_CFG
    MAP --> ROUTES_CFG
    MAP --> MAP_UTILS

    HTTP_CLIENT -->|GET/POST REST| API
    WS_CLIENT -->|Socket.IO| SOCK_SRV

    API --> HEALTH
    API --> VEH_RT
    API --> EVT_RT
    API --> PAY_RT
    API --> MAINT_RT
    API --> DB
    SOCK_SRV -->|emite eventos| WS_CLIENT
    MQTT_CLI -->|suscribe topics| AEDES
    MQTT_CLI --> MSG_PROC
    MSG_PROC --> DB
    MSG_PROC --> SOCK_SRV

    SIM --> VEH_DEF
    SIM -->|publish MQTT| AEDES
```

---

## C) Diagrama de Secuencia — Flujo principal de telemetría

```mermaid
sequenceDiagram
    autonumber
    actor Op as Operador
    participant FE as Frontend (React)
    participant BE as Backend (Express)
    participant DB as SQLite
    participant SOCK as Socket.IO
    participant BRK as Broker MQTT
    participant SIM as Simulador IoT

    Op->>FE: Abre la aplicación en el navegador
    FE->>BE: GET /api/health
    BE-->>FE: { status: "ok", mqtt: {...}, websocket: {...} }
    FE->>BE: GET /api/vehicles
    BE->>DB: SELECT * FROM vehicles
    DB-->>BE: Lista de vehículos
    BE-->>FE: { data: [...vehicles] }
    FE->>SOCK: socket.connect()
    SOCK-->>FE: evento: connect

    Note over FE: Inicia animación 60fps del mapa
    Note over SIM: Loop cada 1800ms

    SIM->>BRK: publish movilidad/vehicles/BUS-001/telemetry
    BRK->>BE: message (topic, payload JSON)
    BE->>DB: INSERT INTO telemetry
    BE->>DB: UPDATE vehicles SET lat, lng, speed, battery
    BE->>SOCK: emitSocketEvent("vehicle:locationUpdated", {...})
    SOCK-->>FE: evento: vehicle:locationUpdated
    FE->>FE: upsertVehicleFromTelemetry() → actualiza estado
    FE->>FE: VehicleMarker se mueve en el mapa (DOM directo)

    Op->>FE: Clic en "Simular pago"
    FE->>BE: POST /api/payments/simulate
    BE->>DB: INSERT INTO payments
    BE->>DB: INSERT INTO events
    BE->>SOCK: emitSocketEvent("payment:created", {...})
    BE->>SOCK: emitSocketEvent("event:created", {...})
    SOCK-->>FE: evento: payment:created
    SOCK-->>FE: evento: event:created
    FE->>FE: Actualiza PaymentsPanel y EventTimeline
    BE-->>FE: 201 { data: payment }
```

---

## D) Modelo lógico de entidades

```mermaid
classDiagram
    class Vehicle {
        +String id
        +String name
        +String type
        +String plate
        +String status
        +Integer battery
        +Real current_lat
        +Real current_lng
        +Real speed
        +String created_at
        +String updated_at
    }

    class Telemetry {
        +Integer id
        +String vehicle_id
        +Real lat
        +Real lng
        +Real speed
        +Integer battery
        +String status
        +String source
        +String created_at
    }

    class Payment {
        +Integer id
        +String vehicle_id
        +String passenger_name
        +Real amount
        +String method
        +String status
        +String created_at
    }

    class MaintenanceReport {
        +Integer id
        +String vehicle_id
        +String type
        +String severity
        +String description
        +String status
        +String created_at
        +String resolved_at
    }

    class Event {
        +Integer id
        +String vehicle_id
        +String event_type
        +String channel
        +String topic
        +String payload_json
        +String created_at
    }

    class SimulatorVehicle {
        +String vehicleId
        +String type
        +String name
        +Number baseSpeed
        +Number batteryDrain
        +Number maintenanceEveryTicks
        +Array route
    }

    class RoutePoint {
        +Real lat
        +Real lng
    }

    class SVGRoute {
        +String vehicleId
        +String color
        +Number durationMs
        +Array points
    }

    class SVGPoint {
        +Number x
        +Number y
    }

    class TrafficLight {
        +String id
        +Number x
        +Number y
        +Integer phase
    }

    class Road {
        +String id
        +String name
        +String type
        +String orientation
        +Object from
        +Object to
    }

    Vehicle "1" --> "0..*" Telemetry : genera
    Vehicle "1" --> "0..*" Payment : recibe
    Vehicle "1" --> "0..*" MaintenanceReport : registra
    Vehicle "1" --> "0..*" Event : origina

    SimulatorVehicle "1" --> "1..*" RoutePoint : recorre
    SVGRoute "1" --> "1..*" SVGPoint : define
```

---

## E) Diagrama de Actividad — Flujo de funcionamiento

```mermaid
flowchart TD
    A([Iniciar aplicación]) --> B[Cargar interfaz React]
    B --> C[Llamar GET /api/health]
    C --> D{¿Backend responde?}
    D -- No --> E[Mostrar error de conexión\nReintentar en 2s]
    E --> C
    D -- Sí --> F[Llamar GET /api/vehicles\nGET /api/events\nGET /api/payments\nGET /api/maintenance]
    F --> G[Renderizar estado inicial del mapa]
    G --> H[Conectar Socket.IO al backend]
    H --> I{¿Socket conectado?}
    I -- No --> J[Estado: desconectado\nReintentar automáticamente]
    J --> H
    I -- Sí --> K[Iniciar animación 60fps del mapa\nIniciar polling REST cada 2s]

    subgraph Loop Simulador
        L([Cada 1800ms]) --> M[Calcular posición GPS del vehículo]
        M --> N[Calcular velocidad con onda + jitter]
        N --> O[Decrementar batería]
        O --> P[Publicar telemetría MQTT]
        P --> Q{¿Es tick de mantenimiento?}
        Q -- Sí --> R[Publicar reporte de mantenimiento MQTT]
        Q -- No --> L
        R --> L
    end

    subgraph Backend MQTT
        S[Recibir mensaje MQTT] --> T[Parsear JSON payload]
        T --> U[Upsert vehículo en DB]
        U --> V[Insertar evento en DB]
        V --> W{¿Tipo de mensaje?}
        W -- telemetría --> X[Insertar telemetry\nActualizar vehicle]
        X --> Y[Emitir vehicle:locationUpdated por WS]
        W -- mantenimiento --> Z[Insertar maintenance_report]
        Z --> AA[Emitir maintenance:reported por WS]
    end

    subgraph Frontend en tiempo real
        K --> BB[Recibir vehicle:locationUpdated]
        BB --> CC[upsertVehicleFromTelemetry en estado React]
        CC --> DD[Marcador se mueve en DOM vía ref]
        K --> EE[Recibir event:created]
        EE --> FF[Agregar a EventTimeline]
    end

    subgraph Acción del operador
        K --> GG[Operador selecciona vehículo]
        GG --> HH[Clic en Simular pago]
        HH --> II[POST /api/payments/simulate]
        II --> JJ[Backend guarda en DB\nEmite payment:created]
        JJ --> KK[Frontend actualiza PaymentsPanel]
    end
```

---

## F) Diagrama de Despliegue

```mermaid
graph TB
    subgraph Cliente["Navegador Web (localhost:5173)"]
        BROWSER[Chrome / Firefox / Safari\nReact SPA]
    end

    subgraph Maquina["Máquina local / Servidor"]
        subgraph NodeFE["Proceso: Vite Dev Server (:5173)"]
            FE_PROC[Frontend\napps/frontend]
        end

        subgraph NodeBE["Proceso: Node.js Backend (:3001)"]
            BE_PROC[Express + Socket.IO\napps/backend]
            SQLITE_FILE[(movilidad.sqlite\ndata/)]
        end

        subgraph NodeBroker["Proceso: Node.js Broker (:1883)"]
            BROKER_PROC[Aedes MQTT\napps/broker]
        end

        subgraph NodeSim["Proceso: Node.js Simulador"]
            SIM_PROC[Simulador IoT\napps/simulator]
        end
    end

    BROWSER -->|HTTP REST\nGET/POST| BE_PROC
    BROWSER -->|WebSocket\nSocket.IO| BE_PROC
    BROWSER -->|HTTP\narchivos estáticos| FE_PROC

    BE_PROC --> SQLITE_FILE
    BE_PROC -->|MQTT suscriptor\nTCP :1883| BROKER_PROC
    SIM_PROC -->|MQTT publisher\nTCP :1883| BROKER_PROC
    BROKER_PROC -->|reenvío mensajes| BE_PROC
```

---

## Notas sobre los diagramas

- Los diagramas A–F se basan exclusivamente en el código existente en el repositorio.
- Los nombres de clases y atributos del diagrama D coinciden con las columnas del schema SQL (`schema.sql`) y los campos de los payloads MQTT del simulador.
- El mapa no usa coordenadas geográficas reales en el SVG del frontend (usa coordenadas porcentuales 0–100). Las coordenadas reales (lat/lng de Ciudad Obregón, Sonora) sí se usan en el simulador para los mensajes MQTT.
- Los semáforos (`TrafficLight`) existen en `cityMapConfig.js` y se renderizan en el SVG, pero su estado (fase) es estático en esta versión del sistema.
