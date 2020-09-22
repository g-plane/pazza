import type {
  Input,
  IParser,
  Result,
  ParserInput,
  ParserOutput,
  ParserError,
} from "./core.ts";

type ContextParser<C, P extends IParser<unknown, unknown, Input>> = {
  context: C;
  parser: P;

  parse(
    input: ParserInput<P>,
    context?: C,
  ): Result<ParserInput<P>, ParserOutput<P>, ParserError<P>, C>;
};
/**
 * Execute the embedded parser with a parser context.
 *
 *     const myContext = { anything: 'any-value' };
 *     context(myContext, digit()).parse("").context === myContext;
 *
 * @param parser embedded parser
 * @param context parser context
 */
export function context<C, P extends IParser<unknown, unknown, Input>>(
  context: C,
  parser: P,
): ContextParser<C, P> {
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
