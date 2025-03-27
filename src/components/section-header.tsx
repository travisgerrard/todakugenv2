'use client';

interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
  );
} 