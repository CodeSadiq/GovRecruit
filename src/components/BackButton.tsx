'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackButton({ 
  className = "", 
  children 
}: { 
  className?: string; 
  children?: React.ReactNode;
}) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className={`bg-transparent border-none cursor-pointer p-0 m-0 inline-flex items-center ${className}`}
    >
      {children}
    </button>
  );
}
