# Deploy para GitHub Pages

Este guia explica como fazer o deploy da aplicação Nuxt Poké TCG no GitHub Pages.

## Configuração Automática (Recomendado)

A aplicação está configurada para deploy automático usando GitHub Actions. Sempre que você fizer push para a branch `main`, o site será automaticamente construído e publicado.

### Passos para ativar o deploy automático:

1. **⚠️ IMPORTANTE: Habilite GitHub Pages no seu repositório:**
   - Vá para: https://github.com/Igor-Ponso/nuxt-poke-tcg/settings/pages
   - Em "Build and deployment" → "Source", selecione **GitHub Actions** (NÃO selecione "Deploy from a branch")
   - Isso é CRÍTICO - sem essa configuração, o GitHub tentará usar Jekyll e falhará
   - Salve as configurações

2. **Faça commit e push das alterações:**
   ```bash
   git add .
   git commit -m "feat: Configure GitHub Pages deployment"
   git push origin main
   ```

3. **Acompanhe o deploy:**
   - Vá para a aba "Actions" no GitHub
   - Você verá o workflow "Deploy to GitHub Pages" em execução
   - Quando finalizar, seu site estará disponível em:
     ```
     https://igor-ponso.github.io/nuxt-poke-tcg/
     ```

## Deploy Manual (Alternativo)

Se preferir fazer deploy manualmente:

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Gere os arquivos estáticos:**
   ```bash
   npm run generate
   ```

3. **Os arquivos estarão em `.output/public/`**

## Configurações Importantes

### Base URL
A aplicação está configurada para usar `/nuxt-poke-tcg/` como base URL em produção. Isso garante que todos os links e assets funcionem corretamente no GitHub Pages.

### SSR Desabilitado
O projeto está configurado com `ssr: false` para gerar um site totalmente estático, compatível com GitHub Pages.

### Sem backend, sem chaves
GitHub Pages serve apenas arquivos estáticos — não existe runtime de servidor, então **nenhuma rota
`server/api/*` funcionaria em produção**. Por isso o app chama a PokéAPI e a Pokémon TCG API
diretamente do browser (ambas enviam `Access-Control-Allow-Origin: *`).

Consequências:
- Não há `.env` nem `POKEMON_TCG_API_KEY` — o tier público da TCG API (1.000 req/dia por IP) basta.
- Nunca adicione uma chave em `runtimeConfig.public`: num build estático ela vai parar no bundle JS.
- A TCG API responde 5xx com alguma frequência; as chamadas em `composables/tcg/useTCGApi.ts`
  usam `retry: 3` do `$fetch` para absorver isso.

### .nojekyll
O arquivo `public/.nojekyll` evita que o GitHub Pages tente processar o site com Jekyll, garantindo que todos os arquivos sejam servidos corretamente.

## Verificação do Deploy

Após o deploy, verifique se:
- ✅ A página inicial carrega corretamente
- ✅ As rotas funcionam (Pokédex, Game, Moves, Type Chart)
- ✅ As imagens dos Pokémon carregam
- ✅ As animações e efeitos funcionam
- ✅ O dark mode funciona

## Troubleshooting

### O site não está carregando
- Verifique se GitHub Pages está habilitado nas configurações
- Confirme que a source está configurada como "GitHub Actions"
- Verifique a aba Actions para ver se houve erros no deploy

### Imagens não carregam
- Verifique se o `baseURL` está configurado corretamente em `nuxt.config.ts`
- Certifique-se de que todas as imagens estão na pasta `public/`

### Rotas retornam 404
- O arquivo `.nojekyll` deve estar presente
- Verifique se o deploy gerou o arquivo `404.html` corretamente

## Estrutura de Arquivos de Deploy

```
.output/public/
├── _nuxt/           # Assets compilados (JS, CSS)
├── .nojekyll        # Previne processamento Jekyll
├── index.html       # Página inicial
├── 404.html         # Página de erro
└── ...              # Outros arquivos estáticos
```

## Atualizações Futuras

Para atualizar o site após mudanças no código:

1. Faça as alterações no código
2. Commit e push para a branch `main`:
   ```bash
   git add .
   git commit -m "feat: Nova funcionalidade"
   git push origin main
   ```
3. O GitHub Actions irá automaticamente fazer o deploy da nova versão

## Domínio Personalizado (Opcional)

Se você quiser usar um domínio personalizado:

1. Configure o domínio em Settings → Pages → Custom domain
2. Atualize `baseURL` em `nuxt.config.ts` para `/` (raiz)
3. Faça novo deploy

---

**Seu site estará disponível em:** https://igor-ponso.github.io/nuxt-poke-tcg/
