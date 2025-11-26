export const costs = {
  flux1: 6,
  flux2: 6,
};

export const variantCosts = {
  flux1: 8,
  flux2: 8,
};

export const get_model_cost = (model: string) => {
  return costs[model as keyof typeof costs] || 6;
};

export const get_variant_cost = (model: string) => {
  return variantCosts[model as keyof typeof variantCosts] || 8;
};
