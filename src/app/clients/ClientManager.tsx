import { useState } from 'react';
import { useProject, Client } from '../../store/projectStore';

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

export function ClientManager() {
    const { state, dispatch } = useProject();
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState<Partial<Client>>({});

    const handleSave = () => {
        if (!form.name || !form.phone) return;

        if (form.id) {
            dispatch({ type: 'UPDATE_CLIENT', payload: form as Client });
        } else {
            dispatch({ type: 'ADD_CLIENT', payload: { ...form, id: generateId() } as Client });
        }
        setIsEditing(false);
        setForm({});
    };

    const handleEdit = (client: Client) => {
        setForm(client);
        setIsEditing(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
            dispatch({ type: 'DELETE_CLIENT', payload: id });
        }
    };

    const handleNew = () => {
        setForm({});
        setIsEditing(true);
    };

    return (
        <div className="module module-clients">
            <div className="module__header section-header-flex">
                <div>
                    <h2 className="module__title">👥 Directorio de Clientes</h2>
                    <p className="module__subtitle">Gestiona tus clientes frecuentes y empresas asociadas.</p>
                </div>
                {!isEditing && (
                    <button className="btn-hero btn-hero--green" onClick={handleNew} style={{ maxWidth: '240px', padding: '1rem' }}>
                        <span className="btn-hero__icon" style={{ fontSize: '2rem' }}>👤</span>
                        <span>NUEVO CLIENTE</span>
                    </button>
                )}
            </div>

            <div className="module__body">
                {isEditing ? (
                    <section className="section form-section" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <h3 className="section__title" style={{ fontSize: '1.4rem', borderBottom: '1px solid var(--panel-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                            {form.id ? '✏️ Editar Ficha de Cliente' : '✨ Nuevo Cliente Profesional'}
                        </h3>
                        <div className="form-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.5rem' }}>
                            <div className="input-group">
                                <label className="input-label" style={{ fontSize: '1rem' }}>NOMBRE O REPRESENTANTE *</label>
                                <input className="input-field-text" placeholder="Ej. Juan Pérez" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label className="input-label" style={{ fontSize: '1rem' }}>EMPRESA O CONSTRUCTORA</label>
                                <input className="input-field-text" placeholder="Opcional. Ej. Constructora Vértice S.A." value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '1rem' }}>TELÉFONO *</label>
                                    <input className="input-field-text" placeholder="Ej. 555-0198" value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label" style={{ fontSize: '1rem' }}>EMAIL</label>
                                    <input className="input-field-text" placeholder="correo@empresa.com" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} />
                                </div>
                            </div>
                        </div>
                        <div className="form-actions" style={{ marginTop: '2.5rem' }}>
                            <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancelar</button>
                            <button className="btn-primary" onClick={handleSave} disabled={!form.name || !form.phone}>💾 Guardar Cliente</button>
                        </div>
                    </section>
                ) : (
                    <div className="clients-list">
                        {state.clients.length === 0 ? (
                            <div className="empty-state">No tienes clientes registrados todavía.</div>
                        ) : (
                            state.clients.map(client => (
                                <div key={client.id} className="client-card">
                                    <div className="client-info">
                                        <div className="client-name">{client.name}</div>
                                        {client.company && <div className="client-company">🏢 {client.company}</div>}
                                        <div className="client-contact">
                                            <span>📞 {client.phone}</span>
                                            {client.email && <span>✉️ {client.email}</span>}
                                        </div>
                                    </div>
                                    <div className="client-actions" style={{ display: 'flex', gap: '8px' }}>
                                        <button className="btn-icon btn-icon--edit" onClick={() => handleEdit(client)} title="Editar Cliente">
                                            ✏️ Editar
                                        </button>
                                        <button className="btn-icon btn-icon--danger" onClick={() => handleDelete(client.id)} title="Eliminar Cliente">
                                            🗑️ Eliminar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
