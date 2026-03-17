/**
 * GlassPro 3D — Calculadora de Cotización
 */

import { GlassMaterial, GlassThickness, GlassType, ShowerDoorMetrics } from './glassCalculator';
import { HardwareFinish } from './glassCalculator';
import { PricingConfig } from '../../store/projectStore';

export type HardwareType = 'bisagra' | 'jalon' | 'clip' | 'riel' | 'tirador' | 'sellador';

export interface HardwareItem {
    id: string;
    type: HardwareType;
    name: string;
    unitPrice: number;
    quantity: number;
    finish: HardwareFinish;
}

export interface QuoteResult {
    glassCost: number;
    hardwareCost: number;
    laborCost: number;
    subtotal: number;
    tax: number;     // 16% IVA (México)
    total: number;
    pricePerM2: number;
    currency: 'MXN';
    breakdown: {
        glassM2: number;
        glassUnitPrice: number;
        laborHours: number;
        laborHourRate: number;
    };
}

// ─── Precios base por m² (MXN) ─────────────────────────────────────────────

// Reemplazados por PricingConfig global
/*
const GLASS_PRICE_PER_M2: Record<GlassMaterial, Record<GlassThickness, number>> = {
    claro: { 6: 680, 8: 820, 10: 1050, 12: 1380 },
    extraclaro: { 6: 920, 8: 1100, 10: 1380, 12: 1750 },
    satinado: { 6: 980, 8: 1200, 10: 1450, 12: 1850 },
    gris: { 6: 750, 8: 900, 10: 1150, 12: 1500 },
    bronce: { 6: 820, 8: 980, 10: 1250, 12: 1600 },
};
*/

// Multiplicadores por acabado de herraje
const FINISH_MULTIPLIER: Record<HardwareFinish, number> = {
    cromo: 1.0,
    negro: 1.15,
    satin: 1.25,
    oro: 1.6,
};

// Precios base dinámicos sacados de PricingConfig (antes quemados en const)
const getHardwarePrice = (type: HardwareType, config: PricingConfig): number => {
    switch (type) {
        case 'bisagra': return config.hwBisagra;
        case 'jalon': return config.hwJalon;
        case 'clip': return config.hwClip;
        case 'riel': return config.hwRiel;
        case 'tirador': return config.hwJalon; // Usar el mismo importe para tirador que jalon
        case 'sellador': return config.hwSellador;
        default: return 100;
    }
};

// Horas de mano de obra estimadas
const LABOR_HOURS: Record<GlassType, number> = {
    batiente: 3.5,
    corrediza: 5.0,
    ventana: 2.0,
};

// ─── Generador de lista de herrajes ───────────────────────────────────────

export function generateHardwareList(
    glassType: GlassType,
    metrics: ShowerDoorMetrics,
    finish: HardwareFinish,
    config: PricingConfig
): HardwareItem[] {
    const mult = FINISH_MULTIPLIER[finish];
    // Eliminar el baseMult complejo. Sólo usamos mult por acabado.

    const items: HardwareItem[] = [];
    const panelCount = metrics.panels.length;

    const makeItem = (type: HardwareType, name: string, qty: number): HardwareItem => ({
        id: `hw-${type}-${items.length}`,
        type,
        name,
        quantity: qty,
        finish,
        unitPrice: Math.round(getHardwarePrice(type, config) * mult),
    });

    if (glassType === 'batiente') {
        const heavyPanel = metrics.panels.some(p => p.weight > 35);
        const bisagrasPerPanel = heavyPanel ? 3 : 2;
        items.push(makeItem('bisagra', `Bisagra de vidrio ${finish}`, bisagrasPerPanel * panelCount));
        items.push(makeItem('jalon', `Jalón tirador ${finish}`, panelCount));
        items.push(makeItem('sellador', 'Sellador de silicona neutro', 2));
    }

    if (glassType === 'corrediza') {
        const railMeters = Math.ceil(metrics.glassWidth / 1000) + 0.5;
        items.push(makeItem('riel', `Riel corriente ${finish} (${railMeters}m)`, railMeters));
        items.push(makeItem('clip', `Clip de vidrio ${finish}`, 4 * panelCount));
        items.push(makeItem('tirador', `Tirador embutido ${finish}`, panelCount));
        items.push(makeItem('sellador', 'Sellador de silicona neutro', 2));
    }

    if (glassType === 'ventana') {
        items.push(makeItem('clip', `Perfil U de aluminio ${finish}`, 4));
        items.push(makeItem('sellador', 'Sellador de silicona estructural', 3));
    }

    return items;
}

// ─── Cotizador principal ───────────────────────────────────────────────────

export function calculateQuote(
    glassType: GlassType,
    material: GlassMaterial,
    thickness: GlassThickness,
    metrics: ShowerDoorMetrics,
    hardware: HardwareItem[],
    config: PricingConfig,
    customLaborRate?: number,
): QuoteResult {
    // Calcular el precio base del vidrio por m2 (usando una fórmula simplificada según el config)
    let baseM2Price = config.glassClear;
    if (material === 'extraclaro') baseM2Price = config.glassExtra;
    if (material === 'gris' || material === 'bronce' || material === 'satinado') baseM2Price = config.glassColor;

    // Multiplicador por espesor
    const thickMult = thickness === 6 ? 0.7 : thickness === 8 ? 0.85 : thickness === 10 ? 1.0 : 1.3;
    const pricePerM2 = Math.round(baseM2Price * thickMult);

    const glassCost = Math.round(metrics.totalArea * pricePerM2);

    const hardwareCost = hardware.reduce((sum, h) => sum + h.unitPrice * h.quantity, 0);

    const laborHours = LABOR_HOURS[glassType];
    const laborRate = customLaborRate ?? config.laborRate;
    const laborCost = Math.round((laborHours * laborRate) + config.installationBase);

    // Aplicar margen
    const baseCost = glassCost + hardwareCost + laborCost;
    const subtotal = Math.round(baseCost * (1 + (config.profitMargin / 100)));

    const tax = Math.round(subtotal * (config.taxRate / 100));
    const total = subtotal + tax;

    return {
        glassCost,
        hardwareCost,
        laborCost,
        subtotal,
        tax,
        total,
        pricePerM2,
        currency: 'MXN',
        breakdown: {
            glassM2: metrics.totalArea,
            glassUnitPrice: pricePerM2,
            laborHours,
            laborHourRate: laborRate,
        },
    };
}
