import React from "react";

interface BeaconIconProps {
  size?: number; // default: 64
  fill?: string; // background color (default: white)
  stroke?: string; // rays + center color (default: black)
}

const BeaconIcon: React.FC<BeaconIconProps> = ({
  size = 24,
  fill = "#FFFFFF",
  stroke = "#000000",
}) => {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      height={size}
      width={size}
    >
      <title>Beacon</title>
      {/* Background */}
      <circle cx="12" cy="12" r="12" fill={fill} />
      {/* Beacon light center */}
      <circle cx="12" cy="12" r="3" fill={stroke} />
      {/* Straight rays */}
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Diagonal rays */}
      <path
        d="M5 5l2.5 2.5M19 19l-2.5-2.5M5 19l2.5-2.5M19 5l-2.5 2.5"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default BeaconIcon;
