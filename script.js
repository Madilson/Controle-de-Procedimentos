// --- CONFIGURATION & CONSTANTS ---
const REGIONS = ['Centro-Oeste', 'Nordeste', 'Norte', 'Sudeste', 'Sul'];
const STATES = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

const DEFAULT_USERS = [
    { id: '1', username: 'admin', password: '123', name: 'Administrador', role: 'admin' },
    { id: '2', username: 'user', password: '123', name: 'Usuário Padrão', role: 'user' }
];

const MOCK_DATA = [
    { id: '1', date: '2024-07-20', region: 'Sudeste', state: 'SP', hospitalUnit: 'Hospital Sírio-Libanês', procedureName: 'Consulta Cardiológica', qtyPerformed: 150, qtyBilled: 145, qtyPaid: 140, valuePerformed: 22500, valueBilled: 21750, valuePaid: 21000, createdBy: 'Sistema', lastModifiedBy: 'Sistema' },
    { id: '2', date: '2024-07-21', region: 'Sul', state: 'RS', hospitalUnit: 'Hospital Moinhos de Vento', procedureName: 'Exame de Sangue', qtyPerformed: 300, qtyBilled: 300, qtyPaid: 280, valuePerformed: 15000, valueBilled: 15000, valuePaid: 14000, createdBy: 'Sistema', lastModifiedBy: 'Sistema' },
    { id: '3', date: '2024-07-22', region: 'Nordeste', state: 'BA', hospitalUnit: 'Hospital Aliança', procedureName: 'Fisioterapia Motora', qtyPerformed: 80, qtyBilled: 75, qtyPaid: 75, valuePerformed: 8000, valueBilled: 7500, valuePaid: 7500, createdBy: 'Sistema', lastModifiedBy: 'Sistema' },
    { id: '4', date: '2024-07-23', region: 'Centro-Oeste', state: 'GO', hospitalUnit: 'Hospital Órion', procedureName: 'Raio-X de Tórax', qtyPerformed: 120, qtyBilled: 118, qtyPaid: 110, valuePerformed: 18000, valueBilled: 17700, valuePaid: 16500, createdBy: 'Sistema', lastModifiedBy: 'Sistema' }
];

// --- STATE MANAGEMENT ---
let appState = {
    currentUser: null,
    users: JSON.parse(localStorage.getItem('app_users')) || DEFAULT_USERS,
    procedures: JSON.parse(localStorage.getItem('app_data')) || MOCK_DATA,
    theme: localStorage.getItem('theme') || 'classic',
    filters: { search: '', region: '', state: '', hospital: '', procedure: '', creator: '', start: '', end: '' }
};

// PHP Backend Flag - Set to true if you implement api.php
const USE_PHP_BACKEND = false; 

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    checkAuth();
});

// --- AUTHENTICATION ---
function checkAuth() {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
        appState.currentUser = JSON.parse(storedUser);
        showApp();
    } else {
        showLogin();
    }
}

function login(e) {
    e.preventDefault();
    const userIn = document.getElementById('username').value;
    const passIn = document.getElementById('password').value;
    
    // In PHP mode, this would be a fetch POST to api.php?action=login
    const user = appState.users.find(u => u.username === userIn && u.password === passIn);
    
    if (user) {
        appState.currentUser = user;
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('login-error').classList.add('hidden');
        showApp();
    } else {
        const errEl = document.getElementById('login-error');
        errEl.textContent = 'Usuário ou senha incorretos.';
        errEl.classList.remove('hidden');
    }
}

function logout() {
    appState.currentUser = null;
    sessionStorage.removeItem('currentUser');
    showLogin();
}

// --- VIEW MANAGEMENT ---
function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('app-content').classList.add('hidden');
    renderLogos('login');
}

function showApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-content').classList.remove('hidden');
    document.getElementById('user-display').textContent = `${appState.currentUser.name} (${appState.currentUser.role === 'admin' ? 'Admin' : 'Usuário'})`;
    
    if (appState.currentUser.role === 'admin') {
        document.getElementById('admin-controls').classList.remove('hidden');
        document.getElementById('admin-controls').classList.add('flex');
    } else {
        document.getElementById('admin-controls').classList.add('hidden');
    }
    
    renderLogos('app');
    populateDropdowns();
    refreshDashboard();
}

