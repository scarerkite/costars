export function findCommonCredits(actor1Credits, actor2Credits) {
  const actor2ProjectIds = new Set(actor2Credits.map(credit => credit.id));

  // Returns common projects
  // [
  //   { id: 123, title: "Shared Movie", year: "2023", media_type: "movie" },
  //   { id: 789, title: "Shared TV Show", year: "2022", media_type: "tv" }
  // ]
  
  return actor1Credits
    .filter(credit => actor2ProjectIds.has(credit.id))
    .map(credit => ({
      id: credit.id,
      title: credit.title || credit.name,
      year: (credit.release_date || credit.first_air_date)?.split('-')[0],
      media_type: credit.media_type
    }));
}