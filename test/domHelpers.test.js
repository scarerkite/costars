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
  it('should create a container element', () => {
    const projects = [
      { title: "The King's Speech", media_type: "movie", year: "2010", id: 123, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.tagName, 'DIV');
  });

  it('should display movie title and year correctly', () => {
    const projects = [
      { title: "The King's Speech", media_type: "movie", year: "2010", id: 123, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
  
    const header = result.querySelector('h3');
    assert.strictEqual(header.textContent, 'Movies');
    
    const firstItem = result.querySelector('li');
    const title = firstItem.querySelector('.project-title').textContent;
    const info = firstItem.querySelector('.project-info').textContent;

    assert.strictEqual(title, 'The King\'s Speech');
    assert.strictEqual(info, '2010 • Movie');
  });

  it('should show "No collaborations found" when projects array is empty', () => {
    const projects = [];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.tagName, 'P');
    assert.strictEqual(result.textContent, 'No collaborations found');
  });

  it('should skip movies with missing title', () => {
    const projects = [
      { title: "Good Movie", media_type: "movie", year: "2023", id: 123, characters: ["Hero", "Villain"] },
      { title: null, media_type: "movie", year: "2023", id: 456, characters: ["Hero", "Villain"] },
      { title: "Another Good Movie", media_type: "tv", year: "2022", id: 789, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.querySelectorAll('li').length, 2); // Only 2 valid movies
  });

  it('should handle a movie with missing year', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: null, id: 123, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
    
    const firstItem = result.querySelector('li');
    const title = firstItem.querySelector('.project-title').textContent;
    const info = firstItem.querySelector('.project-info').textContent;

    assert.strictEqual(title, 'Some Movie');
    assert.strictEqual(info, 'Unknown • Movie');
  });

  it('should safely display movie titles with HTML characters', () => {
    const projects = [
      { title: "Movie with <script>alert('hack')</script>", media_type: "movie", year: "2023", id: 123, characters: ["Hero", "Villain"] }
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
      { title: "Good Movie", media_type: "movie", year: "2023", id: 123, characters: ["Hero", "Villain"] },
      { title: "Missing id", media_type: "movie", year: "2023", id: undefined, characters: ["Hero", "Villain"] },
    ];
    const result = buildResultsList(projects);
    
    assert.strictEqual(result.querySelectorAll('li').length, 1);
  });
});

