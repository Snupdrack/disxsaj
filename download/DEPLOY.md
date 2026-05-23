# 🚀 Guía de Despliegue - Raspados Didxsaj

Esta guía explica cómo desplegar tu menú digital en **Railway** o **Vercel** con tu propio dominio.

---

## 📋 Resumen de cambios para producción

Tu app ya fue adaptada para funcionar en la nube:

| Aspecto | Desarrollo local | Producción (Railway/Vercel) |
|---------|-----------------|---------------------------|
| **Base de datos** | SQLite (archivo local) | PostgreSQL (en la nube) |
| **Imágenes** | Archivos en `public/uploads/` | Base64 en la base de datos |
| **Contraseña admin** | Hardcodeada | Variable de entorno |
| **WhatsApp** | Hardcodeado | Variable de entorno |

---

## 🟣 OPCIÓN 1: Despliegue en Railway

Railway es la opción más fácil porque soporta Docker y PostgreSQL nativo.

### Paso 1: Crear cuenta y proyecto
1. Ve a [railway.app](https://railway.app) y créate una cuenta (puedes usar GitHub)
2. Haz clic en **"New Project"**
3. Selecciona **"Deploy from GitHub repo"** y conecta tu repositorio

### Paso 2: Agregar PostgreSQL
1. Dentro de tu proyecto, haz clic en **"+ New"**
2. Selecciona **"Database" → "Add PostgreSQL"**
3. Railway creará una base de datos PostgreSQL automáticamente
4. Ve a la pestaña **"Variables"** de PostgreSQL y copia el `DATABASE_URL`

### Paso 3: Configurar variables de entorno
En tu servicio web (el de Next.js), ve a **"Variables"** y agrega:

```
DATABASE_URL=postgresql://usuario:password@host:5432/railway?schema=public
ADMIN_PASSWORD=didxsaj2024
ADMIN_TOKEN=cambia-este-token-para-produccion
NEXT_PUBLIC_WA_NUMBER=5219512645961
```

> ⚠️ Usa el `DATABASE_URL` que te dio Railway en el Paso 2

### Paso 4: Cambiar el provider de Prisma
En `prisma/schema.prisma`, cambia la línea 10:

```prisma
# ANTES (SQLite para local):
provider = "sqlite"

# DESPUÉS (PostgreSQL para Railway):
provider = "postgresql"
```

Haz commit y push de este cambio.

### Paso 5: Ejecutar migración y seed
En Railway, ve a tu servicio web → **"Settings"** → **"Deploy"** y agrega un comando de inicio personalizado:

```
npx prisma migrate deploy && npx prisma db seed && node server.js
```

O si prefieres usar la terminal de Railway (ubicada en Settings):

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Paso 6: Crear la primera migración
Antes de hacer push, genera la migración localmente:

```bash
# En tu computadora, con provider = "postgresql":
npx prisma migrate dev --name init
```

Esto creará la carpeta `prisma/migrations/`. Haz commit y push.

### Paso 7: Configurar dominio personalizado
1. En Railway, ve a tu servicio web → **"Settings"** → **"Networking"**
2. Haz clic en **"Generate Domain"** para obtener un dominio `.up.railway.app`
3. Para tu dominio personalizado, haz clic en **"Custom Domain"**
4. Ingresa tu dominio (ej: `menu.didxsaj.com`)
5. Railway te dará un registro CNAME que debes agregar en tu proveedor de DNS:
   - **Tipo**: CNAME
   - **Nombre**: menu (o el subdominio que quieras)
   - **Valor**: `tu-app.up.railway.app`

### Costo estimado Railway
- **Hobby Plan**: $5/mes — incluye $5 de créditos
- PostgreSQL: ~$1/mes (base de datos pequeña)
- Web service: ~$3-4/mes
- **Total estimado**: ~$5/mes

---

## ▲ OPCIÓN 2: Despliegue en Vercel

Vercel es gratuito para proyectos personales y muy fácil con Next.js.

### Paso 1: Crear cuenta y proyecto
1. Ve a [vercel.com](https://vercel.com) y créate una cuenta con GitHub
2. Haz clic en **"Add New" → "Project"**
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es Next.js

### Paso 2: Configurar PostgreSQL
Vercel no tiene PostgreSQL nativo, así que necesitas un servicio externo:

**Opción A: Neon (Recomendado - Gratuito)**
1. Ve a [neon.tech](https://neon.tech) y créate una cuenta
2. Crea un proyecto PostgreSQL
3. Copia la conexión string: `postgresql://usuario:password@ep-xxx.neon.tech/nombre_db?sslmode=require`

**Opción B: Supabase (También gratuito)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto y copia el `DATABASE_URL` de la sección Database

**Opción C: Railway PostgreSQL**
1. Crea solo un servicio PostgreSQL en Railway (sin el web service)
2. Copia el `DATABASE_URL`

### Paso 3: Cambiar provider y crear migración
Igual que en Railway:

1. Cambiar `provider = "sqlite"` a `provider = "postgresql"` en `prisma/schema.prisma`
2. Ejecutar: `npx prisma migrate dev --name init`
3. Commit y push

### Paso 4: Configurar variables de entorno en Vercel
En tu proyecto Vercel → **Settings** → **Environment Variables**:

```
DATABASE_URL=postgresql://usuario:password@host:5432/db?sslmode=require
ADMIN_PASSWORD=didxsaj2024
ADMIN_TOKEN=cambia-este-token-para-produccion
NEXT_PUBLIC_WA_NUMBER=5219512645961
```

### Paso 5: Ejecutar migración y seed
En tu computadora local, con el `DATABASE_URL` de producción:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

O usa la API de Vercel para ejecutar comandos:

```bash
npx vercel env pull .env.production
npx prisma migrate deploy
npx prisma db seed
```

### Paso 6: Desplegar
Simplemente haz push a GitHub. Vercel detectará los cambios y desplegará automáticamente.

### Paso 7: Configurar dominio personalizado
1. En Vercel, ve a **Settings** → **Domains**
2. Agrega tu dominio (ej: `menu.didxsaj.com`)
3. Vercel te dará los registros DNS que debes configurar:
   - **Tipo**: CNAME
   - **Nombre**: menu
   - **Valor**: `cname.vercel-dns.com`
4. También puedes agregar el dominio raíz (`didxsaj.com`) con un registro A

### Costo estimado Vercel
- **Hobby Plan**: **Gratis** (100GB bandwidth, Serverless Functions)
- Neon PostgreSQL: **Gratis** (0.5GB almacenamiento)
- **Total estimado**: $0/mes

---

## 📁 Archivos importantes para el despliegue

```
raspados-didxsaj/
├── Dockerfile              # Configuración Docker para Railway
├── railway.toml            # Configuración Railway
├── vercel.json             # Configuración Vercel
├── .env                    # Variables de entorno (NO subir a Git)
├── .env.example            # Ejemplo de variables de entorno (SÍ subir a Git)
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   ├── seed.ts             # Datos iniciales del menú
│   └── migrations/         # Migraciones (se generan con prisma migrate dev)
├── src/
│   ├── app/
│   │   ├── page.tsx        # Página principal
│   │   ├── layout.tsx      # Layout
│   │   └── api/            # APIs del backend
│   │       ├── menu/       # API pública del menú
│   │       └── admin/      # APIs de administración
│   └── lib/
│       └── db.ts           # Conexión Prisma
└── public/
    └── uploads/            # Imágenes (solo para desarrollo local)
```

---

## 🔧 Pasos antes de hacer push a GitHub

1. **Crear repositorio Git**:
```bash
git init
git add .
git commit -m "Menú digital Raspados Didxsaj listo para producción"
```

2. **Crear repositorio en GitHub** y hacer push:
```bash
git remote add origin https://github.com/TU-USUARIO/raspados-didxsaj.git
git push -u origin main
```

3. **Cambiar a PostgreSQL** (solo necesitas cambiar 1 línea):
En `prisma/schema.prisma`, línea 10:
```
provider = "postgresql"
```

4. **Generar migración**:
```bash
# Configura DATABASE_URL de PostgreSQL en .env temporalmente
npx prisma migrate dev --name init
```

5. **Commit y push**:
```bash
git add .
git commit -m "Migración a PostgreSQL para producción"
git push
```

---

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env` a GitHub (ya está en `.gitignore`)
- Cambia el `ADMIN_TOKEN` para producción a algo largo y aleatorio
- El `ADMIN_PASSWORD` es lo que escribes en la app para entrar al panel admin

---

## ❓ Preguntas frecuentes

**¿Se pierden las imágenes si re-deploy?**
No. Las imágenes se guardan en la base de datos (PostgreSQL), no en el filesystem. Sobreviven a reinicios y re-deploys.

**¿Puedo usar SQLite en producción?**
No recomendado. SQLite no funciona bien en Vercel (filesystem de solo lectura) ni en Railway (filesystem efímero). PostgreSQL es la opción correcta.

**¿Cuánto cuesta?**
- Vercel + Neon: **Gratis**
- Railway: ~**$5/mes**

**¿Cómo agrego mi dominio?**
En Railway o Vercel, ve a Settings → Domains y agrega tu dominio. Te darán los registros DNS que debes configurar en tu proveedor (GoDaddy, Namecheap, etc.).

**¿Los clientes ven los cambios de inmediato?**
Sí. Todo sale de la base de datos PostgreSQL. Cuando cambias algo desde el panel admin, cualquier cliente que abra la página verá el cambio actualizado.
