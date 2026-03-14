import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export function formatCount(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}
