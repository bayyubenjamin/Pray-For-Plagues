import SectionTitle from "@/components/SectionTitle";
import WaitlistForm from "@/components/WaitlistForm";
import ScrollReveal from "@/components/ScrollReveal";

export default function WaitlistPage() {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-16 flex flex-col items-center">
      <ScrollReveal>
        <SectionTitle title="WAITLIST" subtitle="SECURE YOUR PLACE BEFORE THE OUTBREAK." />
      </ScrollReveal>
      <ScrollReveal className="w-full mt-12" delay={150}>
        <WaitlistForm />
      </ScrollReveal>
    </div>
  );
}
