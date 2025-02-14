"use client"

export const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">{children}</div>
)

export const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <header className="px-4 py-3 bg-gray-100">{children}</header>
)

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-medium">{children}</h3>
)

export const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-4">{children}</div>

export const Box = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a2 2 0 011.707.293l4.414 4.414a2 2 0 01.293 1.707V19a2 2 0 01-2 2h-1"
    />
  </svg>
)

export const Package = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-3 3m-9-3l3 3m-3-3h14"
    />
  </svg>
)

export const Tag = ({ children }: { children: React.ReactNode }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
    />
  </svg>
)

