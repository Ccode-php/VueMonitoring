/*
| Topologiya joylashuvi (yuqoridan pastga daraxt).
|
|   core-sw
|     |-- [qurilmalar]  [child switch]  [child switch]
|                         |-- [qurilmalar]
|
| Har bir switch o'z "blok"ining o'rtasida turadi, bloklar bir-biriga tegmaydi.
| Sof funksiya: Vue'ga bog'liq emas (node bilan ham sinash mumkin).
*/

export const SIZE = {
    SW_W: 250,       // switch node kengligi
    SW_H: 90,
    DEV_W: 170,      // qurilma node kengligi
    COL_STEP: 195,   // qurilma ustunlari orasidagi qadam
    ROW_STEP: 118,   // qurilma qatorlari orasidagi qadam (port yozuvi uchun joy bilan)
    LEVEL_Y: 190,    // daraja balandligi
    GAP_X: 40,       // bloklar orasidagi bo'sh joy
    MAX_COLS: 4,     // bitta switch ostida qatorda ko'pi bilan nechta qurilma
    ROOT_GAP: 100,   // ildiz switchlar orasidagi masofa
}

const devicesOf = (sw) => {
    const list = []

    ;(sw.ports || []).forEach((port) => {
        ;(port.devices || []).forEach((device) => list.push({ device, port }))
    })

    return list
}

const measure = (sw) => {
    const devs = devicesOf(sw)
    const cols = Math.min(devs.length, SIZE.MAX_COLS)
    const devW = cols ? (cols - 1) * SIZE.COL_STEP + SIZE.DEV_W : 0
    const kids = (sw.children || []).map(measure)

    const parts = [...(devW ? [devW] : []), ...kids.map((k) => k.width)]
    const itemsW = parts.reduce((a, b) => a + b, 0) + Math.max(0, parts.length - 1) * SIZE.GAP_X

    return { sw, devs, cols, devW, kids, itemsW, width: Math.max(SIZE.SW_W, itemsW) }
}

const place = (m, left, y, parent, out) => {
    const center = left + m.width / 2

    out.switches.push({ sw: m.sw, parent, x: center - SIZE.SW_W / 2, y })

    let cursor = left + (m.width - m.itemsW) / 2

    if (m.devW) {
        m.devs.forEach(({ device, port }, i) => {
            out.devices.push({
                device,
                port,
                sw: m.sw,
                x: cursor + (i % m.cols) * SIZE.COL_STEP,
                y: y + SIZE.LEVEL_Y + Math.floor(i / m.cols) * SIZE.ROW_STEP,
            })
        })

        cursor += m.devW + SIZE.GAP_X
    }

    m.kids.forEach((k) => {
        place(k, cursor, y + SIZE.LEVEL_Y, m.sw, out)
        cursor += k.width + SIZE.GAP_X
    })
}

export const layoutTopology = (roots) => {
    const out = { switches: [], devices: [] }

    let left = 0

    ;(roots || []).forEach((root) => {
        const m = measure(root)

        place(m, left, 0, null, out)

        left += m.width + SIZE.ROOT_GAP
    })

    return out
}
