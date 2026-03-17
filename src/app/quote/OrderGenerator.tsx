import { useProject } from '../../store/projectStore';
import { jsPDF } from 'jspdf';

function generatePDF(state: ReturnType<typeof useProject>['state']) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 20;
    let y = margin;

    // ── Header ────────────────────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('GlassPro 3D', margin, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('Orden de Corte y Suministro de Vidrio Templado', margin, 26);

    doc.setTextColor(96, 165, 250);
    doc.setFontSize(9);
    doc.text(`Folio: #${Date.now().toString().slice(-6)}`, pageW - margin, 14, { align: 'right' });
    doc.setTextColor(148, 163, 184);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin, 20, { align: 'right' });

    y = 52;

    // ── Datos del proyecto ────────────────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('DATOS DEL PROYECTO', margin, y);
    y += 6;

    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const projectData = [
        ['Proyecto:', state.projectName || 'Sin nombre'],
        ['Cliente:', state.clientId ? state.clients.find(c => c.id === state.clientId)?.name || 'Desconocido' : 'Sin especificar'],
        ['Tipo de Instalación:', state.glassType === 'batiente' ? 'Puerta Batiente' : state.glassType === 'corrediza' ? 'Puerta Corrediza' : 'Ventana/Panel Fijo'],
        ['Material del Vidrio:', `${state.material.charAt(0).toUpperCase() + state.material.slice(1)} ${state.thickness}mm`],
        ['Acabado Herrajes:', state.finish.charAt(0).toUpperCase() + state.finish.slice(1)],
    ];

    projectData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 55, y);
        y += 7;
    });

    y += 4;

    // ── Medidas de Corte ──────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('ORDEN DE CORTE — DATOS A FÁBRICA', margin, y);
    y += 6;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    state.metrics.panels.forEach((panel: any) => {
        // Panel header
        doc.setFillColor(241, 245, 249);
        doc.rect(margin, y - 5, pageW - margin * 2, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 41, 59);
        doc.text(panel.label.toUpperCase(), margin + 2, y);
        y += 10;

        // Dimensiones
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        const panelData: [string, string][] = [
            ['Medida de Corte:', `${panel.glassWidth} × ${panel.glassHeight} mm`],
            ['Área:', `${panel.area} m²`],
            ['Peso estimado:', `${panel.weight} kg`],
        ];
        panelData.forEach(([l, v]) => {
            doc.setFont('helvetica', 'bold');
            doc.text(l, margin + 4, y);
            doc.setFont('helvetica', 'normal');
            doc.text(v, margin + 50, y);
            y += 6;
        });

        // Barrenos
        if (panel.barrenos.length > 0) {
            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text('Posición de Barrenos:', margin + 4, y);
            y += 5;
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(30, 41, 59);
            panel.barrenos.forEach((b: any) => {
                doc.text(`• ${b.description}: X=${b.x}mm  Y=${b.y}mm  ⌀${b.diameter}mm`, margin + 8, y);
                y += 5;
            });
        }
        y += 6;
    });

    // Resumen de peso total
    doc.setFillColor(30, 58, 138);
    doc.rect(margin, y, pageW - margin * 2, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(`Peso Total: ${state.metrics.totalWeight} kg  |  Área Total: ${state.metrics.totalArea} m²  |  Paneles: ${state.metrics.panels.length}`, margin + 4, y + 7);
    y += 20;

    // ── Herrajes ──────────────────────────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('LISTA DE HERRAJES (BOM)', margin, y);
    y += 6;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    // Table header
    doc.setFillColor(15, 23, 42);
    doc.rect(margin, y - 5, pageW - margin * 2, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Artículo', margin + 2, y);
    doc.text('Cant.', margin + 100, y);
    doc.text('P. Unit.', margin + 120, y);
    doc.text('Total', margin + 148, y);
    y += 6;

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    state.hardware.forEach((hw, i) => {
        if (i % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 4, pageW - margin * 2, 6, 'F');
        }
        doc.text(hw.name, margin + 2, y);
        doc.text(String(hw.quantity), margin + 102, y);
        doc.text(`$${hw.unitPrice.toLocaleString('es-MX')}`, margin + 120, y);
        doc.text(`$${(hw.unitPrice * hw.quantity).toLocaleString('es-MX')}`, margin + 148, y);
        y += 6;
    });

    y += 6;

    // ── Cotización ────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('COTIZACIÓN', margin, y);
    y += 6;
    doc.setDrawColor(59, 130, 246);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    const quoteRows: [string, string][] = [
        ['Costo Vidrio:', `$${state.quote.glassCost.toLocaleString('es-MX')} MXN`],
        ['Costo Herrajes:', `$${state.quote.hardwareCost.toLocaleString('es-MX')} MXN`],
        ['Mano de Obra:', `$${state.quote.laborCost.toLocaleString('es-MX')} MXN`],
        ['Subtotal:', `$${state.quote.subtotal.toLocaleString('es-MX')} MXN`],
        ['IVA (16%):', `$${state.quote.tax.toLocaleString('es-MX')} MXN`],
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    quoteRows.forEach(([l, v]) => {
        doc.text(l, margin + 4, y);
        doc.text(v, pageW - margin, y, { align: 'right' });
        y += 7;
    });

    doc.setFillColor(59, 130, 246);
    doc.rect(margin, y - 2, pageW - margin * 2, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', margin + 4, y + 6);
    doc.text(`$${state.quote.total.toLocaleString('es-MX')} MXN`, pageW - margin, y + 6, { align: 'right' });
    y += 18;

    // ── Alertas ───────────────────────────────────────────────────────────────
    if (state.alerts.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(234, 88, 12);
        doc.text('⚠ ALERTAS DE SEGURIDAD', margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        state.alerts.forEach(a => {
            doc.setTextColor(a.severity === 'error' ? [220, 38, 38] as any : a.severity === 'warning' ? [234, 88, 12] as any : [14, 165, 233] as any);
            const lines = doc.splitTextToSize(`${a.title}: ${a.message}`, pageW - margin * 2 - 8);
            doc.text(lines, margin + 4, y);
            y += lines.length * 5 + 3;
        });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 285, pageW, 12, 'F');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('GlassPro 3D — Especialista en Vidrio Templado', margin, 292);
    doc.text('Documento generado automáticamente', pageW - margin, 292, { align: 'right' });

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
            `  • ${p.label}: *${p.glassWidth} × ${p.glassHeight} mm* | ${p.weight} kg`
        ),
        ``,
        `⚖️ Peso total: ${state.metrics.totalWeight} kg`,
        `📐 Área total: ${state.metrics.totalArea} m²`,
        ``,
        `💰 *Total: $${state.quote.total.toLocaleString('es-MX')} MXN (IVA incl.)*`,
    ];
    return encodeURIComponent(lines.join('\n'));
}

export function OrderGenerator() {
    const { state } = useProject();

    return (
        <div className="module">
            <div className="module__header">
                <h2 className="module__title">📋 Generador de Orden</h2>
                <p className="module__subtitle">Revisa el resumen completo y genera el PDF o envía la orden por WhatsApp.</p>
            </div>

            <div className="module__body">
                {/* Resumen ejecutivo */}
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
                            <div className="summary-card__label">Total MXN</div>
                        </div>
                    </div>
                </section>

                {/* Detalles de paneles */}
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

                {/* Herrajes y cotización resumida */}
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

                {/* Alertas de seguridad */}
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

                {/* Acciones */}
                <section className="section">
                    <h3 className="section__title">Exportar y Compartir</h3>
                    <div className="actions-grid">
                        <button
                            className="action-btn action-btn--primary"
                            onClick={() => generatePDF(state)}
                        >
                            📄 Generar PDF
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
