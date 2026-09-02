export const decimalToNumber = (value) => {
  return Number(value?.toString() ?? 0);
};

export const decimalToString = (value) => {
  return value?.toString() ?? '0';
};