function initTheme() {
    const root = document.documentElement;
    if (appState.theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

function toggleTheme() {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        appState.theme = 'classic';
    } else {
        root.classList.add('dark');
        appState.theme = 'dark';
    }
    localStorage.setItem('theme', appState.theme);
}

// --- DATA RENDERING ---

function refreshDashboard() {
    const filtered = getFilteredProcedures();
    renderStats(filtered);
    renderCharts(filtered);
    renderTable(filtered);
}

function getFilteredProcedures() {
    const { search, region, state, hospital, procedure, creator, start, end } = appState.filters;
    const term = search.toLowerCase();

    return appState.procedures.filter(p => {
        const matchesTerm = !term || 
            p.procedureName.toLowerCase().includes(term) || 
            p.hospitalUnit.toLowerCase().includes(term);
        
        const matchesRegion = !region || p.region === region;
        const matchesState = !state || p.state === state;
        const matchesHospital = !hospital || p.hospitalUnit === hospital;
        const matchesProc = !procedure || p.procedureName === procedure;
        const matchesCreator = !creator || p.createdBy === creator;
        const matchesDate = (!start || p.date >= start) && (!end || p.date <= end);

        return matchesTerm && matchesRegion && matchesState && matchesHospital && matchesProc && matchesDate && matchesCreator;
    });
}

function renderStats(data) {
    const totals = data.reduce((acc, curr) => ({
        valPerf: acc.valPerf + curr.valuePerformed,
        valBill: acc.valBill + curr.valueBilled,
        valPaid: acc.valPaid + curr.valuePaid,
        qtyPerf: acc.qtyPerf + curr.qtyPerformed,
        qtyBill: acc.qtyBill + curr.qtyBilled,
        qtyPaid: acc.qtyPaid + curr.qtyPaid
    }), { valPerf: 0, valBill: 0, valPaid: 0, qtyPerf: 0, qtyBill: 0, qtyPaid: 0 });

    const createCard = (title, val, colorClass, icon) => `
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex items-center space-x-4 hover:scale-105 transition-transform">
            <div class="rounded-full p-3 ${colorClass}">${icon}</div>
            <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">${title}</p>
                <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">${val}</p>
            </div>
        </div>`;

    const html = [
        createCard('Total Realizado', formatCurrency(totals.valPerf), 'bg-green-100 text-green-600', '<span class="font-bold">R</span>'),
        createCard('Total Faturado', formatCurrency(totals.valBill), 'bg-blue-100 text-blue-600', '<span class="font-bold">F</span>'),
        createCard('Total Pago', formatCurrency(totals.valPaid), 'bg-purple-100 text-purple-600', '<span class="font-bold">P</span>'),
        createCard('Qtd. Realizados', totals.qtyPerf.toLocaleString(), 'bg-yellow-100 text-yellow-600', '<span>🛠️</span>'),
        createCard('Qtd. Faturados', totals.qtyBill.toLocaleString(), 'bg-indigo-100 text-indigo-600', '<span>📊</span>'),
        createCard('Qtd. Pagos', totals.qtyPaid.toLocaleString(), 'bg-pink-100 text-pink-600', '<span>✅</span>')
    ].join('');

    document.getElementById('dashboard-stats').innerHTML = html;
}

let chartInstances = {};

function renderCharts(data) {
    // 1. Region Chart
    const regionData = {};
    data.forEach(p => {
        if (!regionData[p.region]) regionData[p.region] = { perf: 0, bill: 0, paid: 0 };
        regionData[p.region].perf += p.valuePerformed;
        regionData[p.region].bill += p.valueBilled;
        regionData[p.region].paid += p.valuePaid;
    });
    const regions = Object.keys(regionData);
    
    updateChart('chartRegion', 'bar', {
        labels: regions,
        datasets: [
            { label: 'Realizado', data: regions.map(r => regionData[r].perf), backgroundColor: '#22c55e' },
            { label: 'Faturado', data: regions.map(r => regionData[r].bill), backgroundColor: '#3b82f6' },
            { label: 'Pago', data: regions.map(r => regionData[r].paid), backgroundColor: '#a855f7' }
        ]
    });

    // 2. Line Chart (Daily Trend)
    const dateData = {};
    data.forEach(p => {
        dateData[p.date] = (dateData[p.date] || 0) + p.valuePaid;
    });
    const sortedDates = Object.keys(dateData).sort();
    
    updateChart('chartLine', 'line', {
        labels: sortedDates.map(d => formatDateShort(d)),
        datasets: [{
            label: 'Valor Pago',
            data: sortedDates.map(d => dateData[d]),
            borderColor: '#a855f7',
            backgroundColor: '#a855f7',
            tension: 0.3
        }]
    });

    // 3. Monthly Chart (Aggregated)
    const monthData = {};
    data.forEach(p => {
        const key = p.date.substring(0, 7); // YYYY-MM
        monthData[key] = (monthData[key] || 0) + p.valuePaid;
    });
    const sortedMonths = Object.keys(monthData).sort();
    
    updateChart('chartMonthly', 'bar', {
        labels: sortedMonths.map(m => {
            const [y, mo] = m.split('-');
            return `${mo}/${y}`;
        }),
        datasets: [{
            label: 'Total Pago por Mês',
            data: sortedMonths.map(m => monthData[m]),
            backgroundColor: '#8b5cf6'
        }]
    });
}

function updateChart(canvasId, type, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (chartInstances[canvasId]) chartInstances[canvasId].destroy();
    
    chartInstances[canvasId] = new Chart(ctx, {
        type: type,
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: document.documentElement.classList.contains('dark') ? '#ccc' : '#666' } }
            },
            scales: {
                x: { ticks: { color: document.documentElement.classList.contains('dark') ? '#ccc' : '#666' } },
                y: { ticks: { color: document.documentElement.classList.contains('dark') ? '#ccc' : '#666' } }
            }
        }
    });
}

