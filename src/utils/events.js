// Hodisa turlari: nomi, ikonkasi va rangi (DeviceTable, DeviceTimeline va bildirishnomalar uchun)

export const EVENTS = {
    NEW_DEVICE:     { name: 'Yangi qurilma',  icon: '＋', bg: 'bg-blue-500' },
    DEVICE_ONLINE:  { name: 'Online bo‘ldi',  icon: '●', bg: 'bg-green-500' },
    DEVICE_OFFLINE: { name: 'Offline bo‘ldi', icon: '○', bg: 'bg-red-500' },
    IP_CHANGED:     { name: 'IP o‘zgardi',    icon: '⇄', bg: 'bg-yellow-500' },
    MAC_CHANGED:    { name: 'MAC o‘zgardi',   icon: '⇆', bg: 'bg-purple-500' },
}

export const eventName = (type) => EVENTS[type]?.name || type

export const eventIcon = (type) => EVENTS[type]?.icon || '•'

export const eventBg = (type) => EVENTS[type]?.bg || 'bg-gray-500'
