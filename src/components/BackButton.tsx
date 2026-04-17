'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackButton({
  className = "",
  children,
  href
}: {
  className?: string;
  children?: React.ReactNode;
  href?: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href) {
      router.push(href);
      // Ensure the target page refreshes its auth state
      setTimeout(() => router.refresh(), 50);
    } else {
      router.back();
      setTimeout(() => router.refresh(), 50);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`bg-transparent border-none cursor-pointer p-0 m-0 inline-flex items-center ${className}`}
    >
      {children}
    </button>
  );
}
