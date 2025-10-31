import Football from '../assets/foot-ball.png';
import Basketball from '../assets/basketball.png';
import Tennis from '../assets/tennis.png';
import Fav from '../assets/star.png';

export const pickIconForSport = (name: string): string => {
  const k = name.toLowerCase();
  if (k.includes('foot') || k.includes('soccer')) return Football;
  if (k.includes('basket')) return Basketball;
  if (k.includes('tennis')) return Tennis;
  return Football;
};

export const isFootball = (name: string | undefined) => {
  if (!name) return false;
  const k = name.toLowerCase();
  return (
    k.includes('football') ||
    k.includes('soccer') ||
    k.includes('fudbal') ||
    k.includes('futbol') ||
    k.includes('premier')
  );
};

export const favIcon = Fav;
