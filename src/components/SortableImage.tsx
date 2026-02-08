import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SortableImageProps = {
  id: string;
  url: string;
  isCover: boolean;
  onSetCover: () => void;
  onDelete: () => void;
};

export function SortableImage({ id, url, isCover, onSetCover, onDelete }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

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
      {...attributes}
      {...listeners}
      className={`relative group aspect-square border overflow-hidden bg-gray-50 touch-none ${
        isCover ? "border-black ring-2 ring-black/10" : "border-[#C4C4C4]/20"
      }`}
    >
      <img
        src={url}
        alt={id}
        className="w-full h-full object-cover pointer-events-none select-none"
      />
      
      {/* Overlay de acciones */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 text-center">
        <button
          type="button"
          // Importante: pointer-events-auto para que los clicks pasen a través del listener de drag si es necesario, 
          // pero dnd-kit suele manejar esto bien con los listeners en el padre.
          // Aquí usamos onPointerDown stopPropagation para evitar iniciar el drag al hacer click.
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onSetCover}
          className={`text-[9px] uppercase tracking-tighter px-2 py-1 border transition-colors ${
            isCover
              ? "bg-white text-black border-white"
              : "text-white border-white/40 hover:border-white"
          }`}
        >
          {isCover ? "Es portada" : "Usar portada"}
        </button>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onDelete}
          className="text-[9px] text-red-400 hover:text-red-300 uppercase tracking-tighter hover:underline"
        >
          Eliminar
        </button>
      </div>

      {isCover && (
        <div className="absolute top-1 right-1 bg-black text-white text-[8px] px-1.5 py-0.5 uppercase font-bold tracking-tighter shadow-sm">
          Cover
        </div>
      )}
    </div>
  );
}
