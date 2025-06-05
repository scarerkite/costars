import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findCommonCredits } from '../movieMatcher.js';

describe('findCommonCredits', () => {
  it('should return an array', async () => {
    const actor1Credits = [
      { id: 123,
        title: "Some Movie",
        character: "Main Character",
        media_type: "movie",
        release_date: "2023-01-01"
      }
    ];

    const actor2Credits = [];
    
    const result = await findCommonCredits(actor1Credits, actor2Credits);
    assert.ok(Array.isArray(result))
  })

  it('should return matching projects when actors share credits', async () => {
    const actor1Credits = [
      {
        id: 123,
        title: "Shared Movie",
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
    ]

    const actor2Credits = [
      {
        id: 123,
        title: "Shared Movie",
        character: "Supporting Character",
        media_type: "movie",
        release_date: "2023-01-01"
      },
      {
        id: 789,
        name: "Some Other TV Show", 
        character: "Recurring Character",
        media_type: "tv",
        first_air_date: "2020-05-15"
      }
    ]  


    const result = await findCommonCredits(actor1Credits, actor2Credits);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 123);
    assert.strictEqual(result[0].title, "Shared Movie");
  });

  it('should return projects with correct data structure', () => {
    const actor1Credits = [
      {
        id: 123,
        title: "Shared Movie",
        character: "Main Character",
        media_type: "movie",
        release_date: "2023-01-01"
      },
      {
        id: 456,
        name: "Shared TV Show", 
        character: "Guest Star",
        media_type: "tv",
        first_air_date: "2022-05-15"
      }
    ]

    const actor2Credits = [
      {
        id: 123,
        title: "Shared Movie",
        character: "Supporting Character",
        media_type: "movie",
        release_date: "2023-01-01"
      },
      {
        id: 456,
        name: "Shared TV Show", 
        character: "Recurring Star",
        media_type: "tv",
        first_air_date: "2022-05-15"
      }
    ]

    const expectedResult = [
      { id: 123, title: "Shared Movie", year: "2023", media_type: "movie" },
      { id: 456, title: "Shared TV Show", year: "2022", media_type: "tv" }
    ];

    const result = findCommonCredits(actor1Credits, actor2Credits);

    const sortById = (a, b) => a.id - b.id;

    assert.deepEqual(result.sort(sortById), expectedResult.sort(sortById));
  });


  it('should return empty array when no common credits exist', async () => {
    const actor1Credits = [
      { id: 123,
        title: "Some Movie",
        character: "Main Character",
        media_type: "movie",
        release_date: "2023-01-01"
      }
    ];
    
    const actor2Credits = [
      {
        id: 456,
        name: "Some TV Show", 
        character: "Guest Star",
        media_type: "tv",
        first_air_date: "2022-05-15"
      }
    ];

    const result = await findCommonCredits(actor1Credits, actor2Credits);
    assert.strictEqual(result.length, 0);
  });
})


// describe('findCommonCredits', () => {
//   it('should return a list of matching projects and relevant details if there are any', async () => {
//     const mockResponseActor1 = [
//       {
//         id: 123,
//         title: "Some Movie",
//         character: "Main Character",
//         media_type: "movie",
//         release_date: "2023-01-01"
//       },
//       {
//         id: 456,
//         name: "Some TV Show", 
//         character: "Guest Star",
//         media_type: "tv",
//         first_air_date: "2022-05-15"
//       }
//     ]

//     const mockResponseActor2 = [
//       {
//         id: 123,
//         title: "Some Movie",
//         character: "Supporting Character",
//         media_type: "movie",
//         release_date: "2023-01-01"
//       },
//       {
//         id: 789,
//         name: "Some Other TV Show", 
//         character: "Recurring Character",
//         media_type: "tv",
//         first_air_date: "2020-05-15"
//       }
//     ]

//     const mockGetActorCredits = mock.fn();
//     mockGetActorCredits.mock.mockImplementationOnce(() => mockResponseActor1);
//     mockGetActorCredits.mock.mockImplementationOnce(() => mockResponseActor2);

//     const result = await findCommonCredits(123, 456)

//     assert.strictEqual(result.length, 1);
//     assert.strictEqual(result[0].id, 123);
//   })

//   it('should return "No matching projects" if there are no matches')
//   it('should return an error if the actor ID is incorrect')
// })