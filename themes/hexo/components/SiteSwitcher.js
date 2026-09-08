"use client"
import { useEffect, useRef } from 'react'
const sites = [
  { name: '个人主站', href: 'https://liujixue.cn', note: '作品与近况' },
  { name: 'AI 学习库', href: 'https://ai.liujixue.cn', note: '学习与实战' },
  { name: '鸡血玄策', href: 'https://xuan.liujixue.cn', note: '排盘与资料' },
  { name: '博客', href: 'https://blog.liujixue.cn', note: '文章与记录' }
]
export function SiteSwitcher() {
  const ref = useRef(null)
  useEffect(() => {
    const close = (event) => {
      if (event instanceof KeyboardEvent && event.key === 'Escape' && ref.current?.open) {
        ref.current.open = false
        ref.current.querySelector('summary')?.focus()
      } else if (event.type === 'pointerdown' && event.target instanceof Node && !ref.current?.contains(event.target) && ref.current) {
        ref.current.open = false
      }
    }
    document.addEventListener('keydown', close)
    document.addEventListener('pointerdown', close)
    return () => {document.removeEventListener('keydown', close); document.removeEventListener('pointerdown', close)}
  }, [])
  return <details className='site-switcher' ref={ref}><summary>站点切换 <span aria-hidden='true'>⌄</span></summary><nav aria-label='站点切换'>{sites.map(site => <a key={site.href} href={site.href} aria-current={site.name === '博客' ? 'true' : undefined} onClick={() => {if(ref.current) ref.current.open = false}}><strong>{site.name}</strong><small>{site.note}{site.name === '博客' ? ' · 当前站点' : ''}</small></a>)}</nav></details>
}
