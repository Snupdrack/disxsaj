# 🚀 Despliegue Raspados Didxsaj - Guía Simple

Todo está configurado para que solo conectes tu repo y funcione.

---

## 🟣 Railway (Recomendado) — ~$5/mes

### Solo 3 pasos:

**1. Sube tu código a GitHub**
```bash
git init
git add .
git commit -m "Menú digital Raspados Didxsaj"
git remote add origin https://github.com/TU-USUARIO/raspados-didxsaj.git
git push -u origin main
```

**2. Crea el proyecto en Railway**
1. Ve a [railway.app](https://railway.app) → **"New Project"**
2. Selecciona **"Deploy from GitHub repo"** → elige tu repo
3. Espera a que construya (2-3 min)
4. Ve a **"+ New"** → **"Database"** → **"Add PostgreSQL"**
5. Railway conecta automáticamente el `DATABASE_URL` a tu app

**3. Agrega tu dominio personalizado**
1. Ve a tu servicio web → **"Settings"** → **"Networking"**
2. Haz clic en **"Custom Domain"**
3. Ingresa tu dominio (ej: `menu.didxsaj.com`)
4. Agrega el registro CNAME en tu proveedor de DNS:
   - Tipo: `CNAME`
   - Nombre: `menu`
   - Valor: `tu-app.up.railway.app`

### ¿Qué hace Railway automáticamente?
- ✅ Lee el `Dockerfile` y construye la app
- ✅ Lee el `railway.toml` para configuración
- ✅ Ejecuta `start.sh` que hace: migraciones + seed + servidor
- ✅ Conecta PostgreSQL automáticamente
- ✅ Variables de entorno por defecto (admin password, WhatsApp)

### Variables de entorno (ya tienen defaults, pero puedes cambiarlas):
| Variable | Default | Para qué |
|----------|---------|----------|
| `DATABASE_URL` | (automático de PostgreSQL) | Conexión a la base de datos |
| `ADMIN_PASSWORD` | `didxsaj2024` | Contraseña del panel admin |
| `ADMIN_TOKEN` | `didxsaj-admin-2024-token` | Token de sesión admin |
| `NEXT_PUBLIC_WA_NUMBER` | `5219512645961` | Número de WhatsApp |

---

## ▲ Vercel (Gratis)

### 4 pasos:

**1. Sube tu código a GitHub** (igual que arriba)

**2. Crea base de datos PostgreSQL gratis**
1. Ve a [neon.tech](https://neon.tech) → créate una cuenta
2. Crea un proyecto → copia el `DATABASE_URL`

**3. Importa en Vercel**
1. Ve a [vercel.com](https://vercel.com) → **"Add New" → "Project"**
2. Importa tu repo de GitHub
3. En **Environment Variables**, agrega:
   - `DATABASE_URL` = (el de Neon)
   - `ADMIN_PASSWORD` = `didxsaj2024`
   - `ADMIN_TOKEN` = `didxsaj-admin-2024-token`
   - `NEXT_PUBLIC_WA_NUMBER` = `5219512645961`
4. Haz clic en **"Deploy"**

**4. Ejecuta migración y seed**
En tu computadora local:
```bash
# Instala Vercel CLI
npm i -g vercel

# Conecta y descarga las variables de entorno
vercel env pull .env.production

# Ejecuta migraciones
npx prisma migrate deploy

# Ejecuta seed (datos iniciales)
npx prisma db seed
```

**5. Dominio personalizado**
1. En Vercel → **Settings** → **Domains**
2. Agrega tu dominio
3. Configura el CNAME en tu DNS: `cname.vercel-dns.com`

---

## 📁 Archivos que hacen la magia

| Archivo | Qué hace |
|---------|----------|
| `Dockerfile` | Construye la app en Docker (Railway lo usa) |
| `railway.toml` | Configura Railway: build, start, healthcheck, env vars |
| `start.sh` | **Script mágico**: migraciones + seed + servidor |
| `vercel.json` | Configura Vercel: build command |
| `prisma/schema.prisma` | Esquema PostgreSQL (producción) |
| `prisma/schema.sqlite.prisma` | Esquema SQLite (desarrollo local) |
| `prisma/migrations/` | Migraciones de base de datos |
| `prisma/seed.ts` | Datos iniciales del menú |

---

## ❓ Preguntas frecuentes

**¿Se pierden las imágenes si re-deploy?**
No. Las imágenes se guardan en la base de datos PostgreSQL, no en el filesystem.

**¿Tengo que configurar algo manualmente?**
En Railway: NO. Solo conecta repo + agrega PostgreSQL.
En Vercel: Solo necesitas crear el PostgreSQL en Neon y correr la migración.

**¿Puedo cambiar la contraseña del admin?**
Sí, cambia la variable `ADMIN_PASSWORD` en Railway/Vercel.

**¿Los clientes ven los cambios de inmediato?**
Sí. Todo viene de PostgreSQL. Cambios del panel admin son visibles al instante.
