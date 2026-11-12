import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { EquipmentItem, EquipmentStatus } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  Wrench,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2
} from 'lucide-react';

export const EquipmentPage: React.FC = () => {
  const { currentGym } = useGym();
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(AppStorage.getEquipment(currentGym.id));
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<EquipmentItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Strength',
    serial_number: '',
    purchase_price: 150000,
    purchase_date: new Date().toISOString().split('T')[0],
    status: 'operational' as EquipmentStatus,
    last_maintenance_date: new Date().toISOString().split('T')[0],
    next_maintenance_date: '',
    maintenance_notes: '',
  });

  const loadData = () => {
    setEquipmentList(AppStorage.getEquipment(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const handleOpenModal = (item?: EquipmentItem) => {
    if (item) {
      setItemToEdit(item);
      setFormData({
        name: item.name,
        category: item.category,
        serial_number: item.serial_number || '',
        purchase_price: item.purchase_price,
        purchase_date: item.purchase_date,
        status: item.status,
        last_maintenance_date: item.last_maintenance_date || '',
        next_maintenance_date: item.next_maintenance_date || '',
        maintenance_notes: item.maintenance_notes || '',
      });
    } else {
      setItemToEdit(null);
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 3);

      setFormData({
        name: '',
        category: 'Strength',
        serial_number: `EQ-${Date.now().toString(36).toUpperCase()}`,
        purchase_price: 150000,
        purchase_date: new Date().toISOString().split('T')[0],
        status: 'operational',
        last_maintenance_date: new Date().toISOString().split('T')[0],
        next_maintenance_date: nextDate.toISOString().split('T')[0],
        maintenance_notes: 'Inspected and certified for member use.',
      });
    }
    setIsModalOpen(true);
  };

  const setIsModalOpen = (open: boolean) => setModalOpen(open);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (itemToEdit) {
      AppStorage.updateEquipment({
        ...itemToEdit,
        ...formData,
        purchase_price: Number(formData.purchase_price),
      });
    } else {
      AppStorage.addEquipment({
        gym_id: currentGym.id,
        name: formData.name,
        category: formData.category,
        serial_number: formData.serial_number,
        purchase_price: Number(formData.purchase_price),
        purchase_date: formData.purchase_date,
        status: formData.status,
        last_maintenance_date: formData.last_maintenance_date,
        next_maintenance_date: formData.next_maintenance_date,
        maintenance_notes: formData.maintenance_notes,
      });
    }

    loadData();
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'operational': return <Badge variant="success" size="sm">Operational</Badge>;
      case 'under_maintenance': return <Badge variant="warning" size="sm">Under Maintenance</Badge>;
      case 'damaged': return <Badge variant="danger" size="sm">Damaged</Badge>;
      case 'retired': return <Badge variant="neutral" size="sm">Retired</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-400" />
            Equipment Inventory & Maintenance ({equipmentList.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track asset longevity, preventive service cycles, and gym equipment warranty.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => handleOpenModal()}
        >
          Add Equipment
        </Button>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {equipmentList.map(item => (
          <Card key={item.id} hoverEffect className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-white">{item.name}</h3>
                <p className="text-xs text-orange-400 font-medium">{item.category} • {item.serial_number || 'No Serial'}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(item.status)}
                <button
                  onClick={() => handleOpenModal(item)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-[#1A2234]"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#1E283E] text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Asset Value</p>
                <p className="font-bold text-slate-100 mt-0.5">
                  {formatCurrency(item.purchase_price, currentGym.currency_symbol)}
                </p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Purchase Date</p>
                <p className="text-slate-300 font-medium mt-0.5">{formatDate(item.purchase_date)}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Last Serviced</p>
                <p className="text-slate-300 font-medium mt-0.5">{formatDate(item.last_maintenance_date)}</p>
              </div>

              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Next Service Due</p>
                <p className="text-amber-400 font-medium mt-0.5">{formatDate(item.next_maintenance_date)}</p>
              </div>
            </div>

            {item.maintenance_notes && (
              <p className="text-xs text-slate-400 bg-[#0D121D] p-2.5 rounded-lg border border-[#1C2538] leading-relaxed">
                <span className="font-semibold text-slate-300">Service Log:</span> {item.maintenance_notes}
              </p>
            )}
          </Card>
        ))}
      </div>

      {/* Add / Edit Equipment Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={itemToEdit ? 'Update Equipment & Service Record' : 'Register Gym Asset'}
        description="Maintain asset warranty, service history, and operational flags"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Equipment Name"
            required
            placeholder="e.g. Rogue Monster Power Rack"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Strength">Strength Machines</option>
              <option value="Free Weights">Free Weights</option>
              <option value="Cardio">Cardio & Endurance</option>
              <option value="Functional">Functional & Crossfit</option>
            </Select>

            <Input
              label="Asset Price (INR)"
              type="number"
              value={formData.purchase_price}
              onChange={e => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Serial Number / Tag"
              placeholder="e.g. RG-MPR-2023"
              value={formData.serial_number}
              onChange={e => setFormData({ ...formData, serial_number: e.target.value })}
            />
            <Select
              label="Operational Status"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="operational">Operational</option>
              <option value="under_maintenance">Under Maintenance</option>
              <option value="damaged">Damaged</option>
              <option value="retired">Retired</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Last Maintenance Date"
              type="date"
              value={formData.last_maintenance_date}
              onChange={e => setFormData({ ...formData, last_maintenance_date: e.target.value })}
            />
            <Input
              label="Next Scheduled Service"
              type="date"
              value={formData.next_maintenance_date}
              onChange={e => setFormData({ ...formData, next_maintenance_date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Maintenance Notes</label>
            <textarea
              rows={2}
              className="w-full bg-[#0D121D] border border-[#232D42] rounded-lg p-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              placeholder="e.g. Cables replaced, bearings greased..."
              value={formData.maintenance_notes}
              onChange={e => setFormData({ ...formData, maintenance_notes: e.target.value })}
            />
          </div>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
