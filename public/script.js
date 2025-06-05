console.log(">> in script.js")

const form = document.getElementById('actor-search');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const actor1Name = form.elements['actor1'].value;
  const actor2Name = form.elements['actor2'].value;

  console.log(`From JS - Actor1: ${actor1Name}`);
  console.log(`From JS - Actor2: ${actor2Name}`);

  const url = `/search-actors?actor1=${actor1Name}&actor2=${actor2Name}`;

  const response = await fetch(url);
  const json = await response.json();

  console.log('Results from server:', json);
});