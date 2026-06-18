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
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  children: string
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        'text-foreground/90 max-w-none text-sm leading-7',
        '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-foreground',
        '[overflow-wrap:anywhere] break-words [word-break:break-word]',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ ...props }) => (
            <h1
              {...props}
              className='text-foreground mt-6 mb-4 border-b pb-3 text-xl font-semibold'
            />
          ),
          h2: ({ ...props }) => (
            <h2
              {...props}
              className='text-foreground mt-6 mb-3 text-base font-semibold'
            />
          ),
          h3: ({ ...props }) => (
            <h3
              {...props}
              className='text-foreground mt-5 mb-2 text-[0.95rem] font-semibold'
            />
          ),
          h4: ({ ...props }) => (
            <h4 {...props} className='text-foreground mt-4 mb-2 font-semibold' />
          ),
          p: ({ ...props }) => (
            <p {...props} className='my-2.5 whitespace-pre-wrap leading-7' />
          ),
          a: ({ ...props }) => (
            <a
              {...props}
              className='text-primary underline-offset-4 hover:underline'
              target='_blank'
              rel='noopener noreferrer'
            />
          ),
          ul: ({ ...props }) => (
            <ul
              {...props}
              className='marker:text-muted-foreground my-3 list-disc space-y-1.5 pl-5'
            />
          ),
          ol: ({ ...props }) => (
            <ol
              {...props}
              className='marker:text-muted-foreground my-3 list-decimal space-y-1.5 pl-5'
            />
          ),
          li: ({ ...props }) => (
            <li {...props} className='pl-1.5 whitespace-pre-wrap leading-7' />
          ),
          hr: ({ ...props }) => (
            <hr {...props} className='border-border/70 my-5 border-t' />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              {...props}
              className='border-primary/70 bg-muted/40 text-muted-foreground my-4 border-l-2 py-2 pr-4 pl-4'
            />
          ),
          code: ({ ...props }) => (
            <code
              {...props}
              className='bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.9em]'
            />
          ),
          pre: ({ ...props }) => (
            <pre
              {...props}
              className='bg-muted/70 my-4 overflow-x-auto rounded-md border p-3.5 text-xs leading-6'
            />
          ),
          table: ({ ...props }) => (
            <div className='my-4 overflow-x-auto rounded-md border'>
              <table {...props} className='w-full border-collapse text-left' />
            </div>
          ),
          th: ({ ...props }) => (
            <th
              {...props}
              className='bg-muted border-b px-3 py-2 font-semibold'
            />
          ),
          td: ({ ...props }) => (
            <td {...props} className='border-t px-3 py-2 align-top' />
          ),
          img: ({ ...props }) => (
            <img {...props} className='my-3 rounded-lg shadow-sm' />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
