/**
 * GlassPro 3D — Estado Global del Proyecto y Aplicación
 */
import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { GlassType, GlassMaterial, GlassThickness, HardwareFinish, ShowerDoorMetrics, calculateGlass } from '../backend/pricing-engine/glassCalculator';
import { HardwareItem, QuoteResult, generateHardwareList, calculateQuote } from '../backend/pricing-engine/quoteCalculator';
import { SafetyAlert, validateGlass } from '../backend/pricing-engine/safetyValidator';

export type AppModule = 'home' | 'clients' | 'optimizer' | 'configurator' | 'order' | 'settings';

export interface PricingConfig {
    glassClear: number;
    glassExtra: number;
    glassColor: number;
    hwBisagra: number;
    hwJalon: number;
    hwRiel: number;
    hwClip: number;
    hwSellador: number;
    installationBase: number;
    laborRate: number;
    taxRate: number;
    profitMargin: number;
}

export interface UserPreferences {
    measureUnits: 'mm' | 'm' | 'in';
    measureMethod: 'Centreline Glass' | 'Opening Size';
    defaultDoorWidth: number;
    doorActions: string;
    hingePositioning: string;
    glassCoatings: string;
    frameTypes: string;
    hardwareFinishes: string;
    headerOptions: string;
    handleStyles: string;
    fixingStyles: string;
}

export interface Client {
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string;
}

export interface SavedProject {
    id: string;
    clientId: string | null;
    projectName: string;
    date: number;
    glassType: GlassType;
    material: GlassMaterial;
    thickness: GlassThickness;
    finish: HardwareFinish;
    vanoWidth: number;
    vanoHeight: number;
    quoteTotal: number;
}

export interface AppState {
    // Navigation
    activeModule: AppModule | 'settings';

    // Pricing Configuration
    pricingConfig: PricingConfig;

    // Arrays for localStorage
    clients: Client[];
    savedProjects: SavedProject[];

    // Current Project Editing State
    projectId: string | null;
    projectName: string;
    clientId: string | null;

    // Glass config
    glassType: GlassType;
    material: GlassMaterial;
    thickness: GlassThickness;
    finish: HardwareFinish;
    vanoWidth: number;
    vanoHeight: number;

    // Computed (derived)
    metrics: ShowerDoorMetrics;
    hardware: HardwareItem[];
    quote: QuoteResult;
    alerts: SafetyAlert[];
    preferences: UserPreferences;
}

type Action =
    | { type: 'SET_MODULE'; payload: AppModule }
    | { type: 'SET_PROJECT'; payload: { projectName?: string; clientId?: string | null } }
    | { type: 'NEW_PROJECT' }
    | { type: 'LOAD_PROJECT'; payload: SavedProject }
    | { type: 'SAVE_CURRENT_PROJECT' }

    | { type: 'ADD_CLIENT'; payload: Client }
    | { type: 'UPDATE_CLIENT'; payload: Client }
    | { type: 'DELETE_CLIENT'; payload: string }
    | { type: 'DELETE_PROJECT'; payload: string }

    | { type: 'SET_GLASS_TYPE'; payload: GlassType }
    | { type: 'SET_MATERIAL'; payload: GlassMaterial }
    | { type: 'SET_THICKNESS'; payload: GlassThickness }
    | { type: 'SET_FINISH'; payload: HardwareFinish }
    | { type: 'SET_VANO'; payload: { vanoWidth?: number; vanoHeight?: number } }
    | { type: 'UPDATE_PRICING_CONFIG'; payload: PricingConfig }
    | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
    | { type: 'INIT_STORAGE'; payload: { clients: Client[], savedProjects: SavedProject[], pricing: PricingConfig | null, preferences: UserPreferences | null } };

function recompute(state: AppState): AppState {
    const metrics = calculateGlass(state.glassType, state.vanoWidth, state.vanoHeight, state.thickness);
    const hardware = generateHardwareList(state.glassType, metrics, state.finish, state.pricingConfig);
    const quote = calculateQuote(state.glassType, state.material, state.thickness, metrics, hardware, state.pricingConfig);
    const alerts = validateGlass(state.glassType, state.material, state.thickness, metrics);
    return { ...state, metrics, hardware, quote, alerts };
}

const defaultPricingConfig: PricingConfig = {
    glassClear: 450,
    glassExtra: 750,
    glassColor: 550,
    hwBisagra: 250,
    hwJalon: 180,
    hwRiel: 650,
    hwClip: 80,
    hwSellador: 85,
    installationBase: 1500,
    laborRate: 280,
    taxRate: 16,
    profitMargin: 35,
};

const defaultPreferences: UserPreferences = {
    measureUnits: 'mm',
    measureMethod: 'Centreline Glass',
    defaultDoorWidth: 600,
    doorActions: 'Continuous Hinged',
    hingePositioning: 'Flush with wall',
    glassCoatings: 'None',
    frameTypes: 'Frameless',
    hardwareFinishes: 'Chrome',
    headerOptions: 'None',
    handleStyles: 'C-Pull',
    fixingStyles: 'None'
};

const initialVano = { vanoWidth: 900, vanoHeight: 1800 };
const initialMetrics = calculateGlass('batiente', initialVano.vanoWidth, initialVano.vanoHeight, 10);
const initialHardware = generateHardwareList('batiente', initialMetrics, 'cromo', defaultPricingConfig);
const initialQuote = calculateQuote('batiente', 'claro', 10, initialMetrics, initialHardware, defaultPricingConfig);
const initialAlerts = validateGlass('batiente', 'claro', 10, initialMetrics);

