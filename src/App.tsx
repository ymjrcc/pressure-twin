import { Routes, Route, Link, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import KnowledgeBase from './pages/KnowledgeBase'

// 判断路径是否匹配菜单项（支持子路由匹配）
function isActive(pathname: string, menuPath: string): boolean {
  // 首页只匹配精确的 '/'
  if (menuPath === '/') {
    return pathname === '/'
  }
  // 其他路径匹配当前路径或其子路径
  return pathname === menuPath || pathname.startsWith(menuPath + '/')
}

const menuItems = [
  { path: '/', label: '首页' },
  { path: '/reports', label: '巡检报告' },
  { path: '/knowledge', label: '知识库' },
]

function App() {
  const location = useLocation()

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <nav className="shrink-0 bg-white shadow-sm">
        <div className="px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">承压类特种设备数字孪生监测与巡检系统</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => {
                  const active = isActive(location.pathname, item.path)
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-4 border-b-solid ${
                        active
                          ? 'border-b-blue-500 text-blue-500 font-bold hover:text-blue-500'
                          : 'border-b-transparent text-gray-500 !hover:text-blue-500 hover:text-gray-500'
                      }`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-0 flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:reportId" element={<ReportDetail />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
