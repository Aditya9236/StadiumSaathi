/**
 * StadiumSaathi Internationalization Module
 * Covers: headers, navigation advisor, dashboard actions, and emergency broadcasts.
 * Supported locales: English (en), Spanish (es), French (fr).
 */

export type Locale = "en" | "es" | "fr";

export interface Translations {
  // Navigation & App Shell
  appName: string;
  appTagline: string;
  liveTelemetry: string;
  backToPortal: string;
  language: string;

  // Dashboard Labels
  dashboardTitle: string;
  totalOccupancy: string;
  avgWaitTime: string;
  entryFlowRate: string;
  activeSafetyAlerts: string;
  allZonesNormal: string;
  actionRequired: string;
  highCongestion: string;
  moderateQueues: string;
  fluidFlow: string;
  acrossActiveGates: string;
  stadiumCapacity: string;

  // Gate & Zone Status
  gateFlowBoard: string;
  zonesDensityMap: string;
  selectZoneHint: string;
  zoneAnalysis: string;
  currentAttendance: string;
  fillPercentage: string;
  congestionRedirectionPlan: string;

  // Dashboard Actions
  opsControlRoom: string;
  simulateIncident: string;
  simulateIncidentDesc: string;
  resolveActiveAlert: string;
  dispatchStaff: string;
  resolveIncident: string;
  dismissAlert: string;

  // Emergency Broadcast
  emergencyBroadcast: string;
  broadcastPlaceholder: string;
  sendBroadcast: string;
  broadcastSent: string;
  activeBroadcast: string;
  clearBroadcast: string;

  // AI Insight Panel
  aiInsightsTitle: string;
  liveMode: string;
  offlineMode: string;
  refreshInsights: string;
  refreshing: string;
  criticalNotifications: string;
  activeBottlenecks: string;
  noBottlenecks: string;
  staffingAdvice: string;
  redirectionRecommended: string;
  aiAction: string;
  greenHighlight: string;

  // Sustainability
  sustainabilityMonitor: string;
  recycledWaste: string;
  compostedWaste: string;
  landfillRefuse: string;
  carbonOffset: string;

  // Fan Portal Headers
  fanPortalTitle: string;
  fanPortalTagline: string;
  interactiveMap: string;
  navigationAdvisor: string;
  stepFreeRouting: string;
  stepFreeActive: string;
  stepFreeOff: string;

  // Navigation Advisor Form
  yourGate: string;
  yourSection: string;
  selectGate: string;
  selectSection: string;
  needStepFreeAccess: string;
  needSensoryFriendly: string;
  getDirections: string;
  gettingDirections: string;
  estimatedWalkTime: string;
  minutes: string;
  routeWarnings: string;
  navError: string;

  // Incident Banner
  incidentReported: string;
  incidentDispatched: string;
  incidentSeverity: string;
  incidentLocation: string;
  incidentId: string;

  // Broadcast Banner (Fan Portal)
  emergencyNotice: string;
}

