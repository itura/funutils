export interface Transform<X, Y> {
  (x: X): Y
}

export type Predicate<X> = Transform<X, boolean>

export type SideEffect<X> = Transform<X, void>

export type AsyncTransform<X, Y> = Transform<X | Promise<X>, Promise<Y>>

export type PromiseCallback<X, Y> = Transform<X, Y | Promise<Y>>

export interface Reducer<X, Y> {
  (acc: Y, x: X): Y
}

export interface Comparator <X> {
  (a: X, b: X): number
}

export declare function id<X> (x: X): X
export declare function apply<X, Y> (f: Transform<X, Y>): Transform<X, Y>
export declare function compose<X, Y, Z> (f: Transform<Y, Z>): (g: Transform<X, Y>) => Transform<X, Z>
export declare function tap<X> (f: SideEffect<X>): Transform<X, X>

export declare function chain<X0, X1> (
  f0: Transform<X0, X1>
): Transform<X0, X1>
export declare function chain<X0, X1, X2> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>
): Transform<X0, X2>
export declare function chain<X0, X1, X2, X3> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
): Transform<X0, X3>
export declare function chain<X0, X1, X2, X3, X4> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
): Transform<X0, X4>
export declare function chain<X0, X1, X2, X3, X4, X5> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
): Transform<X0, X5>
export declare function chain<X0, X1, X2, X3, X4, X5, X6> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
  f5: Transform<X5, X6>,
): Transform<X0, X6>
export declare function chain<X0, X1, X2, X3, X4, X5, X6, X7> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
  f5: Transform<X5, X6>,
  f6: Transform<X6, X7>,
): Transform<X0, X7>
export declare function chain<X0, X1, X2, X3, X4, X5, X6, X7, X8> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
  f5: Transform<X5, X6>,
  f6: Transform<X6, X7>,
  f7: Transform<X7, X8>,
): Transform<X0, X7>
export declare function chain<X0, X1, X2, X3, X4, X5, X6, X7, X8, X9> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
  f5: Transform<X5, X6>,
  f6: Transform<X6, X7>,
  f7: Transform<X7, X8>,
  f8: Transform<X8, X9>,
): Transform<X0, X9>
export declare function chain<X0, X1, X2, X3, X4, X5, X6, X7, X8, X9, X10> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
  f5: Transform<X5, X6>,
  f6: Transform<X6, X7>,
  f7: Transform<X7, X8>,
  f8: Transform<X8, X9>,
  f9: Transform<X9, X10>,
): Transform<X0, X10>
export declare function chain<X0, X1, X2, X3, X4, X5, X6, X7, X8, X9, X10> (
  f0: Transform<X0, X1>,
  f1: Transform<X1, X2>,
  f2: Transform<X2, X3>,
  f3: Transform<X3, X4>,
  f4: Transform<X4, X5>,
  f5: Transform<X5, X6>,
  f6: Transform<X6, X7>,
  f7: Transform<X7, X8>,
  f8: Transform<X8, X9>,
  f9: Transform<X9, X10>,
  f10: Transform<X10, any>,
  ...fs: Transform<any, any>[]
): Transform<X0, any>

