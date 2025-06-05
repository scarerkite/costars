import assert from 'node:assert/strict';
import { describe, it, beforeEach } from 'node:test';
import { JSDOM } from 'jsdom';
import { buildResultsList } from '../public/domHelpers.js';

// Set up fake DOM before each test
beforeEach(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.document = dom.window.document;
  global.window = dom.window;
});

describe('buildResultsList', () => {
  it('should create a ul element', () => {
    const projects = [
      { title: "The King's Speech", media_type: "movie", year: "2010", id: 123 }
    ];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.tagName, 'UL');
  });

  it('should display movie title and year correctly', () => {
    const projects = [
      { title: "The King's Speech", media_type: "movie", year: "2010", id: 123 }
    ];
    const result = buildResultsList(projects);
    
    const firstItem = result.querySelector('li');

    assert.strictEqual(firstItem.textContent, 'The King\'s Speech (movie), 2010');
  });

  it('should show "No collaborations found" when projects array is empty', () => {
    const projects = [];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.tagName, 'P');
    assert.strictEqual(result.textContent, 'No collaborations found');
  });

  it('should skip movies with missing title', () => {
    const projects = [
      { title: "Good Movie", media_type: "movie", year: "2023", id: 123 },
      { title: null, media_type: "movie", year: "2023", id: 456 },
      { title: "Another Good Movie", media_type: "tv", year: "2022", id: 789 }
    ];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.children.length, 2); // Only 2 valid movies
  });

  it('should handle a movie with missing year', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: null, id: 123 }
    ];
    const result = buildResultsList(projects);
    const firstItem = result.querySelector('li');
    assert.strictEqual(firstItem.textContent, 'Some Movie (movie)');
  });

  it('should safely display movie titles with HTML characters', () => {
    const projects = [
      { title: "Movie with <script>alert('hack')</script>", media_type: "movie", year: "2023", id: 123 }
    ];
    const result = buildResultsList(projects);
    const firstItem = result.querySelector('li');

    const scriptTags = result.querySelectorAll('script');

    assert.ok(firstItem.textContent.includes('<script>'));
    assert.ok(firstItem.textContent.includes('Movie with'));
    
    // Make sure no actual script tags were created in the DOM
    assert.strictEqual(result.querySelectorAll('script').length, 0);
  });

  it('should skip movies with missing ID', () => {
    const projects = [
      { title: "Good Movie", media_type: "movie", year: "2023", id: 123 },
      { title: "Missing id", media_type: "movie", year: "2023", id: undefined },
    ];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.children.length, 1);
  });
});