function renderTable(data) {
    const tbody = document.getElementById('table-body');
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="13" class="p-8 text-center text-gray-500">Nenhum registro encontrado.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(p => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-700/50 group border-b dark:border-gray-700">
            <td class="table-td">${formatDate(p.date)}</td>
            <td class="table-td text-gray-500 dark:text-gray-400">${p.region}</td>
            <td class="table-td text-gray-500 dark:text-gray-400">${p.state}</td>
            <td class="table-td text-gray-500 dark:text-gray-400">${p.hospitalUnit}</td>
            <td class="table-td font-medium text-gray-900 dark:text-white">${p.procedureName}</td>
            <td class="table-td text-xs text-gray-500">
                <div class="flex flex-col">
                    <span class="bg-gray-100 dark:bg-gray-700 px-1 rounded w-fit">${p.createdBy || '-'}</span>
                    ${p.lastModifiedBy && p.lastModifiedBy !== p.createdBy ? `<span class="text-[10px] italic mt-1">Alt: ${p.lastModifiedBy}</span>` : ''}
                </div>
            </td>
            <td class="table-td text-center">${p.qtyPerformed.toLocaleString()}</td>
            <td class="table-td text-center">${p.qtyBilled.toLocaleString()}</td>
            <td class="table-td text-center">${p.qtyPaid.toLocaleString()}</td>
            <td class="table-td text-green-600 font-medium">${formatCurrency(p.valuePerformed)}</td>
            <td class="table-td text-blue-600 font-medium">${formatCurrency(p.valueBilled)}</td>
            <td class="table-td text-purple-600 font-medium">${formatCurrency(p.valuePaid)}</td>
            <td class="table-td">
                <div class="flex gap-2">
                    <button onclick="editProcedure('${p.id}')" class="text-primary-600 hover:text-primary-800"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
                    ${appState.currentUser.role === 'admin' ? `<button onclick="deleteProcedure('${p.id}')" class="text-red-600 hover:text-red-800"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    
    // Totals Footer
    const totals = data.reduce((acc, curr) => ({
        vp: acc.vp + curr.valuePerformed, vb: acc.vb + curr.valueBilled, vpd: acc.vpd + curr.valuePaid
    }), { vp: 0, vb: 0, vpd: 0 });
    
    document.getElementById('table-footer').innerHTML = `
        <tr>
            <td colspan="9" class="p-4 text-right uppercase">Totais</td>
            <td class="p-4 text-green-700 dark:text-green-400">${formatCurrency(totals.vp)}</td>
            <td class="p-4 text-blue-700 dark:text-blue-400">${formatCurrency(totals.vb)}</td>
            <td class="p-4 text-purple-700 dark:text-purple-400">${formatCurrency(totals.vpd)}</td>
            <td></td>
        </tr>
    `;
}

// --- CRUD OPERATIONS ---

function openProcedureModal() {
    resetForm('procedure-form');
    document.getElementById('modal-title').textContent = 'Novo Procedimento';
    document.getElementById('proc-id').value = '';
    
    // Populate dropdowns specifically for modal
    const regionsSel = document.getElementById('proc-region');
    const statesSel = document.getElementById('proc-state');
    regionsSel.innerHTML = REGIONS.map(r => `<option value="${r}">${r}</option>`).join('');
    statesSel.innerHTML = STATES.map(s => `<option value="${s}">${s}</option>`).join('');
    
    document.getElementById('modal-procedure').classList.remove('hidden');
}

function editProcedure(id) {
    const proc = appState.procedures.find(p => p.id === id);
    if (!proc) return;
    
    openProcedureModal();
    document.getElementById('modal-title').textContent = 'Editar Procedimento';
    document.getElementById('proc-id').value = proc.id;
    document.getElementById('proc-name').value = proc.procedureName;
    document.getElementById('proc-hospital').value = proc.hospitalUnit;
    document.getElementById('proc-date').value = proc.date;
    document.getElementById('proc-region').value = proc.region;
    document.getElementById('proc-state').value = proc.state;
    document.getElementById('proc-qty-perf').value = proc.qtyPerformed;
    document.getElementById('proc-qty-bill').value = proc.qtyBilled;
    document.getElementById('proc-qty-paid').value = proc.qtyPaid;
    document.getElementById('proc-val-perf').value = formatCurrencyInput(proc.valuePerformed);
    document.getElementById('proc-val-bill').value = formatCurrencyInput(proc.valueBilled);
    document.getElementById('proc-val-paid').value = formatCurrencyInput(proc.valuePaid);
}

function saveProcedure(e) {
    e.preventDefault();
    const id = document.getElementById('proc-id').value;
    const formData = {
        procedureName: document.getElementById('proc-name').value,
        hospitalUnit: document.getElementById('proc-hospital').value,
        date: document.getElementById('proc-date').value,
        region: document.getElementById('proc-region').value,
        state: document.getElementById('proc-state').value,
        qtyPerformed: Number(document.getElementById('proc-qty-perf').value),
        qtyBilled: Number(document.getElementById('proc-qty-bill').value),
        qtyPaid: Number(document.getElementById('proc-qty-paid').value),
        valuePerformed: parseCurrencyInput(document.getElementById('proc-val-perf').value),
        valueBilled: parseCurrencyInput(document.getElementById('proc-val-bill').value),
        valuePaid: parseCurrencyInput(document.getElementById('proc-val-paid').value),
    };

    if (id) {
        // Update
        const idx = appState.procedures.findIndex(p => p.id === id);
        if (idx !== -1) {
            appState.procedures[idx] = { 
                ...appState.procedures[idx], 
                ...formData, 
                lastModifiedBy: appState.currentUser.name,
                lastModifiedAt: new Date().toISOString()
            };
        }
    } else {
        // Create
        appState.procedures.push({
            id: crypto.randomUUID(),
            ...formData,
            createdBy: appState.currentUser.name,
            lastModifiedBy: appState.currentUser.name,
            lastModifiedAt: new Date().toISOString()
        });
    }
    
    saveData();
    closeModal('modal-procedure');
    refreshDashboard();
}

function deleteProcedure(id) {
    if (confirm('Tem certeza que deseja excluir este procedimento?')) {
        appState.procedures = appState.procedures.filter(p => p.id !== id);
        saveData();
        refreshDashboard();
    }
}

// --- USER MANAGEMENT ---
function openUserModal() {
    renderUserTable();
    document.getElementById('modal-users').classList.remove('hidden');
}

function saveUser(e) {
    e.preventDefault();
    const login = document.getElementById('user-login').value;
    const pass = document.getElementById('user-pass').value;
    const name = document.getElementById('user-name').value;
    const role = document.getElementById('user-role').value;

    if (appState.users.some(u => u.username === login)) {
        alert('Usuário já existe!');
        return;
    }

    appState.users.push({ id: crypto.randomUUID(), username: login, password: pass, name: name, role: role });
    localStorage.setItem('app_users', JSON.stringify(appState.users));
    
    document.getElementById('user-form').reset();
    renderUserTable();
}

function deleteUser(id) {
    if (id === appState.currentUser.id) return;
    if (confirm('Remover usuário?')) {
        appState.users = appState.users.filter(u => u.id !== id);
        localStorage.setItem('app_users', JSON.stringify(appState.users));
        renderUserTable();
    }
}

function renderUserTable() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = appState.users.map(u => `
        <tr class="border-t dark:border-gray-600">
            <td class="px-4 py-2">${u.name}</td>
            <td class="px-4 py-2 text-gray-500">${u.username}</td>
            <td class="px-4 py-2"><span class="px-2 rounded text-xs ${u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}">${u.role}</span></td>
            <td class="px-4 py-2 text-right">
                ${u.id !== appState.currentUser.id ? `<button onclick="deleteUser('${u.id}')" class="text-red-500 hover:text-red-700">Excluir</button>` : '<span class="text-xs text-gray-400">Atual</span>'}
            </td>
        </tr>
    `).join('');
}

// --- SETTINGS ---
function openSettingsModal() { document.getElementById('modal-settings').classList.remove('hidden'); }

function setupSettingsHandlers() {
    document.getElementById('settings-logo').addEventListener('change', e => handleFile(e, 'companyLogo'));
    document.getElementById('settings-banner').addEventListener('change', e => handleFile(e, 'dashboardBanner'));
}

function handleFile(e, key) {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
        if(file.size > 2 * 1024 * 1024) { alert('Arquivo muito grande. Max 2MB.'); return; }
        const reader = new FileReader();
        reader.onloadend = () => {
            try {
                localStorage.setItem(key, reader.result);
                renderLogos('app');
                alert('Salvo com sucesso!');
            } catch(err) { alert('Erro ao salvar no navegador. Imagem muito grande?'); }
        };
        reader.readAsDataURL(file);
    } else {
        alert('Apenas PNG é permitido.');
    }
}

function clearSetting(type) {
    if(type === 'logo') localStorage.removeItem('companyLogo');
    if(type === 'banner') localStorage.removeItem('dashboardBanner');
    renderLogos('app');
    closeModal('modal-settings');
}

function renderLogos(context) {
    const logo = localStorage.getItem('companyLogo');
    const banner = localStorage.getItem('dashboardBanner');
    
    if (context === 'login' || context === 'app') {
        const container = context === 'login' ? document.getElementById('login-logo-container') : document.getElementById('header-logo-container');
        if (logo) {
            if(context === 'login') {
                 container.innerHTML = `<img src="${logo}" class="max-h-24 bg-white/10 rounded p-2">`;
            } else {
                 container.innerHTML = `<img src="${logo}" class="h-12 object-contain">`;
            }
        } else if (context === 'app') {
            container.innerHTML = `<h1 class="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Sistema de Controle</h1><p class="mt-1 text-md text-gray-500 dark:text-gray-400">Gerencie e visualize os dados dos procedimentos.</p>`;
        } else {
            container.innerHTML = `<div class="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm mb-4"><svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>`;
        }
    }

    if (context === 'app') {
        const banEl = document.getElementById('dashboard-banner');
        if (banner) {
            document.getElementById('dashboard-banner-img').src = banner;
            banEl.classList.remove('hidden');
        } else {
            banEl.classList.add('hidden');
        }
    }
}