const en: Translations = {
  appName: "StadiumSaathi",
  appTagline: "Your AI Companion for FIFA World Cup 2026 Operations",
  liveTelemetry: "Live Telemetry Active",
  backToPortal: "← Return to Portal",
  language: "Language",

  dashboardTitle: "Organizer Operations Dashboard",
  totalOccupancy: "Total Stadium Occupancy",
  avgWaitTime: "Average Gate Wait Time",
  entryFlowRate: "Aggregate Entry Flow Rate",
  activeSafetyAlerts: "Active Safety Alerts",
  allZonesNormal: "All Zones Normal",
  actionRequired: "Action Required",
  highCongestion: "High Congestion (Red)",
  moderateQueues: "Moderate Queues (Yellow)",
  fluidFlow: "Fluid Flow (Green)",
  acrossActiveGates: "Across active entry gates",
  stadiumCapacity: "Stadium is at",

  gateFlowBoard: "Gate Flow & Congestion Board",
  zonesDensityMap: "Stands & Zones Density Heatmap",
  selectZoneHint: "Select a zone below to generate active wait lists and crowd redirection recommendations.",
  zoneAnalysis: "Zone Analysis",
  currentAttendance: "Current Attendance",
  fillPercentage: "Fill Percentage",
  congestionRedirectionPlan: "⚠️ High Congestion Redirection Plan",

  opsControlRoom: "Ops Control Room",
  simulateIncident: "Simulate Incident",
  simulateIncidentDesc: "Triggers randomized mock telemetry warnings.",
  resolveActiveAlert: "Resolve or dismiss active alert to simulate another.",
  dispatchStaff: "Dispatch Staff",
  resolveIncident: "Mark as Resolved",
  dismissAlert: "Dismiss Alert",

  emergencyBroadcast: "Emergency Broadcast",
  broadcastPlaceholder: "Type an emergency message to broadcast to all fans...",
  sendBroadcast: "Send Broadcast",
  broadcastSent: "Broadcast Active",
  activeBroadcast: "🔊 Active Broadcast",
  clearBroadcast: "Clear",

  aiInsightsTitle: "AI Operations & Routing Insights",
  liveMode: "Live (Gemini AI)",
  offlineMode: "Offline (Fallback)",
  refreshInsights: "Manually refresh AI insights",
  refreshing: "Refreshing...",
  criticalNotifications: "Critical Notifications",
  activeBottlenecks: "Active Perimeter Bottlenecks",
  noBottlenecks: "No entry bottlenecks detected.",
  staffingAdvice: "Operational Staffing Advice",
  redirectionRecommended: "Redirection Recommended",
  aiAction: "Action",
  greenHighlight: "Green Telemetry Highlight",

  sustainabilityMonitor: "Green Diversion Monitor",
  recycledWaste: "Recycled Waste",
  compostedWaste: "Composted Waste",
  landfillRefuse: "Landfill Refuse",
  carbonOffset: "Carbon Offset",

  fanPortalTitle: "Fan Companion Portal",
  fanPortalTagline: "Navigate, discover, and get AI-powered directions to your seat.",
  interactiveMap: "Interactive Stadium Map",
  navigationAdvisor: "AI Navigation Advisor",
  stepFreeRouting: "Step-Free Routing",
  stepFreeActive: "Step-Free Mode Active — Elevators and ramps only.",
  stepFreeOff: "Enable for accessible routes",

  yourGate: "Your Entry Gate",
  yourSection: "Destination Section",
  selectGate: "Select your entry gate",
  selectSection: "Select your destination zone",
  needStepFreeAccess: "I need step-free access (wheelchair / mobility aid)",
  needSensoryFriendly: "I prefer quieter, sensory-friendly routes",
  getDirections: "Get Directions",
  gettingDirections: "Getting Directions...",
  estimatedWalkTime: "Estimated Walk Time",
  minutes: "min",
  routeWarnings: "Route Notices",
  navError: "Could not generate directions. Please try again.",

  incidentReported: "REPORTED",
  incidentDispatched: "DISPATCHED",
  incidentSeverity: "Severity",
  incidentLocation: "Location",
  incidentId: "Incident ID",

  emergencyNotice: "Emergency Notice",
};

