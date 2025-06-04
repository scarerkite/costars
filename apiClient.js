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

  const response = await callApi(url, options);
  return response.results;
}

export async function getActorCredits(actor_id) {
  const base_url = process.env.TMDB_BASE_URL;
  const url = base_url + `/person/${actor_id}/combined_credits?language=en-US`

  const options = {
    method: 'GET',
    headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer ' + process.env.TMDB_BEARER_TOKEN
    },
  }

  const response = await callApi(url, options);
  return response.cast;
}

export async function callApi(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}