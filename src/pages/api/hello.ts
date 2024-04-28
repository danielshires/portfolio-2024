import type { APIRoute } from 'astro'

export const GET: APIRoute = () => {
  return new Response(
    JSON.stringify({
      greeting: 'Hello world!',
      img: '../../assets/national-park-2020/IMG_0001.jpeg'
    }),
  )
}
