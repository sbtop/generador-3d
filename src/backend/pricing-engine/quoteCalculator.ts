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
    tax: number;
    total: number;
    pricePerUnit: number; // Price per m2 or sqft
    currency: '$';
    breakdown: {
        area: number;
        areaUnit: 'm²' | 'sqft';
        unitPrice: number;
        laborHours: number;
    };
}

// Multiplicadores por acabado de herraje
const FINISH_MULTIPLIER: Record<HardwareFinish, number> = {
    cromo: 1.0,
    negro: 1.15,
    satin: 1.25,
    oro: 1.6,
};

const getHardwarePrice = (type: HardwareType, config: PricingConfig): number => {
    switch (type) {
        case 'bisagra': return config.hwBisagra;
        case 'jalon': return config.hwJalon;
        case 'clip': return config.hwClip;
        case 'riel': return config.hwRiel;
        case 'tirador': return config.hwJalon;
        case 'sellador': return config.hwSellador;
        default: return 100;
    }
};

const LABOR_HOURS: Record<GlassType, number> = {
    batiente: 3.5,
    corrediza: 5.0,
    ventana: 2.0,
};

export function generateHardwareList(
    glassType: GlassType,
    metrics: ShowerDoorMetrics,
    finish: HardwareFinish,
    config: PricingConfig
): HardwareItem[] {
    const mult = FINISH_MULTIPLIER[finish];
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

export function calculateQuote(
    glassType: GlassType,
    material: GlassMaterial,
    thickness: GlassThickness,
    metrics: ShowerDoorMetrics,
    hardware: HardwareItem[],
    config: PricingConfig,
    _unit: 'mm' | 'm' | 'in' = 'mm',
    customLaborRate?: number,
): QuoteResult {
    // 1. Determine Unit Price based on Material
    let baseUnitPrice = config.glassClear;
    if (material === 'extraclaro') baseUnitPrice = config.glassExtra;
    if (material === 'gris' || material === 'bronce' || material === 'satinado') baseUnitPrice = config.glassColor;

    // 2. Adjust for thickness (simple multiplier)
    const thickMult = thickness <= 6 ? 0.8 : thickness <= 8 ? 0.9 : thickness <= 10 ? 1.0 : 1.25;
    const finalUnitPrice = Math.round(baseUnitPrice * thickMult);

    // 3. Calculate Area in SqFt (since the $12 rule is per sqft)
    // Conversion: 1 m2 = 10.7639 sqft
    const areaSqFt = metrics.totalArea * 10.7639;

    // 4. Calculate Costs
    const glassCost = Math.round(areaSqFt * finalUnitPrice);
    const hardwareCost = hardware.reduce((sum, h) => sum + h.unitPrice * h.quantity, 0);
    const laborHours = LABOR_HOURS[glassType] || 3;
    const laborRate = customLaborRate ?? config.laborRate;
    const laborCost = Math.round((laborHours * laborRate) + config.installationBase);

    // 5. Margin & Totals
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
        pricePerUnit: finalUnitPrice,
        currency: '$',
        breakdown: {
            area: +areaSqFt.toFixed(2),
            areaUnit: 'sqft',
            unitPrice: finalUnitPrice,
            laborHours,
        },
    };
}
