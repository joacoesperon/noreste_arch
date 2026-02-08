import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeFeedTailwind from "@/components/HomeFeedTailwind";
import { getProjectsShuffled, getProjectCoverImage } from "@/lib/projects";

export default function HomeTailwindPage() {
  const projects = getProjectsShuffled();
  
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
        <HomeFeedTailwind projects={projectsForFeed} logoImage={logoImage} />
      </main>
      <Footer />
    </>
  );
}
