import { formatInTimeZone } from "date-fns-tz";

export const formatToIST = (date: Date | string | number, pattern: string = "dd MMM yyyy, hh:mm a") => {
  return formatInTimeZone(date, "Asia/Kolkata", pattern);
};
