import React, { useMemo } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList
} from 'recharts';
import { Procedure } from '../types';

interface BarChartData {
  region: string;
  valuePerformed: number;
  valueBilled: number;
  valuePaid: number;
}

const formatCurrencyAxis = (value: number) => {
    if (value >= 1000) {
        return `R$${(value / 1000).toLocaleString('pt-BR')}k`;
    }
    return `R$${value.toLocaleString('pt-BR')}`;
}

const formatCurrencyTooltip = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-gray-800/90 dark:bg-gray-900/90 border border-gray-600 rounded-lg shadow-xl text-white">
          <p className="font-bold text-lg mb-2">{payload[0].payload.fullDate || label}</p>
          {payload.map((pld: any) => (
            <p key={pld.dataKey} style={{ color: pld.fill || pld.stroke }} className="text-sm">
              {`${pld.name}: ${formatCurrencyTooltip(pld.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

const ChartsSection: React.FC<{ procedures: Procedure[] }> = ({ procedures }) => {
  const barChartData = useMemo(() => {
    const dataByRegion: Record<string, Omit<BarChartData, 'region'>> = {};

    procedures.forEach(proc => {
      if (!dataByRegion[proc.region]) {
        dataByRegion[proc.region] = {
          valuePerformed: 0,
          valueBilled: 0,
          valuePaid: 0,
        };
      }
      dataByRegion[proc.region].valuePerformed += proc.valuePerformed;
      dataByRegion[proc.region].valueBilled += proc.valueBilled;
      dataByRegion[proc.region].valuePaid += proc.valuePaid;
    });

    return Object.keys(dataByRegion).map(region => ({
      region,
      ...dataByRegion[region],
    }));
  }, [procedures]);

  const lineChartData = useMemo(() => {
    const dataByDate: Record<string, number> = {};
    
    procedures.forEach(proc => {
        if (!dataByDate[proc.date]) {
            dataByDate[proc.date] = 0;
        }
        dataByDate[proc.date] += proc.valuePaid;
    });

    return Object.keys(dataByDate)
        .map(date => {
            const [year, month, day] = date.split('-');
            return {
                date: `${day}/${month}`,
                fullDate: `${day}/${month}/${year}`, // For tooltip
                valuePaid: dataByDate[date],
                originalDate: date,
            }
        })
        .sort((a, b) => a.originalDate.localeCompare(b.originalDate));
  }, [procedures]);

  const monthlyChartData = useMemo(() => {
    const dataByMonth: Record<string, number> = {};

    procedures.forEach(proc => {
      // Group by YYYY-MM
      const key = proc.date.substring(0, 7);
      if (!dataByMonth[key]) {
        dataByMonth[key] = 0;
      }
      dataByMonth[key] += proc.valuePaid;
    });

    return Object.keys(dataByMonth).sort().map(key => {
        const [year, month] = key.split('-');
        return {
            month: `${month}/${year}`,
            valuePaid: dataByMonth[key]
        };
    });
  }, [procedures]);

  if (procedures.length === 0) {
      return null;
  }

  return (
    <div className="space-y-8 my-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Análise por Região</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={barChartData}
                        margin={{
                            top: 30,
                            right: 20,
                            left: 30,
                            bottom: 5,
                        }}
                        barGap={6}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="region" tick={{ fill: '#6b7280' }} stroke="#6b7280" />
                        <YAxis tickFormatter={formatCurrencyAxis} tick={{ fill: '#6b7280' }} stroke="#6b7280" width={80} />
                        <Tooltip
                           content={<CustomTooltip />}
                           cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                        />
                        <Legend />
                        <Bar name="Valor Realizado" dataKey="valuePerformed" fill="#22c55e" radius={[4, 4, 0, 0]}>
                            <LabelList dataKey="valuePerformed" position="top" formatter={formatCurrencyAxis} style={{ fill: '#6b7280', fontSize: 12 }} />
                        </Bar>
                        <Bar name="Valor Faturado" dataKey="valueBilled" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="valueBilled" position="top" formatter={formatCurrencyAxis} style={{ fill: '#6b7280', fontSize: 12 }} />
                        </Bar>
                        <Bar name="Valor Pago" dataKey="valuePaid" fill="#a855f7" radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="valuePaid" position="top" formatter={formatCurrencyAxis} style={{ fill: '#6b7280', fontSize: 12 }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tendência de Valor Pago ao Longo do Tempo</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <LineChart
                        data={lineChartData}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 30,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="date" tick={{ fill: '#6b7280' }} stroke="#6b7280" />
                        <YAxis tickFormatter={formatCurrencyAxis} tick={{ fill: '#6b7280' }} stroke="#6b7280" width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="valuePaid"
                          name="Valor Pago"
                          stroke="#a855f7"
                          strokeWidth={2}
                          dot={{ r: 4, fill: '#a855f7' }}
                          activeDot={{ r: 8 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Valor Pago por Mês</h2>
            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <BarChart
                        data={monthlyChartData}
                        margin={{
                            top: 30,
                            right: 20,
                            left: 30,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                        <XAxis dataKey="month" tick={{ fill: '#6b7280' }} stroke="#6b7280" />
                        <YAxis tickFormatter={formatCurrencyAxis} tick={{ fill: '#6b7280' }} stroke="#6b7280" width={80} />
                        <Tooltip
                           content={<CustomTooltip />}
                           cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                        />
                        <Legend />
                        <Bar name="Valor Pago" dataKey="valuePaid" fill="#a855f7" radius={[4, 4, 0, 0]}>
                             <LabelList dataKey="valuePaid" position="top" formatter={formatCurrencyAxis} style={{ fill: '#6b7280', fontSize: 12 }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};

export default ChartsSection;