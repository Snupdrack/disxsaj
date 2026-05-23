import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create MenuConfig
  await prisma.menuConfig.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      logoImg: '/uploads/logo.png',
      diablitoImg: '',
      gloriasImg: '',
      botanasImg: '',
      precioClasico: 25,
      precioGlorias: 27,
      precioDiablito: 27,
      precioBotana: 12,
      precioExtra: 2,
      diablitoDesc: 'Clásico de Tamarindo, Nanche o Durazno, cargado con chamoy, salsa botanera y Tajín. ¡Pica pero sabe rico!',
      gloriasDesc: 'Sabor de fresa con plátano, leche, lechera y ese toque especial. ¡El favorito de la casa!',
    },
  })

  // Create Sabores
  const sabores = [
    { nombre: 'Fresa', emoji: '🍓', color: '#DC143C', bg: 'linear-gradient(135deg,#ffe0e0,#ffccd5)', desc: 'Rojo intenso y dulce, irresistible como la fresa fresca.', orden: 0 },
    { nombre: 'Limón', emoji: '🍋', color: '#6B8E23', bg: 'linear-gradient(135deg,#f0fff0,#e8f5e9)', desc: 'Refrescante y cítrico, el favorito para el calor extremo.', orden: 1 },
    { nombre: 'Piña', emoji: '🍍', color: '#FFD700', bg: 'linear-gradient(135deg,#fffde7,#fff9c4)', desc: 'Tropical y refrescante, el sabor de la piña natural.', orden: 2 },
    { nombre: 'Mora azul', emoji: '🫐', color: '#5B4FCF', bg: 'linear-gradient(135deg,#e8e0ff,#d0c4ff)', desc: 'Intenso y dulce, el sabor bold de la mora azul.', orden: 3 },
    { nombre: 'Nanche', emoji: '🌿', color: '#DAA520', bg: 'linear-gradient(135deg,#fff8e1,#ffecb3)', desc: 'Dulce y tropical, el sabor dorado del nanche oaxaqueño.', orden: 4 },
  ]

  for (const s of sabores) {
    await prisma.sabor.create({ data: s })
  }

  // Create Extras Clásico
  const extrasClasico = [
    { nombre: '🌶️ Chamoy', orden: 0 },
    { nombre: '🔥 Salsa', orden: 1 },
    { nombre: '🧂 Tajín', orden: 2 },
    { nombre: '🥛 Lechera', orden: 3 },
  ]
  for (const e of extrasClasico) {
    await prisma.extraClasico.create({ data: e })
  }

  // Create Extras Diablito
  const extrasDiablito = [
    { nombre: '🌶️ Doble Chamoy', orden: 0 },
    { nombre: '🔥 Más Salsa botanera', orden: 1 },
    { nombre: '🧂 Extra Tajín', orden: 2 },
    { nombre: '🥛 Con Lechera', orden: 3 },
  ]
  for (const e of extrasDiablito) {
    await prisma.extraDiablito.create({ data: e })
  }

  // Create Extras Gloria
  const extrasGloria = [
    { nombre: '🥛 Extra Lechera', orden: 0 },
    { nombre: '🍌 Más Plátano', orden: 1 },
  ]
  for (const e of extrasGloria) {
    await prisma.extraGloria.create({ data: e })
  }

  // Create Bases Diablito
  const basesDiablito = [
    { nombre: '🫙 Tamarindo', orden: 0 },
    { nombre: '🌿 Nanche', orden: 1 },
    { nombre: '🍑 Durazno', orden: 2 },
  ]
  for (const b of basesDiablito) {
    await prisma.baseDiablito.create({ data: b })
  }

  // Create Botanas
  const botanas = [
    { nombre: '🥔 Papas', orden: 0 },
    { nombre: '🫳 Chicharrones', orden: 1 },
    { nombre: '🌾 Hojuelas', orden: 2 },
    { nombre: '🥜 Cacahuates', orden: 3 },
  ]
  for (const b of botanas) {
    await prisma.botana.create({ data: b })
  }

  console.log('Seed completed successfully!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
