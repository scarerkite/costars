import 'dotenv/config';
import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it } from 'node:test';
import { callApi, getActorData, getActorCredits } from '../apiClient.js';
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from 'undici';

let mockAgent;
let originalDispatcher;

beforeEach(() => {
  originalDispatcher = getGlobalDispatcher();

  mockAgent = new MockAgent();

  setGlobalDispatcher(mockAgent);
});

afterEach(() => {
  setGlobalDispatcher(originalDispatcher);
});

describe('callApi', () => {
  it('should return successful JSON response', async () => {
    const testUrl = 'https://api.themoviedb.org/3/search/person?query=test';
    const testOptions = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer fake-token'
      }
    };

    const mockResponse = { results: [{ name: "Test" }] };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=test',
      method: 'GET'
    }).reply(200, mockResponse);

    const result = await callApi(testUrl, testOptions);
    
    assert.deepEqual(result, mockResponse);
  });

  it('should throw error on 404 response', async () => {
    const testUrl = 'https://api.themoviedb.org/3/search/person?query=test';
    const testOptions = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer fake-token'
      }
    };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=test',
      method: 'GET'
    }).reply(404, {});

    await assert.rejects(
      () => callApi(testUrl, testOptions),
      /Response status: 404/
    );
  });

  it('should throw error on 500 response', async () => {
    const testUrl = 'https://api.themoviedb.org/3/search/person?query=test';
    const testOptions = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer fake-token'
      }
    };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=test',
      method: 'GET'
    }).reply(500, {});

    await assert.rejects(
      () => callApi(testUrl, testOptions),
      /Response status: 500/
    );
  });

  it('should handle network timeouts', async () => {
    const testUrl = 'https://api.themoviedb.org/3/search/person?query=test';
    const testOptions = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer fake-token'
      }
    };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=test',
      method: 'GET'
    }).replyWithError(new Error('network timeout'));

    await assert.rejects(
      () => callApi(testUrl, testOptions),
      /fetch failed/
    );
  });

  it('should handle malformed JSON', async () => {
    const testUrl = 'https://api.themoviedb.org/3/search/person?query=test';
    const testOptions = {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': 'Bearer fake-token'
      }
    };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=test',
      method: 'GET'
    }).reply(200, 'invalid json content', {
      headers: { 'content-type': 'application/json' }
    });

    await assert.rejects(
      () => callApi(testUrl, testOptions),
      /Unexpected token/
    );
  });
});

describe('getActorData', () => {
  it('should form the correct URL', async () => {
    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=Famous%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { results: [] });

    await getActorData("Famous Actor");

    assert.ok(true);
  });


  it('should return actor results on successful response', async () => {
    const mockResponse = {
      page: 1,
      results: [
        {
          id: 101,
          name: "Meera Syal",
          known_for_department: "Acting"
        }
      ],
      total_pages: 1,
      total_results: 1
    };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=Meera%20Syal&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, mockResponse);

    const result = await getActorData("Meera Syal");

    assert.deepEqual(result, mockResponse.results);
  });
});

describe ('getActorCredits', () => {
  it('should return actor credits for a valid actor ID', async () => {
    const mockResponse = {
      cast: [
        {
          id: 123,
          title: "Some Movie",
          character: "Main Character",
          media_type: "movie",
          release_date: "2023-01-01"
        },
        {
          id: 456,
          name: "Some TV Show", 
          character: "Guest Star",
          media_type: "tv",
          first_air_date: "2022-05-15"
        }
      ],
      crew: []
    };

    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/person/12345/combined_credits?language=en-US',
      method: 'GET'
    }).reply(200, mockResponse);

    const result = await getActorCredits(12345);
    
    assert.deepEqual(result, mockResponse.cast);
  });
});