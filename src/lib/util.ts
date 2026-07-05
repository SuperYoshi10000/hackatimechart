export function getHMSFromTime(time: number): [number, number, number] {
    return [
        Math.floor(time / 3600), // hours
        Math.floor((time % 3600) / 60), // minutes
        time % 60 // seconds
    ]
}