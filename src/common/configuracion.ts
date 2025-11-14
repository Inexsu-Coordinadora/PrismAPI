//* No exportamos un objeto, exportamos una FUNCIÓN
export function getConfig() {
    
    //* Esta función LEE 'process.env' en el momento en que se llama,
    //* para ese entonces, index.ts YA habrá corrido dotenv.config()
    return {
        httpPuerto: Number(process.env.PUERTO),
        baseDatos: {
            host: process.env.PGHOST,
            puerto: Number(process.env.PGPORT),
            usuario: process.env.PGUSER,
            contrasena: process.env.PGPASSWORD,
            nombreDb: process.env.PGDBNAME, //* <-- ¡Ahora sí tendrá el valor!
        },
    };
}