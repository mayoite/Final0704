export function centimetersToMeters(valueCm: number) {
  return valueCm / 100;
}

export function centimetersToFeet(valueCm: number) {
  return valueCm / 30.48;
}

export function squareMetersToSquareFeet(valueSqM: number) {
  return valueSqM * 10.7639;
}

export function formatLengthPair(valueCm: number, digits = 1) {
  return `${centimetersToMeters(valueCm).toFixed(digits)} m / ${centimetersToFeet(valueCm).toFixed(digits)} ft`;
}

export function formatAreaPair(valueSqM: number, digits = 1) {
  return `${valueSqM.toFixed(digits)} m2 / ${squareMetersToSquareFeet(valueSqM).toFixed(digits)} ft2`;
}
