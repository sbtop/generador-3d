import { useState } from 'react';
import { useProject } from '../../store/projectStore';
import { jsPDF } from 'jspdf';

// --- PDF CONSTANTS ---
const PAGE_W = 210;
const MARGIN = 20;
const FOOTER_Y = 285;

function generatePDF(state: ReturnType<typeof useProject>['state']) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    let y = MARGIN;

    const drawHeader = () => {
        doc.setFillColor(15, 23, 42);
        doc.rect(0, 0, PAGE_W, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('GlassPro 3D', MARGIN, 18);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text('Orden de Corte y Suministro de Vidrio Templado', MARGIN, 26);
        doc.setTextColor(96, 165, 250);
        doc.setFontSize(9);
        doc.text(`Folio: #${Date.now().toString().slice(-6)}`, PAGE_W - MARGIN, 14, { align: 'right' });
        doc.setTextColor(148, 163, 184);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, PAGE_W - MARGIN, 20, { align: 'right' });
    };

    const drawFooter = () => {
        const currPage = doc.internal.pages.length - 1;
        doc.setPage(currPage);
        doc.setFillColor(15, 23, 42);
        doc.rect(0, FOOTER_Y, PAGE_W, 12, 'F');
        doc.setTextColor(148, 163, 184);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('GlassPro 3D — Especialista en Vidrio Templado', MARGIN, FOOTER_Y + 7);
        doc.text(`Página ${currPage}`, PAGE_W - MARGIN, FOOTER_Y + 7, { align: 'right' });
    };

    const checkPageBreak = (neededY: number) => {
        if (y + neededY > FOOTER_Y - 10) {
            drawFooter();
            doc.addPage();
            y = 50; // Empezar después del header si lo repitiéramos, pero aquí solo saltamos
            return true;
        }
        return false;
    };

    drawHeader();
    y = 52;

    // ── Datos del proyecto ────────────────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DATOS DEL PROYECTO', MARGIN, y);
    y += 6;
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 6;

    const projectData = [
        ['Proyecto:', state.projectName || 'Sin nombre'],
        ['Cliente:', state.clientId ? state.clients.find(c => c.id === state.clientId)?.name || 'Desconocido' : 'Sin especificar'],
        ['Tipo de Instalación:', state.glassType === 'batiente' ? 'Puerta Batiente' : state.glassType === 'corrediza' ? 'Puerta Corrediza' : 'Ventana/Panel Fijo'],
        ['Material del Vidrio:', `${state.material.charAt(0).toUpperCase() + state.material.slice(1)} ${state.thickness}mm`],
        ['Acabado Herrajes:', state.finish.charAt(0).toUpperCase() + state.finish.slice(1)],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    projectData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, MARGIN, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, MARGIN + 55, y);
        y += 7;
    });
    y += 4;

    // ── Medidas de Corte ──────────────────────────────────────────────────────
    checkPageBreak(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('ORDEN DE CORTE — DATOS A FÁBRICA', MARGIN, y);
    y += 6;
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 8;

    state.metrics.panels.forEach((panel: any) => {
        const barrenosSize = panel.barrenos.length * 5 + 5;
        checkPageBreak(30 + barrenosSize);

        doc.setFillColor(241, 245, 249);
        doc.rect(MARGIN, y - 5, PAGE_W - MARGIN * 2, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(panel.label.toUpperCase(), MARGIN + 2, y);
        y += 10;

        const pData: [string, string][] = [
            ['Medida de Corte:', `${panel.glassWidth} × ${panel.glassHeight} mm`],
            ['Área:', `${panel.area} m²`],
            ['Peso estimado:', `${panel.weight} kg`],
        ];
        pData.forEach(([l, v]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(l, MARGIN + 4, y);
            doc.setFont('helvetica', 'normal');
            doc.text(v, MARGIN + 50, y);
            y += 6;
        });

        if (panel.barrenos.length > 0) {
            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text('Posición de Barrenos:', MARGIN + 4, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            panel.barrenos.forEach((b: any) => {
                doc.text(`• ${b.description}: X=${b.x}mm  Y=${b.y}mm  ⌀${b.diameter}mm`, MARGIN + 8, y);
                y += 5;
            });
        }
        y += 6;
    });

    checkPageBreak(15);
    doc.setFillColor(30, 58, 138);
    doc.rect(MARGIN, y, PAGE_W - MARGIN * 2, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Peso Total: ${state.metrics.totalWeight} kg  |  Área Total: ${state.metrics.totalArea} m²`, MARGIN + 4, y + 7);
    y += 20;

    // ── Herrajes ──────────────────────────────────────────────────────────────
    checkPageBreak(30);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text('LISTA DE HERRAJES (BOM)', MARGIN, y);
    y += 6;
    doc.setDrawColor(59, 130, 246);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 8;

    doc.setFillColor(15, 23, 42);
    doc.rect(MARGIN, y - 5, PAGE_W - MARGIN * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Artículo', MARGIN + 2, y);
    doc.text('Cant.', PAGE_W - MARGIN - 60, y);
    doc.text('Total', PAGE_W - MARGIN - 20, y, { align: 'right' });
    y += 8;

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    state.hardware.forEach((hw, i) => {
        checkPageBreak(8);
        if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(MARGIN, y - 4, PAGE_W - MARGIN * 2, 6, 'F');
        }
        doc.text(hw.name, MARGIN + 2, y);
        doc.text(String(hw.quantity), PAGE_W - MARGIN - 60, y);
        doc.text(`$${(hw.unitPrice * hw.quantity).toLocaleString('es-MX')}`, PAGE_W - MARGIN - 2, y, { align: 'right' });
        y += 6;
    });
    y += 10;

    // ── Cotización ────────────────────────────────────────────────────────────
    checkPageBreak(40);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('COTIZACIÓN FINAL', MARGIN, y);
    y += 6;
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 8;

    const quoteRows: [string, string][] = [
        ['Costo Vidrio:', `$${state.quote.glassCost.toLocaleString('es-MX')}`],
        ['Costo Herrajes:', `$${state.quote.hardwareCost.toLocaleString('es-MX')}`],
        ['Instalación/Mano de Obra:', `$${state.quote.laborCost.toLocaleString('es-MX')}`],
        ['Subtotal:', `$${state.quote.subtotal.toLocaleString('es-MX')}`],
        ['IVA (16%):', `$${state.quote.tax.toLocaleString('es-MX')}`],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    quoteRows.forEach(([l, v]) => {
        doc.text(l, MARGIN + 4, y);
        doc.text(v, PAGE_W - MARGIN, y, { align: 'right' });
        y += 7;
    });

    doc.setFillColor(59, 130, 246);
    doc.rect(MARGIN, y - 2, PAGE_W - MARGIN * 2, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', MARGIN + 4, y + 6);
    doc.text(`$${state.quote.total.toLocaleString('es-MX')}`, PAGE_W - MARGIN - 2, y + 6, { align: 'right' });
    y += 20;

    // ── Alertas ───────────────────────────────────────────────────────────────
    if (state.alerts.length > 0) {
        checkPageBreak(25);
        doc.setTextColor(234, 88, 12);
        doc.setFontSize(10);
        doc.text('⚠ ALERTAS DE SEGURIDAD', MARGIN, y);
        y += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        state.alerts.forEach(a => {
            const lines = doc.splitTextToSize(`• ${a.title}: ${a.message}`, PAGE_W - MARGIN * 2 - 10);
            checkPageBreak(lines.length * 5 + 2);
            doc.text(lines, MARGIN + 4, y);
            y += lines.length * 5 + 2;
        });
    }

    drawFooter();
    doc.save(`GlassPro-${state.projectName || 'Orden'}-${Date.now().toString().slice(-6)}.pdf`);
}

function generateWhatsApp(state: ReturnType<typeof useProject>['state']): string {
    const lines = [
        `🔷 *GlassPro 3D — Orden de Corte*`,
        `📂 Proyecto: ${state.projectName}`,
        `👤 Cliente: ${state.clientId ? state.clients.find(c => c.id === state.clientId)?.name || 'Desconocido' : 'N/D'}`,
        ``,
        `📐 *Tipo:* ${state.glassType}`,
        `🔲 *Material:* ${state.material} ${state.thickness}mm`,
        `🔩 *Acabado:* ${state.finish}`,
        ``,
        `📦 *Medidas de Corte:*`,
        ...state.metrics.panels.map((p: any) =>
            `  • ${p.label}: *${p.glassWidth} × ${p.glassHeight} mm*`
        ),
        ``,
        `💰 *Total: $${state.quote.total.toLocaleString('es-MX')} (IVA incl.)*`,
    ];
    return encodeURIComponent(lines.join('\n'));
}

export function OrderGenerator() {
    const { state } = useProject();
    const [pdfStatus, setPdfStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');

    const handlePDF = async () => {
        setPdfStatus('generating');
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            generatePDF(state);
            setPdfStatus('success');
            setTimeout(() => setPdfStatus('idle'), 2000);
        } catch (err) {
            console.error('PDF Generation failed:', err);
            setPdfStatus('error');
            alert('Error al generar el PDF.');
            setTimeout(() => setPdfStatus('idle'), 3000);
        }
    };

    return (
        <div className="module">
            <div className="module__header">
                <h2 className="module__title">📋 Generador de Orden</h2>
                <p className="module__subtitle">Revisa el resumen completo y genera el PDF o envía la orden por WhatsApp.</p>
            </div>

            <div className="module__body">
                <section className="section">
                    <h3 className="section__title">Resumen Ejecutivo</h3>
                    <div className="summary-grid">
                        <div className="summary-card summary-card--blue">
                            <div className="summary-card__value">{state.metrics.panels.length}</div>
                            <div className="summary-card__label">Paneles</div>
                        </div>
                        <div className="summary-card summary-card--green">
                            <div className="summary-card__value">{state.metrics.totalWeight} kg</div>
                            <div className="summary-card__label">Peso Total</div>
                        </div>
                        <div className="summary-card summary-card--purple">
                            <div className="summary-card__value">{state.metrics.totalArea} m²</div>
                            <div className="summary-card__label">Área Total</div>
                        </div>
                        <div className="summary-card summary-card--orange">
                            <div className="summary-card__value">${state.quote.total.toLocaleString('es-MX')}</div>
                            <div className="summary-card__label">Total Orden</div>
                        </div>
                    </div>
                </section>

                <section className="section">
                    <h3 className="section__title">Detalle por Hoja</h3>
                    {state.metrics.panels.map((panel: any) => (
                        <div key={panel.label} className="panel-detail">
                            <div className="panel-detail__header">
                                <span className="panel-detail__name">{panel.label}</span>
                                <span className="panel-detail__dims">{panel.glassWidth} × {panel.glassHeight} mm</span>
                            </div>
                            <div className="panel-detail__specs">
                                <span>Área: <strong>{panel.area} m²</strong></span>
                                <span>Peso: <strong>{panel.weight} kg</strong></span>
                                <span>Barrenos: <strong>{panel.barrenos.length}</strong></span>
                            </div>
                            <div className="barrenos-table">
                                {panel.barrenos.map((b: any, i: number) => (
                                    <div key={i} className="barreno-row">
                                        <span className="barreno-row__num">{i + 1}</span>
                                        <span className="barreno-row__desc">{b.description}</span>
                                        <span className="barreno-row__pos">X: {b.x}mm</span>
                                        <span className="barreno-row__pos">Y: {b.y}mm</span>
                                        <span className="barreno-row__diam">⌀{b.diameter}mm</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </section>

                <section className="section">
                    <h3 className="section__title">Lista de Herrajes</h3>
                    <div className="order-hardware-list">
                        {state.hardware.map(hw => (
                            <div key={hw.id} className="order-hw-row">
                                <span className="order-hw-name">{hw.name}</span>
                                <span className="order-hw-qty">× {hw.quantity}</span>
                                <span className="order-hw-price">${(hw.unitPrice * hw.quantity).toLocaleString('es-MX')}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {state.alerts.length > 0 && (
                    <section className="section">
                        <h3 className="section__title">🛡️ Alertas de Seguridad</h3>
                        {state.alerts.map(a => (
                            <div key={a.id} className={`alert-card alert-card--${a.severity}`}>
                                <div className="alert-card__title">{a.title}</div>
                                <div className="alert-card__msg">{a.message}</div>
                            </div>
                        ))}
                    </section>
                )}

                <section className="section">
                    <h3 className="section__title">Exportar y Compartir</h3>
                    <div className="actions-grid">
                        <button
                            className="action-btn action-btn--primary"
                            onClick={handlePDF}
                            disabled={pdfStatus !== 'idle'}
                        >
                            {pdfStatus === 'generating' ? '⏳ Generando...' : pdfStatus === 'success' ? '✅ ¡Listo!' : pdfStatus === 'error' ? '❌ Error' : '📄 Generar PDF'}
                            <span className="action-btn__sub">Orden de corte completa</span>
                        </button>
                        <a
                            className="action-btn action-btn--whatsapp"
                            href={`https://wa.me/?text=${generateWhatsApp(state)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            💬 Enviar por WhatsApp
                            <span className="action-btn__sub">Compartir resumen</span>
                        </a>
                        <button
                            className="action-btn action-btn--secondary"
                            onClick={() => {
                                const data = JSON.stringify(state, null, 2);
                                const blob = new Blob([data], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `GlassPro-${state.projectName || 'proyecto'}.json`;
                                a.click();
                            }}
                        >
                            💾 Exportar JSON
                            <span className="action-btn__sub">Guardar proyecto</span>
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
