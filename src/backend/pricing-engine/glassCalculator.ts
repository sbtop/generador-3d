/**
 * GlassPro 3D — Motor de Cálculo de Vidrio Templado
 * Soporta: Puertas Batientes, Puertas Corredizas, Ventanas
 */

export type GlassType = 'batiente' | 'corrediza' | 'ventana';
export type GlassMaterial = 'claro' | 'extraclaro' | 'satinado' | 'gris' | 'bronce';
export type GlassThickness = 6 | 8 | 10 | 12;
export type HardwareFinish = 'cromo' | 'negro' | 'satin' | 'oro';

export interface Barreno {
    x: number; // mm desde borde izquierdo del vidrio
    y: number; // mm desde borde inferior del vidrio
    diameter: number; // mm
    description: string;
}

export interface GlassPanel {
    label: string;        // "Hoja Única" | "Hoja Izquierda" | "Hoja Derecha" | "Panel Fijo"
    glassWidth: number;   // mm — medida de corte
    glassHeight: number;  // mm — medida de corte
    weight: number;       // kg
    area: number;         // m²
    barrenos: Barreno[];
}

export interface ShowerDoorMetrics {
    glassType: GlassType;
    thickness: GlassThickness;
    panels: GlassPanel[];
    totalWeight: number;
    totalArea: number;
    // Atajos para UI sencilla (primer panel)
    glassWidth: number;
    glassHeight: number;
    weight: number;
    area: number;
}

// ─── Constantes de descuento ───────────────────────────────────────────────

const BATIENTE = {
    HINGE_GAP: 5,     // holgura bisagra lado muro
    STRIKE_GAP: 3,    // holgura cierre (imán/tope)
    BOTTOM_GAP: 10,   // barrido inferior (escobilla)
    TOP_GAP: 2,       // holgura superior estética
};

const CORREDIZA = {
    OVERLAP: 50,       // traslape entre hojas
    HEIGHT_RIEL: 40,   // descuento altura para corredor riel superior
    WALL_GAP: 5,       // holgura lateral lado muro
};

const VENTANA = {
    PERIMETER_GAP: 2,  // descuento perimetral para silicona (cada lado)
};

// Densidad del vidrio templado: 2.5 kg/m²/mm espesor
const GLASS_DENSITY = 2.5;

// ─── Generadores de barrenos ───────────────────────────────────────────────

function barrenos_bisagras(w: number, h: number): Barreno[] {
    const margin = 5; // mm desde borde
    const diam = 12;
    const barrenos: Barreno[] = [
        // Bisagra inferior: 200mm desde abajo
        { x: margin, y: 200, diameter: diam, description: 'Bisagra inferior' },
        // Bisagra superior: 200mm desde arriba
        { x: margin, y: h - 200, diameter: diam, description: 'Bisagra superior' },
    ];
    // Si el vidrio es muy alto o pesado, añadir bisagra central
    const weight = (w / 1000) * (h / 1000) * 12 * GLASS_DENSITY;
    if (h > 2000 || weight > 35) {
        barrenos.push({ x: margin, y: Math.round(h / 2), diameter: diam, description: 'Bisagra central (refuerzo)' });
    }
    // Jalón (perforación centrada horizontal, 1000mm desde abajo)
    barrenos.push({ x: Math.round(w / 2), y: 1000, diameter: diam, description: 'Jalón / Tirón' });
    return barrenos;
}

function barrenos_corrediza(w: number, h: number): Barreno[] {
    const diam = 10;
    return [
        { x: Math.round(w * 0.2), y: h - 50, diameter: diam, description: 'Clip superior izquierdo' },
        { x: Math.round(w * 0.8), y: h - 50, diameter: diam, description: 'Clip superior derecho' },
        { x: Math.round(w * 0.2), y: 50, diameter: diam, description: 'Guía inferior izquierda' },
        { x: Math.round(w * 0.8), y: 50, diameter: diam, description: 'Guía inferior derecha' },
    ];
}

function barrenos_ventana(w: number, h: number): Barreno[] {
    // Sin barrenos para ventanas con sellado de silicona
    void w; void h;
    return [];
}

// ─── Calculadores por tipo ──────────────────────────────────────────────────

function calcBatiente(vanoW: number, vanoH: number, t: GlassThickness): GlassPanel[] {
    const w = vanoW - BATIENTE.HINGE_GAP - BATIENTE.STRIKE_GAP;
    const h = vanoH - BATIENTE.BOTTOM_GAP - BATIENTE.TOP_GAP;
    const area = (w * h) / 1_000_000;
    const weight = area * t * GLASS_DENSITY;
    return [{
        label: 'Hoja Única',
        glassWidth: w,
        glassHeight: h,
        area: +area.toFixed(4),
        weight: +weight.toFixed(2),
        barrenos: barrenos_bisagras(w, h),
    }];
}

function calcCorrediza(vanoW: number, vanoH: number, t: GlassThickness): GlassPanel[] {
    const h = vanoH - CORREDIZA.HEIGHT_RIEL;
    // Cada hoja = la mitad del vano + traslape, menos holgura lateral
    const w = Math.round(vanoW / 2 + CORREDIZA.OVERLAP / 2 - CORREDIZA.WALL_GAP);

    const panels: GlassPanel[] = ['Hoja Izquierda', 'Hoja Derecha'].map(label => {
        const area = (w * h) / 1_000_000;
        const weight = area * t * GLASS_DENSITY;
        return {
            label,
            glassWidth: w,
            glassHeight: h,
            area: +area.toFixed(4),
            weight: +weight.toFixed(2),
            barrenos: barrenos_corrediza(w, h),
        };
    });
    return panels;
}

function calcVentana(vanoW: number, vanoH: number, t: GlassThickness): GlassPanel[] {
    const w = vanoW - VENTANA.PERIMETER_GAP * 2;
    const h = vanoH - VENTANA.PERIMETER_GAP * 2;
    const area = (w * h) / 1_000_000;
    const weight = area * t * GLASS_DENSITY;
    return [{
        label: 'Panel Fijo',
        glassWidth: w,
        glassHeight: h,
        area: +area.toFixed(4),
        weight: +weight.toFixed(2),
        barrenos: barrenos_ventana(w, h),
    }];
}

// ─── Función principal ──────────────────────────────────────────────────────

export function calculateGlass(
    glassType: GlassType,
    vanoWidth: number,
    vanoHeight: number,
    thickness: GlassThickness,
): ShowerDoorMetrics {
    let panels: GlassPanel[];

    switch (glassType) {
        case 'batiente': panels = calcBatiente(vanoWidth, vanoHeight, thickness); break;
        case 'corrediza': panels = calcCorrediza(vanoWidth, vanoHeight, thickness); break;
        case 'ventana': panels = calcVentana(vanoWidth, vanoHeight, thickness); break;
    }

    const totalWeight = +panels.reduce((s, p) => s + p.weight, 0).toFixed(2);
    const totalArea = +panels.reduce((s, p) => s + p.area, 0).toFixed(4);

    return {
        glassType,
        thickness,
        panels,
        totalWeight,
        totalArea,
        // Atajos primer panel
        glassWidth: panels[0].glassWidth,
        glassHeight: panels[0].glassHeight,
        weight: panels[0].weight,
        area: panels[0].area,
    };
}

// Alias de compatibilidad con el código anterior
export const calculateShowerDoor = (w: number, h: number, t: number) =>
    calculateGlass('batiente', w, h, t as GlassThickness);

export type { ShowerDoorMetrics as GlassMetrics };
