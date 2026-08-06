import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const revalidate = 60; // Revalidate every 60 seconds

export async function generateMetadata({ params }) {
    const { data: blog } = await supabase
        .from("blogs")
        .select("title, tags")
        .eq("slug", params.slug)
        .single();

    if (!blog) return { title: "Not Found" };
    return {
        title: `${blog.title} | Premium Hub Nepal`,
        description: `Read about ${blog.tags} in Nepal.`,
    };
}

export default async function BlogPost({ params }) {
    const { data: blog, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", params.slug)
        .single();

    if (error || !blog) {
        notFound();
    }

    return (
        <>
            <header style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)", padding: "15px 5%" }}>
                <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>
                    <Link href="/" className="brand" style={{textDecoration: "none"}}>
                        <img src="/logo-icon.png" alt="Logo" className="brand-logo" style={{width: 32, height: 32}} /> 
                        Premium <span style={{ color: "var(--accent)" }}>Hub Nepal</span>
                    </Link>
                    <Link href="/#blog" className="btn-secondary" style={{padding: "8px 16px", textDecoration: "none"}}>
                        ← Back to home
                    </Link>
                </nav>
            </header>

            <main style={{ maxWidth: "720px", margin: "60px auto", padding: "0 20px", minHeight: "60vh" }}>
                <article>
                    {blog.tags && <span className="tag mono" style={{marginBottom: "15px", display: "inline-block"}}>{blog.tags}</span>}
                    <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", fontFamily: "var(--font-sora)", lineHeight: 1.2 }}>{blog.title}</h1>
                    <div style={{ color: "var(--muted)", marginBottom: "40px", fontSize: "0.9rem" }}>
                        Published on {new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                    
                    <div 
                        className="blog-content"
                        style={{ fontSize: "1.1rem", lineHeight: 1.7, color: "var(--text)" }}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                </article>
            </main>

            <footer style={{ marginTop: "60px", borderTop: "1px solid var(--line)" }}>
                <div className="footer-inner">
                    <div>
                        <div className="brand" style={{ marginBottom: 10 }}>
                            <img src="/logo-icon.png" alt="Premium Hub Nepal crest logo" className="brand-logo" /> Premium <span style={{ color: "var(--accent)" }}>Hub Nepal</span>
                        </div>
                        <p>Local pricing for the platforms you already use, made simple for Nepal.</p>
                    </div>
                </div>
            </footer>
            
            <style dangerouslySetInnerHTML={{__html: `
                .blog-content h2 { font-family: var(--font-sora); margin: 30px 0 15px 0; font-size: 1.6rem; }
                .blog-content h3 { font-family: var(--font-sora); margin: 25px 0 12px 0; font-size: 1.3rem; }
                .blog-content p { margin-bottom: 20px; }
                .blog-content ul, .blog-content ol { margin-bottom: 20px; padding-left: 20px; }
                .blog-content li { margin-bottom: 8px; }
                .blog-content a { color: var(--accent); text-decoration: underline; }
            `}} />
        </>
    );
}
