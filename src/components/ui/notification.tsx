"use client"

import { useState, useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react"
import { createPortal } from "react-dom"

export type NotificationType = "success" | "error" | "info" | "warning"

export interface NotificationProps {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

interface NotificationItemProps extends NotificationProps {
  onClose: () => void
  index: number
}

// The individual notification component
function NotificationItem({ type, title, message, duration = 5000, onClose }: Omit<NotificationItemProps, 'id' | 'index'>) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onClose()
    }, duration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [duration])

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-white" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-white" />
      case "info":
        return <Info className="h-5 w-5 text-white" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500"
      case "error":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onAnimationComplete={() => {
        setTimeout(() => {
          onClose();
        }, 5000);
      }}
      className={`w-80 rounded-lg shadow-lg ${getBackgroundColor()} text-white overflow-hidden`}
    >
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3">{getIcon()}</div>
        <div className="flex-1 mr-2">
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-sm opacity-90">{message}</p>
        </div>
        <button onClick={onClose} className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className="h-1 bg-white/30"
      />
    </motion.div>
  )
}

// The notification container and context
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationProps[]>([])
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Function to add a notification
  const addNotification = (notification: Omit<NotificationProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setNotifications((prev) => [...prev, { ...notification, id }])
    return id
  }

  // Function to remove a notification
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  // Expose the notification functions globally
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.showNotification = addNotification
    }
  }, [])

  if (!isMounted) return null

  return createPortal(
    <div className="fixed top-4 right-4 z-[9999999] space-y-4 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem {...notification} onClose={() => removeNotification(notification.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  )
}

// Global notification functions
declare global {
  interface Window {
    showNotification: (notification: Omit<NotificationProps, "id">) => string
  }
}

// Hook for using notifications in components
export function useNotification() {
  const show = (notification: Omit<NotificationProps, "id">) => {
    if (typeof window !== "undefined" && window.showNotification) {
      return window.showNotification(notification)
    }
    return ""
  }

  return {
    show,
    success: (title: string, message: string, duration?: number) => show({ type: "success", title, message, duration }),
    error: (title: string, message: string, duration?: number) => show({ type: "error", title, message, duration }),
    warning: (title: string, message: string, duration?: number) => show({ type: "warning", title, message, duration }),
    info: (title: string, message: string, duration?: number) => show({ type: "info", title, message, duration }),
  }
} 