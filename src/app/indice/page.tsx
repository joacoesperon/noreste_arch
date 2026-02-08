import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProjectsSortedByYear, getProjectCoverImage } from "@/lib/projects";
import IndexTailwind from "./IndexTailwind";

export default function IndexPage() {
  const projects = getProjectsSortedByYear();
  
  // Preparar datos para el cliente
  const projectsForClient = projects.map(p => ({
    slug: p.slug,
    title: p.title,
    status: p.status,
    year: p.year,
    image: getProjectCoverImage(p),
  }));

  return (
    <>
      <Header />
      <main className="main clearfix wrapper">
        <div className="page projects pt-[94px]">
          <section className="py-0">
            <div className="container mx-auto px-4 max-w-[1600px]">
              <IndexTailwind projects={projectsForClient} />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
