export const toNumber = (value) => (value === null || value === undefined ? null : Number(value));

export const serializeArtisan = (artisan) => ({
  ...artisan,
  hourlyRate: toNumber(artisan.hourlyRate),
});

export const serializeRequest = (request) => ({
  ...request,
  budget: toNumber(request.budget),
});
