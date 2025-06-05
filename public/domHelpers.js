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
    let li = document.createElement('li')
    const year = project.year ? `, ${project.year}` : "";
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    li.innerHTML = `<a href="...">${escapeHtml(project.title)}</a> (${project.media_type})${year}`;
    projectList.appendChild(li)
  })

  return projectList;
}