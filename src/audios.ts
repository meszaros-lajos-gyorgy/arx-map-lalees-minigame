import { Audio, Locales } from 'arx-level-generator'

export const goblinVoiceThisGameIsShit: Partial<Record<Locales, Audio>> = {
  english: Audio.fromCustomFile({
    filename: 'goblin_this_game_is_shit.wav',
    sourcePath: './speech',
    type: 'speech/english',
  }),
  // TODO: create german version
  german: Audio.fromCustomFile({
    filename: 'goblin_this_game_is_shit.wav',
    sourcePath: './speech',
    type: 'speech/german',
  }),
}

export const goblinVoiceYes: Partial<Record<Locales, Audio>> = {
  english: Audio.fromCustomFile({
    filename: 'goblin_victory3_shorter.wav',
    sourcePath: './speech',
    type: 'speech/english',
  }),
  // TODO: create german version
  german: Audio.fromCustomFile({
    filename: 'goblin_victory3_shorter.wav',
    sourcePath: './speech',
    type: 'speech/german',
  }),
}

export const goblinVoiceWish: Partial<Record<Locales, Audio>> = {
  english: Audio.fromCustomFile({
    filename: 'goblin_wants_to_play_games.wav',
    sourcePath: './speech',
    type: 'speech/english',
  }),
  // TODO: create german version
  german: Audio.fromCustomFile({
    filename: 'goblin_wants_to_play_games.wav',
    sourcePath: './speech',
    type: 'speech/german',
  }),
}
