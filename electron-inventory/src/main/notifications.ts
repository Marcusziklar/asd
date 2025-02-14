import { Notification } from "electron"

export class NotificationService {
  showNotification(title: string, body: string) {
    new Notification({ title, body }).show()
  }

  showLowStockNotification(product: { name: string; stock: number }) {
    this.showNotification("Low Stock Alert", `${product.name} is running low on stock (${product.stock} remaining).`)
  }

  showPriceChangeNotification(product: { name: string; oldPrice: number; newPrice: number }) {
    this.showNotification(
      "Price Change Alert",
      `${product.name} price changed from $${product.oldPrice.toFixed(2)} to $${product.newPrice.toFixed(2)}.`,
    )
  }
}

