import type { StandardSchemaV1 } from '@standard-schema/spec'
import type { ZodFormattedError, ZodIssue } from 'zod'

function issueMapper(issue: StandardSchemaV1.Issue) {
  return issue.message
}

const isZodIssue = (error: any): error is ZodIssue => {
  return error.code !== undefined
}

export function formatErrorsToZodFormattedError<TType>(issues: readonly StandardSchemaV1.Issue[]): ZodFormattedError<TType> {
  const fieldErrors: ZodFormattedError<TType> = { _errors: [] } as any
  const processIssue = (issue: StandardSchemaV1.Issue) => {
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
    let curr: any = fieldErrors
    let i = 0
    while (i < issue.path.length) {
      const el = issue.path[i] as string
      const terminal = i === issue.path.length - 1

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
