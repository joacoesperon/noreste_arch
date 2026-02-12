import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeFeedVideo from "@/components/HomeFeedVideo";
import { getVisibleProjects, getProjectCoverImage } from "@/lib/projects";

export const dynamic = 'force-dynamic';

export default function Home() {
  const projects = getVisibleProjects();
  
  // Preparar datos para el feed
  const projectsForFeed = projects.map(p => ({
    slug: p.slug,
    title: p.title,
    image: getProjectCoverImage(p),
  }));

  // Logo para la presentación inicial
  const logoImage = "/images/logo.png";

  return (
    <>
      <Header />
      <main className="main clearfix wrapper">
        <HomeFeedVideo projects={projectsForFeed} logoImage={logoImage} />
      </main>
      <Footer />
    </>
  );
}