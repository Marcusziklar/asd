import Layout from "./components/Layout"
import { ThemeProvider } from "./components/ThemeProvider"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Layout />
    </ThemeProvider>
  )
}

export default App

