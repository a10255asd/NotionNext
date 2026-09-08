import SmartLink from '@/components/SmartLink'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { SiteSwitcher } from './SiteSwitcher'

export default function Header() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const button = useRef(null)
  useEffect(() => { setOpen(false) }, [router.asPath])
  useEffect(() => {
    const onKey = event => { if (event.key === 'Escape' && open) { setOpen(false); button.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])
  const links = [{ href: '/', label: '文章' }, { href: '/category', label: '分类' }, { href: '/archive', label: '归档' }, { href: '/search', label: '搜索' }].map(item => <SmartLink key={item.href} href={item.href} aria-current={router.asPath === item.href ? 'page' : undefined}>{item.label}</SmartLink>)
  return <header className='blog-refresh-header'><div className='blog-refresh-header-inner'><SmartLink href='/' className='blog-refresh-brand'>Jixue Blog<span>博客</span></SmartLink><nav className='blog-refresh-desktop' aria-label='主导航'>{links}</nav><div className='blog-refresh-actions'><SiteSwitcher /><button ref={button} className='blog-refresh-menu' aria-expanded={open} aria-controls='blog-mobile-nav' aria-label={open ? '关闭导航' : '打开导航'} onClick={() => setOpen(!open)}>{open ? '关闭' : '菜单'}</button></div>{open && <nav id='blog-mobile-nav' className='blog-refresh-mobile' aria-label='移动导航'>{links}</nav>}</div></header>
}
