// Extend Express Request to include `user` populated by Passport/JWT
// Extensión de tipos para Express + Passport/JWT
// 
// ¿Por qué esto?
// Cuando el JwtAuthGuard valida el token, automáticamente añade información
// del usuario a req.user (lo hace Passport internamente).
// 
// Por defecto, TypeScript no sabe qué propiedades tiene req.user,
// así que aquí le decimos: "req.user tendrá al menos un id de tipo number"
// 
// Esto es lo que devuelve tu jwt.strategy.ts en el método validate():
//   return { id: user.id, avatar: user.avatar, ... }
// 
// Ahora puedes hacer req.user.id sin errores de TypeScript ✅

declare global {
  namespace Express {
    interface User {
      id: number;
      // Si tu JWT devuelve más campos (avatar, email, role), añádelos aquí:
      // avatar?: number;
      // email?: string;
    }
  }
}

export {};
