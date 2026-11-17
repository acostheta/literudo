// Marca de la política "Recordarme" que lee el middleware.
//
// Si la cookie falta, el middleware entiende que el navegador se cerró y el
// usuario no quería recordarse, y cierra la sesión. Por eso hay que escribirla
// en TODOS los flujos que abren sesión (login y alta): si falta, el usuario
// recién autenticado rebota a /login con el formulario bloqueado.
export function setRememberCookie(remember: boolean) {
  if (remember) {
    // Persistente 30 días: sobrevive al cierre del navegador.
    document.cookie = "literudo_remember=1; path=/; max-age=2592000; samesite=lax";
  } else {
    // Cookie de sesión (sin max-age): muere al cerrar el navegador, y en la
    // siguiente visita el middleware cierra la sesión.
    document.cookie = "literudo_remember=0; path=/; samesite=lax";
  }
}
