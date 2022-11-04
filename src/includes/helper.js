export default {
    formatTime(time) {
        const minutes = Math.floor(time / 60) || 0 // Nece svaki br biti deljiv sa 60, zato moramo da grabujemo i sekunde:
        const seconds = Math.round(time - minutes * 60 || 0)

        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
}
