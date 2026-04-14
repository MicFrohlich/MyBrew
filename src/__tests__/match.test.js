import { describe, it, expect } from 'vitest';
import { matchScore } from '../lib/match.js';

const bean = {
  acidity: 8, body: 4, sweetness: 7, fruitiness: 9,
  intensity: 5, aroma: 9, finish: 8,
  flavors: ['Bergamot','Lemon','Jasmine']
};

describe('matchScore', () => {
  it('returns 75 when taste profile is empty', () => {
    expect(matchScore({ level: 'casual', sliders: {}, flavors: [] }, bean)).toBe(75);
  });

  it('scores high when sliders match bean exactly (casual)', () => {
    const profile = { level: 'casual', sliders: { sweet: 70, strength: 50 }, flavors: [] };
    expect(matchScore(profile, bean)).toBeGreaterThanOrEqual(90);
  });

  it('boosts score when flavors overlap', () => {
    const withoutFlavors = matchScore({ level: 'exploring', sliders: { acidity: 30, body: 30 }, flavors: [] }, bean);
    const withFlavors = matchScore({ level: 'exploring', sliders: { acidity: 30, body: 30 }, flavors: ['Jasmine','Lemon'] }, bean);
    expect(withFlavors).toBeGreaterThan(withoutFlavors);
  });

  it('returns a rounded integer between 0 and 100', () => {
    const score = matchScore({ level: 'exploring', sliders: { acidity: 50, body: 50 }, flavors: ['Chocolate'] }, bean);
    expect(Number.isInteger(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});
