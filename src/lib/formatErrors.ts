import type { ZodFormattedError, ZodIssue } from 'zod'
import type { FormattedError, StandardSchemaV1 } from '../types'

function issueMapper(issue: StandardSchemaV1.Issue | FormattedError<any>) {
  return issue.message
}

const isZodIssue = (error: any): error is ZodIssue => {
  return error.code !== undefined
}
type SomeIssues<TType> = readonly StandardSchemaV1.Issue[] | FormattedError<TType>[]
type SomeIssue<TType> = StandardSchemaV1.Issue | FormattedError<TType>

function getNormalizedPathArray<TType>(issue: SomeIssue<TType>): string[] {
  if (typeof issue.path === 'object') {
    return issue.path
      ?.map(item => (typeof item === 'object' ? item.key : item)) as string[]
  }

  return issue.path as unknown as string[]
}

export function formatErrorsToZodFormattedError<TType>(issues: SomeIssues<TType>): ZodFormattedError<TType> {
  const fieldErrors: ZodFormattedError<TType> = { _errors: [] } as any
  const processIssue = (issue: SomeIssue<TType>) => {
    // Handle zod only issue types
    if (isZodIssue(issue)) {
      if (issue.code === 'invalid_union') {
        issue.unionErrors.map(processIssue)
        return
      }
      if (issue.code === 'invalid_return_type') {
        processIssue(issue.returnTypeError)
        return
      }
      if (issue.code === 'invalid_arguments') {
        processIssue(issue.argumentsError)
        return
      }
    }

    // Issue without path gets added to the root
    if (issue.path == null || issue.path?.length === 0) {
      fieldErrors._errors.push(issueMapper(issue))
      return
    }

    // Issue with path gets added to the correct field

    const normalizedPath = getNormalizedPathArray(issue)

    let curr: any = fieldErrors
    let i = 0
    while (i < normalizedPath.length) {
      const el = normalizedPath[i]
      const terminal = i === normalizedPath.length - 1

      if (!terminal) {
        curr[el] = curr[el] || { _errors: [] }
      }
      else {
        curr[el] = curr[el] || { _errors: [] }
        curr[el]._errors.push(issueMapper(issue))
      }

      curr = curr[el]
      i++
    }
  }

  for (const issue of issues)
    processIssue(issue)

  return fieldErrors
}
