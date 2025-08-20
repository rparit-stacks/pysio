import Image from "next/image";
import Link from "next/link";

const resources = [
  {
    id: 1,
    title: "5 Stretches to Relieve Back Pain",
    description:
      "Simple daily stretches you can do at home to improve posture and reduce back discomfort.",
    image: "/backpain.webp",
    category: "Exercise & Mobility",
    date: "August 12, 2025",
    slug: "stretches-for-back-pain",
  },
  {
    id: 2,
    title: "Nutrition Tips for Faster Injury Recovery",
    description:
      "Learn which foods and nutrients can speed up your body’s natural healing process.",
    image: "/recovery.webp",
    category: "Nutrition",
    date: "August 8, 2025",
    slug: "nutrition-for-injury-recovery",
  },
  {
    id: 3,
    title: "Preventing Sports Injuries",
    description:
      "Practical warm-up, technique, and recovery tips to keep you active and injury-free.",
    image: "/sportsinjury.webp",
    category: "Sports & Fitness",
    date: "August 5, 2025",
    slug: "preventing-sports-injuries",
  },
];

export default function HealthResourcesPage() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-2">Health Resources</h1>
        <p className="text-gray-600 mb-8">
          Explore expert advice, guides, and tools to help you stay healthy and recover faster.
        </p>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-4 flex flex-col"
            >
              <div className="relative h-48 w-full mb-4">
                <Image
                  src={resource.image}
                  alt={resource.title}
                  fill
                  className="object-cover rounded-xl"
                />
              </div>

              <span className="text-sm text-blue-600 font-medium">
                {resource.category}
              </span>
              <h2 className="text-lg font-semibold mt-1">{resource.title}</h2>
              <p className="text-gray-600 text-sm flex-grow mt-1">
                {resource.description}
              </p>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">{resource.date}</span>
                <Link
                  href={`/health-resources/${resource.slug}`}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Read more →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
