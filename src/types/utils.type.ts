declare const $NestedValue: unique symbol

type NestedValue<TValue extends object = object> = {
  [$NestedValue]: never
} & TValue
/*
Projects that React Hook Form installed don't include the DOM library need these interfaces to compile.
React Native applications is no DOM available. The JavaScript runtime is ES6/ES2015 only.
These definitions allow such projects to compile with only --lib ES6.
Warning: all of these interfaces are empty.
If you want type definitions for various properties, you need to add `--lib DOM` (via command line or tsconfig.json).
*/

export type Noop = () => void

interface File extends Blob {
  readonly name: string
  readonly lastModified: number
}

interface FileList {
  [index: number]: File
  item: (index: number) => File | null
  readonly length: number
}

export type Primitive =
  | bigint
  | boolean
  | number
  | string
  | symbol
  | null
  | undefined

export type BrowserNativeObject = Date | File | FileList

export type EmptyObject = { [K in number | string]: never }

export type NonUndefined<T> = T extends undefined ? never : T

export type LiteralUnion<T extends U, U extends Primitive> =
  | (U & { _?: never })
  | T

export type DeepPartial<T> = T extends BrowserNativeObject | NestedValue
  ? T
  : { [K in keyof T]?: DeepPartial<T[K]> }

export type DeepPartialSkipArrayKey<T> = T extends
  | BrowserNativeObject
  | NestedValue
  ? T
  : T extends readonly any[]
    ? { [K in keyof T]: DeepPartialSkipArrayKey<T[K]> }
    : { [K in keyof T]?: DeepPartialSkipArrayKey<T[K]> }

/**
 * Checks whether the type is any
 * See {@link https://stackoverflow.com/a/49928360/3406963}
 * @typeParam T - type which may be any
 * ```
 * IsAny<any> = true
 * IsAny<string> = false
 * ```
 */
export type IsAny<T> = 0 extends 1 & T ? true : false

/**
 * Checks whether the type is never
 * @typeParam T - type which may be never
 * ```
 * IsAny<never> = true
 * IsAny<string> = false
 * ```
 */
export type IsNever<T> = [T] extends [never] ? true : false

/**
 * Checks whether T1 can be exactly (mutually) assigned to T2
 * @typeParam T1 - type to check
 * @typeParam T2 - type to check against
 * ```
 * IsEqual<string, string> = true
 * IsEqual<'foo', 'foo'> = true
 * IsEqual<string, number> = false
 * IsEqual<string, number> = false
 * IsEqual<string, 'foo'> = false
 * IsEqual<'foo', string> = false
 * IsEqual<'foo' | 'bar', 'foo'> = boolean // 'foo' is assignable, but 'bar' is not (true | false) -> boolean
 * ```
 */
export type IsEqual<T1, T2> = T1 extends T2
  ? (<G>() => G extends T1 ? 1 : 2) extends <G>() => G extends T2 ? 1 : 2
      ? true
      : false
  : false

export type DeepMap<T, TValue> = IsAny<T> extends true
  ? any
  : T extends BrowserNativeObject | NestedValue
    ? TValue
    : T extends object
      ? { [K in keyof T]: DeepMap<NonUndefined<T[K]>, TValue> }
      : TValue

export type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], Date | FileList | NestedValue>,
  object | any[]
> extends never
  ? true
  : false

export type Merge<A, B> = {
  [K in keyof A | keyof B]?: K extends keyof A & keyof B
    ? [A[K], B[K]] extends [object, object]
        ? Merge<A[K], B[K]>
        : A[K] | B[K]
    : K extends keyof A
      ? A[K]
      : K extends keyof B
        ? B[K]
        : never;
}

export type NullableKeys<T> = {
  [K in keyof T]: T[K] | null
}

export type NestedNullableKeys<T> = {
  [K in keyof T]: T[K] extends object ? NestedNullableKeys<T[K]> | null : T[K] | null
}
