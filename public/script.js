import { buildResultsList } from './domHelpers.js';

const form = document.getElementById('actor-search');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const actor1Name = form.elements['actor1'].value;
  const actor2Name = form.elements['actor2'].value;

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;

  submitButton.disabled = true;
  submitButton.textContent = 'Searching...';

  try {
    const url = `/search-actors?actor1=${actor1Name}&actor2=${actor2Name}`;
  
    const response = await fetch(url);
    const json = await response.json();
  
    const resultsDiv = document.getElementById('results')
    // Clear previous results if any
    resultsDiv.innerHTML = '';
    resultsDiv.classList.remove("show");

    // Add visible results box
    resultsDiv.classList.add("show");
  
    if (json.error) {
      const errorP = document.createElement('p');
      errorP.textContent = json.error;
      errorP.style.color = 'red';
      resultsDiv.appendChild(errorP);
    } else {
      const projectList = buildResultsList(json);
      resultsDiv.appendChild(projectList);
    }
  } catch (error) {
    console.error('Network error:', error);
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    const errorP = document.createElement('p');
    errorP.textContent = 'Network error. Please try again.';
    errorP.style.color = 'red';
    resultsDiv.appendChild(errorP);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});