"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Project } from "@/lib/projects";

type Props = {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (slug: string) => void;
  loading: boolean;
};

export function SortableProjectRow({ project, onEdit, onDelete, loading }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: project.slug });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col md:flex-row md:items-center justify-between py-8 gap-4 group bg-white border-b border-[var(--color-text)]/10 last:border-0 ${isDragging ? 'shadow-lg relative' : ''}`}
    >
      <div className="flex items-center gap-6 flex-1">
        {/* Drag Handle - Los puntitos */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-2 text-[var(--color-text)]/40 hover:text-[var(--color-text)] transition-colors"
          title="Arrastrar para reordenar"
        >
          <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
            <circle cx="2" cy="2" r="2" />
            <circle cx="2" cy="10" r="2" />
            <circle cx="2" cy="18" r="2" />
            <circle cx="10" cy="2" r="2" />
            <circle cx="10" cy="10" r="2" />
            <circle cx="10" cy="18" r="2" />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className={`text-base lowercase tracking-wide transition-colors ${
            (project as any).visible === false 
              ? 'text-[var(--color-text)] line-through opacity-50' 
              : 'text-black group-hover:text-[var(--color-text-hover)]'
          }`}>
            {project.title} {(project as any).visible === false && '(oculto)'}
          </span>
          <div className="flex gap-4 mt-1 text-[10px] text-[var(--color-text)] uppercase tracking-widest">
            <span>{project.year}</span>
            <span>{project.status}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8 pl-14 md:pl-0">
        <button onClick={() => onEdit(project)} className="text-[10px] text-[var(--color-text)] hover:text-black transition-colors uppercase tracking-widest">editar</button>
        <button onClick={() => onDelete(project.slug)} disabled={loading} className="text-[10px] text-red-300 hover:text-red-500 transition-colors uppercase tracking-widest disabled:opacity-30">eliminar</button>
        <a href={`/projects/${project.slug}`} target="_blank" className="text-[10px] text-[var(--color-text)] hover:text-black transition-colors uppercase tracking-widest">ver →</a>
      </div>
    </div>
  );
}