export declare function applyP<X, Y> (p: Promise<X>): (f: PromiseCallback<X, Y>) => Promise<Y>
export declare function chainP<X0, X1> (
  f0: PromiseCallback<X0, X1>
): AsyncTransform<X0, X1>
export declare function chainP<X0, X1, X2> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>
): AsyncTransform<X0, X2>
export declare function chainP<X0, X1, X2, X3> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
): AsyncTransform<X0, X3>
export declare function chainP<X0, X1, X2, X3, X4> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
): AsyncTransform<X0, X4>
export declare function chainP<X0, X1, X2, X3, X4, X5> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
): AsyncTransform<X0, X5>
export declare function chainP<X0, X1, X2, X3, X4, X5, X6> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
  f5: PromiseCallback<X5, X6>,
): AsyncTransform<X0, X6>
export declare function chainP<X0, X1, X2, X3, X4, X5, X6, X7> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
  f5: PromiseCallback<X5, X6>,
  f6: PromiseCallback<X6, X7>,
): AsyncTransform<X0, X7>
export declare function chainP<X0, X1, X2, X3, X4, X5, X6, X7, X8> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
  f5: PromiseCallback<X5, X6>,
  f6: PromiseCallback<X6, X7>,
  f7: PromiseCallback<X7, X8>,
): AsyncTransform<X0, X7>
export declare function chainP<X0, X1, X2, X3, X4, X5, X6, X7, X8, X9> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
  f5: PromiseCallback<X5, X6>,
  f6: PromiseCallback<X6, X7>,
  f7: PromiseCallback<X7, X8>,
  f8: PromiseCallback<X8, X9>,
): AsyncTransform<X0, X9>
export declare function chainP<X0, X1, X2, X3, X4, X5, X6, X7, X8, X9, X10> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
  f5: PromiseCallback<X5, X6>,
  f6: PromiseCallback<X6, X7>,
  f7: PromiseCallback<X7, X8>,
  f8: PromiseCallback<X8, X9>,
  f9: PromiseCallback<X9, X10>,
): AsyncTransform<X0, X10>
export declare function chainP<X0, X1, X2, X3, X4, X5, X6, X7, X8, X9, X10> (
  f0: PromiseCallback<X0, X1>,
  f1: PromiseCallback<X1, X2>,
  f2: PromiseCallback<X2, X3>,
  f3: PromiseCallback<X3, X4>,
  f4: PromiseCallback<X4, X5>,
  f5: PromiseCallback<X5, X6>,
  f6: PromiseCallback<X6, X7>,
  f7: PromiseCallback<X7, X8>,
  f8: PromiseCallback<X8, X9>,
  f9: PromiseCallback<X9, X10>,
  f10: PromiseCallback<X10, any>,
  ...fs: PromiseCallback<any, any>[]
): AsyncTransform<X0, any>

export declare function applyM<X, Y> (M: monads.Monad<X>): (f: Transform<any,Y>) => Transform<any, Y>
export declare function chainM<X> (M: monads.Monad<X>): (...fs: Transform<any, any>[]) => Transform<any, any>
export declare function composeM<X, Y, Z> (M1: monads.Monad<X>): (M2: monads.Monad<Y>) => monads.Monad<Z>

export interface Functor<X> {
  map: <Y> (f: (x: X) => Y) => Functor<Y>
}
export declare function applyF<X, Y> (F: Functor<X>): (f: Transform<X, Y>) => Functor<Y>
export declare function chainF (...fs: Transform<any, any>[]): Transform<Functor<any>, Functor<any>>

export declare function fail (e: Error): void
export declare function zip (...xs: any[]): any[][]
export declare function randomInt (range: number, min?: number): number
export declare function repeat<X> (count: number, f: Transform<number, X>): X[]
export declare function sleep (ms: number): Promise<void>

export interface BuilderConfig {
  [key: string]: any
}
export declare function Builder<X> (factory: Transform<BuilderConfig, X>): (...fs: Transform<BuilderConfig, BuilderConfig>[]) => X

export module maybe {
  interface IMaybe<X> extends Functor<X> {
    map: <Y> (f: (x: X) => Y) => IMaybe<Y>
    caseMap: (cases: Cases) => any
    dig: <Y> (...keys: string[]) => IMaybe<Y>
    toBoolean: () => boolean
  }

  interface Cases {
    just?: (x: any) => any
    nothing: () => any
  }

  function Maybe<X> (x: X): IMaybe<X>
  function Just<X> (x: X): IMaybe<X>
  function Nothing (): IMaybe<void>
  function isMaybe (x: any): boolean
  function map<X, Y> (f: Transform<X, Y>): Transform<IMaybe<X>, IMaybe<Y>>
  function caseMap<X, Y = any> (cases: Cases): Transform<IMaybe<X>, Y>
  function toBoolean (m: IMaybe<any>): boolean

  function given<X> (...ms: IMaybe<any>[]): Transform<(...xs: any[]) => X, IMaybe<X>>
  function none<X> (...ms: IMaybe<any>[]): (f: () => X) => IMaybe<X>

  type CasesSpec = [boolean, () => any] | [boolean, CasesSpec]
  function cases (...specs: CasesSpec[]): IMaybe<any>

  type Key = string | number
  function dig <X, Y> (...keys: Key[]): Transform<X, IMaybe<Y>>
}

export module monads {
  interface Monad<X> {
    bind: (f: (x: any) => any) => (x: X) => any
    unit: (x: any) => X
  }
  const Id: Monad<any>
  const Maybe: Monad<maybe.IMaybe<any>>
  const FlatSequence: Monad<any[]>
  const Something: Monad<maybe.IMaybe<any>[]>
  function Sequence (...operations: ((x: any[]) => any[])[]): Monad<any[]>
}

