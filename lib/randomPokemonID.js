// Pokemon IDs run 1 to 1025 (current national dex count)
const minPokedexNumber = 1;
const maxPokedexNumber = 1025;

export function getRandomPokemonId() { //randomizes the number
  return Math.floor(Math.random() * (maxPokedexNumber - minPokedexNumber + 1)) + minPokedexNumber;
}
