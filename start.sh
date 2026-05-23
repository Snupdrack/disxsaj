#!/bin/bash
# ═══════════════════════════════════════════════════════
# Raspados Didxsaj - Script de inicio automático
# Se ejecuta en Railway/Vercel/producción
# Hace TODO: migraciones + seed + arrancar servidor
# ═══════════════════════════════════════════════════════

set -e

echo "🚀 Iniciando Raspados Didxsaj..."
echo ""

# ─── 1. Generar cliente Prisma ───
echo "📦 Generando cliente Prisma..."
npx prisma generate

# ─── 2. Ejecutar migraciones ───
echo "🗄️ Ejecutando migraciones..."
npx prisma migrate deploy

# ─── 3. Seed (solo si la base de datos está vacía) ───
echo "🌱 Verificando datos iniciales..."
# Verificar si ya hay datos (si el MenuConfig "main" existe)
HAS_DATA=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.menuConfig.findUnique({ where: { id: 'main' } })
  .then(r => { console.log(r ? 'yes' : 'no'); p.\$disconnect(); })
  .catch(() => { console.log('no'); p.\$disconnect(); });
" 2>/dev/null || echo "no")

if [ "$HAS_DATA" = "no" ]; then
  echo "🌱 Base de datos vacía, ejecutando seed..."
  npx prisma db seed
else
  echo "✅ Base de datos ya tiene datos, saltando seed."
fi

# ─── 4. Arrancar servidor ───
echo ""
echo "🏁 Arrancando servidor en puerto ${PORT:-3000}..."
exec node server.js
