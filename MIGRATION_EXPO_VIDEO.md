# Migração de expo-av para expo-video

## ✅ Migração Concluída

A migração do `expo-av` para `expo-video` foi concluída com sucesso!

## 📝 Mudanças Realizadas

### 1. Pacotes Atualizados
- ✅ Instalado: `expo-video`
- ✅ Removido: `expo-av`

### 2. Arquivos Atualizados

Todos os arquivos de tela foram atualizados:

- ✅ `screens/AlunosScreen.tsx`
- ✅ `screens/DashScreen.tsx`
- ✅ `screens/TreinosScreen.tsx`
- ✅ `screens/ExerciciosScreen.tsx`
- ✅ `screens/PerfilScreen.tsx`

### 3. Mudanças na API

#### Antes (expo-av):
```typescript
import { Video, ResizeMode } from 'expo-av';

<Video
  source={require('../assets/background_720p.mp4')}
  resizeMode={ResizeMode.COVER}
  isLooping
  shouldPlay
  isMuted
/>
```

#### Depois (expo-video):
```typescript
import { VideoView, useVideoPlayer } from 'expo-video';

<VideoView
  player={useVideoPlayer(require('../assets/background_720p.mp4'), player => {
    player.loop = true;
    player.play();
    player.muted = true;
  })}
  contentFit="cover"
  nativeControls={false}
/>
```

## 🚀 Como Aplicar as Mudanças

Para aplicar completamente a migração, você precisa **reiniciar o servidor Expo** e **limpar o cache**:

### Opção 1: Reiniciar com cache limpo
```bash
# Pare o servidor atual (Ctrl+C no terminal)
# Depois execute:
npm start -- --clear
```

### Opção 2: Limpar cache manualmente
```bash
# Pare o servidor atual (Ctrl+C no terminal)
# Limpe o cache:
npx expo start --clear

# Ou use:
npm start -- --reset-cache
```

### Opção 3: Limpar tudo
```bash
# Pare o servidor
# Limpe completamente:
rm -rf node_modules/.cache
npx expo start --clear
```

## 🎯 Próximos Passos

1. **Pare o servidor atual** pressionando `Ctrl+C` no terminal
2. **Reinicie com cache limpo**: `npm start -- --clear`
3. **Abra a aplicação web** pressionando `w`
4. **Verifique** que o warning do expo-av desapareceu

## 📊 Benefícios da Migração

- ✅ **Compatibilidade futura**: expo-video é o padrão no SDK 54+
- ✅ **Melhor performance**: API mais moderna e otimizada
- ✅ **Mais recursos**: Suporte a novos recursos de vídeo
- ✅ **Sem warnings**: Não haverá mais avisos de deprecação

## 🐛 Solução de Problemas

### Se ainda ver o warning do expo-av:
1. Certifique-se de que parou completamente o servidor
2. Limpe o cache do Metro: `npx expo start --clear`
3. Se necessário, delete `node_modules/.cache` e reinicie

### Se o vídeo não aparecer:
1. Verifique se o arquivo `background_720p.mp4` existe em `assets/`
2. Verifique o console do navegador para erros
3. Tente recarregar a página (Cmd+R ou Ctrl+R)

## 📚 Documentação

- [expo-video docs](https://docs.expo.dev/versions/latest/sdk/video/)
- [Migration guide](https://docs.expo.dev/versions/latest/sdk/video/#migration-from-expo-av)
