export function findCommonCredits(actor1Credits, actor2Credits) {
  const actor2ProjectIds = new Set(actor2Credits.map(credit => credit.id));

  const sharedProjects = actor1Credits
    .filter(credit => actor2ProjectIds.has(credit.id))
    .map(credit => {
      const actor2Credit = actor2Credits.find(c => c.id === credit.id);
      return {
        id: credit.id,
        title: credit.title || credit.name,
        year: (credit.release_date || credit.first_air_date)?.split('-')[0],
        media_type: credit.media_type,
        characters: [credit.character, actor2Credit.character]
      };
    });

  // Returns common projects with character information
  // [
  //   { id: 123, title: "Shared Movie", year: "2023", media_type: "movie", characters: ["Hero", "Villain"] },
  //   { id: 789, title: "Shared TV Show", year: "2022", media_type: "tv", characters: ["Detective", "Doctor"] },
  //   { id: 456, title: "Talk Show", year: "2021", media_type: "tv", characters: ["Self", "Self"] }
  // ]
  
  return sharedProjects;
}