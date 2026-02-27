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
  rectSortingStrategy,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import Header from "@/components/Header";
import { SortableImage } from "@/components/SortableImage";
import { SortableProjectRow } from "@/components/SortableProjectRow";
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
  cover?: string;
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
  cover: "",
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndImages = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setCurrentImages((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndProjects = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p.slug === active.id);
      const newIndex = projects.findIndex(p => p.slug === over.id);
      
      const newOrder = arrayMove(projects, oldIndex, newIndex);
      setProjects(newOrder);
      setOrderChanged(true);
    }
  };

  const saveNewOrder = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects: projects }), // Enviar el orden tal cual se ve
      });
      if (res.ok) {
        setSuccess("Orden actualizado correctamente");
        setOrderChanged(false);
        loadProjects();
      } else {
        const data = await res.json();
        throw new Error(data.error || "Error al guardar el orden");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el nuevo orden");
    } finally {
      setLoading(false);
    }
  };

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [orderChanged, setOrderChanged] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newVideos, setNewVideos] = useState<File[]>([]);
  
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentVideos, setCurrentVideos] = useState<string[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/login/check");
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch (e) {}
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
      setProjects(data.projects || []); // Ya no invertimos al cargar
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
      cover: project.cover || "",
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
    setCurrentImages(project.images || []);
    setCurrentVideos(project.videos || []);
    setNewImages([]);
    setNewVideos([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteFile = async (filename: string, type: 'images' | 'videos') => {
    if (!editingSlug || !confirm(`¿Eliminar archivo ${filename}?`)) return;
    
    try {
      const res = await fetch(`/api/projects/${editingSlug}/images?filename=${filename}&type=${type}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (type === 'images') {
          setCurrentImages(prev => prev.filter(img => img !== filename));
        } else {
          setCurrentVideos(prev => prev.filter(vid => vid !== filename));
        }
        loadProjects();
      }
    } catch (e) {
      setError("Error al eliminar archivo");
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
      const projectData = {
        ...form,
        images: currentImages,
        videos: currentVideos,
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

      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach(img => formData.append("images", img));
        await fetch(`/api/projects/${form.slug}/images?type=images`, { method: "POST", body: formData });
      }
      
      if (newVideos.length > 0) {
        const formData = new FormData();
        newVideos.forEach(vid => formData.append("videos", vid));
        await fetch(`/api/projects/${form.slug}/images?type=videos`, { method: "POST", body: formData });
      }
      
      setSuccess(editingSlug ? "Proyecto actualizado correctamente" : "Proyecto creado correctamente");
      
      if (!editingSlug) {
        setForm(emptyForm);
        setNewImages([]);
        setNewVideos([]);
      } else {
        const updatedRes = await fetch(`/api/projects/${editingSlug}`);
        const updatedData = await updatedRes.json();
        setCurrentImages(updatedData.images || []);
        setCurrentVideos(updatedData.videos || []);
        setNewImages([]);
        setNewVideos([]);
      }
      
      loadProjects();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setForm(emptyForm);
    setNewImages([]);
    setNewVideos([]);
    setCurrentImages([]);
    setCurrentVideos([]);
    setEditingSlug(null);
    setError("");
    setSuccess("");
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-sm text-center">
          <h1 className="text-xl text-[var(--color-text)] mb-8 lowercase tracking-widest">admin</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={password}
              placeholder="contraseña"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] text-center transition-colors"
            />
            <button type="submit" className="w-full py-3 border border-[var(--color-text)] text-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-white transition-all cursor-pointer lowercase tracking-widest text-sm">
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
      <main className="min-h-screen bg-white pt-32 px-4 md:px-[15%] pb-20">
        <div className="w-full mx-auto">
          <div className="flex justify-between items-end mb-12 border-b border-[var(--color-text)]/20 pb-4">
            <h1 className="text-2xl text-black lowercase tracking-widest font-medium">
              {editingSlug ? `editando / ${editingSlug}` : "nuevo proyecto"}
            </h1>
            <div className="flex gap-6 items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={form.visible} 
                  onChange={(e) => setForm({...form, visible: e.target.checked})}
                  className="w-4 h-4 accent-[var(--color-text-hover)]"
                />
                <span className="text-xs text-[var(--color-text)] group-hover:text-[var(--color-text-hover)] uppercase tracking-widest transition-colors">Visible en web</span>
              </label>
              
              {editingSlug && (
                <button onClick={handleCancel} className="text-[var(--color-text)] hover:text-black text-sm lowercase transition-colors underline decoration-1 underline-offset-4">
                  cancelar
                </button>
              )}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-16">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
              <div className="md:col-span-3">
                <h2 className="text-black text-[11px] font-semibold uppercase tracking-[0.2em] mb-4 border-b border-[var(--color-text)]/10 pb-2">información general</h2>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">título</label>
                <input type="text" value={form.title} onChange={handleTitleChange} required className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] transition-colors" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">slug (url)</label>
                <input 
                  type="text" 
                  value={form.slug} 
                  onChange={(e) => setForm({...form, slug: e.target.value})}
                  disabled={!!editingSlug} 
                  className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none disabled:opacity-30" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">estado</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] cursor-pointer transition-colors">
                  <option value="Proyecto">Proyecto</option>
                  <option value="Construido">Construido</option>
                  <option value="En obra">En obra</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">m2</label>
                <input type="number" value={form.m2} onChange={(e) => setForm({ ...form, m2: parseInt(e.target.value) || 0 })} required className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] transition-colors" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">año</label>
                <input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 2024 })} required className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] transition-colors" />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">ubicación</label>
                <input type="text" value={form.location} placeholder="Pilar, Provincia de Buenos Aires, Argentina" onChange={(e) => setForm({ ...form, location: e.target.value })} required className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] transition-colors" />
              </div>
            </section>
            
            <section className="pt-8 border-t border-[var(--color-text)]/10">
              <h2 className="text-black text-[11px] font-semibold uppercase tracking-[0.2em] mb-8 border-b border-[var(--color-text)]/10 pb-2">créditos</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-x-12 gap-y-10">
                {Object.keys(emptyForm.credits).map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[9px] text-[var(--color-text)] uppercase tracking-widest">{key}</label>
                    <input type="text" value={(form.credits as any)[key] || ""} onChange={(e) => handleCreditChange(key as any, e.target.value)} className="w-full py-2 border-b border-[var(--color-text)]/30 bg-transparent text-black focus:outline-none focus:border-[var(--color-text-hover)] transition-colors" />
                  </div>
                ))}
              </div>
            </section>
            
            {/* Gestión de Archivos */}
            <section className="pt-8 border-t border-[var(--color-text)]/10">
              <h2 className="text-black text-[11px] font-semibold uppercase tracking-[0.2em] mb-8 border-b border-[var(--color-text)]/10 pb-2">imágenes y galería</h2>
              
              <div className="space-y-8">
                {/* Imágenes */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-[10px] text-[var(--color-text)] font-medium uppercase tracking-widest">fotos</h3>
                    {form.cover && (
                      <span className="text-[8px] text-[var(--color-text-hover)] font-medium uppercase tracking-widest bg-gray-50 px-2 py-1 border border-[var(--color-text)]/20">
                        portada: {form.cover}
                      </span>
                    )}
                  </div>
                  
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndImages}>
                    <SortableContext items={currentImages} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {currentImages.map((img) => (
                          <SortableImage 
                            key={img} 
                            id={img}
                            url={img}
                            isCover={form.cover === img}
                            onSetCover={() => setForm({...form, cover: img})}
                            onDelete={() => deleteFile(img, 'images')}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <input 
                    type="file" 
                    id="img-upload" 
                    multiple 
                    accept="image/*" 
                    onChange={(e) => {
                      setNewImages(Array.from(e.target.files || []));
                      e.target.value = ""; // Resetear valor para permitir re-subir el mismo archivo
                    }} 
                    className="hidden" 
                  />
                  <label htmlFor="img-upload" className="block w-full py-4 border border-[var(--color-text)] text-[var(--color-text)] text-center cursor-pointer hover:bg-black hover:text-white hover:border-black transition-all lowercase text-xs tracking-[0.2em]">
                    {newImages.length > 0 ? `${newImages.length} fotos nuevas` : "+ agregar fotos"}
                  </label>
                </div>

                {/* Videos */}
                <div className="space-y-6 pt-8 border-t border-[var(--color-text)]/5">
                  <h3 className="text-[10px] text-[var(--color-text)] font-medium uppercase tracking-widest">videos</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {currentVideos.map((vid) => (
                      <div key={vid} className={`relative aspect-video bg-gray-100 group border ${form.cover === vid ? 'border-black ring-2 ring-black/10' : 'border-[var(--color-text)]/20'}`}>
                        <video src={vid} muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                          <button type="button" onClick={() => setForm({...form, cover: vid})} className={`text-[9px] uppercase tracking-tighter px-2 py-1 border ${form.cover === vid ? 'bg-white text-black' : 'text-white border-white'}`}>
                            {form.cover === vid ? 'portada' : 'usar portada'}
                          </button>
                          <button type="button" onClick={() => deleteFile(vid, 'videos')} className="text-[9px] text-red-400 uppercase tracking-tighter">eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <input 
                    type="file" 
                    id="vid-upload" 
                    multiple 
                    accept="video/*" 
                    onChange={(e) => {
                      setNewVideos(Array.from(e.target.files || []));
                      e.target.value = ""; // Resetear valor
                    }} 
                    className="hidden" 
                  />
                  <label htmlFor="vid-upload" className="block w-full py-4 border border-[var(--color-text)] text-[var(--color-text)] text-center cursor-pointer hover:bg-black hover:text-white hover:border-black transition-all lowercase text-xs tracking-[0.2em]">
                    {newVideos.length > 0 ? `${newVideos.length} videos nuevos` : "+ agregar videos"}
                  </label>
                </div>
              </div>
            </section>
            
            <div className="pt-12 space-y-6">
              <button type="submit" disabled={loading} className="px-16 py-4 bg-black text-white hover:bg-[#333] transition-all cursor-pointer disabled:opacity-30 lowercase tracking-[0.2em] text-xs">
                {loading ? "guardando..." : (editingSlug ? "actualizar proyecto" : "crear proyecto")}
              </button>
              
              {error && <div className="p-4 text-red-500 text-[10px] uppercase tracking-widest border-l border-red-500 bg-red-50/30">{error}</div>}
              {success && <div className="p-4 text-black text-[10px] uppercase tracking-widest border-l border-black bg-gray-50 font-medium">{success}</div>}
            </div>
          </form>
          
          <section className="mt-40 pt-16 border-t border-black">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-black text-sm font-semibold uppercase tracking-[0.3em]">proyectos actuales</h2>
              <span className="text-[9px] text-[var(--color-text)] uppercase tracking-widest italic">Arrastra el icono ::: para reordenar</span>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProjects}>
              <SortableContext items={projects.map(p => p.slug)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col">
                  {projects.map((project) => (
                    <SortableProjectRow 
                      key={project.slug} 
                      project={project} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                      loading={loading}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {orderChanged && (
              <div className="mt-8 flex justify-center">
                <button 
                  onClick={saveNewOrder}
                  disabled={loading}
                  className="px-8 py-3 bg-[var(--color-text-hover)] text-white text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl animate-bounce"
                >
                  {loading ? "guardando..." : "guardar nuevo orden"}
                </button>
              </div>
            )}
          </section>
        </div>

        <button 
          onClick={handleLogout}
          className="fixed bottom-8 right-8 z-[100] text-[9px] text-[var(--color-text)] hover:text-red-500 uppercase tracking-[0.3em] border border-[var(--color-text)]/20 bg-white/80 backdrop-blur-sm px-6 py-3 transition-all hover:border-red-200"
        >
          salir del panel
        </button>
      </main>
    </>
  );
}
