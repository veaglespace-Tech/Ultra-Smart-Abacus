import Image from "next/image";

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/images/logo.png"
        alt="Smart Abacus System"
        width={60}
        height={60}
        priority
      />

      
    </div>
  );
}