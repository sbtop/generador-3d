/**
 * GlassPro 3D — Validador de Seguridad
 * Implementa las "Reglas de Oro" para instalaciones de vidrio templado
 */

import { GlassType, GlassThickness, GlassMaterial, ShowerDoorMetrics } from './glassCalculator';

export type AlertSeverity = 'error' | 'warning' | 'info';

export interface SafetyAlert {
    id: string;
    severity: AlertSeverity;
    title: string;
    message: string;
    rule: string;
}

export function validateGlass(
    glassType: GlassType,
    material: GlassMaterial,
    thickness: GlassThickness,
    metrics: ShowerDoorMetrics,
): SafetyAlert[] {
    const alerts: SafetyAlert[] = [];

    // ── Regla 1: Vidrio recocido prohibido en puertas de baño ──────────────────
    // (Detectamos "material recocido" si el usuario intentara usarlo — no está en
    //  nuestro catálogo, pero lo dejamos como regla de educación si thickness < 6)
    if (glassType === 'batiente' && thickness < 6) {
        alerts.push({
            id: 'r1-recocido',
            severity: 'error',
            title: '🚫 Vidrio No Permitido',
            message:
                'Espesores menores a 6mm están prohibidos en puertas de baño batientes. ' +
                'Use mínimo 8mm para puertas hasta 900mm de ancho.',
            rule: 'NOM-146: Puertas de baño requieren vidrio de seguridad templado ≥ 6mm.',
        });
    }

    // ── Regla 2: Peso por hoja > 50 kg requiere bisagra adicional ─────────────
    for (const panel of metrics.panels) {
        if (panel.weight > 50) {
            alerts.push({
                id: `r2-peso-${panel.label.toLowerCase().replace(' ', '-')}`,
                severity: 'warning',
                title: '⚠️ Peso Crítico de Hoja',
                message:
                    `"${panel.label}": ${panel.weight} kg. Se requieren mínimo 3 bisagras ` +
                    'o refuerzo estructural. Coordine con el instalador.',
                rule: 'Bisagras estándar soportan hasta 50 kg por hoja.',
            });
        } else if (panel.weight > 35) {
            alerts.push({
                id: `r2-peso-warn-${panel.label.toLowerCase().replace(' ', '-')}`,
                severity: 'info',
                title: 'ℹ️ Peso Elevado',
                message:
                    `"${panel.label}": ${panel.weight} kg. Verifique la capacidad de las bisagras seleccionadas.`,
                rule: 'Recomendación preventiva de peso.',
            });
        }
    }

    // ── Regla 3: Relación ancho/alto > 3:1 inestable ─────────────────────────
    for (const panel of metrics.panels) {
        const ratio = panel.glassWidth / panel.glassHeight;
        if (ratio > 3) {
            alerts.push({
                id: `r3-ratio-${panel.label.toLowerCase()}`,
                severity: 'warning',
                title: '⚠️ Proporción Inestable',
                message:
                    `"${panel.label}": Relación ancho/alto de ${ratio.toFixed(1)}:1. ` +
                    'Un panel más ancho que alto triplica puede ser estructuralmente inestable.',
                rule: 'Relación máxima recomendada: 3:1 (ancho:alto).',
            });
        }
    }

    // ── Regla 4: 6mm en puertas batientes > 900mm ancho ──────────────────────
    if (glassType === 'batiente' && thickness === 6) {
        const tooWide = metrics.panels.some(p => p.glassWidth > 900);
        if (tooWide) {
            alerts.push({
                id: 'r4-espesor-6mm',
                severity: 'warning',
                title: '⚠️ Espesor Insuficiente',
                message:
                    'Puertas batientes mayores a 900mm de ancho requieren espesor mínimo de 8mm. ' +
                    'El vidrio de 6mm puede presentar vibración o flexión excesiva.',
                rule: 'Espesor mínimo para puertas anchas: 8mm.',
            });
        }
    }

    // ── Regla 5: Peso total transporte ────────────────────────────────────────
    if (metrics.totalWeight > 100) {
        alerts.push({
            id: 'r5-transporte',
            severity: 'info',
            title: 'ℹ️ Logística Especial',
            message:
                `Peso total de hojas: ${metrics.totalWeight} kg. ` +
                'Se requiere equipo de transporte especializado y mínimo 3 operarios.',
            rule: 'Recomendación de seguridad en obra.',
        });
    }

    // ── Regla 6: Ventanas de 6mm para vanos grandes ──────────────────────────
    if (glassType === 'ventana' && thickness === 6) {
        const tooBig = metrics.panels.some(p => p.area > 1.5);
        if (tooBig) {
            alerts.push({
                id: 'r6-ventana-area',
                severity: 'warning',
                title: '⚠️ Área Grande con 6mm',
                message:
                    'Ventanas mayores a 1.5 m² con vidrio de 6mm pueden presentar deflexión. ' +
                    'Considere 8mm o laminado de seguridad.',
                rule: 'Para ventanas > 1.5 m²: mínimo 8mm recomendado.',
            });
        }
    }

    // ── Satinado solo en lados sin exposición UV extrema ─────────────────────
    if (material === 'satinado' && glassType === 'ventana') {
        alerts.push({
            id: 'r7-satinado-ventana',
            severity: 'info',
            title: 'ℹ️ Vidrio Satinado Exterior',
            message:
                'El vidrio satinado exterior acumula más suciedad visible. ' +
                'Considere satinado interior o un sellado hidrofóbico.',
            rule: 'Recomendación de mantenimiento.',
        });
    }

    return alerts;
}
