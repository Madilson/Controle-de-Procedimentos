import { Procedure, User } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'admin-user',
    username: 'admin',
    password: '123',
    name: 'Administrador',
    role: 'admin'
  },
  {
    id: 'std-user',
    username: 'user',
    password: '123',
    name: 'Usuário Padrão',
    role: 'user'
  }
];

export const INITIAL_DATA: Procedure[] = [
  {
    id: 'a1b2c3d4',
    date: '2024-07-20',
    region: 'Sudeste',
    state: 'SP',
    hospitalUnit: 'Hospital Sírio-Libanês',
    procedureName: 'Consulta Cardiológica',
    qtyPerformed: 150,
    qtyBilled: 145,
    qtyPaid: 140,
    valuePerformed: 22500,
    valueBilled: 21750,
    valuePaid: 21000,
    createdBy: 'Sistema',
    lastModifiedBy: 'Sistema',
    lastModifiedAt: new Date().toISOString()
  },
  {
    id: 'e5f6g7h8',
    date: '2024-07-21',
    region: 'Sul',
    state: 'RS',
    hospitalUnit: 'Hospital Moinhos de Vento',
    procedureName: 'Exame de Sangue',
    qtyPerformed: 300,
    qtyBilled: 300,
    qtyPaid: 280,
    valuePerformed: 15000,
    valueBilled: 15000,
    valuePaid: 14000,
    createdBy: 'Sistema',
    lastModifiedBy: 'Sistema',
    lastModifiedAt: new Date().toISOString()
  },
  {
    id: 'i9j0k1l2',
    date: '2024-07-22',
    region: 'Nordeste',
    state: 'BA',
    hospitalUnit: 'Hospital Aliança',
    procedureName: 'Fisioterapia Motora',
    qtyPerformed: 80,
    qtyBilled: 75,
    qtyPaid: 75,
    valuePerformed: 8000,
    valueBilled: 7500,
    valuePaid: 7500,
    createdBy: 'Sistema',
    lastModifiedBy: 'Sistema',
    lastModifiedAt: new Date().toISOString()
  },
  {
    id: 'm3n4o5p6',
    date: '2024-07-23',
    region: 'Centro-Oeste',
    state: 'GO',
    hospitalUnit: 'Hospital Órion',
    procedureName: 'Raio-X de Tórax',
    qtyPerformed: 120,
    qtyBilled: 118,
    qtyPaid: 110,
    valuePerformed: 18000,
    valueBilled: 17700,
    valuePaid: 16500,
    createdBy: 'Sistema',
    lastModifiedBy: 'Sistema',
    lastModifiedAt: new Date().toISOString()
  },
];

export const BRAZILIAN_REGIONS = [
  'Centro-Oeste',
  'Nordeste',
  'Norte',
  'Sudeste',
  'Sul',
];

export const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 
  'SP', 'SE', 'TO'
];