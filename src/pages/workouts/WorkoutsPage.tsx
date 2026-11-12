import React, { useState, useEffect } from 'react';
import { useGym } from '../../contexts/GymContext';
import { AppStorage, DATA_CHANGE_EVENT } from '../../lib/storage';
import { WorkoutPlan, Member } from '../../types/database';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Dumbbell, Plus, UserCheck, Flame, Clock, Trash2 } from 'lucide-react';

export const WorkoutsPage: React.FC = () => {
  const { currentGym } = useGym();
  const [plans, setPlans] = useState<WorkoutPlan[]>(AppStorage.getWorkoutPlans(currentGym.id));
  const [members, setMembers] = useState<Member[]>(AppStorage.getMembers(currentGym.id));

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    goal: 'Muscle Hypertrophy & Strength',
    difficulty: 'intermediate' as const,
    duration_weeks: 8,
    member_id: members[0]?.id || '',
    description: '',
    exercises: [
      { day_of_week: 'Monday (Push)', exercise_name: 'Barbell Bench Press', target_muscle: 'Chest', sets: 4, reps: '8-10', rest_seconds: 90 },
      { day_of_week: 'Monday (Push)', exercise_name: 'Incline Dumbbell Press', target_muscle: 'Upper Chest', sets: 3, reps: '10-12', rest_seconds: 60 },
      { day_of_week: 'Wednesday (Pull)', exercise_name: 'Barbell Deadlift', target_muscle: 'Back', sets: 4, reps: '5-6', rest_seconds: 120 },
      { day_of_week: 'Friday (Legs)', exercise_name: 'Barbell Squat', target_muscle: 'Quads & Glutes', sets: 4, reps: '8-10', rest_seconds: 120 },
    ],
  });

  const loadData = () => {
    setPlans(AppStorage.getWorkoutPlans(currentGym.id));
    setMembers(AppStorage.getMembers(currentGym.id));
  };

  useEffect(() => {
    loadData();
    window.addEventListener(DATA_CHANGE_EVENT, loadData);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, loadData);
  }, [currentGym.id]);

  const handleAddExerciseRow = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        { day_of_week: 'Monday (Push)', exercise_name: '', target_muscle: '', sets: 3, reps: '10-12', rest_seconds: 60 },
      ],
    }));
  };

  const handleRemoveExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    AppStorage.addWorkoutPlan({
      gym_id: currentGym.id,
      member_id: formData.member_id || undefined,
      name: formData.name,
      goal: formData.goal,
      difficulty: formData.difficulty,
      duration_weeks: Number(formData.duration_weeks),
      is_template: !formData.member_id,
      description: formData.description,
      exercises: formData.exercises.map((ex, idx) => ({
        id: crypto.randomUUID(),
        workout_plan_id: '',
        day_of_week: ex.day_of_week,
        exercise_name: ex.exercise_name || 'Standard Lift',
        target_muscle: ex.target_muscle || 'Full Body',
        sets: Number(ex.sets),
        reps: ex.reps,
        rest_seconds: Number(ex.rest_seconds),
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
            <Dumbbell className="w-5 h-5 text-orange-400" />
            Workout Plans & Routines ({plans.length})
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Build progressive exercise schedules, target muscle volumes, and assign routines to members.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Create Workout Plan
        </Button>
      </div>

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plans.map(p => {
          const assignedMember = members.find(m => m.id === p.member_id);

          return (
            <Card key={p.id} hoverEffect className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <Badge variant="orange" size="sm">{p.difficulty}</Badge>
                  </div>
                  <p className="text-xs text-orange-400 font-medium mt-0.5">{p.goal}</p>
                </div>

                <span className="text-[11px] font-semibold text-slate-400 bg-[#0E1320] px-2.5 py-1 rounded border border-[#232D42]">
                  {p.duration_weeks} Weeks
                </span>
              </div>

              {assignedMember && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#0E1320] border border-[#1E283E] text-xs">
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Assigned Athlete:</span>
                  <span className="font-semibold text-slate-200">{assignedMember.full_name} ({assignedMember.member_code})</span>
                </div>
              )}

              <div className="space-y-1.5 pt-2 border-t border-[#1E283E]">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Exercise Breakdown:
                </p>
                {p.exercises?.map(ex => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between p-2 rounded bg-[#0D121D] border border-[#1C2538] text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{ex.exercise_name}</p>
                      <p className="text-[10px] text-slate-500">{ex.day_of_week} • {ex.target_muscle}</p>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="text-orange-400 font-bold">{ex.sets} Sets</span>
                      <span className="text-slate-400 ml-1">× {ex.reps}</span>
                      <p className="text-[10px] text-slate-500">{ex.rest_seconds}s rest</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create Workout Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Design Workout Routine"
        description="Configure exercise volume, sets, reps, and assign to member"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Plan Title"
            required
            placeholder="e.g. 12-Week Powerlifting & Hypertrophy"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Primary Goal"
              value={formData.goal}
              onChange={e => setFormData({ ...formData, goal: e.target.value })}
            />
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </Select>
            <Input
              label="Duration (Weeks)"
              type="number"
              value={formData.duration_weeks}
              onChange={e => setFormData({ ...formData, duration_weeks: Number(e.target.value) })}
            />
          </div>

          <Select
            label="Assign to Member (Optional)"
            value={formData.member_id}
            onChange={e => setFormData({ ...formData, member_id: e.target.value })}
          >
            <option value="">General Club Template (No member)</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>
                {m.full_name} ({m.member_code})
              </option>
            ))}
          </Select>

          {/* Exercise Builder */}
          <div className="pt-2 border-t border-[#1E273A] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Exercise List</h4>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="text-xs h-7"
                onClick={handleAddExerciseRow}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                Add Movement
              </Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {formData.exercises.map((ex, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 p-2 rounded-lg bg-[#0D121D] border border-[#232D42] items-center text-xs">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Day (e.g. Mon)"
                      className="w-full bg-[#141B2A] border border-[#232F48] rounded px-2 py-1 text-slate-100 placeholder:text-slate-500"
                      value={ex.day_of_week}
                      onChange={e => {
                        const copy = [...formData.exercises];
                        copy[idx].day_of_week = e.target.value;
                        setFormData({ ...formData, exercises: copy });
                      }}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Exercise Name"
                      className="w-full bg-[#141B2A] border border-[#232F48] rounded px-2 py-1 text-slate-100 placeholder:text-slate-500"
                      value={ex.exercise_name}
                      onChange={e => {
                        const copy = [...formData.exercises];
                        copy[idx].exercise_name = e.target.value;
                        setFormData({ ...formData, exercises: copy });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Sets"
                      className="w-full bg-[#141B2A] border border-[#232F48] rounded px-2 py-1 text-slate-100"
                      value={ex.sets}
                      onChange={e => {
                        const copy = [...formData.exercises];
                        copy[idx].sets = Number(e.target.value);
                        setFormData({ ...formData, exercises: copy });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      placeholder="Reps"
                      className="w-full bg-[#141B2A] border border-[#232F48] rounded px-2 py-1 text-slate-100"
                      value={ex.reps}
                      onChange={e => {
                        const copy = [...formData.exercises];
                        copy[idx].reps = e.target.value;
                        setFormData({ ...formData, exercises: copy });
                      }}
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#1E273A] flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Workout Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
