/**
 * Self-check for the TCG query builder.
 *
 *   npm run check:tcg
 *
 * The branching in buildQueryParams is what decides whether the gallery opens on
 * Bulbasaur or on a wall of Energy cards, and it is not covered by lint or tsc.
 * No test framework — plain asserts, exits non-zero on the first failure.
 */

import assert from 'node:assert/strict'
import { buildQueryParams } from '../composables/tcg/useTCGApi.ts'

const q = (params: Parameters<typeof buildQueryParams>[0]) =>
  Object.fromEntries(new URLSearchParams(buildQueryParams(params)))

// Free browsing: Pokédex order, and no Trainer/Energy cards ahead of #1
{
  const p = q({ pageSize: 20 })
  assert.equal(p.q, 'nationalPokedexNumbers:[1 TO 1025]')
  assert.equal(p.orderBy, 'nationalPokedexNumbers,set.releaseDate,number')
}

// Inside a set: binder order, and no Pokédex range (a set includes its Trainers)
{
  const p = q({ set: 'base1', pageSize: 20 })
  assert.equal(p.q, 'set.id:base1')
  assert.equal(p.orderBy, 'number')
}

// A name search reaches Trainer/Energy cards, so the Pokédex range must not apply
{
  const p = q({ name: 'Professor Oak' })
  assert.equal(p.q, 'name:"Professor Oak"')
  assert.ok(!p.q.includes('nationalPokedexNumbers'))
}

// Asking for Trainers explicitly must not be contradicted by the Pokédex range
{
  const p = q({ supertype: 'Trainer' })
  assert.equal(p.q, 'supertype:"Trainer"')
  assert.equal(p.orderBy, 'nationalPokedexNumbers,set.releaseDate,number')
}

// Filters combine, and an explicit orderBy still wins
{
  const p = q({ set: 'swsh1', rarity: 'Rare Holo', supertype: 'Pokémon', orderBy: 'name' })
  assert.equal(p.q, 'rarity:"Rare Holo" set.id:swsh1 supertype:"Pokémon"')
  assert.equal(p.orderBy, 'name')
}

// Pagination passes through
{
  const p = q({ set: 'base1', page: 3, pageSize: 20 })
  assert.equal(p.page, '3')
  assert.equal(p.pageSize, '20')
}

console.log('✓ TCG query builder checks passed')