// --- HELPERS & UTILS ---
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }
function saveData() { localStorage.setItem('app_data', JSON.stringify(appState.procedures)); }
function formatCurrency(val) { return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function formatDate(iso) { if(!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; }
function formatDateShort(iso) { if(!iso) return ''; const [y,m,d] = iso.split('-'); return `${d}/${m}`; }
function resetForm(id) { document.getElementById(id).reset(); }

function formatCurrencyInput(val) { return (val * 100).toFixed(0).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); } // Simple visual hack
function parseCurrencyInput(val) { return parseFloat(val.replace(/\./g, '').replace(',', '.')) / 100 || 0; }

function toggleFilters() {
    const el = document.getElementById('filters-container');
    const chev = document.getElementById('filter-chevron');
    el.classList.toggle('hidden');
    chev.classList.toggle('rotate-180');
}

function setupEventListeners() {
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('procedure-form').addEventListener('submit', saveProcedure);
    document.getElementById('user-form').addEventListener('submit', saveUser);
    setupSettingsHandlers();
    
    // Filters
    ['search-term', 'filter-region', 'filter-state', 'filter-hospital', 'filter-procedure', 'filter-creator', 'filter-start-date', 'filter-end-date'].forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            const key = id.replace('filter-', '').replace('search-term', 'search').replace('start-date', 'start').replace('end-date', 'end');
            appState.filters[key] = e.target.value;
            refreshDashboard();
        });
    });

    // Money Inputs
    document.querySelectorAll('.money-input').forEach(input => {
        input.addEventListener('input', e => {
            let val = e.target.value.replace(/\D/g, '');
            val = (Number(val) / 100).toFixed(2).replace('.', ',');
            val = val.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
            e.target.value = val;
        });
    });
}

