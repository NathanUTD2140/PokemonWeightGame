/*
    Calls pokeAPI, first we start with a base link as the pokeapi give to us
    Then we try and get an id based off a number later. Basic error handling
    We get the data as a json object, and return the id, name, weight, and sprite data
*/

const POKEAPI_BASE = 'https://pokeapi.co/api/v2/pokemon';

export async function fetchPokemon(idOrName) {
  const res = await fetch(`${POKEAPI_BASE}/${idOrName}/`);

  if (!res.ok) {
    throw new Error(`Failed to fetch Pokemon ${idOrName}: ${res.status}`);
  }

  const data = await res.json();

  return {
    id: data.id,
    name: data.name,
    weight: data.weight, // in hectograms, per PokeAPI convention, have to remember
    sprite: data.sprites.front_default,
  };
}

