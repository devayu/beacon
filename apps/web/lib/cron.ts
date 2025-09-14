import { fr } from "date-fns/locale";

export const generateCron = (
  frequency: string,
  time: string,
  dayOfWeek?: string,
  dayOfMonth?: string
): string => {
  const [hours, minutes] = time.split(":").map(Number);

  switch (frequency) {
    case "daily":
      return `${minutes} ${hours} * * *`;
    case "weekly":
      const day = dayOfWeek || "1";
      return `${minutes} ${hours} * * ${day}`;
    case "monthly":
      const monthDay = dayOfMonth || "1";
      return `${minutes} ${hours} ${monthDay} * *`;
    default:
      return `${minutes} ${hours} * * *`;
  }
};

export const parseCron = (cronExpression: string) => {
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) return null;

  const [minute, hour, day, month, dayOfWeek] = parts;

  const time = `${hour?.padStart(2, "0")}:${minute?.padStart(2, "0")}`;

  if (dayOfWeek !== "*") {
    return { frequency: "weekly", time, dayOfWeek };
  } else if (day !== "*") {
    return { frequency: "monthly", time, dayOfMonth: day };
  } else {
    return { frequency: "daily", time };
  }
};

export const cronDescription = (
  frequency: string,
  config: { time: string; dayOfWeek?: string; dayOfMonth?: string }
) => {
  const { time, dayOfWeek, dayOfMonth } = config;
  switch (frequency) {
    case "daily":
      return `Runs daily at ${time}`;
    case "weekly":
      return `Runs every ${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][parseInt(dayOfWeek ?? "0")]} at ${time}`;
    case "monthly":
      return `Runs on the ${dayOfMonth}${getDaySuffix(parseInt(dayOfMonth ?? "0"))} of each month at ${time}`;
  }
};

export const getDaySuffix = (day: number) => {
  if (day >= 11 && day <= 13) {
    return "th";
  }
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};
