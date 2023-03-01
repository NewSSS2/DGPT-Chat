import { AppSchema } from '../../db/schema'
import gpt from 'gpt-3-encoder'
import { logger } from '../../logger'

type PromptOpts = {
  sender: AppSchema.Profile
  chat: AppSchema.Chat
  char: AppSchema.Character
  history: AppSchema.ChatMessage[]
  message: string
  members: AppSchema.Profile[]
}

const BOT_REPLACE = /\{\{char\}\}/g
const SELF_REPLACE = /\{\{user\}\}/g

export function createPrompt({ sender, chat, char, history, message, members }: PromptOpts) {
  const username = sender.handle || 'You'

  const lines: string[] = [`${char.name}'s Persona: ${formatCharacter(char.name, chat.overrides)}`]

  if (chat.scenario) {
    lines.push(`Scenario: ${chat.scenario}`)
  }

  lines.push(
    `<START>`,
    ...chat.sampleChat.split('\n'),
    ...history.map((chat) => prefix(chat, char.name, members) + chat.msg),
    `${username}: ${message}`,
    `${char.name}:`
  )

  const prompt = lines
    .filter(removeEmpty)
    .join('\n')
    .replace(BOT_REPLACE, char.name)
    .replace(SELF_REPLACE, username)

  const tokens = gpt.encode(prompt).length
  logger.debug({ tokens, prompt }, 'Tokens')

  return prompt
}

export function formatCharacter(name: string, persona: AppSchema.CharacterPersona) {
  switch (persona.kind) {
    case 'wpp': {
      const attrs = Object.entries(persona.attributes)
        .map(([key, values]) => `${key}(${values.map(quote).join(' + ')})`)
        .join('\n')

      return [`[character("${name}") {`, attrs, '}]'].join('\n')
    }

    case 'sbf': {
      const attrs = Object.entries(persona.attributes).map(
        ([key, values]) => `${key}: ${values.map(quote).join(', ')}`
      )

      return `[ character: "${name}"; ${attrs.join('; ')} ]`
    }

    case 'boostyle': {
      const attrs = Object.values(persona.attributes).reduce(
        (prev, curr) => {
          prev.push(...curr)
          return prev
        },
        [name]
      )
      return attrs.join(' + ')
    }
  }
}

export function exportCharacter(char: AppSchema.Character, target: 'tavern' | 'ooba') {
  switch (target) {
    case 'tavern': {
      return {
        name: char.name,
        first_mes: char.greeting,
        scenario: char.scenario,
        description: formatCharacter(char.name, char.persona),
        mes_example: char.sampleChat,
      }
    }

    case 'ooba': {
      return {
        char_name: char.name,
        char_greeting: char.greeting,
        world_scenario: char.scenario,
        char_persona: formatCharacter(char.name, char.persona),
        example_dialogue: char.sampleChat,
      }
    }
  }
}

function quote(str: string) {
  return `"${str}"`
}

function prefix(chat: AppSchema.ChatMessage, bot: string, members: AppSchema.Profile[]) {
  const member = members.find((mem) => chat.userId === mem.userId)

  return chat.characterId ? `${bot}: ` : `${member?.handle}: `
}

function removeEmpty(value?: string) {
  return !!value
}
