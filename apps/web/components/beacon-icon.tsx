import Link from "next/link";
import React from "react";

interface BeaconIconProps {
  size?: number;
  asLink?: boolean;
  showText?: boolean;
  className?: string;
}

const BeaconIcon: React.FC<BeaconIconProps> = ({
  size = 24,
  asLink = false,
  showText = false,
  className = "",
}) => {
  const iconElement = (
    <>
      <svg
        className="beacon-icon"
        viewBox="0 0 317.87 317.87"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        style={{ width: size, height: size }}
      >
        <title>Beacon</title>
        <path
          className="beacon-path"
          d="M12.44,220.68l216.27,81.09c-21.06,10.31-44.74,16.09-69.76,16.09-65.88,0-122.4-40.08-146.5-97.19Z"
          fill="var(--beacon-fill)"
        />
        <path
          className="beacon-path"
          d="M317.87,158.94c0,50.49-23.55,95.48-60.25,124.59-1.38-2.73-3.67-5.21-7.02-7.12L1.81,183c-1.19-7.86-1.81-15.89-1.81-24.06,0-3.35.1-6.67.31-9.97l253.85-80.73c11.12-13.29,2.77-29.55-15.15-26.92L6.46,113.95C25.86,48.09,86.78,0,158.94,0c87.78,0,158.93,71.15,158.93,158.94Z"
          fill="var(--beacon-fill)"
        />
      </svg>
      {showText && <span className="text-xl font-bold">Beacon</span>}
    </>
  );

  if (asLink) {
    return (
      <Link href="/" className={`flex items-center gap-1 ${className}`}>
        {iconElement}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>{iconElement}</div>
  );
};

export default BeaconIcon;
