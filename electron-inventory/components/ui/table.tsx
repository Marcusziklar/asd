"use client"

export const Table = ({ children }: { children: React.ReactNode }) => (
  <table className="w-full border-collapse">{children}</table>
)

export const TableBody = ({ children }: { children: React.ReactNode }) => <tbody className="text-sm">{children}</tbody>

export const TableCell = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-2 border border-gray-200">{children}</td>
)

export const TableHead = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-2 border border-gray-200 font-medium">{children}</th>
)

export const TableHeader = ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>

export const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr className="border-b border-gray-200">{children}</tr>
)

export const Button = ({
  children,
  variant = "default",
  size = "default",
  onClick,
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "icon"
  onClick?: () => void
}) => {
  const buttonClasses = `inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
    variant === "outline"
      ? "border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-800"
      : variant === "ghost"
        ? "text-gray-500 hover:bg-gray-100"
        : "bg-gray-700 text-white hover:bg-gray-800"
  } ${size === "icon" ? "px-1 py-1" : ""}`

  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  )
}

export const Input = ({
  type = "text",
  placeholder,
  className,
  value,
  onChange,
}: {
  type?: string
  placeholder?: string
  className?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <input
    type={type}
    placeholder={placeholder}
    className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${className || ""}`}
    value={value}
    onChange={onChange}
  />
)

