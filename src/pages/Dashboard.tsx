import { useProductionStore } from '../store/useProductionStore';
import { useCompanyStore } from '../store/useCompanyStore';
import { useDocumentStore } from '../store/useDocumentStore';
import { isDelayed } from '../lib/calculations';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Building2, AlertTriangle, CheckCircle, Clock, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { productions } = useProductionStore();
  const { companies } = useCompanyStore();
  const { documentTypes } = useDocumentStore();
  const navigate = useNavigate();

  const stats = {
    total: productions.length,
    completed: productions.filter(p => p.status === 'completed').length,
    delayed: productions.filter(isDelayed).length,
    inProgress: productions.filter(p => p.status === 'in_progress').length,
    activeCompanies: companies.filter(c => c.status === 'active').length,
    avgProgress: productions.length ? Math.round(productions.reduce((acc, curr) => acc + curr.progress, 0) / productions.length) : 0,
  };

  const statusData = [
    { name: 'Não iniciado', value: productions.filter(p => p.status === 'not_started').length, color: '#94a3b8' },
    { name: 'Em andamento', value: productions.filter(p => p.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Pend. Info', value: productions.filter(p => p.status === 'pending_info').length, color: '#f97316' },
    { name: 'Ag. Cliente', value: productions.filter(p => p.status === 'waiting_client').length, color: '#eab308' },
    { name: 'Em revisão', value: productions.filter(p => p.status === 'in_review').length, color: '#a855f7' },
    { name: 'Concluído', value: productions.filter(p => p.status === 'completed').length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const docCount = documentTypes.map(d => ({
    name: d.acronym,
    count: productions.filter(p => p.documentTypeId === d.id).length
  })).filter(d => d.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="pb-8">
      <div className="section-header">
        <div>
          <h1 className="page-title">Dashboard Gerencial</h1>
          <p className="page-subtitle">Visão geral da produção de documentos SST</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <button
          onClick={() => navigate('/production')}
          className="kpi-card border-l-4 border-l-blue-500 text-left hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500 group-hover:text-blue-600 transition-colors">Em Produção</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><FileText className="w-5 h-5" /></div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        </button>
        <div className="kpi-card border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Concluídos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.completed}</h3>
            </div>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><CheckCircle className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="kpi-card border-l-4 border-l-red-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Atrasados</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.delayed}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertTriangle className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="kpi-card border-l-4 border-l-primary-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Progresso Médio</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.avgProgress}%</h3>
            </div>
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><Clock className="w-5 h-5" /></div>
          </div>
        </div>
        <div className="kpi-card border-l-4 border-l-slate-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Empresas Ativas</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.activeCompanies}</h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Building2 className="w-5 h-5" /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Status */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Processos por Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [`${value} processos`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></span>
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Tipos de Doc */}
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Documentos em Produção</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={docCount} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="count" fill="#28a05a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