describe('buildResultsList - with headers and grouping', () => {
  it('should group movies under "Movies" header', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: "2001", id: 123, characters: ["John Doe", "Jane Smith"] },
      { title: "Another Movie", media_type: "movie", year: "2004", id: 456, characters: ["JoJo Bloggs", "Janet Jackson"] }
    ];
    const result = buildResultsList(projects);
    
    const movieHeader = result.querySelector('h3');
    assert.strictEqual(movieHeader.textContent, 'Movies');
    
    const movieItems = result.querySelectorAll('li');
    assert.strictEqual(movieItems.length, 2);
  });

  it('should group TV shows under "TV" header when character is not Self', () => {
    const projects = [
      { title: "Some TV Show", media_type: "tv", year: "2008", id: 123, characters: ["Detective Smith", "Detective Roberts"] },
      { title: "Another TV Show", media_type: "tv", year: "2015", id: 456, characters: ["Dr. Jones", "Dr. White"] }
    ];
    const result = buildResultsList(projects);
    
    const tvHeader = result.querySelector('h3');
    assert.strictEqual(tvHeader.textContent, 'TV');
    
    const tvItems = result.querySelectorAll('li');
    assert.strictEqual(tvItems.length, 2);
  });

  it('should group TV appearances under "Appearances (as self)" header when character is Self', () => {
    const projects = [
      { title: "Some Talk Show", media_type: "tv", year: "2020", id: 123, characters: ["Self", "Self"] },
      { title: "Some Award Show", media_type: "tv", year: "2021", id: 456, characters: ["Self", "Self"] }
    ];
    const result = buildResultsList(projects);
    
    const appearanceHeader = result.querySelector('h3');
    assert.strictEqual(appearanceHeader.textContent, 'Appearances (as self)');
    
    const appearanceItems = result.querySelectorAll('li');
    assert.strictEqual(appearanceItems.length, 2);
  });

  it('should separate TV acting roles from TV appearances as self', () => {
    const projects = [
      { title: "Some TV Show", media_type: "tv", year: "2008", id: 123, characters: ["Detective Smith", "Detective Roberts"] },
      { title: "Some Talk Show", media_type: "tv", year: "2020", id: 456, characters: ["Self", "Self"] }
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    assert.ok(headerTexts.includes('TV'));
    assert.ok(headerTexts.includes('Appearances (as self)'));
    assert.strictEqual(headers.length, 2);
    
    const allItems = result.querySelectorAll('li');
    assert.strictEqual(allItems.length, 2);
  });

  it('should create multiple sections with headers when mixed media types exist', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: "2001", id: 123, characters: ["Hero", "Villain"]  },
      { title: "Some TV Show", media_type: "tv", year: "2008", id: 456, characters: ["Detective", "Villain"] },
      { title: "Some Talk Show", media_type: "tv", year: "2020", id: 789, characters: ["Self", "Self"] },
      { title: "Another Movie", media_type: "movie", year: "2004", id: 101, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    assert.strictEqual(headers.length, 3);
    
    const headerTexts = Array.from(headers).map(h => h.textContent);
    assert.ok(headerTexts.includes('Movies'));
    assert.ok(headerTexts.includes('TV'));
    assert.ok(headerTexts.includes('Appearances (as self)'));
    
    const allItems = result.querySelectorAll('li');
    assert.strictEqual(allItems.length, 4);
  });

  it('should not show TV header when only TV appearances as Self exist', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: "2001", id: 123, characters: ["Hero", "Villain"] },
      { title: "Some Talk Show", media_type: "tv", year: "2020", id: 456, characters: ["Self", "Self"] }
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    assert.ok(headerTexts.includes('Movies'));
    assert.ok(headerTexts.includes('Appearances (as self)'));
    assert.ok(!headerTexts.includes('TV'));
    assert.strictEqual(headers.length, 2);
  });

  it('should not show Appearances header when no Self appearances exist', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: "2001", id: 123, characters: ["Hero", "Villain"] },
      { title: "Some TV Show", media_type: "tv", year: "2008", id: 456, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    assert.ok(headerTexts.includes('Movies'));
    assert.ok(headerTexts.includes('TV'));
    assert.ok(!headerTexts.includes('Appearances (as self)'));
    assert.strictEqual(headers.length, 2);
  });

  it('should maintain proper order: Movies, TV, then Appearances', () => {
    const projects = [
      { title: "Some Talk Show", media_type: "tv", year: "2020", id: 789, characters: ["Self", "Self"] },
      { title: "Some TV Show", media_type: "tv", year: "2008", id: 456, characters: ["Hero", "Villain"] },
      { title: "Some Movie", media_type: "movie", year: "2001", id: 123, characters: ["Hero", "Villain"] }
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    assert.strictEqual(headerTexts[0], 'Movies');
    assert.strictEqual(headerTexts[1], 'TV');
    assert.strictEqual(headerTexts[2], 'Appearances (as self)');
  });

  it('should not show year for appearances as self', () => {
    const projects = [
      { title: "Some Talk Show", media_type: "tv", year: "2020", id: 123, characters: ["Self", "Self"] }
    ];
    const result = buildResultsList(projects);
    
    const firstItem = result.querySelector('li');
    const info = firstItem.querySelector('.project-info').textContent;
    
    assert.strictEqual(info, 'TV'); // No year shown for appearances
  });

  it('should handle projects without characters property gracefully', () => {
    const projects = [
      { title: "Some Movie", media_type: "movie", year: "2023", id: 123 }, // No characters
      { title: "Some TV Show", media_type: "tv", year: "2022", id: 456 }, // No characters
      { title: "Another Movie", media_type: "movie", year: "2021", id: 789, characters: ["Hero", "Villain"] } // Has characters
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    // Should create Movies and TV headers
    assert.ok(headerTexts.includes('Movies'));
    assert.ok(headerTexts.includes('TV'));
    assert.ok(!headerTexts.includes('Appearances (as self)')); // No appearances since no characters data
    assert.strictEqual(headers.length, 2);
    
    // Should have 3 items total
    const allItems = result.querySelectorAll('li');
    assert.strictEqual(allItems.length, 3);
  });

  it('should handle mixed projects with and without characters property', () => {
    const projects = [
      { title: "Movie With Characters", media_type: "movie", year: "2023", id: 123, characters: ["Hero", "Villain"] },
      { title: "Movie Without Characters", media_type: "movie", year: "2022", id: 456 }, // No characters
      { title: "TV Show Without Characters", media_type: "tv", year: "2021", id: 789 }, // No characters - should go to TV
      { title: "Talk Show", media_type: "tv", year: "2020", id: 101, characters: ["Self", "Self"] } // Should go to appearances
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    assert.strictEqual(headers.length, 3); // All three categories should be present
    
    const allItems = result.querySelectorAll('li');
    assert.strictEqual(allItems.length, 4);
  });

  it('should group TV appearances with Self variations under "Appearances (as self)" header', () => {
    const projects = [
      { title: "The Oscars", media_type: "tv", year: "2020", id: 123, characters: ["Self - Presenter", "Self - Guest"] },
      { title: "Some Talk Show", media_type: "tv", year: "2021", id: 456, characters: ["Self", "Self - Host"] },
      { title: "Award Show", media_type: "tv", year: "2022", id: 789, characters: ["Self - Guest", "Self"] }
    ];
    const result = buildResultsList(projects);
    
    const appearanceHeader = result.querySelector('h3');
    assert.strictEqual(appearanceHeader.textContent, 'Appearances (as self)');
    
    const appearanceItems = result.querySelectorAll('li');
    assert.strictEqual(appearanceItems.length, 3);
  });

  it('should not group mixed Self and character appearances as self', () => {
    const projects = [
      { title: "Some Show", media_type: "tv", year: "2020", id: 123, characters: ["Self - Host", "Detective Jones"] }, // Mixed
      { title: "Drama Show", media_type: "tv", year: "2021", id: 456, characters: ["Hero", "Villain"] } // Acting
    ];
    const result = buildResultsList(projects);
    
    const headers = result.querySelectorAll('h3');
    const headerTexts = Array.from(headers).map(h => h.textContent);
    
    assert.ok(headerTexts.includes('TV'));
    assert.ok(!headerTexts.includes('Appearances (as self)'));
    assert.strictEqual(headers.length, 1);
  });

  it('should handle edge cases with Self character variations', () => {
    const projects = [
      { title: "Talk Show", media_type: "tv", year: "2020", id: 123, characters: ["Self - Special Guest", "Self"] },
      { title: "News Show", media_type: "tv", year: "2021", id: 456, characters: ["Self - Interviewee", "Self - Correspondent"] }
    ];
    const result = buildResultsList(projects);
    
    const appearanceHeader = result.querySelector('h3');
    assert.strictEqual(appearanceHeader.textContent, 'Appearances (as self)');
    
    const appearanceItems = result.querySelectorAll('li');
    assert.strictEqual(appearanceItems.length, 2);
  });
});