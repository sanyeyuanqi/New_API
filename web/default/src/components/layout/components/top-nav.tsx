/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useMemo } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type TopNavLink } from '../types'

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  links: TopNavLink[]
  expanded?: boolean
}

/**
 * 顶部导航栏组件
 * 在大屏幕显示水平导航，在小屏幕显示下拉菜单
 */
export function TopNav({
  className,
  links,
  expanded: _expanded = false,
  ...props
}: TopNavProps) {
  const location = useLocation()
  // 规范化链接，确保所有可选属性都有默认值
  const normalizedLinks = useMemo(
    () =>
      links.map((link) => ({
        disabled: false,
        external: false,
        ...link,
        isActive:
          link.isActive ??
          (link.href === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(link.href)),
      })),
    [links, location.pathname]
  )

  return (
    <>
      {/* 移动端下拉菜单 */}
      <div className='lg:hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger
            render={
              <Button
                size='icon'
                variant='outline'
                className='size-10 rounded-full border-slate-200/80 bg-white/70 shadow-none dark:border-white/10 dark:bg-white/[0.045]'
              />
            }
          >
            <Menu className='size-4' />
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {normalizedLinks.map(
              ({ title, href, isActive, disabled, external }) => (
                <DropdownMenuItem
                  key={`${title}-${href}`}
                  render={
                    external ? (
                      <a
                        href={href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={!isActive ? 'text-muted-foreground' : ''}
                      >
                        {title}
                      </a>
                    ) : (
                      <Link
                        to={href}
                        className={!isActive ? 'text-muted-foreground' : ''}
                        disabled={disabled}
                      >
                        {title}
                      </Link>
                    )
                  }
                ></DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 桌面端水平导航 */}
      <nav
        className={cn(
          'absolute top-1/2 left-1/2 hidden h-8 min-w-0 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-lg border-transparent bg-transparent p-0 shadow-none backdrop-blur-none transition-[width,max-width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:inline-flex dark:border-transparent dark:bg-transparent',
          className
        )}
        {...props}
      >
        {normalizedLinks.map(({ title, href, isActive, disabled, external }) =>
          external ? (
            <a
              key={`${title}-${href}`}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className={cn(
                'inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                  : 'text-slate-500 hover:bg-slate-950/[0.045] hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.075] dark:hover:text-white'
              )}
            >
              {title}
            </a>
          ) : (
            <Link
              key={`${title}-${href}`}
              to={href}
              disabled={disabled}
              className={cn(
                'inline-flex h-7 items-center rounded-lg px-2.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                  : 'text-slate-500 hover:bg-slate-950/[0.045] hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.075] dark:hover:text-white',
                disabled && 'pointer-events-none opacity-50'
              )}
            >
              {title}
            </Link>
          )
        )}
      </nav>
    </>
  )
}
