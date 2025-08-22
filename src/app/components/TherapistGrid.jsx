"use client"
import TherapistCard from "./TherapistCard"

export default function TherapistGrid({ therapists }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
        {therapists?.map((therapist, index) => (
          <div
            key={therapist.id || index}
            className="animate-in fade-in slide-in-from-bottom duration-500"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <TherapistCard therapist={therapist} />
          </div>
        ))}
      </div>
    </div>
  )
}
