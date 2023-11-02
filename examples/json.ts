import {
  IParser,
  between,
  char,
  choice,
  digit,
  escapedWith,
  lazy,
  many0,
  many1,
  map,
  noneOfChars,
  optional,
  or,
  sepBy,
  serial,
  string,
  trim,
} from '../src'

function jsonBoolean(): IParser<boolean> {
  return or(
    map(string('true'), () => true),
    map(string('false'), () => false)
  )
}

function jsonNull(): IParser<null> {
  return map(string('null'), () => null)
}

function jsonNumber(): IParser<number> {
  const sign = map(optional(char('-')), (s) => s ?? '')
  const digits = map(many1(digit()), (list) => list.join(''))
  const parts = serial(
    sign,
    digits,
    optional(map(serial(char('.'), digits), ([_, float]) => float))
  )

  return map(parts, ([sign, int, float]) => {
    if (float) {
      return Number.parseFloat(`${sign}${int}.${float}`)
    } else {
      return Number.parseInt(`${sign}${int}`)
    }
  })
}

function jsonString(): IParser<string> {
  return map(
    between(
      char('"'),
      char('"'),
      many0(
        choice(
          noneOfChars('"', '\\'),
          escapedWith('\\', [
            ['"', '"'],
            ['\\', '\\'],
            ['/', '/'],
            ['b', '\b'],
            ['f', '\f'],
            ['n', '\n'],
            ['r', '\r'],
            ['t', '\t'],
          ])
        )
      )
    ),
    (chars) => chars.join('')
  )
}

function jsonArray(): IParser<JsonValue[]> {
  return between(
    char('['),
    trim(char(']')),
    trim(sepBy(trim(char(',')), jsonValue()))
  )
}

function jsonProperty(): IParser<[string, JsonValue]> {
  return map(
    serial(trim(jsonString()), trim(char(':')), jsonValue()),
    ([key, _, value]) => [key, value]
  )
}

function jsonObject(): IParser<{ [x in string]: JsonValue }> {
  return map(
    between(
      char('{'),
      trim(char('}')),
      trim(sepBy(trim(char(',')), jsonProperty()))
    ),
    Object.fromEntries
  )
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [x in string]: JsonValue }
  | JsonValue[]

export function jsonValue(): IParser<JsonValue> {
  return lazy(() =>
    trim(
      choice(
        jsonBoolean(),
        jsonNull(),
        jsonString(),
        jsonObject(),
        jsonNumber(),
        jsonArray()
      )
    )
  )
}
