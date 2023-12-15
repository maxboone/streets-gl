import { atomWithStorage } from 'jotai/utils'

export const openaiAtom = atomWithStorage<string>('openai-key', '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')
export const gmapsAtom = atomWithStorage<string>('gmaps-key', 'AIzaSyADyxTEE9ii8ZGpWSvfiwyTF8Dp0odrclk')