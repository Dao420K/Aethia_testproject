import { CriticalAlert } from '../types';

export const INITIAL_ALERTS: CriticalAlert[] = [
  {
    id: 'alert-1',
    timestamp: 'À l’instant',
    title: 'ÉRUPTION VOLCANIQUE MAJEURE',
    locationName: 'Montagnes de Feu (Ignis)',
    lat: -22,
    lng: 85,
    severity: 'critical',
    message: 'Éjection massive de magma et coulées de lave sulfurique détectées sur le continent d’Ignis. Flux thermique en hausse de +340%.',
    iconType: 'volcano',
    isRead: false
  },
  {
    id: 'alert-2',
    timestamp: 'Il y a 4 min',
    title: 'PERTURBATION ÉLECTROMAGNÉTIQUE',
    locationName: 'Villes Flottantes de Celestia',
    lat: 52,
    lng: -145,
    severity: 'high',
    message: 'Anomalie d’énergie d’Éther menaçant les répulseurs anti-gravité des citadelles de Celestia. Aurores intenses en cours.',
    iconType: 'magic',
    isRead: false
  },
  {
    id: 'alert-3',
    timestamp: 'Il y a 12 min',
    title: 'BLIZZARD CATACLYSMIQUE',
    locationName: 'Chaîne de Glace Éternelle (Hyperborea)',
    lat: 82,
    lng: -10,
    severity: 'warning',
    message: 'Chute brutale de température à -68°C. Front de gel polaire se propageant vers le continent de Veridia.',
    iconType: 'ice',
    isRead: false
  },
  {
    id: 'alert-4',
    timestamp: 'Il y a 28 min',
    title: 'SEISME SOUS-MARIN DÉTECTÉ',
    locationName: 'Mer de Cristal / L’Océan Sans Fin',
    lat: -5,
    lng: -40,
    severity: 'warning',
    message: 'Magnitude 7.4 enregistrée dans la fosse océanique du Fleuve d’Or. Houle de réflexion mesurée.',
    iconType: 'seismic',
    isRead: true
  }
];
