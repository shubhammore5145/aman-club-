import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { DietPlan, Member } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { UtensilsCrossed, Plus, UserCheck, Flame, Droplets, Trash2 } from 'lucide-react';

export const DietsPage: React.FC = () => {
  const { currentGym } = useGym();
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(AppStorage.getDietPlans(currentGym.id));
  const [members, setMembers] = useState<Member[]>(AppStorage.getMembers(currentGym.id));

  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    goal: 'Lean Muscle & Clean Bulk',
    target_calories: 2600,
    protein_g: 175,
    carbs_g: 280,
    fat_g: 70,
    water_intake_liters: 4.0,
    member_id: members[0]?.id || '',
    notes: '',
    meals: [
      { meal_type: 'Breakfast', meal_name: 'High Protein Oats & Eggs', calories: 650, protein_g: 45, items: '80g Oats, 4 Whole Eggs, 1 Scoop Whey' },
      { meal_type: 'Lunch', meal_name: 'Chicken Rice / Paneer Bowl', calories: 750, protein_g: 55, items: '200g Chicken Breast/Paneer, 150g Rice, Salad' },
      { meal_type: 'Evening Snack', meal_name: 'Pre-Workout Peanut Butter Toast', calories: 350, protein_g: 15, items: '2 Toast, 30g Peanut Butter, 1 Banana' },
      { meal_type: 'Dinner', meal_name: 'Grilled Fish / Soya & Sweet Potato', calories: 650, protein_g: 45, items: '180g Fish/Soya, 200g Sweet Potato, Veggies' },
    ],
  });

  const loadData = () => {
    setDietPlans(AppStorage.getDietPlans(currentGym.id));
    setMembers(AppStorage.getMembers(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    AppStorage.addDietPlan({
      gym_id: currentGym.id,
      member_id: formData.member_id || undefined,
      name: formData.name,
      goal: formData.goal,
      target_calories: Number(formData.target_calories),
      protein_g: Number(formData.protein_g),
      carbs_g: Number(formData.carbs_g),
      fat_g: Number(formData.fat_g),
      water_intake_liters: Number(formData.water_intake_liters),
      is_template: !formData.member_id,
      notes: formData.notes,
      meals: formData.meals.map((m, idx) => ({
        id: crypto.randomUUID(),
        diet_plan_id: '',
        meal_type: m.meal_type,
        meal_name: m.meal_name,
        items: m.items.split(',').map(s => s.trim()).filter(Boolean),
        calories: Number(m.calories),
        protein_g: Number(m.protein_g),
        carbs_g: 40,
        fat_g: 15,
        order_index: idx + 1,
        created_at: new Date().toISOString(),
      })),
    });

    loadData();
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
            Diet Plans & Macro Nutrition ({dietPlans.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build caloric targets, macronutrient distributions, and customized meal structures.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Create Diet Plan
        </Button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dietPlans.map(d => {
          const assignedMember = members.find(m => m.id === d.member_id);

          return (
            <Card key={d.id} hoverEffect className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{d.name}</h3>
                  <p className="text-xs text-emerald-400 font-medium mt-0.5">{d.goal}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-white">{d.target_calories}</span>
                  <span className="text-xs text-slate-400 ml-1">kcal/day</span>
                </div>
              </div>

              {/* Macro Bar */}
              <div className="grid grid-cols-4 gap-2 p-2.5 rounded-lg bg-[#0D121D] border border-[#1E283E] text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Protein</p>
                  <p className="font-bold text-orange-400">{d.protein_g}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Carbs</p>
                  <p className="font-bold text-sky-400">{d.carbs_g}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Fats</p>
                  <p className="font-bold text-amber-400">{d.fat_g}g</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Hydration</p>
                  <p className="font-bold text-emerald-400 flex items-center justify-center gap-0.5">
                    <Droplets className="w-3 h-3" /> {d.water_intake_liters}L
                  </p>
                </div>
              </div>

              {assignedMember && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0E1320] border border-[#1E283E] text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Assigned Athlete:</span>
                  <span className="font-semibold text-slate-200">{assignedMember.full_name}</span>
                </div>
              )}

              {/* Meals */}
              <div className="space-y-2 pt-2 border-t border-[#1E283E]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Daily Meals:
                </p>
                {d.meals?.map(m => (
                  <div
                    key={m.id}
                    className="p-2.5 rounded bg-[#0D121D] border border-[#1C2538] text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-200">{m.meal_type}: {m.meal_name}</span>
                      <span className="text-orange-400 font-bold">{m.calories} kcal • {m.protein_g}g Pro</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{m.items.join(', ')}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Diet Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Formulate Diet & Nutrition Chart"
        description="Set calorie targets, macronutrients, and meal distribution"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Title"
            required
            placeholder="e.g. 2,800 kcal Lean Bulk Regimen"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Calories (kcal)"
              type="number"
              value={formData.target_calories}
              onChange={e => setFormData({ ...formData, target_calories: Number(e.target.value) })}
            />
            <Input
              label="Protein (g)"
              type="number"
              value={formData.protein_g}
              onChange={e => setFormData({ ...formData, protein_g: Number(e.target.value) })}
            />
            <Input
              label="Carbs (g)"
              type="number"
              value={formData.carbs_g}
              onChange={e => setFormData({ ...formData, carbs_g: Number(e.target.value) })}
            />
            <Input
              label="Fats (g)"
              type="number"
              value={formData.fat_g}
              onChange={e => setFormData({ ...formData, fat_g: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Water Target (Liters/day)"
              type="number"
              step="0.5"
              value={formData.water_intake_liters}
              onChange={e => setFormData({ ...formData, water_intake_liters: Number(e.target.value) })}
            />
            <Select
              label="Assign Member (Optional)"
              value={formData.member_id}
              onChange={e => setFormData({ ...formData, member_id: e.target.value })}
            >
              <option value="">General Gym Template</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.full_name} ({m.member_code})
                </option>
              ))}
            </Select>
          </div>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Diet Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
