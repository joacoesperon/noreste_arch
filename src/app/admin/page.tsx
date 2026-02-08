"use client";

import { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from "@dnd-kit/sortable";
import Header from "@/components/Header";
import { SortableImage } from "@/components/SortableImage";
import type { Project, ProjectCredits } from "@/lib/projects";

type ProjectForm = {
  slug: string;
  title: string;
  m2: number;
  status: "Construido" | "Proyecto" | "En obra";
  year: number;
  location: string;
  credits: ProjectCredits;
  visible: boolean;
  coverImage?: string;
};

const emptyForm: ProjectForm = {
  slug: "",
  title: "",
  m2: 0,
  status: "Proyecto",
  year: new Date().getFullYear(),
  location: "",
  credits: {
    proyecto: "Noreste Arquitectura",
    equipo: "",
    obra: "",
    paisajismo: "",
    interiorismo: "",
    instalaciones: "",
    estructura: "",
    fotografias: "",
  },
  visible: true,
  coverImage: "",
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Sensores para dnd-kit (Mouse, Touch y Teclado)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Evita que se dispare el drag al hacer solo un click
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndExterior = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCurrentExtImages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndInterior = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCurrentIntImages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [exteriorImages, setExteriorImages] = useState<File[]>([]);
  const [interiorImages, setInteriorImages] = useState<File[]>([]);
  
  // Para visualizar imágenes existentes en edición
  const [currentExtImages, setCurrentExtImages] = useState<string[]>([]);
  const [currentIntImages, setCurrentIntImages] = useState<string[]>([]);

  useEffect(() => {
    // Comprobar si hay una sesión activa al cargar la página
    const checkSession = async () => {
      try {
        const res = await fetch("/api/login/check");
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch (e) {
        // Ignorar error, simplemente mostrar login
      }
    };
    checkSession();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/login/logout", { method: "POST" });
    setIsAuthenticated(false);
    setForm(emptyForm);
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      // Revertir el orden para que los nuevos salgan arriba
      setProjects(data.projects ? [...data.projects].reverse() : []);
    } catch (e) {
      console.error("Error loading projects:", e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
      } else {
        setError(data.error || "Contraseña incorrecta");
      }
    } catch (e) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setForm({
      ...form,
      title,
      slug: editingSlug ? form.slug : generateSlug(title),
    });
  };

  const handleCreditChange = (key: keyof ProjectCredits, value: string) => {
    setForm({
      ...form,
      credits: {
        ...form.credits,
        [key]: value || null,
      }
    });
  };

  const handleEdit = (project: Project) => {
    setEditingSlug(project.slug);
    setForm({
      slug: project.slug,
      title: project.title,
      m2: project.m2,
      status: project.status,
      year: project.year,
      location: project.location,
      visible: (project as any).visible !== false,
      coverImage: project.coverImage || "",
      credits: {
        proyecto: project.credits?.proyecto || "",
        equipo: project.credits?.equipo || "",
        obra: project.credits?.obra || "",
        paisajismo: project.credits?.paisajismo || "",
        interiorismo: project.credits?.interiorismo || "",
        instalaciones: project.credits?.instalaciones || "",
        estructura: project.credits?.estructura || "",
        fotografias: project.credits?.fotografias || "",
      },
    });
    setCurrentExtImages(project.exteriorImages || []);
    setCurrentIntImages(project.interiorImages || []);
    setExteriorImages([]);
    setInteriorImages([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteImage = async (filename: string, type: 'exterior' | 'interior') => {
    if (!editingSlug || !confirm(`¿Eliminar imagen ${filename}?`)) return;
    
    try {
      const res = await fetch(`/api/projects/${editingSlug}/images?filename=${filename}&type=${type}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (type === 'exterior') {
          setCurrentExtImages(prev => prev.filter(img => img !== filename));
        } else {
          setCurrentIntImages(prev => prev.filter(img => img !== filename));
        }
        loadProjects(); // Recargar para sincronizar lista inferior
      }
    } catch (e) {
      setError("Error al eliminar imagen");
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm(`¿Eliminar el proyecto "${slug}"?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${slug}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Proyecto eliminado correctamente");
        loadProjects();
      }
    } catch (e) { setError("Error de conexión"); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const existingProject = projects.find(p => p.slug === (editingSlug || form.slug));
      
      const projectData = {
        ...form,
        exteriorImages: currentExtImages,
        interiorImages: currentIntImages,
      };

      let res;
      if (editingSlug) {
        res = await fetch(`/api/projects/${editingSlug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });
      } else {
        res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });
      }
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar");
      }

      // Subir imágenes nuevas si hay
      if (exteriorImages.length > 0) {
        const formData = new FormData();
        exteriorImages.forEach(img => formData.append("images", img));
        await fetch(`/api/projects/${form.slug}/images?type=exterior`, { method: "POST", body: formData });
      }
      if (interiorImages.length > 0) {
        const formData = new FormData();
        interiorImages.forEach(img => formData.append("images", img));
        await fetch(`/api/projects/${form.slug}/images?type=interior`, { method: "POST", body: formData });
      }
      
      setSuccess(editingSlug ? "Proyecto actualizado correctamente" : "Proyecto creado correctamente");
      
      // Limpiar después de éxito si no estamos editando (o si queremos resetear)
      if (!editingSlug) {
        setForm(emptyForm);
        setExteriorImages([]);
        setInteriorImages([]);
      } else {
        // Si editamos, refrescar datos actuales del servidor para asegurar sincronización
        const updatedRes = await fetch(`/api/projects/${editingSlug}`);
        const updatedData = await updatedRes.json();
        
        // Actualizar el formulario con los datos frescos del servidor
        setForm({
          slug: updatedData.slug,
          title: updatedData.title,
          m2: updatedData.m2,
          status: updatedData.status,
          year: updatedData.year,
          location: updatedData.location,
          visible: updatedData.visible !== false,
          coverImage: updatedData.coverImage || "",
          credits: {
            proyecto: updatedData.credits?.proyecto || "",
            equipo: updatedData.credits?.equipo || "",
            obra: updatedData.credits?.obra || "",
            paisajismo: updatedData.credits?.paisajismo || "",
            interiorismo: updatedData.credits?.interiorismo || "",
            instalaciones: updatedData.credits?.instalaciones || "",
            estructura: updatedData.credits?.estructura || "",
            fotografias: updatedData.credits?.fotografias || "",
          },
        });
        
        setCurrentExtImages(updatedData.exteriorImages || []);
        setCurrentIntImages(updatedData.interiorImages || []);
        setExteriorImages([]);
        setInteriorImages([]);
      }
      
      loadProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setExteriorImages([]);
    setInteriorImages([]);
    setCurrentExtImages([]);
    setCurrentIntImages([]);
    setEditingSlug(null);
    setError("");
    setSuccess("");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-xl text-[#C4C4C4] mb-8 lowercase tracking-widest">noreste arch admin</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={password}
              placeholder="contraseña"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-[#C4C4C4] text-center"
            />
            <button type="submit" className="w-full py-3 border border-[#C4C4C4] text-[#C4C4C4] hover:bg-[#C4C4C4] hover:text-white transition-all cursor-pointer lowercase tracking-widest text-sm">
              {loading ? "verificando..." : "entrar"}
            </button>
            {error && <p className="text-red-500 text-xs uppercase tracking-widest mt-4">{error}</p>}
          </form>
        </div>
      </main>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white pt-32 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-end mb-12 border-b border-[#C4C4C4]/20 pb-4">
            <h1 className="text-2xl text-black lowercase tracking-widest font-medium">
              {editingSlug ? `editando / ${editingSlug}` : "nuevo proyecto"}
            </h1>
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={form.visible} 
                  onChange={(e) => setForm({...form, visible: e.target.checked})}
                  className="w-4 h-4 accent-black"
                />
                <span className="text-xs text-[#C4C4C4] uppercase tracking-widest">Visible en web</span>
              </label>
              
              {editingSlug && (
                <button onClick={handleCancel} className="text-[#C4C4C4] hover:text-black text-sm lowercase transition-colors">
                  cancelar
                </button>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-12">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-8">
              <div className="md:col-span-3">
                <h2 className="text-[#C4C4C4] text-xs uppercase tracking-widest mb-4">información general</h2>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">título</label>
                <input type="text" value={form.title} onChange={handleTitleChange} required className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-black" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">slug (url)</label>
                <input 
                  type="text" 
                  value={form.slug} 
                  onChange={(e) => setForm({...form, slug: e.target.value})}
                  disabled={!!editingSlug} 
                  className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none disabled:opacity-30" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">estado</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-black cursor-pointer">
                  <option value="Proyecto">Proyecto</option>
                  <option value="Construido">Construido</option>
                  <option value="En obra">En obra</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">m2</label>
                <input type="number" value={form.m2} onChange={(e) => setForm({ ...form, m2: parseInt(e.target.value) || 0 })} required className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-black" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">año</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} required className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-black" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">ubicación</label>
                <input type="text" value={form.location} placeholder="Pilar, Provincia de Buenos Aires, Argentina" onChange={(e) => setForm({ ...form, location: e.target.value })} required className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-black" />
              </div>
            </section>
            
            <section className="pt-8 border-t border-[#C4C4C4]/10">
              <h2 className="text-[#C4C4C4] text-xs uppercase tracking-widest mb-8">créditos</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-8">
                {Object.keys(emptyForm.credits).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] text-[#C4C4C4] uppercase tracking-widest">{key}</label>
                    <input type="text" value={(form.credits as any)[key] || ""} onChange={(e) => handleCreditChange(key as any, e.target.value)} className="w-full py-2 border-b border-[#C4C4C4]/30 bg-transparent text-black focus:outline-none focus:border-black" />
                  </div>
                ))}
              </div>
            </section>
            
            {/* Gestión de Imágenes */}
            <section className="pt-8 border-t border-[#C4C4C4]/10">
              <h2 className="text-[#C4C4C4] text-xs uppercase tracking-widest mb-4">gestión de imágenes</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Exterior */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] text-[#C4C4C4] uppercase tracking-[0.2em]">exteriores</h3>
                    {form.coverImage && (
                      <span className="text-[9px] text-black font-medium uppercase tracking-widest bg-gray-100 px-2 py-1 border border-black/10">
                        portada actual: {form.coverImage}
                      </span>
                    )}
                  </div>
                  
                  {/* Imágenes actuales */}
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndExterior}
                  >
                    <SortableContext 
                      items={currentExtImages}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {currentExtImages.map((img) => (
                          <SortableImage 
                            key={img} 
                            id={img}
                            url={`/projects/${editingSlug}/exterior/${img}`}
                            isCover={form.coverImage === img}
                            onSetCover={() => setForm({...form, coverImage: img})}
                            onDelete={() => deleteImage(img, 'exterior')}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <input type="file" id="ext-upload" multiple accept="image/*" onChange={(e) => setExteriorImages(Array.from(e.target.files || []))} className="hidden" />
                  <label htmlFor="ext-upload" className="block w-full py-3 border border-black text-black text-center cursor-pointer hover:bg-black hover:text-white transition-all lowercase text-xs tracking-widest">
                    {exteriorImages.length > 0 ? `${exteriorImages.length} ext. nuevas` : "+ agregar exteriores"}
                  </label>
                </div>

                {/* Interior */}
                <div className="space-y-6">
                  <h3 className="text-[10px] text-[#C4C4C4] uppercase tracking-[0.2em]">interiores</h3>
                  
                  {/* Imágenes actuales */}
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEndInterior}
                  >
                    <SortableContext 
                      items={currentIntImages}
                      strategy={rectSortingStrategy}
                    >
                      <div className="grid grid-cols-4 gap-2">
                        {currentIntImages.map((img) => (
                          <SortableImage 
                            key={img} 
                            id={img}
                            url={`/projects/${editingSlug}/interior/${img}`}
                            isCover={false}
                            onSetCover={() => {}}
                            onDelete={() => deleteImage(img, 'interior')}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <input type="file" id="int-upload" multiple accept="image/*" onChange={(e) => setInteriorImages(Array.from(e.target.files || []))} className="hidden" />
                  <label htmlFor="int-upload" className="block w-full py-3 border border-black text-black text-center cursor-pointer hover:bg-black hover:text-white transition-all lowercase text-xs tracking-widest">
                    {interiorImages.length > 0 ? `${interiorImages.length} int. nuevas` : "+ agregar interiores"}
                  </label>
                </div>
              </div>
            </section>
            
            <div className="pt-12 space-y-4">
              <button type="submit" disabled={loading} className="px-12 py-4 bg-black text-white hover:bg-[#333] transition-all cursor-pointer disabled:opacity-30 lowercase tracking-widest text-sm">
                {loading ? "guardando..." : (editingSlug ? "actualizar proyecto" : "crear proyecto")}
              </button>
              
              {/* Feedback de éxito/error justo debajo del botón */}
              {error && <div className="p-4 bg-red-50 text-red-500 text-sm border-l-2 border-red-500">{error}</div>}
              {success && <div className="p-4 bg-gray-50 text-black text-sm border-l-2 border-black font-medium">{success}</div>}
            </div>
          </form>
          
          <section className="mt-32 pt-16 border-t border-black">
            <h2 className="text-black text-xl lowercase tracking-widest mb-12 font-medium">proyectos actuales</h2>
            <div className="divide-y divide-[#C4C4C4]/20">
              {projects.map((project) => (
                <div key={project.slug} className="flex flex-col md:flex-row md:items-center justify-between py-6 gap-4">
                  <div className="flex flex-col">
                    <span className={`text-lg lowercase font-medium ${(project as any).visible === false ? 'text-[#C4C4C4] line-through' : 'text-black'}`}>
                      {project.title} {(project as any).visible === false && '(oculto)'}
                    </span>
                    <div className="flex gap-4 mt-1 text-xs text-[#C4C4C4]">
                      <span>{project.year}</span>
                      <span>{project.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <button onClick={() => handleEdit(project)} className="text-xs text-[#C4C4C4] hover:text-black transition-colors uppercase tracking-widest">editar</button>
                    <button onClick={() => handleDelete(project.slug)} disabled={loading} className="text-xs text-red-300 hover:text-red-500 transition-colors uppercase tracking-widest disabled:opacity-30">eliminar</button>
                    <a href={`/projects/${project.slug}`} target="_blank" className="text-xs text-[#C4C4C4] hover:text-black transition-colors uppercase tracking-widest">ver →</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Botón de Salir Fijo abajo a la derecha */}
        <button 
          onClick={handleLogout}
          className="fixed bottom-8 right-8 z-[100] text-[10px] text-red-400 hover:text-red-600 uppercase tracking-widest border border-red-100 bg-white/90 backdrop-blur-sm px-4 py-2 shadow-sm transition-colors rounded-sm hover:border-red-200"
        >
          salir del panel
        </button>
      </main>
    </>
  );
}