const initialState: AppState = {
    activeModule: 'home', // Inicia en el Dashboard

    pricingConfig: defaultPricingConfig,

    clients: [],
    savedProjects: [],

    projectId: null,
    projectName: 'Nuevo Proyecto',
    clientId: null,

    glassType: 'batiente',
    material: 'claro',
    thickness: 10,
    finish: 'cromo',
    ...initialVano,

    metrics: initialMetrics,
    hardware: initialHardware,
    quote: initialQuote,
    alerts: initialAlerts,
    preferences: defaultPreferences
};

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function reducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'INIT_STORAGE': {
            return recompute({
                ...state,
                clients: action.payload.clients,
                savedProjects: action.payload.savedProjects,
                pricingConfig: action.payload.pricing || defaultPricingConfig,
                preferences: action.payload.preferences || defaultPreferences
            });
        }
        case 'SET_MODULE':
            return { ...state, activeModule: action.payload as any };

        case 'SET_PROJECT':
            return { ...state, ...action.payload };

        case 'NEW_PROJECT': {
            const newState: AppState = {
                ...state,
                projectId: null,
                projectName: 'Nuevo Proyecto',
                clientId: null,
                glassType: 'batiente',
                material: 'claro',
                thickness: 10,
                finish: 'cromo',
                vanoWidth: 900,
                vanoHeight: 1800,
            };
            return recompute(newState);
        }

        case 'LOAD_PROJECT': {
            const p = action.payload;
            const newState: AppState = {
                ...state,
                projectId: p.id,
                projectName: p.projectName,
                clientId: p.clientId,
                glassType: p.glassType,
                material: p.material,
                thickness: p.thickness,
                finish: p.finish,
                vanoWidth: p.vanoWidth,
                vanoHeight: p.vanoHeight,
                activeModule: 'optimizer'
            };
            return recompute(newState);
        }

        case 'SAVE_CURRENT_PROJECT': {
            const id = state.projectId || generateId();
            const projectToSave: SavedProject = {
                id,
                clientId: state.clientId,
                projectName: state.projectName,
                date: Date.now(),
                glassType: state.glassType,
                material: state.material,
                thickness: state.thickness,
                finish: state.finish,
                vanoWidth: state.vanoWidth,
                vanoHeight: state.vanoHeight,
                quoteTotal: state.quote.total
            };

            const exists = state.savedProjects.some(p => p.id === id);
            const savedProjects = exists
                ? state.savedProjects.map(p => p.id === id ? projectToSave : p)
                : [projectToSave, ...state.savedProjects];

            return { ...state, projectId: id, savedProjects };
        }

        case 'ADD_CLIENT': {
            const clients = [action.payload, ...state.clients];
            return { ...state, clients };
        }

        case 'UPDATE_CLIENT': {
            const clients = state.clients.map(c => c.id === action.payload.id ? action.payload : c);
            return { ...state, clients };
        }

        case 'DELETE_CLIENT': {
            const clients = state.clients.filter(c => c.id !== action.payload);
            // También habría que "des-vincular" proyectos de este cliente si lo borramos
            return { ...state, clients, clientId: state.clientId === action.payload ? null : state.clientId };
        }

        case 'DELETE_PROJECT': {
            const savedProjects = state.savedProjects.filter(p => p.id !== action.payload);
            return { ...state, savedProjects, projectId: state.projectId === action.payload ? null : state.projectId };
        }

        case 'SET_GLASS_TYPE': return recompute({ ...state, glassType: action.payload });
        case 'SET_MATERIAL': return recompute({ ...state, material: action.payload });
        case 'SET_THICKNESS': return recompute({ ...state, thickness: action.payload });
        case 'SET_FINISH': return recompute({ ...state, finish: action.payload });
        case 'SET_VANO': return recompute({ ...state, ...action.payload });
        case 'UPDATE_PRICING_CONFIG': return recompute({ ...state, pricingConfig: action.payload });
        case 'UPDATE_PREFERENCES': {
            const preferences = { ...state.preferences, ...action.payload };
            localStorage.setItem('glasspro_preferences', JSON.stringify(preferences));
            return { ...state, preferences };
        }

        default: return state;
    }
}

const ProjectContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Cargar localStorage inicial
    useEffect(() => {
        try {
            const storedClients = localStorage.getItem('glasspro_clients');
            const storedProjects = localStorage.getItem('glasspro_projects');
            const storedPricing = localStorage.getItem('glasspro_pricing');

            dispatch({
                type: 'INIT_STORAGE',
                payload: {
                    clients: storedClients ? JSON.parse(storedClients) : [],
                    savedProjects: storedProjects ? JSON.parse(storedProjects) : [],
                    pricing: storedPricing ? JSON.parse(storedPricing) : null,
                    preferences: storedPrefs ? JSON.parse(storedPrefs) : null
                }
            });
        } catch (e) {
            console.error('Failed to load local storage', e);
        }
    }, []);

    const storedPrefs = localStorage.getItem('glasspro_preferences');

    // Guardar localStorage tras cada cambio de colecciones
    useEffect(() => {
        if (state.clients !== initialState.clients || state.savedProjects !== initialState.savedProjects) {
            localStorage.setItem('glasspro_clients', JSON.stringify(state.clients));
            localStorage.setItem('glasspro_projects', JSON.stringify(state.savedProjects));
        }
    }, [state.clients, state.savedProjects]);

    return <ProjectContext.Provider value={{ state, dispatch }}>{children}</ProjectContext.Provider>;
}

export function useProject() {
    const ctx = useContext(ProjectContext);
    if (!ctx) throw new Error('useProject must be used inside ProjectProvider');
    return ctx;
}
