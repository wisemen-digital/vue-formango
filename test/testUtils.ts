import { z } from 'zod'

export const basicSchema = z.object({ name: z.string().min(4) })

export const basicWithSimilarNamesSchema = z.object({
  name: z.string(),
  nameFirst: z.string().min(4),
  nameSecond: z.string().min(4),
})

export const objectSchema = z.object({
  a: z.object({
    b: z.string(),
    bObj: z.object({ c: z.string() }),
  }),
})

export const basicArraySchema = z.object({ array: z.array(z.string()) })

export const basic2DArraySchema = z.object({ array: z.array(z.array(z.string())) })

export const objectArraySchema = z.object({
  array: z.array(
    z.object({ name: z.string() }),
  ),
})

export const twoDimensionalArraySchema = z.object({
  array: z.array(
    z.array(
      z.object({ name: z.string() }),
    ),
  ),
})

export const nestedArraySchema = z.object({
  users: z.array(
    z.array(
      z.object({ name: z.string() }),
    ),
  ),
})
export const fieldWithArraySchema = z.object({ field: z.object({ array: z.array(z.string()) }) })

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
