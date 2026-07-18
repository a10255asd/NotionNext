export const PERSONAL_TOOLS = [
  {
    title: '纳指定投计算器',
    name: '纳指定投计算器',
    href: '/tools/nasdaq-dca-calculator',
    icon: 'fas fa-chart-line',
    description: '模拟长期定投、目标月投、收益率场景和压力回撤。'
  }
]

export const PERSONAL_TOOLS_MENU = {
  id: 'jixue-tools',
  title: '工具',
  name: '工具',
  href: '/tools',
  icon: 'fas fa-calculator',
  show: true,
  subMenus: PERSONAL_TOOLS.map((tool, index) => ({
    id: `jixue-tool-${index}`,
    title: tool.title,
    name: tool.name,
    href: tool.href,
    icon: tool.icon,
    show: true
  }))
}

const linkPointsToTools = link => {
  if (!link) {
    return false
  }
  if (link.href === '/tools' || link.url === '/tools') {
    return true
  }
  const subMenus = link.subMenus || link.children || []
  return Array.isArray(subMenus)
    ? subMenus.some(linkPointsToTools)
    : false
}

export const withPersonalToolsMenu = links => {
  const normalizedLinks = Array.isArray(links) ? links.filter(Boolean) : []
  if (normalizedLinks.some(linkPointsToTools)) {
    return normalizedLinks
  }
  return normalizedLinks.concat(PERSONAL_TOOLS_MENU)
}