const es: Translations = {
  appName: "StadiumSaathi",
  appTagline: "Tu compañero de IA para las operaciones de la Copa Mundial 2026",
  liveTelemetry: "Telemetría en vivo activa",
  backToPortal: "← Volver al Portal",
  language: "Idioma",

  dashboardTitle: "Panel de Operaciones del Organizador",
  totalOccupancy: "Ocupación Total del Estadio",
  avgWaitTime: "Tiempo Promedio de Espera en Puertas",
  entryFlowRate: "Tasa Agregada de Flujo de Entrada",
  activeSafetyAlerts: "Alertas de Seguridad Activas",
  allZonesNormal: "Todas las Zonas Normales",
  actionRequired: "Acción Requerida",
  highCongestion: "Alta Congestión (Rojo)",
  moderateQueues: "Colas Moderadas (Amarillo)",
  fluidFlow: "Flujo Fluido (Verde)",
  acrossActiveGates: "Puertas de entrada activas",
  stadiumCapacity: "El estadio está al",

  gateFlowBoard: "Tablero de Flujo y Congestión de Puertas",
  zonesDensityMap: "Mapa de Densidad de Gradas y Zonas",
  selectZoneHint: "Selecciona una zona para generar listas de espera y recomendaciones de desvío.",
  zoneAnalysis: "Análisis de Zona",
  currentAttendance: "Asistencia Actual",
  fillPercentage: "Porcentaje de Llenado",
  congestionRedirectionPlan: "⚠️ Plan de Desvío por Alta Congestión",

  opsControlRoom: "Sala de Control de Operaciones",
  simulateIncident: "Simular Incidente",
  simulateIncidentDesc: "Activa advertencias de telemetría simuladas.",
  resolveActiveAlert: "Resuelva o descarte la alerta activa para simular otra.",
  dispatchStaff: "Despachar Personal",
  resolveIncident: "Marcar como Resuelto",
  dismissAlert: "Descartar Alerta",

  emergencyBroadcast: "Transmisión de Emergencia",
  broadcastPlaceholder: "Escribe un mensaje de emergencia para transmitir a todos los aficionados...",
  sendBroadcast: "Enviar Transmisión",
  broadcastSent: "Transmisión Activa",
  activeBroadcast: "🔊 Transmisión Activa",
  clearBroadcast: "Limpiar",

  aiInsightsTitle: "Perspectivas de Operaciones e IA",
  liveMode: "En Vivo (Gemini IA)",
  offlineMode: "Sin Conexión (Respaldo)",
  refreshInsights: "Actualizar perspectivas de IA manualmente",
  refreshing: "Actualizando...",
  criticalNotifications: "Notificaciones Críticas",
  activeBottlenecks: "Cuellos de Botella Activos",
  noBottlenecks: "No se detectaron cuellos de botella.",
  staffingAdvice: "Consejos Operacionales de Personal",
  redirectionRecommended: "Desvío Recomendado",
  aiAction: "Acción",
  greenHighlight: "Resaltado Verde de Telemetría",

  sustainabilityMonitor: "Monitor de Desvío Verde",
  recycledWaste: "Residuos Reciclados",
  compostedWaste: "Residuos Compostados",
  landfillRefuse: "Residuos al Vertedero",
  carbonOffset: "Compensación de Carbono",

  fanPortalTitle: "Portal del Aficionado",
  fanPortalTagline: "Navega, descubre y obtén direcciones potenciadas por IA hacia tu asiento.",
  interactiveMap: "Mapa Interactivo del Estadio",
  navigationAdvisor: "Asesor de Navegación IA",
  stepFreeRouting: "Ruta Sin Escalones",
  stepFreeActive: "Modo Sin Escalones Activo — Solo ascensores y rampas.",
  stepFreeOff: "Activar para rutas accesibles",

  yourGate: "Tu Puerta de Entrada",
  yourSection: "Sección de Destino",
  selectGate: "Selecciona tu puerta de entrada",
  selectSection: "Selecciona tu zona de destino",
  needStepFreeAccess: "Necesito acceso sin escalones (silla de ruedas / ayuda de movilidad)",
  needSensoryFriendly: "Prefiero rutas más tranquilas, aptas para personas con sensibilidad sensorial",
  getDirections: "Obtener Direcciones",
  gettingDirections: "Obteniendo Direcciones...",
  estimatedWalkTime: "Tiempo Estimado a Pie",
  minutes: "min",
  routeWarnings: "Avisos de Ruta",
  navError: "No se pudieron generar las direcciones. Por favor, inténtalo de nuevo.",

  incidentReported: "REPORTADO",
  incidentDispatched: "DESPACHADO",
  incidentSeverity: "Severidad",
  incidentLocation: "Ubicación",
  incidentId: "ID de Incidente",

  emergencyNotice: "Aviso de Emergencia",
};

