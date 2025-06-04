export async function getActorData(actor_name) {
  const encoded_actor_name = encodeURIComponent(actor_name.trim());
  const base_url = process.env.TMDB_BASE_URL;
  const url = base_url + "/search/person?query=" + encoded_actor_name + "&include_adult=false&language=en-US&page=1"

  const options = {
    method: 'GET',
    headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + process.env.TMDB_BEARER_TOKEN
    },
  }

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    console.log(json);
  } catch (error) {
    console.error(error.message);
  }
}