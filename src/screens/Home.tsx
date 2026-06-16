'use client';

import HeroBanner from '@/components/home/HeroBanner';
import MonetizationCarousel from '@/components/home/MonetizationCarousel';
import CarGrid from '@/components/home/CarGrid';

export default function Home() {
  return (
    <div className="page-enter">
      <HeroBanner />
      <MonetizationCarousel />
      <CarGrid />
    </div>
  );
}
