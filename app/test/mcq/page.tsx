import MCQQuiz from "@/app/ui/MCQQuiz";

interface PageProps {
  searchParams: Promise<{
    topic?: string;
  }>;
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const topic = params.topic || "General Knowledge";
  
  return <MCQQuiz topic={topic} />;
}