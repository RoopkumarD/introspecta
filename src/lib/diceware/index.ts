// credits -> https://github.com/grempe/diceware

function secureRandom(count: number) {
  var cryptoObj = crypto;
  var rand = new Uint32Array(1);
  var skip = 0x7fffffff - (0x7fffffff % count);
  var result;

  if (((count - 1) & count) === 0) {
    cryptoObj.getRandomValues(rand);
    return rand[0] & (count - 1);
  }

  do {
    cryptoObj.getRandomValues(rand);
    result = rand[0] & 0x7fffffff;
  } while (result >= skip);

  return result % count;
}

export function getWords(
  numWords: number,
  numRollsPerWord: number,
  eff,
): string[] {
  "use strict";

  var i, j, words, rollResults, rollResultsJoined;

  words = [];

  if (!numWords) {
    numWords = 1;
  }
  if (!numRollsPerWord) {
    numRollsPerWord = 5;
  }

  for (i = 0; i < numWords; i += 1) {
    rollResults = [];

    for (j = 0; j < numRollsPerWord; j += 1) {
      // roll a 6 sided die
      rollResults.push(secureRandom(6) + 1);
    }

    rollResultsJoined = rollResults.join("");
    words.push(eff[Number(rollResultsJoined)]);
  }

  return words;
}
