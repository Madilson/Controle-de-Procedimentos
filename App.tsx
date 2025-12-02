import React, { useState, useMemo, useEffect } from 'react';
import { Procedure, User } from './types';
import { INITIAL_DATA, BRAZILIAN_REGIONS, BRAZILIAN_STATES, INITIAL_USERS } from './constants';
import ProcedureTable from './components/ProcedureTable';
import ProcedureFormModal from './components/ProcedureFormModal';
import ConfirmationModal from './components/ConfirmationModal';
import LoginScreen from './components/LoginScreen';
import UserManagementModal from './components/UserManagementModal';
import SystemSettingsModal from './components/SystemSettingsModal';
import PlusIcon from './components/icons/PlusIcon';
import PdfIcon from './components/icons/PdfIcon';
import CsvIcon from './components/icons/CsvIcon';
import ExcelIcon from './components/icons/ExcelIcon';
import DashboardCard from './components/DashboardCard';
import ChartsSection from './components/ChartsSection';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tooltip } from 'react-tooltip';
import PaintBrushIcon from './components/icons/PaintBrushIcon';
import ChevronDownIcon from './components/icons/ChevronDownIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import UserIcon from './components/icons/UserIcon';
import UsersIcon from './components/icons/UsersIcon';
import CogIcon from './components/icons/CogIcon';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string | null>(localStorage.getItem('companyLogo'));
  const [dashboardBanner, setDashboardBanner] = useState<string | null>(localStorage.getItem('dashboardBanner'));

  // Data State
  const [procedures, setProcedures] = useState<Procedure[]>(INITIAL_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [procedureToDeleteId, setProcedureToDeleteId] = useState<string | null>(null);
  
  // Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedHospitalUnit, setSelectedHospitalUnit] = useState('');
  const [selectedProcedureName, setSelectedProcedureName] = useState('');
  const [selectedCreatedBy, setSelectedCreatedBy] = useState('');

  // UI State
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'classic');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'classic'); 
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auth Logic
  const handleLogin = async (username: string, pass: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = usersList.find(u => u.username === username && u.password === pass);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    // Reset some states if needed
  };

  const handleCreateUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: crypto.randomUUID() };
    setUsersList([...usersList, newUser]);
  };

  const handleDeleteUser = (id: string) => {
    setUsersList(usersList.filter(u => u.id !== id));
  };

  const handleSaveLogo = (logoData: string | null) => {
    setCompanyLogo(logoData);
    try {
      if (logoData) {
          localStorage.setItem('companyLogo', logoData);
      } else {
          localStorage.removeItem('companyLogo');
      }
    } catch (error) {
      console.error("Error saving logo to localStorage:", error);
      alert("Erro ao salvar a logo. A imagem pode ser muito grande para o armazenamento do navegador.");
    }
  };

  const handleSaveBanner = (bannerData: string | null) => {
    setDashboardBanner(bannerData);
    try {
      if (bannerData) {
          localStorage.setItem('dashboardBanner', bannerData);
      } else {
          localStorage.removeItem('dashboardBanner');
      }
    } catch (error) {
      console.error("Error saving banner to localStorage:", error);
      alert("Erro ao salvar o banner. A imagem pode ser muito grande para o armazenamento do navegador.");
    }
  };

  // --- Existing Logic Below ---

  const themes = [
    { name: 'classic', label: 'Clássico' },
    { name: 'dark', label: 'Noturno' },
  ];

  const dashboardStats = useMemo(() => {
    return procedures.reduce(
      (acc, proc) => {
        acc.totalQtyPerformed += proc.qtyPerformed;
        acc.totalQtyBilled += proc.qtyBilled;
        acc.totalQtyPaid += proc.qtyPaid;
        acc.totalValuePerformed += proc.valuePerformed;
        acc.totalValueBilled += proc.valueBilled;
        acc.totalValuePaid += proc.valuePaid;
        return acc;
      },
      {
        totalQtyPerformed: 0,
        totalQtyBilled: 0,
        totalQtyPaid: 0,
        totalValuePerformed: 0,
        totalValueBilled: 0,
        totalValuePaid: 0,
      }
    );
  }, [procedures]);
  
  const uniqueRegions = BRAZILIAN_REGIONS;
  const uniqueStates = BRAZILIAN_STATES;
  const uniqueHospitalUnits = useMemo(() => [...new Set(procedures.map(p => p.hospitalUnit).sort())], [procedures]);
  const uniqueProcedureNames = useMemo(() => [...new Set(procedures.map(p => p.procedureName).sort())], [procedures]);
  const uniqueCreators = useMemo(() => [...new Set(procedures.map(p => p.createdBy || '').filter(Boolean).sort())], [procedures]);


  const filteredProcedures = useMemo(() => {
    return procedures.filter((p) => {
        const matchesSearchTerm =
          !searchTerm ||
          p.procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.hospitalUnit.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDateRange = 
          (!startDate || p.date >= startDate) &&
          (!endDate || p.date <= endDate);
        
        const matchesRegion = !selectedRegion || p.region === selectedRegion;
        const matchesState = !selectedState || p.state === selectedState;
        const matchesHospitalUnit = !selectedHospitalUnit || p.hospitalUnit === selectedHospitalUnit;
        const matchesProcedureName = !selectedProcedureName || p.procedureName === selectedProcedureName;
        const matchesCreatedBy = !selectedCreatedBy || p.createdBy === selectedCreatedBy;

        return matchesSearchTerm && matchesDateRange && matchesRegion && matchesState && matchesHospitalUnit && matchesProcedureName && matchesCreatedBy;
      }
    );
  }, [procedures, searchTerm, startDate, endDate, selectedRegion, selectedState, selectedHospitalUnit, selectedProcedureName, selectedCreatedBy]);

  const handleAddNew = () => {
    setEditingProcedure(null);
    setIsModalOpen(true);
  };

  const handleEdit = (procedure: Procedure) => {
    setEditingProcedure(procedure);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setProcedureToDeleteId(id);
    setIsConfirmModalOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (procedureToDeleteId) {
      setProcedures(procedures.filter((p) => p.id !== procedureToDeleteId));
      setProcedureToDeleteId(null);
    }
    setIsConfirmModalOpen(false);
  };

  const handleSave = (procedureData: Omit<Procedure, 'id'> & { id?: string }) => {
    const userName = currentUser?.name || 'Unknown';
    const auditInfo = {
        lastModifiedBy: userName,
        lastModifiedAt: new Date().toISOString()
    };

    if (procedureData.id) {
      // Update: preserve createdBy if it exists in the edited object, update lastModified
      setProcedures(
        procedures.map((p) => (p.id === procedureData.id ? { ...p, ...procedureData, ...auditInfo } as Procedure : p))
      );
    } else {
      // Create: Set createdBy
      setProcedures([
        ...procedures, 
        { 
            ...procedureData, 
            id: crypto.randomUUID(), 
            createdBy: userName,
            ...auditInfo 
        } as Procedure
      ]);
    }
    setIsModalOpen(false);
  };
  
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNumber = (value: number) => value.toLocaleString('pt-BR');
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }
  
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    const themeColors: Record<string, string> = {
      classic: '#3b82f6',
      corporate: '#0ea5e9',
      vibrant: '#f97316',
      dark: '#3b82f6',
    };
    const headerColor = themeColors[theme] || '#3b82f6';

    const tableColumn = [
      'Data', 'Região', 'Estado', 'Unidade Hospitalar', 'Procedimento', 'Registrado Por',
      'Qtd Real.', 'Qtd Fat.', 'Qtd Pagos',
      'Vlr Realizado', 'Vlr Faturado', 'Vlr Pago'
    ];
    
    const tableRows = filteredProcedures.map(proc => [
      formatDate(proc.date),
      proc.region,
      proc.state,
      proc.hospitalUnit,
      proc.procedureName,
      proc.createdBy || proc.lastModifiedBy || '-',
      formatNumber(proc.qtyPerformed),
      formatNumber(proc.qtyBilled),
      formatNumber(proc.qtyPaid),
      formatCurrency(proc.valuePerformed),
      formatCurrency(proc.valueBilled),
      formatCurrency(proc.valuePaid)
    ]);

    const totals = filteredProcedures.reduce(
      (acc, proc) => {
        acc.qtyPerformed += proc.qtyPerformed;
        acc.qtyBilled += proc.qtyBilled;
        acc.qtyPaid += proc.qtyPaid;
        acc.valuePerformed += proc.valuePerformed;
        acc.valueBilled += proc.valueBilled;
        acc.valuePaid += proc.valuePaid;
        return acc;
      },
      {
        qtyPerformed: 0, qtyBilled: 0, qtyPaid: 0,
        valuePerformed: 0, valueBilled: 0, valuePaid: 0,
      }
    );
    
    const totalRow: any = [
        { content: 'TOTAIS', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: formatNumber(totals.qtyPerformed), styles: { fontStyle: 'bold' } },
        { content: formatNumber(totals.qtyBilled), styles: { fontStyle: 'bold' } },
        { content: formatNumber(totals.qtyPaid), styles: { fontStyle: 'bold' } },
        { content: formatCurrency(totals.valuePerformed), styles: { fontStyle: 'bold' } },
        { content: formatCurrency(totals.valueBilled), styles: { fontStyle: 'bold' } },
        { content: formatCurrency(totals.valuePaid), styles: { fontStyle: 'bold' } },
    ];

    doc.text("Relatório de Procedimentos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} por ${currentUser?.name}`, 14, 20);

    let filterSummary = 'Filtros aplicados: ';
    const activeFilters = [];
    if (startDate && endDate) activeFilters.push(`Período: ${formatDate(startDate)} a ${formatDate(endDate)}`);
    else if(startDate) activeFilters.push(`A partir de: ${formatDate(startDate)}`);
    else if(endDate) activeFilters.push(`Até: ${formatDate(endDate)}`);
    
    if (selectedRegion) activeFilters.push(`Região: ${selectedRegion}`);
    if (selectedState) activeFilters.push(`Estado: ${selectedState}`);
    if (selectedHospitalUnit) activeFilters.push(`Unidade: ${selectedHospitalUnit}`);
    if (selectedProcedureName) activeFilters.push(`Procedimento: ${selectedProcedureName}`);
    if (selectedCreatedBy) activeFilters.push(`Registrado por: ${selectedCreatedBy}`);
    if (searchTerm) activeFilters.push(`Busca: "${searchTerm}"`);

    doc.setFontSize(8);
    doc.text(
      filterSummary + (activeFilters.length > 0 ? activeFilters.join('; ') : 'Nenhum'),
      14, 25, { maxWidth: 270 }
    );

    autoTable(doc, {
        startY: 30,
        head: [tableColumn],
        body: tableRows,
        foot: [totalRow],
        theme: 'grid',
        headStyles: { fillColor: headerColor, fontStyle: 'bold' },
        footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: 'bold' },
        didDrawPage: (data) => {
            const pageCount = (doc.internal as any).getNumberOfPages();
            doc.setFontSize(8)
            doc.text(
                'Página ' + data.pageNumber + ' de ' + pageCount, 
                doc.internal.pageSize.width - data.settings.margin.right, 
                doc.internal.pageSize.height - 10,
                { align: 'right' }
            );
        }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    
    const summaryData = [
      ['Total Qtd. Realizados', formatNumber(totals.qtyPerformed)],
      ['Total Qtd. Faturados', formatNumber(totals.qtyBilled)],
      ['Total Qtd. Pagos', formatNumber(totals.qtyPaid)],
      ['Total Valor Realizado', formatCurrency(totals.valuePerformed)],
      ['Total Valor Faturado', formatCurrency(totals.valueBilled)],
      ['Total Valor Pago', formatCurrency(totals.valuePaid)],
    ];

    autoTable(doc, {
        startY: finalY + 10,
        head: [['Resumo Geral', 'Total']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: '#6b7280' },
        columnStyles: {
          0: { fontStyle: 'bold' },
        },
        tableWidth: 'wrap',
        styles: { cellPadding: 2, fontSize: 9 },
        margin: { left: 14 }
    });
    
    doc.save("relatorio_procedimentos.pdf");
};

const handleExportCSV = () => {
    const headers = [
      'ID', 'Data', 'Região', 'Estado', 'Unidade Hospitalar', 'Nome do Procedimento',
      'Registrado Por', 'Última Alteração Por', 'Qtd. Realizados', 'Qtd. Faturados', 'Qtd. Pagos',
      'Valor Realizado', 'Valor Faturado', 'Valor Pago', 'Data Alteração'
    ];

    const escapeCsvCell = (cellData: any) => {
      const stringData = String(cellData || '');
      if (/[",\n]/.test(stringData)) {
        return `"${stringData.replace(/"/g, '""')}"`;
      }
      return stringData;
    };

    const csvContent = [
      headers.join(','),
      ...filteredProcedures.map(proc => [
        proc.id,
        proc.date,
        proc.region,
        proc.state,
        escapeCsvCell(proc.hospitalUnit),
        escapeCsvCell(proc.procedureName),
        escapeCsvCell(proc.createdBy || '-'),
        escapeCsvCell(proc.lastModifiedBy || '-'),
        proc.qtyPerformed,
        proc.qtyBilled,
        proc.qtyPaid,
        proc.valuePerformed,
        proc.valueBilled,
        proc.valuePaid,
        escapeCsvCell(proc.lastModifiedAt)
      ].join(','))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_procedimentos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    const headers = [
      'ID', 'Data', 'Região', 'Estado', 'Unidade Hospitalar', 'Nome do Procedimento',
      'Registrado Por', 'Última Alteração Por', 'Qtd. Realizados', 'Qtd. Faturados', 'Qtd. Pagos',
      'Valor Realizado', 'Valor Faturado', 'Valor Pago', 'Data Alteração'
    ];

    const separator = ';';

    const formatForExcel = (value: any): string => {
        if (typeof value === 'number') {
            return value.toString().replace('.', ',');
        }
        let stringValue = String(value || '');
        if (stringValue.includes(separator) || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    const csvContent = [
      headers.join(separator),
      ...filteredProcedures.map(proc => [
        proc.id,
        proc.date,
        proc.region,
        proc.state,
        formatForExcel(proc.hospitalUnit),
        formatForExcel(proc.procedureName),
        formatForExcel(proc.createdBy || '-'),
        formatForExcel(proc.lastModifiedBy || '-'),
        proc.qtyPerformed,
        proc.qtyBilled,
        proc.qtyPaid,
        formatForExcel(proc.valuePerformed),
        formatForExcel(proc.valueBilled),
        formatForExcel(proc.valuePaid),
        formatForExcel(proc.lastModifiedAt)
      ].join(separator))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'relatorio_procedimentos.xls');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const commonInputClass = "w-full sm:w-auto px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500";
  const commonButtonClass = "flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300";

  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} companyLogo={companyLogo} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      {/* Top Navigation / User Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="hidden sm:inline">Bem-vindo,</span>
                <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {currentUser.name} ({currentUser.role === 'admin' ? 'Admin' : 'Usuário'})
                </span>
             </div>
             <div className="flex items-center gap-3">
                {currentUser.role === 'admin' && (
                  <>
                    <button 
                        onClick={() => setIsSettingsModalOpen(true)}
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1"
                        title="Configurações do Sistema"
                    >
                        <CogIcon className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                    <button 
                        onClick={() => setIsUserModalOpen(true)}
                        className="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300 flex items-center gap-1"
                    >
                        <UsersIcon className="w-4 h-4" /> <span className="hidden sm:inline">Usuários</span>
                    </button>
                    <div className="h-4 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  </>
                )}
                <button 
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                    <LogoutIcon className="w-4 h-4" /> Sair
                </button>
             </div>
          </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
              {companyLogo ? (
                  <img src={companyLogo} alt="Logo" className="h-12 object-contain" />
              ) : (
                  <>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sistema de Controle</h1>
                    <p className="mt-1 text-md text-gray-500 dark:text-gray-400">Gerencie e visualize os dados dos procedimentos.</p>
                  </>
              )}
          </div>
           <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <div className="relative">
                <button
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  className="p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  aria-label="Change theme"
                >
                  <PaintBrushIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </button>
                {isThemeDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700">
                    {themes.map((t) => (
                      <button
                        key={t.name}
                        onClick={() => {
                          setTheme(t.name);
                          setIsThemeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          theme === t.name
                            ? 'bg-primary-500 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleAddNew}
                className={`${commonButtonClass} bg-primary-600 hover:bg-primary-700 focus:ring-primary-500`}
              >
                <PlusIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Adicionar Procedimento</span>
              </button>
            </div>
        </header>

        {/* Dashboard Banner - Smaller and Responsive */}
        {dashboardBanner && (
            <div className="mb-6 w-full overflow-hidden rounded-xl shadow-md">
                <img 
                    src={dashboardBanner} 
                    alt="Dashboard Banner" 
                    className="w-full h-32 md:h-48 object-cover" 
                />
            </div>
        )}

        {/* Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <DashboardCard title="Total Realizado" value={formatCurrency(dashboardStats.totalValuePerformed)} icon={<span className="text-xl font-bold">R</span>} colorClass="bg-green-100 text-green-600" />
            <DashboardCard title="Total Faturado" value={formatCurrency(dashboardStats.totalValueBilled)} icon={<span className="text-xl font-bold">F</span>} colorClass="bg-blue-100 text-blue-600" />
            <DashboardCard title="Total Pago" value={formatCurrency(dashboardStats.totalValuePaid)} icon={<span className="text-xl font-bold">P</span>} colorClass="bg-purple-100 text-purple-600" />
            <DashboardCard title="Qtd. Realizados" value={formatNumber(dashboardStats.totalQtyPerformed)} icon={<span className="text-xl">🛠️</span>} colorClass="bg-yellow-100 text-yellow-600" />
            <DashboardCard title="Qtd. Faturados" value={formatNumber(dashboardStats.totalQtyBilled)} icon={<span className="text-xl">📊</span>} colorClass="bg-indigo-100 text-indigo-600" />
            <DashboardCard title="Qtd. Pagos" value={formatNumber(dashboardStats.totalQtyPaid)} icon={<span className="text-xl">✅</span>} colorClass="bg-pink-100 text-pink-600" />
        </div>

        {/* Charts Section */}
        <ChartsSection procedures={filteredProcedures} />

        {/* Table Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-all duration-300">
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="flex justify-between items-center w-full p-4"
              aria-expanded={isFiltersOpen}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filtros e Opções</h2>
              <ChevronDownIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400 transform transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFiltersOpen && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Buscar por palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={commonInputClass}
                  />
                  <select id="regionFilter" value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className={commonInputClass}>
                      <option value="">Todas Regiões</option>
                      {uniqueRegions.map(region => <option key={region} value={region}>{region}</option>)}
                  </select>
                  <select id="stateFilter" value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className={commonInputClass}>
                      <option value="">Todos Estados</option>
                      {uniqueStates.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  <select id="hospitalUnitFilter" value={selectedHospitalUnit} onChange={(e) => setSelectedHospitalUnit(e.target.value)} className={commonInputClass}>
                      <option value="">Todas Unidades</option>
                      {uniqueHospitalUnits.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                  <select id="procedureFilter" value={selectedProcedureName} onChange={(e) => setSelectedProcedureName(e.target.value)} className={commonInputClass}>
                      <option value="">Todos Procedimentos</option>
                      {uniqueProcedureNames.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                   <select id="createdByFilter" value={selectedCreatedBy} onChange={(e) => setSelectedCreatedBy(e.target.value)} className={commonInputClass}>
                      <option value="">Todos (Registrado Por)</option>
                      {uniqueCreators.map(creator => <option key={creator} value={creator}>{creator}</option>)}
                  </select>
                   <div className="flex items-center gap-2">
                      <label htmlFor="startDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">De:</label>
                      <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={commonInputClass} />
                  </div>
                  <div className="flex items-center gap-2">
                      <label htmlFor="endDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Até:</label>
                      <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={commonInputClass} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button onClick={handleExportExcel} className={`${commonButtonClass} bg-green-600 hover:bg-green-700 focus:ring-green-500`}>
                      <ExcelIcon className="w-5 h-5" /> <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button onClick={handleExportCSV} className={`${commonButtonClass} bg-orange-500 hover:bg-orange-600 focus:ring-orange-500`}>
                      <CsvIcon className="w-5 h-5" /> <span className="hidden sm:inline">CSV</span>
                    </button>
                    <button onClick={handleExportPDF} className={`${commonButtonClass} bg-red-600 hover:bg-red-700 focus:ring-red-500`}>
                      <PdfIcon className="w-5 h-5" /> <span className="hidden sm:inline">PDF</span>
                    </button>
                </div>
              </div>
            )}
          </div>

          <ProcedureTable
            procedures={filteredProcedures}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentUserRole={currentUser.role}
          />
        </div>
      </main>

      <ProcedureFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        procedureToEdit={editingProcedure}
        regions={uniqueRegions}
        states={uniqueStates}
        procedureNames={uniqueProcedureNames}
      />
      
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message="Tem certeza que deseja excluir este procedimento? Esta ação não pode ser desfeita."
      />

      <UserManagementModal 
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        users={usersList}
        onCreateUser={handleCreateUser}
        onDeleteUser={handleDeleteUser}
        currentUserId={currentUser.id}
      />

      <SystemSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentLogo={companyLogo}
        onSaveLogo={handleSaveLogo}
        currentBanner={dashboardBanner}
        onSaveBanner={handleSaveBanner}
      />

      <Tooltip id="dashboard-card-tooltip" />
    </div>
  );
};

export default App;