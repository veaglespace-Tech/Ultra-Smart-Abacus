import Image from "next/image";

export default function demo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/images/demo.png"
        alt="Smart Abacus System"
        width={60}
        height={60}
        priority
      />

      
    </div>
  );
}