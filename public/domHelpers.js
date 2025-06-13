export function buildResultsList(projects) {
  // projects is json

  const validProjects = projects.filter(project => 
    project.title && project.id
  );

  if (validProjects.length === 0) {
    const p = document.createElement('p');
    p.textContent = "No collaborations found";
    return p;
  }

  const groups = {
    movies: [],
    tv: [],
    appearances: []
  };

  validProjects.forEach(project => {
    if (project.media_type === "movie") {
      groups.movies.push(project);
    } else if (project.media_type === "tv") {
      if (project.characters && project.characters.every(char => char && char.startsWith("Self"))) {
        groups.appearances.push(project);
      } else {
        groups.tv.push(project);
      }
    }
  });
  
  const container = document.createElement('div');

  const groupConfig = [
    { key: 'movies', title: 'Movies', showYear: true },
    { key: 'tv', title: 'TV', showYear: true },
    { key: 'appearances', title: 'Appearances as self', showYear: false }
  ];

  groupConfig.forEach(({ key, title, showYear }) => {
    if (groups[key].length > 0) {
      // Add header
      const header = document.createElement('h3');
      header.textContent = title;
      container.appendChild(header);

      if (key === 'tv' || key === 'appearances') {
        const disclaimer = document.createElement('p');
        disclaimer.className = 'disclaimer';
        disclaimer.textContent = 'Note: May not have appeared in the same episodes';
        container.appendChild(disclaimer);
      }
        
      // Add list for this group
      const groupList = document.createElement('ul');
      
      groups[key].forEach(project => {
        let li = document.createElement("li");
        li.className = "project-card";
        
        const year = showYear && project.year ? project.year : (showYear ? "Unknown" : null);

        const media_type = project.media_type == "tv" ? "TV" : "Movie";
        const escapeHtml = (text) => {
          const div = document.createElement("div");
          div.textContent = text;
          return div.innerHTML;
        };

        const yearDisplay = year ? `${year} • ` : "";
        
        li.innerHTML = `
          <a target="_blank" href="https://www.themoviedb.org/${project.media_type}/${project.id}" class="card-link">
            <div class="project-title">${escapeHtml(project.title)}</div>
            <div class="project-info">${yearDisplay}${media_type}</div>
          </a>
        `;
        
        groupList.appendChild(li);
      });
      
      container.appendChild(groupList);
    }
  });

  return container;

}