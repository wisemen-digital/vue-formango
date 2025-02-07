const isObject = (value: unknown): boolean => (
  value !== null && typeof value === 'object'
)

const isNullOrUndefined = (value: unknown): value is null | undefined => (
  value === null || value === undefined
)

const isUndefined = (val: unknown): val is undefined => val === undefined

const isEmptyArray = (obj: unknown[]): boolean => {
  for (const key in obj) {
    if (!isUndefined(obj[key]))
      return false
  }
  return true
}

const isEmptyObject = (value: Record<string, unknown>) =>
  isObject(value) && !Object.keys(value).length

const baseGet = (object: any, updatePath: (string | number)[]) => {
  const length = updatePath.slice(0, -1).length
  let index = 0

  while (index < length)
    object = isUndefined(object) ? index++ : object[updatePath[index++]]

  return object
}

export const set = (
  object: Record<string, unknown>,
  path: string,
  value?: unknown,
) => {
  let index = -1
  const arrayPath = path.split('.')
  const length = arrayPath.length
  const lastIndex = length - 1

  while (++index < length) {
    const key = arrayPath[index]
    let newValue = value

    if (index !== lastIndex) {
      const objValue = object[key]
      newValue
        = (isObject(objValue) || Array.isArray(objValue))
          ? objValue
          : !isNaN(+arrayPath[index + 1])
              ? []
              : {}
    }
    object[key] = newValue
    object = object[key] as Record<string, unknown>
  }
  return object
}

export const get = <T>(obj: T, path: string, defaultValue?: unknown): any => {
  const arrayPath = path.split('.')

  const result = arrayPath.reduce(
    (result, key) =>
      isNullOrUndefined(result) ? result : result[key as keyof {}],
    obj,
  )

  if (isNullOrUndefined(obj))
    return undefined

  return (isUndefined(result) || result === obj)
    ? isUndefined(obj[path as keyof T])
      ? defaultValue
      : obj[path as keyof T]
    : result
}

export const unset = (object: any, path: string) => {
  const arrayPath = path.split('.')

  const childObject = arrayPath.length === 1
    ? object
    : baseGet(object, arrayPath)

  const index = arrayPath.length - 1
  const key = arrayPath[index]

  if (childObject) {
    if (Array.isArray(childObject)) {
      childObject.splice(+key, 1)
    }
    else if (isObject(childObject)) {
      const value = childObject[key]

      if (!Array.isArray(value))
        delete childObject[key]
    }
  }

  if (
    index !== 0
    && ((isObject(childObject) && isEmptyObject(childObject))
      || (Array.isArray(childObject) && isEmptyArray(childObject)))
  )
    unset(object, arrayPath.slice(0, -1).join('.'))

  return object
}

export const generateId = (): string => {
  let id = ''
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 10; i += 1)
    id += chars.charAt(Math.floor(Math.random() * chars.length))

  return `form-${id}`
}

const x = <number>0

export const generateUuid = (): string => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | x
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
  return uuid
}

type ThrottledFunction<T extends (...args: any) => any> = (...args: Parameters<T>) => ReturnType<T>
export function throttle<T extends (...args: any) => any>(func: T, limit: number): ThrottledFunction<T> {
  let inThrottle: boolean
  let lastResult: ReturnType<T>

  return function (this: any, ...args: any[]): ReturnType<T> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const context = this

    if (!inThrottle) {
      inThrottle = true

      setTimeout(() => (inThrottle = false), limit)

      lastResult = func.apply(context, args)
    }

    return lastResult
  }
}

export function isSubPath({
  childPath,
  parentPath,
}: {
  childPath: string
  parentPath: string
}): { isPart: boolean; relativePath?: string } {
  const childSegments = childPath.split('.')
  const parentSegments = parentPath.split('.')

  if (childSegments.length <= parentSegments.length)
    return { isPart: false }

  for (let i = 0; i < parentSegments.length; i++) {
    if (childSegments[i] !== parentSegments[i])
      return { isPart: false }
  }

  const relativePath = childSegments.slice(parentSegments.length).join('.')
  return { isPart: true, relativePath }
}
