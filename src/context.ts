import type {
  Input,
  IParser,
  Result,
  ParserInput,
  ParserOutput,
  ParserError,
} from "./core.ts";

type ContextParser<P extends IParser<unknown, unknown, Input>, C> = {
  parser: P;
  context: C;

  parse(
    input: ParserInput<P>,
    context?: C,
  ): Result<ParserInput<P>, ParserOutput<P>, ParserError<P>, C>;
};
/**
 * Execute the embedded parser with a parser context.
 *
 *     context(digit(), { anything: 'any-value' }).parse("").context;
 *
 * @param parser embedded parser
 * @param context parser context
 */
export function context<P extends IParser<unknown, unknown, Input>, C>(
  parser: P,
  context: C,
): ContextParser<P, C> {
  return {
    parser,
    context,
    parse(input, context) {
      return this.parser.parse(input, context ?? this.context) as Result<
        ParserInput<P>,
        ParserOutput<P>,
        ParserError<P>,
        C
      >;
    },
  };
}
