import { useState } from 'react';
import { ProjectProvider, useProject } from './store/projectStore';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { VanoOptimizer } from './app/scan-room/VanoOptimizer';
import { StyleConfigurator } from './app/glass-designer/StyleConfigurator';
import { OrderGenerator } from './app/quote/OrderGenerator';
import { ProjectDashboard } from './app/home/ProjectDashboard';
import { ClientManager } from './app/clients/ClientManager';
import { PriceSettings } from './app/settings/PriceSettings';
import './styles.css';

function AppContent() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { state } = useProject();

    return (
        <div className="app-shell">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(c => !c)}
            />

            <div className={`app-main ${sidebarCollapsed ? 'app-main--expanded' : ''}`}>
                <Header />
                <div className="app-content">
                    {state.activeModule === 'home' && <ProjectDashboard />}
                    {state.activeModule === 'clients' && <ClientManager />}
                    {state.activeModule === 'settings' && <PriceSettings />}
                    {state.activeModule === 'optimizer' && <VanoOptimizer />}
                    {state.activeModule === 'configurator' && <StyleConfigurator />}
                    {state.activeModule === 'order' && <OrderGenerator />}
                </div>
            </div>
        </div>
    );
}

export default function App() {
    return (
        <ProjectProvider>
            <AppContent />
        </ProjectProvider>
    );
}
