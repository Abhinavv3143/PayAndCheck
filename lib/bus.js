import { EventEmitter } from 'events'
const g = globalThis
export const bus = g.__pac_bus || new EventEmitter()
if (!g.__pac_bus) g.__pac_bus = bus
