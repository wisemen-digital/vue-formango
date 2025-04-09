import { z } from 'zod'

export const basicSchema = z.object({
  name: z.string().min(4),
})

export const basicWithSimilarNamesSchema = z.object({
  nameFirst: z.string().min(4),
  nameSecond: z.string().min(4),
  name: z.string(),
})

export const objectSchema = z.object({
  a: z.object({
    b: z.string(),
    bObj: z.object({
      c: z.string(),
    }),
  }),
})

export const basicArraySchema = z.object({
  array: z.array(z.string()),
})

export const basic2DArraySchema = z.object({
  array: z.array(z.array(z.string())),
})

export const objectArraySchema = z.object({
  array: z.array(
    z.object({
      name: z.string(),
    }),
  ),
})

export const twoDimensionalArraySchema = z.object({
  array: z.array(
    z.array(
      z.object({
        name: z.string(),
      }),
    ),
  ),
})

export const nestedArraySchema = z.object({
  users: z.array(
    z.array(
      z.object({
        name: z.string(),
      }),
    ),
  ),
})
export const fieldWithArraySchema = z.object({
  field: z.object({ array: z.array(z.string()) }),
})

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
