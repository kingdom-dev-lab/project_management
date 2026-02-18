'use client';

import { useMemo, useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'DONE'];

function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <p className="font-medium text-slate-800">{task.title}</p>
      <p className="mt-1 text-xs text-slate-500">Priority: {task.priority}</p>
    </div>
  );
}

export function KanbanBoard({ tasks }) {
  const [boardTasks, setBoardTasks] = useState(tasks || []);

  const grouped = useMemo(() => {
    return COLUMNS.reduce((acc, status) => {
      acc[status] = boardTasks.filter((task) => task.status === status);
      return acc;
    }, {});
  }, [boardTasks]);

  const onDragEnd = ({ active, over }) => {
    if (!over) return;
    const status = over.id;
    setBoardTasks((prev) => prev.map((task) => (task.id === active.id ? { ...task, status } : task)));
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <div className="grid gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => (
          <div key={column} id={column} className="rounded-xl bg-slate-50 p-3">
            <h3 className="mb-3 text-sm font-semibold text-slate-600">{column.replace('_', ' ')}</h3>
            <SortableContext items={grouped[column].map((task) => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3" id={column}>
                {grouped[column].map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>
    </DndContext>
  );
}
