import SmartLink from '@/components/SmartLink'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { PERSONAL_TOOLS } from '@/lib/site/personalToolsMenu'
import {
  IconArrowRight,
  IconCalculator,
  IconChartLine,
  IconTool
} from '@tabler/icons-react'

const toolStatus = {
  ready: '已上线',
  planning: '规划中'
}

const toolList = PERSONAL_TOOLS.map(tool => ({
  ...tool,
  status: 'ready',
  tags: ['定投模拟', '目标反推', '压力测试']
}))

const plannedTools = [
  {
    title: '减脂热量计算器',
    description: '估算基础代谢、每日热量缺口和体重变化节奏。',
    status: 'planning',
    tags: ['健身', '热量', '计划']
  },
  {
    title: '复利目标规划器',
    description: '根据目标金额、期限和收益率反推投入计划。',
    status: 'planning',
    tags: ['复利', '目标', '资产']
  }
]

const ToolCard = ({ tool }) => {
  const isReady = tool.status === 'ready'
  const Wrapper = isReady ? SmartLink : 'div'
  const wrapperProps = isReady
    ? { href: tool.href, className: 'block h-full no-underline' }
    : { className: 'block h-full' }

  return (
    <Wrapper {...wrapperProps}>
      <article className='flex h-full flex-col rounded-md border border-gray-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:hover:border-emerald-700'>
        <div className='mb-4 flex items-start justify-between gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>
            {isReady ? <IconCalculator size={22} stroke={1.8} /> : <IconTool size={22} stroke={1.8} />}
          </div>
          <span className={`rounded-md px-2 py-1 text-xs font-medium ${isReady ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400'}`}>
            {toolStatus[tool.status]}
          </span>
        </div>
        <h2 className='text-lg font-semibold tracking-normal text-gray-950 dark:text-gray-50'>
          {tool.title}
        </h2>
        <p className='mt-3 flex-1 text-sm leading-6 text-gray-600 dark:text-gray-300'>
          {tool.description}
        </p>
        <div className='mt-5 flex flex-wrap gap-2'>
          {tool.tags.map(tag => (
            <span
              key={tag}
              className='rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400'>
              {tag}
            </span>
          ))}
        </div>
        {isReady && (
          <div className='mt-5 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300'>
            打开工具
            <IconArrowRight size={16} stroke={1.8} />
          </div>
        )}
      </article>
    </Wrapper>
  )
}

const ToolsIndex = () => {
  return (
    <main className='mx-auto w-full max-w-6xl pb-10 text-gray-900 dark:text-gray-50'>
      <section className='mb-6 rounded-md border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950'>
        <div className='mb-3 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300'>
          <IconChartLine size={16} stroke={1.8} />
          Jixue Lab
        </div>
        <h1 className='text-2xl font-semibold tracking-normal text-gray-950 dark:text-gray-50 md:text-3xl'>
          工具合集
        </h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300'>
          这里会放一些可以直接使用的小工具。先从投资和健身方向开始，后面再接入小程序、API 和个人项目。
        </p>
      </section>

      <section className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
        {[...toolList, ...plannedTools].map(tool => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </section>
    </main>
  )
}

export async function getStaticProps({ locale }) {
  const props = (await fetchGlobalAllData({ from: 'tools-index', locale })) || {}
  delete props.allPages

  return {
    props: {
      ...props,
      post: {
        title: '工具合集',
        summary: 'Jixue Lab 的在线工具合集，包含定投模拟、目标反推和更多个人工具。',
        slug: 'tools',
        type: 'Page',
        pageCover: props.siteInfo?.pageCover,
        pageCoverThumbnail: props.siteInfo?.pageCover
      }
    },
    revalidate: 3600
  }
}

export default ToolsIndex

