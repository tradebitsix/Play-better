import { Router } from 'express'
export function merchRouter(){
  const r = Router()
  r.get('/', (req,res) => {
    res.json({
      items: [
        { id:'pb-shirt', title:'Play Better Tee', price:'$29', url:'https://example.com/play-better-tee' },
        { id:'pb-hoodie', title:'Play Better Hoodie', price:'$59', url:'https://example.com/play-better-hoodie' },
        { id:'pb-hat', title:'Play Better Hat', price:'$24', url:'https://example.com/play-better-hat' }
      ]
    })
  })
  return r
}
