import { expect, test } from 'vitest'
import { ErrorKind, anyByte, byte, slice } from '../src'

test('byte', () => {
  const bytes = Uint8Array.of(13, 10)

  expect(byte(13)(bytes)).toEqual({
    ok: true,
    input: bytes.subarray(1),
    output: 13,
    context: {},
  })

  expect(byte(10)(bytes)).toEqual({
    ok: false,
    input: bytes,
    error: ErrorKind.Byte,
    context: {},
  })
})

test('anyByte', () => {
  expect(anyByte()(Uint8Array.of(13, 10))).toEqual({
    ok: true,
    input: Uint8Array.of(10),
    output: 13,
    context: {},
  })

  expect(anyByte()(Uint8Array.of())).toEqual({
    ok: false,
    input: Uint8Array.of(),
    error: ErrorKind.AnyByte,
    context: {},
  })
})

test('slice', () => {
  const bytes = Uint8Array.of(65, 66, 67)

  expect(slice(Uint8Array.of(65, 66))(bytes)).toEqual({
    ok: true,
    input: bytes.subarray(2),
    output: bytes.subarray(0, 2),
    context: {},
  })

  expect(slice(Uint8Array.of(64, 65))(bytes)).toEqual({
    ok: false,
    input: bytes,
    error: ErrorKind.Slice,
    context: {},
  })
})
