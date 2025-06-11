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
    
  const projectList = document.createElement('ul')

  validProjects.forEach(project => {
    let li = document.createElement("li");
    li.className = "project-card";
    
    const year = project.year ? project.year : "Unknown";
    const media_type = project.media_type == "tv" ? "TV" : "Movie";
    const escapeHtml = (text) => {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    };

    li.innerHTML = `
      <a href="https://www.themoviedb.org/${project.media_type}/${project.id}" class="card-link">
        <div class="project-title">${escapeHtml(project.title)}</div>
        <div class="project-info">${year} • ${media_type}</div>
      </a>
    `;
    
    projectList.appendChild(li);
  });

  return projectList;
}