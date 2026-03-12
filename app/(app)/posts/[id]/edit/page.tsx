import { createClient } from "@supabase/supabase-js";
import PostEditor from "@/app/components/PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await db.from("posts").select("*").eq("id", id).single();
  if (!data) notFound();

  return (
    <PostEditor
      postId={id}
      initial={{
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        keywords: data.keywords ?? "",
        published: data.published,
      }}
    />
  );
}
