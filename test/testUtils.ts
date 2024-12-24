import { z } from 'zod'

export const basicSchema = z.object({
  name: z.string().min(4),
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
  array: z.array(z.array(z.object({
    name: z.string(),
  }))),
})

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
