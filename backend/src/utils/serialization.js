export const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

export const serializeArtisan = (artisan) => ({
  ...artisan,
  hourlyRate: toNumber(artisan.hourlyRate),
});

export const serializeRequest = (request, viewer) => {
  const serialized = { ...request, budget: toNumber(request.budget) };

  const isLinkedParty = viewer?.role === 'ADMIN'
    || request.customerId === viewer?.id
    || (viewer?.artisanId && request.artisanId === viewer.artisanId);

  if (!isLinkedParty && serialized.customer) {
    serialized.customer = { ...serialized.customer, phone: null, email: null };
  }

  return serialized;
};
