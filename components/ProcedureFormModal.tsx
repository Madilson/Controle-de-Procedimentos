import React, { useState, useEffect } from 'react';
import { Procedure } from '../types';

type ProcedureFormData = Omit<Procedure, 'id'>;

interface ProcedureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (procedure: Omit<Procedure, 'id'> & { id?: string }) => void;
  procedureToEdit: Procedure | null;
  regions: string[];
  states: string[];
  procedureNames: string[];
}

const initialFormState: ProcedureFormData = {
  date: new Date().toISOString().split('T')[0],
  region: '',
  state: '',
  hospitalUnit: '',
  procedureName: '',
  qtyPerformed: 0,
  qtyBilled: 0,
  qtyPaid: 0,
  valuePerformed: 0,
  valueBilled: 0,
  valuePaid: 0,
  // Initialize audit fields safely
  createdBy: '',
  lastModifiedBy: '',
  lastModifiedAt: '',
};

const fieldLabels: Record<Exclude<keyof ProcedureFormData, 'lastModifiedBy' | 'lastModifiedAt' | 'createdBy'>, string> = {
  date: 'Data do Procedimento',
  region: 'Região',
  state: 'Estado (UF)',
  hospitalUnit: 'Unidade Hospitalar',
  procedureName: 'Nome do Procedimento',
  qtyPerformed: 'Qtd. Realizados',
  qtyBilled: 'Qtd. Faturados',
  qtyPaid: 'Qtd. Pagos',
  valuePerformed: 'Valor Realizado',
  valueBilled: 'Valor Faturado',
  valuePaid: 'Valor Pago',
};

const formatCurrencyForDisplay = (num: number): string => {
  if (typeof num !== 'number' || isNaN(num)) return '';
  // Format the number to a string with 2 decimal places, then replace dot with comma
  const formatted = num.toFixed(2).replace('.', ',');
  // Add dot as a thousands separator
  const parts = formatted.split(',');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return parts.join(',');
};