const fr: Translations = {
  appName: "StadiumSaathi",
  appTagline: "Votre compagnon IA pour les opérations de la Coupe du Monde 2026",
  liveTelemetry: "Télémétrie en direct active",
  backToPortal: "← Retour au Portail",
  language: "Langue",

  dashboardTitle: "Tableau de Bord des Opérations",
  totalOccupancy: "Occupation Totale du Stade",
  avgWaitTime: "Temps d'Attente Moyen aux Portes",
  entryFlowRate: "Taux de Flux d'Entrée Agrégé",
  activeSafetyAlerts: "Alertes de Sécurité Actives",
  allZonesNormal: "Toutes les Zones Normales",
  actionRequired: "Action Requise",
  highCongestion: "Haute Congestion (Rouge)",
  moderateQueues: "Files Modérées (Jaune)",
  fluidFlow: "Flux Fluide (Vert)",
  acrossActiveGates: "Portes d'entrée actives",
  stadiumCapacity: "Le stade est à",

  gateFlowBoard: "Tableau de Flux et Congestion des Portes",
  zonesDensityMap: "Carte de Densité des Tribunes et Zones",
  selectZoneHint: "Sélectionnez une zone pour générer des listes d'attente et des recommandations de déviation.",
  zoneAnalysis: "Analyse de Zone",
  currentAttendance: "Assistance Actuelle",
  fillPercentage: "Pourcentage de Remplissage",
  congestionRedirectionPlan: "⚠️ Plan de Déviation pour Haute Congestion",

  opsControlRoom: "Salle de Contrôle des Opérations",
  simulateIncident: "Simuler un Incident",
  simulateIncidentDesc: "Déclenche des avertissements de télémétrie simulés.",
  resolveActiveAlert: "Résolvez ou ignorez l'alerte active pour en simuler une autre.",
  dispatchStaff: "Dépêcher le Personnel",
  resolveIncident: "Marquer comme Résolu",
  dismissAlert: "Ignorer l'Alerte",

  emergencyBroadcast: "Diffusion d'Urgence",
  broadcastPlaceholder: "Tapez un message d'urgence à diffuser à tous les supporters...",
  sendBroadcast: "Envoyer la Diffusion",
  broadcastSent: "Diffusion Active",
  activeBroadcast: "🔊 Diffusion Active",
  clearBroadcast: "Effacer",

  aiInsightsTitle: "Aperçus des Opérations et de l'IA",
  liveMode: "En Direct (Gemini IA)",
  offlineMode: "Hors Ligne (Secours)",
  refreshInsights: "Actualiser manuellement les aperçus IA",
  refreshing: "Actualisation...",
  criticalNotifications: "Notifications Critiques",
  activeBottlenecks: "Goulots d'Étranglement Actifs",
  noBottlenecks: "Aucun goulot d'étranglement détecté.",
  staffingAdvice: "Conseils Opérationnels en Personnel",
  redirectionRecommended: "Déviation Recommandée",
  aiAction: "Action",
  greenHighlight: "Mise en Évidence Télémétrie Verte",

  sustainabilityMonitor: "Moniteur de Déviation Verte",
  recycledWaste: "Déchets Recyclés",
  compostedWaste: "Déchets Compostés",
  landfillRefuse: "Ordures en Décharge",
  carbonOffset: "Compensation Carbone",

  fanPortalTitle: "Portail Fan",
  fanPortalTagline: "Naviguez, découvrez et obtenez des directions IA vers votre siège.",
  interactiveMap: "Plan Interactif du Stade",
  navigationAdvisor: "Conseiller de Navigation IA",
  stepFreeRouting: "Itinéraire Sans Marches",
  stepFreeActive: "Mode Sans Marches Actif — Ascenseurs et rampes uniquement.",
  stepFreeOff: "Activer pour les itinéraires accessibles",

  yourGate: "Votre Porte d'Entrée",
  yourSection: "Section de Destination",
  selectGate: "Sélectionnez votre porte d'entrée",
  selectSection: "Sélectionnez votre zone de destination",
  needStepFreeAccess: "J'ai besoin d'un accès sans marches (fauteuil roulant / aide à la mobilité)",
  needSensoryFriendly: "Je préfère des itinéraires calmes et adaptés aux sensibilités sensorielles",
  getDirections: "Obtenir l'Itinéraire",
  gettingDirections: "Obtention de l'Itinéraire...",
  estimatedWalkTime: "Temps de Marche Estimé",
  minutes: "min",
  routeWarnings: "Avis d'Itinéraire",
  navError: "Impossible de générer les directions. Veuillez réessayer.",

  incidentReported: "SIGNALÉ",
  incidentDispatched: "DÉPÊCHÉ",
  incidentSeverity: "Sévérité",
  incidentLocation: "Localisation",
  incidentId: "ID d'Incident",

  emergencyNotice: "Avis d'Urgence",
};

/** Map of all supported locale translation objects */
export const translations: Record<Locale, Translations> = { en, es, fr };

/**
 * Returns the translation object for the given locale.
 * Falls back to English if the locale is not found.
 */
export function t(locale: Locale): Translations {
  return translations[locale] ?? translations.en;
}