export module array {
  function concat<X> (...a2: X[]): Transform<X[], X[]>
  function every<X> (f: Predicate<X>): Transform<X[], boolean>
  function filter<X> (f: Predicate<X>): Transform<X[], X[]>
  function find<X> (f: Predicate<X>): Transform<X[], X | undefined>
  function findIndex<X> (f: Predicate<X>): Transform<X[], number>
  function flat<X> (n?: number): Transform<X[][], X[]>
  function includes<X> (x: X): Transform<X[], boolean>
  function indexOf<X> (x: X): Transform<X[], number>
  function join<X> (delimiter: string): Transform<X[], string>
  function lastIndexOf<X> (x: X): Transform<X[], number>
  function map<X, Y> (f: Transform<X, Y>): Transform<X[], Y[]>
  function reduce<X, Y> (f: Reducer<X, Y>): Transform<X[], Y>
  function reduceRight<X, Y> (f: Reducer<X, Y>): Transform<X[], Y>
  function reverse<X> (): Transform<X[], X[]>
  function slice<X> (start: number, end?: number): Transform<X[], X[]>
  function some<X> (f: Predicate<X>): Transform<X[], boolean>
  function sort<X> (f: Comparator<X>): Transform<X[], X[]>
  function compact<X> (): Transform<X[], X[]>
  function sum (init?: number): Transform<number[], number>
  function buildLines (init?: string): Transform<string[], string>
  function uniq<X, Y = X> (f?: Transform<X, Y>): Transform<X[], X[]>
  function append<X> (x: X): Transform<X[], X[]>
  function prepend<X> (x: X): Transform<X[], X[]>
  function first<X> (): Transform<X[], X>
  function last<X> (): Transform<X[], X>
  function groupBy<X> (f: Transform<X, any>): Transform<X[], { [key: string]: X }>
}

export module string {
  function includes (s: string): Transform<string, boolean>
  function match (r: string | RegExp): Transform<string, RegExpMatchArray | null>
  function normalize (form?: string): Transform<string, string>
  function padEnd (maxLength: number, fill?: string): Transform<string, string>
  function padStart (maxLength: number, fill?: string): Transform<string, string>
  function repeat (n: number): Transform<string, string>
  function replace (searchValue: string | RegExp, replaceValue: string): Transform<string, string>;
  function slice (start: number, end?: number): Transform<string, string>
  function split (delimiter: string): Transform<string, string[]>
  function startsWith (s: string, position?: number): Transform<string, boolean>
  function substring (start: number, end?: number): Transform<string, string>
  function toLocaleLowerCase (): Transform<string, string>
  function toLocaleUpperCase (): Transform<string, string>
  function toLowerCase (): Transform<string, string>
  function toString (): Transform<string, string>
  function toUpperCase (): Transform<string, string>
  function trim (): Transform<string, string>
  function trimEnd (): Transform<string, string>
  function trimStart (): Transform<string, string>
}

export module number {
  function toExponential (digits?: number): Transform<number, string>
  function toFixed (digits?: number): Transform<number, string>
  interface LocaleOptions {
    [key: string]: any
  }
  function toLocaleString (locale?: string, options?: LocaleOptions): string
  function toPrecision (digits?: number): string
  function toString(radix?: number): string
}

export module generators {
  const zip: Generator<any[], void, void>
  const integers: Generator<number, void, void>
}

interface Performance {
  now: () => number
}
interface IPerf {
  time: <X> (action: () => Promise<X>) => Promise<[number, X]>
}
export function perf (perfImpl: Performance): IPerf

export module lazyseq {
  interface ILazySeq<X> {
    map: (f: Transform<any, any>) => ILazySeq<X>
    filter: (f: Predicate<any>) => ILazySeq<X>
    compact: () => ILazySeq<X>
    uniq: (f?: Transform<any, any>) => ILazySeq<X>
    reduce: (f: Reducer<X, any>, initial: X) => ILazySeq<X>
    take: (n: number) => X
  }

  function LazySeq<X, Y> (generator: Generator<X> | X[]): ILazySeq<Y>

  interface ILazySeqM<Y> {
    map: (f: Transform<any, any>) => ILazySeqM<Y>
    reduce: (f: Reducer<any,Y>, initial: Y) => ILazySeqM<Y>
    take: (n: number) => Y
  }

  function LazySeqM<M, X, Y> (monad: monads.Monad<M>, generator: Generator<X>): ILazySeqM<Y>
}