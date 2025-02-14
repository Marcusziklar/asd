"use client"

import { useState } from "react"
import { LayoutDashboard, Package, QrCode, Settings, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import Dashboard from "./Dashboard"
import ProductsTable from "./ProductsTable"
import QRCodeManager from "./QRCodeManager"
import LabelManager from "./LabelManager"

export default function Layout() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />
      case "products":
        return <ProductsTable />
      case "qrcodes":
        return <QRCodeManager />
      case "labels":
        return <LabelManager />
      case "settings":
        return <div>Settings Page</div>
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <nav className="space-y-2">
          <Button
            variant={activeTab === "dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button
            variant={activeTab === "products" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("products")}
          >
            <Package className="mr-2 h-4 w-4" />
            Products
          </Button>
          <Button
            variant={activeTab === "qrcodes" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("qrcodes")}
          >
            <QrCode className="mr-2 h-4 w-4" />
            QR Codes
          </Button>
          <Button
            variant={activeTab === "labels" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("labels")}
          >
            <Tag className="mr-2 h-4 w-4" />
            Labels
          </Button>
          <Button
            variant={activeTab === "settings" ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveTab("settings")}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{renderContent()}</main>
    </div>
  )
}