const ProcedureFormModal: React.FC<ProcedureFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  procedureToEdit,
  regions,
  states,
  procedureNames,
}) => {
  const [formData, setFormData] = useState<ProcedureFormData>(initialFormState);
  const [errors, setErrors] = useState<Partial<Record<keyof ProcedureFormData, string>>>({});

  const validate = (data: ProcedureFormData): Partial<Record<keyof ProcedureFormData, string>> => {
    const newErrors: Partial<Record<keyof ProcedureFormData, string>> = {};

    // Required fields
    if (!data.procedureName.trim()) newErrors.procedureName = 'Este campo é obrigatório.';
    if (!data.hospitalUnit.trim()) newErrors.hospitalUnit = 'Este campo é obrigatório.';
    if (!data.date) newErrors.date = 'Este campo é obrigatório.';
    if (!data.region) newErrors.region = 'Este campo é obrigatório.';
    if (!data.state) newErrors.state = 'Este campo é obrigatório.';

    // Date validation
    if (data.date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today's date
        const procedureDate = new Date(data.date + 'T00:00:00'); // Ensure timezone consistency
        if (procedureDate > today) {
            newErrors.date = 'A data não pode ser no futuro.';
        }
    }

    // Quantity validation
    if (data.qtyPerformed < 0) newErrors.qtyPerformed = 'A quantidade não pode ser negativa.';
    if (data.qtyBilled < 0) newErrors.qtyBilled = 'A quantidade faturada não pode ser negativa.';
    if (data.qtyPaid < 0) newErrors.qtyPaid = 'A quantidade paga não pode ser negativa.';

    if (data.qtyBilled > data.qtyPerformed) {
        newErrors.qtyBilled = 'Qtd. Faturados não pode ser maior que Qtd. Realizados.';
    }
    if (data.qtyPaid > data.qtyBilled) {
        newErrors.qtyPaid = 'Qtd. Pagos não pode ser maior que Qtd. Faturados.';
    }

    // Value validation
    if (data.valuePerformed < 0) newErrors.valuePerformed = 'O valor não pode ser negativo.';
    if (data.valueBilled < 0) newErrors.valueBilled = 'O valor não pode ser negativo.';
    if (data.valuePaid < 0) newErrors.valuePaid = 'O valor não pode ser negativo.';

    if (data.valueBilled > data.valuePerformed) {
        newErrors.valueBilled = 'Valor Faturado não pode ser maior que Valor Realizado.';
    }
    if (data.valuePaid > data.valueBilled) {
        newErrors.valuePaid = 'Valor Pago não pode ser maior que Valor Faturado.';
    }

    return newErrors;
  };

  useEffect(() => {
    if (procedureToEdit) {
      setFormData(procedureToEdit);
    } else {
      setFormData(initialFormState);
    }
    setErrors({}); // Reset errors when modal opens or procedure changes
  }, [procedureToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Clear the error for the field being edited
    if (errors[name as keyof ProcedureFormData]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof ProcedureFormData];
          return newErrors;
        });
    }
    
    if (name.startsWith('value')) { // valuePerformed, valueBilled, valuePaid
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly === '') {
          setFormData((prev) => ({ ...prev, [name]: 0 }));
          return;
      }
      const numberValue = Number(digitsOnly) / 100;
      setFormData((prev) => ({
          ...prev,
          [name]: isNaN(numberValue) ? 0 : numberValue,
      }));
    } else {
      const isNumberInput = e.target.nodeName === 'INPUT' && (e.target as HTMLInputElement).type === 'number';
      setFormData((prev) => ({
        ...prev,
        [name]: isNumberInput ? parseFloat(value) || 0 : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    onSave({ ...formData, id: procedureToEdit?.id });
  };

  if (!isOpen) return null;
  
  const commonInputClass = "block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white";
  const errorInputClass = "border-red-500 dark:border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {procedureToEdit ? 'Editar Procedimento' : 'Adicionar Novo Procedimento'}
          </h2>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-6">
            
            <div>
              <label htmlFor="procedureName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.procedureName}</label>
              <input
                type="text"
                id="procedureName"
                name="procedureName"
                value={formData.procedureName}
                onChange={handleChange}
                className={`${commonInputClass} ${errors.procedureName ? errorInputClass : ''}`}
                required
                list="procedure-names-datalist"
              />
              <datalist id="procedure-names-datalist">
                {procedureNames.map(name => <option key={name} value={name} />)}
              </datalist>
              {errors.procedureName && <p className="mt-1 text-sm text-red-600">{errors.procedureName}</p>}
            </div>

            <div>
              <label htmlFor="hospitalUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.hospitalUnit}</label>
              <input
                type="text"
                id="hospitalUnit"
                name="hospitalUnit"
                value={formData.hospitalUnit}
                onChange={handleChange}
                className={`${commonInputClass} ${errors.hospitalUnit ? errorInputClass : ''}`}
                required
              />
               {errors.hospitalUnit && <p className="mt-1 text-sm text-red-600">{errors.hospitalUnit}</p>}
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.date}</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`${commonInputClass} ${errors.date ? errorInputClass : ''}`}
                required
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.region}</label>
                  <select
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className={`${commonInputClass} ${errors.region ? errorInputClass : ''}`}
                    required
                  >
                    <option value="" disabled>Selecione uma região</option>
                    {regions.map(region => <option key={region} value={region}>{region}</option>)}
                  </select>
                  {errors.region && <p className="mt-1 text-sm text-red-600">{errors.region}</p>}
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.state}</label>
                  <select
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`${commonInputClass} ${errors.state ? errorInputClass : ''}`}
                    required
                  >
                    <option value="" disabled>Selecione um estado</option>
                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                  {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-4">
                    Quantidades
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                     <div>
                      <label htmlFor="qtyPerformed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.qtyPerformed}</label>
                      <input type="number" id="qtyPerformed" name="qtyPerformed" value={formData.qtyPerformed} onChange={handleChange} className={`${commonInputClass} ${errors.qtyPerformed ? errorInputClass : ''}`} required min="0" />
                      {errors.qtyPerformed && <p className="mt-1 text-sm text-red-600">{errors.qtyPerformed}</p>}
                    </div>
                    <div>
                      <label htmlFor="qtyBilled" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.qtyBilled}</label>
                      <input type="number" id="qtyBilled" name="qtyBilled" value={formData.qtyBilled} onChange={handleChange} className={`${commonInputClass} ${errors.qtyBilled ? errorInputClass : ''}`} required min="0" />
                      {errors.qtyBilled && <p className="mt-1 text-sm text-red-600">{errors.qtyBilled}</p>}
                    </div>
                    <div>
                      <label htmlFor="qtyPaid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.qtyPaid}</label>
                      <input type="number" id="qtyPaid" name="qtyPaid" value={formData.qtyPaid} onChange={handleChange} className={`${commonInputClass} ${errors.qtyPaid ? errorInputClass : ''}`} required min="0" />
                      {errors.qtyPaid && <p className="mt-1 text-sm text-red-600">{errors.qtyPaid}</p>}
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-4">
                    Valores (R$)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div>
                      <label htmlFor="valuePerformed" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.valuePerformed}</label>
                      <input type="text" inputMode="decimal" id="valuePerformed" name="valuePerformed" value={formatCurrencyForDisplay(formData.valuePerformed)} onChange={handleChange} className={`${commonInputClass} ${errors.valuePerformed ? errorInputClass : ''}`} required />
                      {errors.valuePerformed && <p className="mt-1 text-sm text-red-600">{errors.valuePerformed}</p>}
                    </div>
                    <div>
                      <label htmlFor="valueBilled" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.valueBilled}</label>
                      <input type="text" inputMode="decimal" id="valueBilled" name="valueBilled" value={formatCurrencyForDisplay(formData.valueBilled)} onChange={handleChange} className={`${commonInputClass} ${errors.valueBilled ? errorInputClass : ''}`} required />
                      {errors.valueBilled && <p className="mt-1 text-sm text-red-600">{errors.valueBilled}</p>}
                    </div>
                    <div>
                      <label htmlFor="valuePaid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{fieldLabels.valuePaid}</label>
                      <input type="text" inputMode="decimal" id="valuePaid" name="valuePaid" value={formatCurrencyForDisplay(formData.valuePaid)} onChange={handleChange} className={`${commonInputClass} ${errors.valuePaid ? errorInputClass : ''}`} required />
                      {errors.valuePaid && <p className="mt-1 text-sm text-red-600">{errors.valuePaid}</p>}
                    </div>
                </div>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end items-center space-x-4 rounded-b-lg sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProcedureFormModal;