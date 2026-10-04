import Image from "next/image";

export function BrandMark({
  className,
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/icons/waybridge-icon.svg"
      alt=""
      width={size}
      height={size}
      className={className}
    />
  );
}
