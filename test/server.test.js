import 'dotenv/config';
import assert from 'node:assert/strict';
import { beforeEach, afterEach, describe, it } from 'node:test';
import request from 'supertest';
import { MockAgent, setGlobalDispatcher, getGlobalDispatcher } from 'undici';
import express from 'express';
import { getActorData, getActorCredits } from '../apiClient.js';
import { findCommonCredits } from '../movieMatcher.js';

import app from '../server.js';

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

describe('GET /search-actors', () => {
  it('should return error when actor1 is not found', async () => {
    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=Unknown%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { results: [] });

    mockPool.intercept({
      path: '/3/search/person?query=Famous%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, {
      results: [{ id: 31, name: 'Famous Actor'}]
    })

    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: 'Unknown Actor', actor2: 'Famous Actor' });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.error, "Actor 'Unknown Actor' not found");
  });

  it('should return error when actor2 is not found', async () => {
    const mockPool = mockAgent.get('https://api.themoviedb.org');
    
    mockPool.intercept({
      path: '/3/search/person?query=Famous%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { 
      results: [{ id: 31, name: "Famous Actor" }] 
    });
    
    mockPool.intercept({
      path: '/3/search/person?query=Unknown%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { results: [] });

    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: 'Famous Actor', actor2: 'Unknown Actor' });

    assert.strictEqual(response.status, 200);
    assert.strictEqual(response.body.error, "Actor 'Unknown Actor' not found");
  });

  it('should return 500 when the API fails', async () => {
    const mockPool = mockAgent.get('https://api.themoviedb.org');
    mockPool.intercept({
      path: '/3/search/person?query=Famous%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).replyWithError(new Error('API unavailable'));

    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: 'Famous Actor', actor2: 'Up and Coming' });

    assert.strictEqual(response.status, 500);
    assert.strictEqual(response.body.error, 'Internal server error');
  });

  it('should return common credits when both actors are found', async () => {
    const mockPool = mockAgent.get('https://api.themoviedb.org');
    
    // Mock actor search responses
    mockPool.intercept({
      path: '/3/search/person?query=Famous%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { 
      results: [{ id: 101, name: "Famous Actor" }] 
    });
    
    mockPool.intercept({
      path: '/3/search/person?query=Another%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { 
      results: [{ id: 102, name: "Another Actor" }] 
    });

    // Mock credits responses
    mockPool.intercept({
      path: '/3/person/101/combined_credits?language=en-US',
      method: 'GET'
    }).reply(200, {
      cast: [
        { id: 201, title: "Shared Action Movie", media_type: "movie", release_date: "2022-06-15" },
        { id: 202, title: "Solo Drama Film", media_type: "movie", release_date: "2021-03-10" }
      ]
    });
    
    mockPool.intercept({
      path: '/3/person/102/combined_credits?language=en-US',
      method: 'GET'
    }).reply(200, {
      cast: [
        { id: 201, title: "Shared Action Movie", media_type: "movie", release_date: "2022-06-15" },
        { id: 203, name: "Different TV Show", media_type: "tv", first_air_date: "2020-09-01" }
      ]
    });

    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: 'Famous Actor', actor2: 'Another Actor' });

    assert.strictEqual(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.strictEqual(response.body.length, 1);
    assert.strictEqual(response.body[0].title, "Shared Action Movie");
    assert.strictEqual(response.body[0].year, "2022");
  });
})

describe('Input validation', () => {
  it('should handle missing actor1 parameter', async () => {
    const response = await request(app)
      .get('/search-actors')
      .query({ actor2: 'Famous Actor' });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, '2 actors are required')
  })

  it('should handle missing actor2 parameter', async () => {
    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: 'Famous Actor' });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, '2 actors are required');
  });

  it('should handle missing both parameters', async () => {
    const response = await request(app)
      .get('/search-actors'); // no query params at all

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, '2 actors are required');
  });

  it('should handle empty string for actor1', async () => {
    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: '', actor2: 'Famous Actor' });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Actor names cannot be empty');
  });

  it('should handle empty string for actor2', async () => {
    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: 'Famous Actor', actor2: '' });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Actor names cannot be empty');
  });

  it('should handle whitespace-only actor names', async () => {
    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: '   ', actor2: 'Famous Actor' });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Actor names cannot be empty');
  });

  it('should handle very long actor names', async () => {
    const veryLongName = 'A'.repeat(1000);
    
    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: veryLongName, actor2: 'Famous Actor' });

    assert.strictEqual(response.status, 400);
    assert.strictEqual(response.body.error, 'Actor names must be less than 100 characters');
  });

  it('should handle potentially malicious input', async () => {
    const maliciousInput = "<script>alert('xss')</script>";
    
    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: maliciousInput, actor2: 'Famous Actor' });

    assert.ok(response.status === 400 || response.status === 200);
  });

  it('should trim whitespace from actor names', async () => {
    const mockPool = mockAgent.get('https://api.themoviedb.org');
    
    mockPool.intercept({
      path: '/3/search/person?query=Famous%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { 
      results: [{ id: 101, name: "Famous Actor" }] 
    });
    
    mockPool.intercept({
      path: '/3/search/person?query=Another%20Actor&include_adult=false&language=en-US&page=1',
      method: 'GET'
    }).reply(200, { 
      results: [{ id: 102, name: "Another Actor" }] 
    });

    mockPool.intercept({
      path: '/3/person/101/combined_credits?language=en-US',
      method: 'GET'
    }).reply(200, { cast: [] });
    
    mockPool.intercept({
      path: '/3/person/102/combined_credits?language=en-US',
      method: 'GET'
    }).reply(200, { cast: [] });

    const response = await request(app)
      .get('/search-actors')
      .query({ actor1: '  Famous Actor  ', actor2: '  Another Actor  ' });

    assert.strictEqual(response.status, 200);
  });
});