function populateDropdowns() {
    const uniq = (field) => [...new Set(appState.procedures.map(p => p[field]))].sort();
    
    const fill = (id, opts) => {
        const el = document.getElementById(id);
        const current = el.value;
        el.innerHTML = `<option value="">Todos</option>` + opts.map(o => `<option value="${o}">${o}</option>`).join('');
        el.value = current;
    };

    fill('filter-region', REGIONS);
    fill('filter-state', STATES);
    fill('filter-hospital', uniq('hospitalUnit'));
    fill('filter-procedure', uniq('procedureName'));
    fill('filter-creator', uniq('createdBy').filter(Boolean));
    
    // Datalist for Modal
    document.getElementById('proc-list').innerHTML = uniq('procedureName').map(n => `<option value="${n}">`).join('');
}

// --- EXPORT ---
function exportExcel() {
    // Basic CSV/XLS generation
    const data = getFilteredProcedures();
    let csv = "Data;Região;Estado;Hospital;Procedimento;Valor Pago\n";
    data.forEach(p => {
        csv += `${formatDate(p.date)};${p.region};${p.state};${p.hospitalUnit};${p.procedureName};${p.valuePaid.toFixed(2).replace('.', ',')}\n`;
    });
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio.csv";
    link.click();
}

function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape');
    
    doc.text("Relatório de Procedimentos", 14, 15);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 20);
    
    const data = getFilteredProcedures();
    const rows = data.map(p => [
        formatDate(p.date), p.region, p.state, p.hospitalUnit, p.procedureName, 
        p.qtyPerformed, formatCurrency(p.valuePaid)
    ]);
    
    doc.autoTable({
        startY: 25,
        head: [['Data', 'Região', 'UF', 'Hospital', 'Procedimento', 'Qtd', 'Valor Pago']],
        body: rows,
    });
    
    doc.save('relatorio.pdf');
}
