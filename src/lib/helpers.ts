const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].substring(0,3)} ${d.getFullYear()}`;
}

export function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${String(d.getDate()).padStart(2,"0")} ${MONTHS[d.getMonth()].substring(0,3)} ${d.getFullYear()}`;
}

export function fmtMoney(n: number | null, currency = "INR"): string {
  if (n === null || n === undefined) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function daysFromNow(iso: string | null): number | null {
  if (!iso) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
  if (isNaN(d.getTime())) return null;
  return Math.floor((d.getTime() - today.getTime()) / 86400000);
}

export const LEVEL_LABEL: Record<number, string> = {
  1: "10th / Matriculation",
  2: "12th / Intermediate",
  3: "Diploma / ITI / Certificate",
  4: "Graduate (Bachelor's Degree)",
  5: "Post Graduate (Master's Degree)",
  6: "PhD / Doctorate",
};

export function getTimeAgo(date: string | Date | null): string {
  if (!date) return 'RECENT';
  const now = new Date();
  const past = new Date(date);
  const diffInMs = now.getTime() - past.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  
  if (diffInSecs < 60) return 'RECENT';
  const diffInMins = Math.floor(diffInSecs / 60);
  if (diffInMins < 60) return `${diffInMins} MINS AGO`;
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'HOUR' : 'HOURS'} AGO`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} ${diffInDays === 1 ? 'DAY' : 'DAYS'} AGO`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? 'MONTH' : 'MONTHS'} AGO`;
}
